/**
 * ============================================
 * LLM SERVICE - NVIDIA NIM Integration
 * ============================================
 *
 * Keeps the existing OpenAI-compatible NVIDIA NIM provider/model,
 * but bounds latency with short prompts, task token caps, no retries,
 * and local fallback helpers for interactive flows.
 */

const OpenAI = require('openai');
const llmConfig = require('../config/llm');

const CATEGORIES = ['technical', 'behavioral', 'project', 'technical', 'situational'];
const WEAK_PHRASES = [
  "i don't know",
  'i dont know',
  'not sure',
  'no idea',
  'skip',
  'n/a',
  'none'
];

class LLMService {
  constructor() {
    this.client = new OpenAI({
      apiKey: llmConfig.apiKey,
      baseURL: llmConfig.baseURL,
      timeout: llmConfig.timeoutMs,
      maxRetries: llmConfig.maxRetries
    });
  }

  stripCodeFences(content) {
    return content
      .replace(/^\s*```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim();
  }

  removeInvisibleCharacters(content) {
    return content
      .replace(/^\uFEFF/, '')
      .replace(/[\u200B-\u200D\u2060]/g, '')
      .trim();
  }

  findFirstJsonBoundary(content) {
    const objectStart = content.indexOf('{');
    const arrayStart = content.indexOf('[');

    if (objectStart === -1) return arrayStart;
    if (arrayStart === -1) return objectStart;
    return Math.min(objectStart, arrayStart);
  }

  extractBalancedJson(content) {
    const start = this.findFirstJsonBoundary(content);

    if (start === -1) {
      return content.trim();
    }

    const opening = content[start];
    const closing = opening === '[' ? ']' : '}';
    let depth = 0;
    let inString = false;
    let escaping = false;

    for (let index = start; index < content.length; index += 1) {
      const char = content[index];

      if (escaping) {
        escaping = false;
        continue;
      }

      if (char === '\\') {
        escaping = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (inString) {
        continue;
      }

      if (char === opening) {
        depth += 1;
      } else if (char === closing) {
        depth -= 1;

        if (depth === 0) {
          return content.slice(start, index + 1).trim();
        }
      }
    }

    return content.slice(start).trim();
  }

  normalizeJsonText(rawContent) {
    return this.extractBalancedJson(
      this.removeInvisibleCharacters(
        this.stripCodeFences(rawContent || '')
      )
    );
  }

  normalizeText(text, maxChars) {
    const normalized = String(text || '')
      .replace(/\r/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!maxChars || normalized.length <= maxChars) {
      return normalized;
    }

    return normalized.slice(0, maxChars).trim();
  }

  compactJson(value, maxChars = 5000) {
    const json = JSON.stringify(value || {});
    return json.length > maxChars ? json.slice(0, maxChars) : json;
  }

  taskTokens(taskName) {
    return llmConfig.taskMaxTokens?.[taskName] || llmConfig.maxTokens;
  }

  extractContent(completion) {
    const content = completion?.choices?.[0]?.message?.content;

    if (typeof content === 'string') {
      return content;
    }

    if (Array.isArray(content)) {
      return content
        .map((part) => (typeof part === 'string' ? part : part?.text || ''))
        .join('')
        .trim();
    }

    throw new Error('LLM response did not contain message content');
  }

  parseJsonResponse(completion, contextLabel) {
    const rawContent = this.extractContent(completion);
    const cleanJson = this.normalizeJsonText(rawContent);

    try {
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error(`${contextLabel} returned invalid JSON:`, rawContent);
      console.error(`${contextLabel} normalized JSON candidate:`, cleanJson);
      throw new Error(`Failed to parse ${contextLabel} response from AI`);
    }
  }

  async createJsonCompletion(prompt, contextLabel, options = {}) {
    const completion = await this.client.chat.completions.create({
      model: llmConfig.model,
      temperature: options.temperature ?? llmConfig.temperature,
      top_p: llmConfig.topP,
      max_tokens: options.maxTokens || llmConfig.maxTokens,
      stream: false,
      messages: [
        {
          role: 'system',
          content: 'Return compact valid JSON only. No markdown, no explanations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    }, {
      timeout: options.timeoutMs || llmConfig.timeoutMs,
      maxRetries: options.maxRetries ?? llmConfig.maxRetries
    });

    return this.parseJsonResponse(completion, contextLabel);
  }

  async parseResume(resumeText) {
    const compactText = this.normalizeText(resumeText, llmConfig.inputLimits.resumeTextChars);
    const prompt = `Extract resume data from TEXT.
Return this JSON object:
{"personalInfo":{"name":"","email":"","phone":"","location":"","linkedin":"","github":"","portfolio":""},"summary":"","skills":{"technical":[],"soft":[],"tools":[],"languages":[]},"experience":[{"company":"","title":"","location":"","startDate":"","endDate":"","description":"","highlights":[]}],"education":[{"institution":"","degree":"","field":"","graduationDate":"","gpa":""}],"projects":[{"name":"","description":"","technologies":[],"link":""}],"certifications":[{"name":"","issuer":"","date":""}],"aiAnalysis":{"primaryDomain":"","experienceLevel":"","keyStrengths":[],"potentialWeaknesses":[],"suggestedQuestionTopics":[]}}
Rules: use empty strings/arrays when unknown; keep arrays short; do not invent employers, schools, or links.
TEXT:
${compactText}`;

    try {
      return await this.createJsonCompletion(prompt, 'resume parsing', {
        maxTokens: this.taskTokens('resumeParse')
      });
    } catch (error) {
      console.error('Resume parsing error:', error.message);
      throw new Error('Failed to parse resume with AI');
    }
  }

  buildQuestionProfile(parsedResume) {
    return {
      name: parsedResume.personalInfo?.name || 'Candidate',
      domain: parsedResume.aiAnalysis?.primaryDomain || 'Software Development',
      level: parsedResume.aiAnalysis?.experienceLevel || 'Mid',
      skills: [
        ...(parsedResume.skills?.technical || []),
        ...(parsedResume.skills?.tools || [])
      ].slice(0, 12),
      recentExperience: (parsedResume.experience || []).slice(0, 2).map((item) => ({
        title: item.title,
        company: item.company,
        highlights: (item.highlights || []).slice(0, 3)
      })),
      projects: (parsedResume.projects || []).slice(0, 2).map((item) => ({
        name: item.name,
        technologies: (item.technologies || []).slice(0, 5)
      })),
      topics: (parsedResume.aiAnalysis?.suggestedQuestionTopics || []).slice(0, 8)
    };
  }

  async generateQuestions(parsedResume, questionCount = 10) {
    const profile = this.buildQuestionProfile(parsedResume);
    const prompt = `Create ${questionCount} interview questions from this resume profile.
Profile JSON: ${this.compactJson(profile, 4500)}
Return a JSON array. Each item:
{"questionText":"","category":"technical|behavioral|situational|project","basedOn":"","relatedSkill":"","expectedKeyPoints":["","",""],"difficultyLevel":"easy|medium|hard","tips":"","timeLimit":120}
Requirements: specific to profile, short question text, 3 expectedKeyPoints, mix technical/behavioral/project/situational.`;

    try {
      return await this.createJsonCompletion(prompt, 'question generation', {
        maxTokens: this.taskTokens('questionGeneration')
      });
    } catch (error) {
      console.error('Question generation error:', error.message);
      throw new Error('Failed to generate questions with AI');
    }
  }

  isGibberish(text) {
    const trimmed = String(text || '').trim();
    if (!trimmed) return true;

    const letters = (trimmed.match(/[a-z]/gi) || []).length;
    const words = trimmed.split(/\s+/).filter(Boolean);
    const nonText = (trimmed.match(/[^a-z0-9\s.,;:'"!?()/-]/gi) || []).length;
    const repeatedChars = /(.)\1{6,}/.test(trimmed);

    return repeatedChars || (trimmed.length > 12 && letters / trimmed.length < 0.35) ||
      (words.length <= 2 && nonText / Math.max(trimmed.length, 1) > 0.25);
  }

  getLocalAnswerEvaluation(question, answer) {
    const text = String(answer || '').trim();
    const lower = text.toLowerCase();
    const expected = question.expectedKeyPoints || [];

    if (!text || text.length < 10) {
      return {
        relevanceScore: 0,
        accuracyScore: 0,
        communicationScore: 0,
        depthScore: 0,
        overallScore: 0,
        feedback: 'No meaningful answer was provided.',
        keyPointsCovered: [],
        missedPoints: expected,
        improvementTips: 'Answer the question with specific details, examples, and reasoning.'
      };
    }

    if (WEAK_PHRASES.includes(lower) || WEAK_PHRASES.some((phrase) => lower === phrase || lower.startsWith(`${phrase}.`))) {
      return {
        relevanceScore: 0,
        accuracyScore: 0,
        communicationScore: 5,
        depthScore: 0,
        overallScore: 1,
        feedback: 'The answer does not attempt the question.',
        keyPointsCovered: [],
        missedPoints: expected,
        improvementTips: 'If unsure, explain what you do know and reason through the problem step by step.'
      };
    }

    if (this.isGibberish(text)) {
      return {
        relevanceScore: 0,
        accuracyScore: 0,
        communicationScore: 0,
        depthScore: 0,
        overallScore: 0,
        feedback: 'The answer appears incoherent and cannot be evaluated as an interview response.',
        keyPointsCovered: [],
        missedPoints: expected,
        improvementTips: 'Provide a clear response using complete sentences and relevant technical details.'
      };
    }

    if (text.split(/\s+/).filter(Boolean).length < 5) {
      return {
        relevanceScore: 10,
        accuracyScore: 10,
        communicationScore: 20,
        depthScore: 5,
        overallScore: 11,
        feedback: 'The answer is too short to show useful understanding.',
        keyPointsCovered: [],
        missedPoints: expected,
        improvementTips: 'Expand the answer with a concrete example and explain the reasoning behind it.'
      };
    }

    return null;
  }

  buildHeuristicEvaluation(question, answer, reason = 'AI evaluation was unavailable.') {
    const text = String(answer || '').trim();
    const local = this.getLocalAnswerEvaluation(question, text);
    if (local) return local;

    const words = text.toLowerCase().match(/[a-z0-9]+/g) || [];
    const wordSet = new Set(words);
    const expected = question.expectedKeyPoints || [];
    const expectedHits = expected.filter((point) => {
      const pointWords = String(point).toLowerCase().match(/[a-z0-9]+/g) || [];
      return pointWords.some((word) => word.length > 3 && wordSet.has(word));
    });

    const lengthScore = Math.min(45, Math.max(20, words.length * 1.5));
    const coverageScore = Math.min(30, expectedHits.length * 10);
    const relevanceScore = Math.min(70, lengthScore + coverageScore);
    const accuracyScore = Math.min(60, relevanceScore);
    const communicationScore = Math.min(70, Math.max(25, words.length));
    const depthScore = Math.min(55, Math.max(20, words.length * 1.1 + coverageScore));
    const overallScore = Math.round(
      (relevanceScore * 0.30) +
      (accuracyScore * 0.35) +
      (communicationScore * 0.20) +
      (depthScore * 0.15)
    );

    return {
      relevanceScore: Math.round(relevanceScore),
      accuracyScore: Math.round(accuracyScore),
      communicationScore: Math.round(communicationScore),
      depthScore: Math.round(depthScore),
      overallScore,
      feedback: `${reason} This fallback score is conservative and based on answer length, relevance signals, and expected-point overlap.`,
      keyPointsCovered: expectedHits,
      missedPoints: expected.filter((point) => !expectedHits.includes(point)),
      improvementTips: 'Add a structured example and explicitly cover the expected points for this question.'
    };
  }

  async evaluateAnswer(question, answer) {
    const localEvaluation = this.getLocalAnswerEvaluation(question, answer);
    if (localEvaluation) {
      return localEvaluation;
    }

    const prompt = `Score this interview answer strictly.
Question JSON: ${this.compactJson({
      questionText: question.questionText,
      category: question.category,
      expectedKeyPoints: question.expectedKeyPoints || [],
      basedOn: question.basedOn
    }, 2500)}
Answer: ${this.normalizeText(answer, llmConfig.inputLimits.answerChars)}
Return JSON:
{"relevanceScore":0,"accuracyScore":0,"communicationScore":0,"depthScore":0,"overallScore":0,"feedback":"","keyPointsCovered":[],"missedPoints":[],"improvementTips":""}
Scoring: 0-20 very poor, 21-40 poor, 41-60 acceptable, 61-80 good, 81-100 excellent. overallScore is weighted relevance .30, accuracy .35, communication .20, depth .15.`;

    try {
      return await this.createJsonCompletion(prompt, 'answer evaluation', {
        maxTokens: this.taskTokens('answerEvaluation')
      });
    } catch (error) {
      console.error('Answer evaluation error:', error.message);
      throw new Error('Failed to evaluate answer with AI');
    }
  }

  async assessInterviewBatch(interviewData) {
    const answers = (interviewData.answers || []).map((answer) => ({
      answerIndex: answer.answerIndex,
      question: this.normalizeText(answer.question, 450),
      category: answer.category || 'general',
      expectedKeyPoints: (answer.expectedKeyPoints || []).slice(0, 4),
      answer: this.normalizeText(answer.answer, llmConfig.inputLimits.batchAnswerChars)
    }));

    const prompt = `Assess this complete interview strictly.
Candidate: ${interviewData.candidateName || 'Candidate'}
Domain: ${interviewData.domain || 'Software Development'}
Confidence summary: ${this.compactJson(interviewData.confidenceSummary || {}, 800)}
Voice summary: ${this.compactJson(interviewData.voiceMetrics || {}, 800)}
Answers JSON: ${this.compactJson(answers, 11000)}
Return JSON:
{"answerEvaluations":[{"answerIndex":1,"relevanceScore":0,"accuracyScore":0,"communicationScore":0,"depthScore":0,"overallScore":0,"feedback":"","keyPointsCovered":[],"missedPoints":[],"improvementTips":""}],"summary":{"overallFeedback":"","strengths":[],"areasToImprove":[],"recommendations":[],"interviewReadiness":"","nextSteps":[]}}
Rules: one evaluation for every answerIndex provided; strict scoring, no praise for weak answers; summarize with specific improvement actions.`;

    try {
      return await this.createJsonCompletion(prompt, 'batch interview assessment', {
        maxTokens: this.taskTokens('batchAssessment')
      });
    } catch (error) {
      console.error('Batch interview assessment error:', error.message);
      throw new Error('Failed to assess interview in batch');
    }
  }

  async generateFinalSummary(sessionData) {
    const prompt = `Write a concise final interview summary.
Input JSON: ${this.compactJson({
      candidateName: sessionData.candidateName,
      domain: sessionData.domain,
      answers: (sessionData.answers || []).map((answer) => ({
        question: this.normalizeText(answer.question, 280),
        category: answer.category,
        overallScore: answer.overallScore,
        feedback: this.normalizeText(answer.feedback, 260)
      })),
      confidence: sessionData.confidence || {},
      voiceMetrics: sessionData.voiceMetrics || {},
      irs: sessionData.irs,
      passed: sessionData.passed
    }, 8000)}
Return JSON:
{"overallFeedback":"","strengths":[],"areasToImprove":[],"recommendations":[],"interviewReadiness":"","nextSteps":[]}
Be direct and evidence-based.`;

    try {
      return await this.createJsonCompletion(prompt, 'final summary', {
        maxTokens: this.taskTokens('finalSummary')
      });
    } catch (error) {
      console.error('Summary generation error:', error.message);
      throw new Error('Failed to generate summary with AI');
    }
  }

  generateFallbackQuestions(parsedResume, questionCount = 10) {
    const candidateName = parsedResume.personalInfo?.name || 'the candidate';
    const domain = parsedResume.aiAnalysis?.primaryDomain || 'software development';
    const skills = [
      ...(parsedResume.skills?.technical || []),
      ...(parsedResume.skills?.tools || []),
      ...(parsedResume.aiAnalysis?.suggestedQuestionTopics || [])
    ].filter(Boolean);
    const uniqueSkills = [...new Set(skills)].slice(0, Math.max(questionCount, 6));
    const projects = (parsedResume.projects || []).filter((project) => project?.name);
    const experience = (parsedResume.experience || []).filter((item) => item?.title || item?.company);

    const skillFor = (index) => uniqueSkills[index % Math.max(uniqueSkills.length, 1)] || domain;
    const projectFor = (index) => projects[index % Math.max(projects.length, 1)]?.name || 'a project from your resume';
    const experienceFor = (index) => {
      const item = experience[index % Math.max(experience.length, 1)];
      if (!item) return 'your recent experience';
      return [item.title, item.company].filter(Boolean).join(' at ') || 'your recent experience';
    };

    return Array.from({ length: questionCount }, (_, index) => {
      const category = CATEGORIES[index % CATEGORIES.length];
      const skill = skillFor(index);
      const difficulty = index % 5 === 4 ? 'hard' : index % 3 === 0 ? 'easy' : 'medium';

      if (category === 'behavioral') {
        return {
          questionText: `Tell me about a time you had to solve a difficult problem while working in ${domain}.`,
          category,
          basedOn: `Based on ${candidateName}'s resume domain: ${domain}.`,
          relatedSkill: skill,
          expectedKeyPoints: ['specific situation', 'actions taken', 'measurable outcome'],
          difficultyLevel: difficulty,
          tips: 'Use a clear situation, action, and result structure.',
          timeLimit: 120
        };
      }

      if (category === 'project') {
        return {
          questionText: `Walk me through ${projectFor(index)} and explain the most important technical decision you made.`,
          category,
          basedOn: 'Based on the projects listed in the resume.',
          relatedSkill: skill,
          expectedKeyPoints: ['project goal', 'technical tradeoff', 'result or lesson learned'],
          difficultyLevel: difficulty,
          tips: 'Focus on your own contribution and the reason behind the decision.',
          timeLimit: 120
        };
      }

      if (category === 'situational') {
        return {
          questionText: `If a production issue appeared in an area using ${skill}, how would you diagnose and fix it?`,
          category,
          basedOn: `Based on the listed skill: ${skill}.`,
          relatedSkill: skill,
          expectedKeyPoints: ['triage steps', 'root-cause analysis', 'safe fix and verification'],
          difficultyLevel: difficulty,
          tips: 'Explain the order of investigation and how you would reduce risk.',
          timeLimit: 120
        };
      }

      return {
        questionText: `Explain how you have used ${skill} in ${experienceFor(index)} and what challenges you handled.`,
        category,
        basedOn: `Based on the resume skill or experience: ${skill}.`,
        relatedSkill: skill,
        expectedKeyPoints: ['practical usage', 'technical challenge', 'outcome'],
        difficultyLevel: difficulty,
        tips: 'Use a real example rather than a definition.',
        timeLimit: 120
      };
    });
  }

  buildFallbackSummary(sessionData, result) {
    const score = result?.interviewReadinessScore || 0;
    const passed = !!result?.passed;
    const weakAreas = [];

    if ((result?.answerPerformance?.averageAccuracy || 0) < 60) {
      weakAreas.push('Improve technical accuracy with more precise facts and examples.');
    }
    if ((result?.answerPerformance?.averageDepth || 0) < 60) {
      weakAreas.push('Add deeper reasoning instead of surface-level answers.');
    }
    if ((result?.answerPerformance?.averageCommunication || 0) < 60) {
      weakAreas.push('Use a clearer structure for each response.');
    }

    return {
      overallFeedback: passed
        ? `The interview completed with an IRS of ${score}. The answers were strong enough overall, but continued practice should focus on making examples sharper and more evidence-based.`
        : `The interview completed with an IRS of ${score}. The current performance is not ready for a live interview yet because the answer quality needs more precision, depth, or structure.`,
      strengths: passed ? ['Completed the interview with enough answer quality to pass the readiness threshold.'] : [],
      areasToImprove: weakAreas.length > 0 ? weakAreas : ['Give fuller, more specific answers that directly address each question.'],
      recommendations: [
        'Practice answering with situation, action, result, and technical detail.',
        'Review the missed expected points from each question.',
        'Use concrete examples from projects or work experience.',
        'Keep answers concise but complete.'
      ],
      interviewReadiness: passed
        ? 'The candidate is close to live interview readiness.'
        : 'The candidate should practice more before a live interview.',
      nextSteps: [
        'Redo the weakest questions first.',
        'Prepare two concrete project stories with measurable outcomes.',
        'Review fundamentals for the listed technical skills.'
      ]
    };
  }
}

module.exports = new LLMService();
