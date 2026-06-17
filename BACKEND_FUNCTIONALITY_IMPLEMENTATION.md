# ClearView - Enhanced Backend & AI Functionality Implementation Plan

> **Project**: AI-Based Resume-Personalized Interview System  
> **Technology Stack**: Node.js, Express.js, MongoDB, Python, MediaPipe, Google Gemini API (FREE)  
> **Focus**: Zero-cost implementation using FREE models and APIs only

---

## 🔥 KEY ENHANCEMENT: Resume-Based AI Interview

The system now includes:
1. **Resume Upload & Parsing** - Extract skills, experience, projects from PDF/DOCX
2. **AI Question Generation** - Generate personalized questions using FREE Gemini API
3. **Voice Answer Processing** - Transcribe and analyze spoken answers
4. **AI Answer Evaluation** - Score answers for relevance, accuracy, depth

---

## 1. Enhanced System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                           │
│  • Resume Upload  • Voice Input  • Video Capture                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NODE.JS + EXPRESS API                        │
│  ┌───────────┐  ┌───────────┐  ┌────────────┐  ┌─────────────┐ │
│  │   Auth    │  │  Resume   │  │  Interview │  │   Feedback  │ │
│  │  Routes   │  │  Routes   │  │   Routes   │  │    Routes   │ │
│  └───────────┘  └───────────┘  └────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
         │              │                │
         ▼              ▼                ▼
┌──────────────┐ ┌─────────────────┐ ┌───────────────────────────┐
│   MongoDB    │ │  Gemini API     │ │  Python AI Service        │
│  ┌────────┐  │ │  (FREE TIER)    │ │  ┌─────────────────────┐  │
│  │ Users  │  │ │                 │ │  │  MediaPipe Face     │  │
│  │ Resumes│  │ │ • Parse Resume  │ │  │  MediaPipe Pose     │  │
│  │Sessions│  │ │ • Gen Questions │ │  │  Confidence Engine  │  │
│  │ Results│  │ │ • Eval Answers  │ │  └─────────────────────┘  │
│  └────────┘  │ │                 │ │                           │
└──────────────┘ └─────────────────┘ └───────────────────────────┘
```

---

## 2. FREE AI Models & APIs

> **⚠️ CRITICAL: ALL MODELS ARE 100% FREE**

| Component | FREE Solution | Limits | Cost |
|-----------|---------------|--------|------|
| **LLM for Questions/Answers** | Google Gemini API (gemini-1.5-flash) | 15 RPM, 1M tokens/day | **$0** |
| **Resume Parsing** | pdf-parse + mammoth.js | Unlimited local | **$0** |
| **Face Analysis** | MediaPipe Face Mesh | Unlimited local | **$0** |
| **Pose Analysis** | MediaPipe Pose | Unlimited local | **$0** |
| **Speech-to-Text** | Web Speech API (Browser) | Unlimited | **$0** |
| **Database** | MongoDB Atlas Free | 512MB | **$0** |

### Alternative FREE LLM Options (if Gemini limits hit):
1. **Groq API** - Free tier with Llama 3.1, ~30 RPM
2. **Together AI** - $25 free credits
3. **Ollama (Local)** - Run Llama/Mistral locally, unlimited

---

## 3. Enhanced Project Structure

```
clearview-backend/
├── package.json
├── .env
├── server.js
├── config/
│   ├── db.js
│   ├── jwt.js
│   ├── gemini.js              # NEW: Gemini API config
│   └── constants.js
├── middleware/
│   ├── auth.js
│   ├── upload.js              # NEW: File upload middleware
│   ├── errorHandler.js
│   └── validators.js
├── models/
│   ├── User.js
│   ├── Resume.js              # NEW: Resume schema
│   ├── Question.js            # Enhanced
│   ├── InterviewSession.js    # Enhanced
│   └── Result.js              # Enhanced
├── routes/
│   ├── auth.routes.js
│   ├── resume.routes.js       # NEW: Resume routes
│   ├── interview.routes.js    # Enhanced
│   └── feedback.routes.js
├── controllers/
│   ├── auth.controller.js
│   ├── resume.controller.js   # NEW
│   ├── interview.controller.js # Enhanced
│   └── feedback.controller.js
├── services/
│   ├── gemini.service.js      # NEW: Gemini AI integration
│   ├── resume.service.js      # NEW: Resume parsing
│   ├── question.service.js    # NEW: Question generation
│   ├── answer.service.js      # NEW: Answer evaluation
│   ├── scoring.service.js
│   └── ai.service.js
└── utils/
    ├── helpers.js
    ├── prompts.js             # NEW: AI prompts
    └── logger.js

clearview-ai-service/          # Python (MediaPipe)
├── requirements.txt
├── app.py
└── services/
    ├── face_analysis.py
    ├── pose_analysis.py
    └── confidence_engine.py
```

---

## 4. MongoDB Schemas (Enhanced)

### 4.1 Resume Schema (NEW)
```javascript
// models/Resume.js
const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String  // Path to stored file
  },
  
  // Parsed Data
  personalInfo: {
    name: String,
    email: String,
    phone: String,
    location: String,
    linkedin: String,
    github: String
  },
  
  summary: {
    type: String  // Professional summary/objective
  },
  
  skills: {
    technical: [String],    // e.g., ["JavaScript", "React", "Node.js"]
    soft: [String],         // e.g., ["Leadership", "Communication"]
    tools: [String],        // e.g., ["Git", "Docker", "AWS"]
    languages: [String]     // e.g., ["English", "Spanish"]
  },
  
  experience: [{
    company: String,
    title: String,
    location: String,
    startDate: String,
    endDate: String,        // or "Present"
    description: String,
    highlights: [String]    // Bullet points
  }],
  
  education: [{
    institution: String,
    degree: String,
    field: String,
    graduationDate: String,
    gpa: String
  }],
  
  projects: [{
    name: String,
    description: String,
    technologies: [String],
    link: String
  }],
  
  certifications: [{
    name: String,
    issuer: String,
    date: String
  }],
  
  // AI Analysis
  aiAnalysis: {
    primaryDomain: String,      // e.g., "Frontend Development"
    experienceLevel: String,    // "Entry", "Mid", "Senior"
    keyStrengths: [String],
    potentialWeaknesses: [String],
    suggestedQuestionTopics: [String]
  },
  
  parsedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
```

### 4.2 Enhanced Question Schema
```javascript
// models/Question.js (Enhanced)
const questionSchema = new mongoose.Schema({
  // For AI-generated questions
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewSession'
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume'
  },
  
  questionText: {
    type: String,
    required: true
  },
  
  category: {
    type: String,
    enum: ['technical', 'behavioral', 'situational', 'project', 'general'],
    required: true
  },
  
  // Resume context
  basedOn: {
    type: String  // e.g., "Based on your 3 years of React experience"
  },
  
  relatedSkill: {
    type: String  // e.g., "React.js"
  },
  
  relatedExperience: {
    type: String  // e.g., "Software Engineer at XYZ Company"
  },
  
  // Expected answer guidance (for AI evaluation)
  expectedKeyPoints: [String],  // Key points a good answer should cover
  difficultyLevel: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  
  timeLimit: {
    type: Number,
    default: 120  // 2 minutes per question
  },
  
  tips: String,  // Hint for candidate
  
  isAIGenerated: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
```

### 4.3 Enhanced Interview Session Schema
```javascript
// models/InterviewSession.js (Enhanced)
const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  
  status: {
    type: String,
    enum: ['preparing', 'questions_generated', 'in_progress', 'completed', 'abandoned'],
    default: 'preparing'
  },
  
  // Generated questions for this session
  questions: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    order: Number
  }],
  
  // User answers with AI evaluation
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    answerText: String,      // Transcribed or typed answer
    answerAudio: String,     // Optional: stored audio URL
    responseTime: Number,    // milliseconds
    answeredAt: Date,
    
    // AI Evaluation of this answer
    aiEvaluation: {
      relevanceScore: Number,      // 0-100: How relevant to the question
      accuracyScore: Number,       // 0-100: Technical accuracy
      communicationScore: Number,  // 0-100: Clarity of expression
      depthScore: Number,          // 0-100: Depth of answer
      overallScore: Number,        // 0-100: Weighted average
      feedback: String,            // AI-generated feedback
      keyPointsCovered: [String],  // Which expected points were mentioned
      missedPoints: [String],      // Points that were missed
      improvementTips: String      // Specific improvement suggestion
    }
  }],
  
  // Confidence metrics (from video analysis)
  confidenceFrames: [{
    timestamp: Date,
    eyeContact: Number,
    posture: Number,
    facialTension: Number
  }],
  
  startTime: Date,
  endTime: Date,
  totalDuration: Number  // milliseconds
  
}, { timestamps: true });

module.exports = mongoose.model('InterviewSession', sessionSchema);
```

### 4.4 Enhanced Result Schema
```javascript
// models/Result.js (Enhanced)
const resultSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewSession',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  
  // Answer Performance (from AI evaluation)
  answerPerformance: {
    totalQuestions: Number,
    averageRelevance: Number,
    averageAccuracy: Number,
    averageCommunication: Number,
    averageDepth: Number,
    overallAnswerScore: Number,  // 0-10
    strongestCategory: String,
    weakestCategory: String,
    
    // Per-category breakdown
    technicalScore: Number,
    behavioralScore: Number,
    situationalScore: Number,
    projectScore: Number
  },
  
  // Confidence Metrics (from video analysis)
  confidenceMetrics: {
    eyeContactRatio: Number,
    postureStability: Number,
    facialCalmness: Number,
    confidenceScore: Number  // 0-10
  },
  
  // Final Scores
  aptitudeScore: Number,            // Based on answer quality
  confidenceScore: Number,          // Based on video analysis
  interviewReadinessScore: Number,  // Combined IRS (0-100)
  passed: Boolean,                  // IRS >= 60
  
  // AI-Generated Summary
  overallFeedback: String,
  strengths: [String],
  areasToImprove: [String],
  recommendations: [String],
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Result', resultSchema);
```

---

## 5. API Endpoints (Enhanced)

### 5.1 Resume Routes (NEW)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resume/upload` | Upload & parse resume |
| GET | `/api/resume/:id` | Get parsed resume |
| GET | `/api/resume/all` | Get all user resumes |
| DELETE | `/api/resume/:id` | Delete a resume |

### 5.2 Interview Routes (Enhanced)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/interview/generate-questions` | Generate AI questions from resume |
| GET | `/api/interview/:sessionId/questions` | Get generated questions |
| POST | `/api/interview/:sessionId/start` | Start interview session |
| GET | `/api/interview/:sessionId/current` | Get current question |
| POST | `/api/interview/:sessionId/answer` | Submit & evaluate answer |
| POST | `/api/interview/:sessionId/analyze-frame` | Analyze confidence |
| POST | `/api/interview/:sessionId/complete` | Complete session |

---

## 6. Google Gemini API Integration (FREE)

### 6.1 Setup & Configuration

```javascript
// config/gemini.js
module.exports = {
  apiKey: process.env.GEMINI_API_KEY,
  model: 'gemini-1.5-flash',  // FREE tier model
  generationConfig: {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 2048
  }
};
```

### 6.2 Gemini Service

```javascript
// services/gemini.service.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/gemini');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: config.model,
      generationConfig: config.generationConfig
    });
  }

  /**
   * Parse resume text and extract structured data
   */
  async parseResume(resumeText) {
    const prompt = `
You are an expert resume parser. Analyze the following resume and extract structured information.

RESUME TEXT:
${resumeText}

Return a JSON object with this exact structure:
{
  "personalInfo": {
    "name": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "github": ""
  },
  "summary": "",
  "skills": {
    "technical": [],
    "soft": [],
    "tools": [],
    "languages": []
  },
  "experience": [
    {
      "company": "",
      "title": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "description": "",
      "highlights": []
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "graduationDate": "",
      "gpa": ""
    }
  ],
  "projects": [
    {
      "name": "",
      "description": "",
      "technologies": [],
      "link": ""
    }
  ],
  "certifications": [
    {
      "name": "",
      "issuer": "",
      "date": ""
    }
  ],
  "aiAnalysis": {
    "primaryDomain": "",
    "experienceLevel": "",
    "keyStrengths": [],
    "potentialWeaknesses": [],
    "suggestedQuestionTopics": []
  }
}

Only return valid JSON, no markdown or explanations.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Clean and parse JSON
      const cleanJson = response.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error('Resume parsing error:', error);
      throw new Error('Failed to parse resume');
    }
  }

  /**
   * Generate personalized interview questions based on resume
   */
  async generateQuestions(parsedResume, questionCount = 10) {
    const prompt = `
You are an expert technical interviewer. Based on the following candidate profile, generate ${questionCount} personalized interview questions.

CANDIDATE PROFILE:
- Name: ${parsedResume.personalInfo?.name || 'Candidate'}
- Primary Domain: ${parsedResume.aiAnalysis?.primaryDomain || 'Software Development'}
- Experience Level: ${parsedResume.aiAnalysis?.experienceLevel || 'Mid'}
- Technical Skills: ${parsedResume.skills?.technical?.join(', ') || 'N/A'}
- Tools: ${parsedResume.skills?.tools?.join(', ') || 'N/A'}
- Experience: ${JSON.stringify(parsedResume.experience?.slice(0, 2) || [])}
- Projects: ${JSON.stringify(parsedResume.projects?.slice(0, 2) || [])}

QUESTION REQUIREMENTS:
- Mix of question types: technical (40%), behavioral (30%), project-based (20%), situational (10%)
- Questions should be relevant to their skills and experience
- Include expected key points for each question
- Vary difficulty levels

Return a JSON array with this structure:
[
  {
    "questionText": "Your full question here",
    "category": "technical|behavioral|situational|project",
    "basedOn": "Based on your X experience/skill",
    "relatedSkill": "Skill name",
    "expectedKeyPoints": ["Point 1", "Point 2", "Point 3"],
    "difficultyLevel": "easy|medium|hard",
    "tips": "Brief hint for the candidate",
    "timeLimit": 120
  }
]

Only return valid JSON array, no markdown.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      const cleanJson = response.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error('Question generation error:', error);
      throw new Error('Failed to generate questions');
    }
  }

  /**
   * Evaluate a candidate's answer
   */
  async evaluateAnswer(question, answer, resumeContext) {
    const prompt = `
You are an expert interview evaluator. Evaluate the following answer based on the question and candidate's background.

QUESTION: ${question.questionText}
CATEGORY: ${question.category}
EXPECTED KEY POINTS: ${question.expectedKeyPoints?.join(', ')}

CANDIDATE'S ANSWER: ${answer}

CANDIDATE CONTEXT: ${question.basedOn}

Evaluate the answer on these criteria (0-100 scale):
1. Relevance: How well does the answer address the question?
2. Accuracy: Is the information technically correct?
3. Communication: Is the answer clear and well-structured?
4. Depth: Does the answer show deep understanding?

Return a JSON object:
{
  "relevanceScore": 0-100,
  "accuracyScore": 0-100,
  "communicationScore": 0-100,
  "depthScore": 0-100,
  "overallScore": 0-100,
  "feedback": "2-3 sentences of constructive feedback",
  "keyPointsCovered": ["Point 1", "Point 2"],
  "missedPoints": ["Point 3"],
  "improvementTips": "Specific actionable tip for improvement"
}

Be fair but constructive. Only return valid JSON.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      const cleanJson = response.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error('Answer evaluation error:', error);
      throw new Error('Failed to evaluate answer');
    }
  }

  /**
   * Generate final interview summary and recommendations
   */
  async generateFinalSummary(sessionData) {
    const prompt = `
You are an expert career coach. Based on the interview performance, provide a comprehensive summary.

CANDIDATE: ${sessionData.candidateName}
POSITION DOMAIN: ${sessionData.domain}

ANSWER SCORES:
${sessionData.answers.map((a, i) => `
Q${i+1} (${a.category}): 
- Question: ${a.question}
- Overall Score: ${a.overallScore}/100
- Feedback: ${a.feedback}
`).join('\n')}

CONFIDENCE METRICS:
- Eye Contact: ${sessionData.confidence.eyeContact}%
- Posture: ${sessionData.confidence.posture}%
- Calmness: ${sessionData.confidence.calmness}%

Overall Interview Readiness Score: ${sessionData.irs}%
Result: ${sessionData.passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}

Generate a comprehensive summary:
{
  "overallFeedback": "2-3 paragraph overall assessment",
  "strengths": ["Top 3-5 strengths demonstrated"],
  "areasToImprove": ["Top 3-5 areas needing improvement"],
  "recommendations": ["5-7 specific actionable recommendations"],
  "interviewReadiness": "A brief statement about their interview readiness",
  "nextSteps": ["Suggested next steps for improvement"]
}

Be encouraging but honest. Only return valid JSON.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      const cleanJson = response.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error('Summary generation error:', error);
      throw new Error('Failed to generate summary');
    }
  }
}

module.exports = new GeminiService();
```

---

## 7. Resume Parsing Service

```javascript
// services/resume.service.js
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const geminiService = require('./gemini.service');

class ResumeService {
  /**
   * Extract text from PDF or DOCX file
   */
  async extractText(fileBuffer, mimeType) {
    try {
      if (mimeType === 'application/pdf') {
        const data = await pdfParse(fileBuffer);
        return data.text;
      } else if (
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'application/msword'
      ) {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        return result.value;
      } else {
        throw new Error('Unsupported file type');
      }
    } catch (error) {
      console.error('Text extraction error:', error);
      throw error;
    }
  }

  /**
   * Parse resume and extract structured data using AI
   */
  async parseResume(fileBuffer, mimeType) {
    // Step 1: Extract raw text
    const rawText = await this.extractText(fileBuffer, mimeType);
    
    // Step 2: Use Gemini to parse and structure the data
    const parsedData = await geminiService.parseResume(rawText);
    
    return parsedData;
  }
}

module.exports = new ResumeService();
```

---

## 8. Resume Controller

```javascript
// controllers/resume.controller.js
const Resume = require('../models/Resume');
const resumeService = require('../services/resume.service');

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { buffer, mimetype, originalname } = req.file;
    
    // Parse resume using AI
    const parsedData = await resumeService.parseResume(buffer, mimetype);
    
    // Save to database
    const resume = new Resume({
      userId: req.user._id,
      originalFileName: originalname,
      ...parsedData
    });
    
    await resume.save();
    
    res.status(201).json({
      success: true,
      message: 'Resume parsed successfully',
      parsedResume: {
        id: resume._id,
        ...parsedData
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to parse resume',
      error: error.message 
    });
  }
};

exports.getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    res.json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .select('originalFileName personalInfo.name aiAnalysis.primaryDomain createdAt')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, resumes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    const result = await Resume.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!result) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    res.json({ success: true, message: 'Resume deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
```

---

## 9. Enhanced Interview Controller

```javascript
// controllers/interview.controller.js
const InterviewSession = require('../models/InterviewSession');
const Question = require('../models/Question');
const Resume = require('../models/Resume');
const geminiService = require('../services/gemini.service');
const scoringService = require('../services/scoring.service');

/**
 * Generate personalized questions based on resume
 */
exports.generateQuestions = async (req, res) => {
  try {
    const { resumeId } = req.body;
    
    // Get parsed resume
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id
    });
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    // Generate questions using Gemini
    const generatedQuestions = await geminiService.generateQuestions(resume, 10);
    
    // Create interview session
    const session = new InterviewSession({
      userId: req.user._id,
      resumeId: resume._id,
      status: 'questions_generated'
    });
    
    // Save questions and link to session
    const questionDocs = [];
    for (let i = 0; i < generatedQuestions.length; i++) {
      const q = generatedQuestions[i];
      const question = new Question({
        sessionId: session._id,
        resumeId: resume._id,
        questionText: q.questionText,
        category: q.category,
        basedOn: q.basedOn,
        relatedSkill: q.relatedSkill,
        expectedKeyPoints: q.expectedKeyPoints,
        difficultyLevel: q.difficultyLevel,
        tips: q.tips,
        timeLimit: q.timeLimit || 120,
        isAIGenerated: true
      });
      await question.save();
      
      session.questions.push({
        questionId: question._id,
        order: i + 1
      });
      
      questionDocs.push(question);
    }
    
    await session.save();
    
    res.status(201).json({
      success: true,
      sessionId: session._id,
      totalQuestions: questionDocs.length,
      questions: questionDocs.map(q => ({
        id: q._id,
        text: q.questionText,
        category: q.category,
        basedOn: q.basedOn,
        tips: q.tips,
        timeLimit: q.timeLimit
      }))
    });
  } catch (error) {
    console.error('Generate questions error:', error);
    res.status(500).json({ message: 'Failed to generate questions', error: error.message });
  }
};

/**
 * Submit and evaluate an answer
 */
exports.submitAnswer = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionId, answer } = req.body;
    
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    const resume = await Resume.findById(session.resumeId);
    
    // Evaluate answer using Gemini
    const evaluation = await geminiService.evaluateAnswer(
      question, 
      answer,
      resume
    );
    
    // Add answer to session
    session.answers.push({
      questionId: question._id,
      answerText: answer,
      responseTime: req.body.responseTime || 0,
      answeredAt: new Date(),
      aiEvaluation: evaluation
    });
    
    await session.save();
    
    res.json({
      success: true,
      feedback: {
        overallScore: evaluation.overallScore,
        summary: evaluation.feedback,
        scores: {
          relevance: evaluation.relevanceScore,
          accuracy: evaluation.accuracyScore,
          communication: evaluation.communicationScore,
          depth: evaluation.depthScore
        },
        tips: evaluation.improvementTips
      }
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ message: 'Failed to evaluate answer', error: error.message });
  }
};

/**
 * Complete interview and generate final results
 */
exports.completeInterview = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await InterviewSession.findById(sessionId)
      .populate('questions.questionId')
      .populate('resumeId');
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    session.status = 'completed';
    session.endTime = new Date();
    session.totalDuration = session.endTime - session.startTime;
    await session.save();
    
    // Calculate scores
    const result = await scoringService.calculateFinalScores(session);
    
    // Generate AI summary
    const summary = await geminiService.generateFinalSummary({
      candidateName: session.resumeId.personalInfo?.name,
      domain: session.resumeId.aiAnalysis?.primaryDomain,
      answers: session.answers.map(a => ({
        question: a.questionId?.questionText,
        category: a.questionId?.category,
        overallScore: a.aiEvaluation?.overallScore,
        feedback: a.aiEvaluation?.feedback
      })),
      confidence: {
        eyeContact: result.confidence.eyeContactRatio,
        posture: result.confidence.postureStability,
        calmness: result.confidence.facialCalmness
      },
      irs: result.interviewReadinessScore,
      passed: result.passed
    });
    
    // Save result
    result.overallFeedback = summary.overallFeedback;
    result.strengths = summary.strengths;
    result.areasToImprove = summary.areasToImprove;
    result.recommendations = summary.recommendations;
    await result.save();
    
    res.json({
      success: true,
      result: {
        sessionId: session._id,
        aptitudeScore: result.aptitudeScore,
        confidenceScore: result.confidenceScore,
        interviewReadinessScore: result.interviewReadinessScore,
        passed: result.passed,
        summary: summary
      }
    });
  } catch (error) {
    console.error('Complete interview error:', error);
    res.status(500).json({ message: 'Failed to complete interview', error: error.message });
  }
};
```

---

## 10. Enhanced Scoring Service

```javascript
// services/scoring.service.js
const Result = require('../models/Result');

class ScoringService {
  /**
   * Calculate final scores from session data
   */
  async calculateFinalScores(session) {
    // Calculate answer performance
    const answerPerformance = this.calculateAnswerPerformance(session.answers);
    
    // Calculate confidence from video frames
    const confidenceMetrics = this.calculateConfidenceMetrics(session.confidenceFrames);
    
    // Calculate final scores
    const aptitudeScore = (answerPerformance.overallAnswerScore).toFixed(1);
    const confidenceScore = (confidenceMetrics.confidenceScore).toFixed(1);
    
    // IRS = 50% Aptitude + 50% Confidence
    const irs = ((aptitudeScore * 5) + (confidenceScore * 5)).toFixed(1);
    const passed = irs >= 60;
    
    // Create result document
    const result = new Result({
      sessionId: session._id,
      userId: session.userId,
      resumeId: session.resumeId,
      answerPerformance,
      confidenceMetrics,
      aptitudeScore: parseFloat(aptitudeScore),
      confidenceScore: parseFloat(confidenceScore),
      interviewReadinessScore: parseFloat(irs),
      passed
    });
    
    return result;
  }

  /**
   * Calculate answer performance from AI evaluations
   */
  calculateAnswerPerformance(answers) {
    if (!answers || answers.length === 0) {
      return { overallAnswerScore: 0 };
    }
    
    const scores = answers.map(a => a.aiEvaluation || {});
    
    const avg = (arr, key) => {
      const valid = arr.filter(s => s[key] !== undefined);
      return valid.length ? valid.reduce((sum, s) => sum + s[key], 0) / valid.length : 0;
    };
    
    const averageRelevance = avg(scores, 'relevanceScore');
    const averageAccuracy = avg(scores, 'accuracyScore');
    const averageCommunication = avg(scores, 'communicationScore');
    const averageDepth = avg(scores, 'depthScore');
    
    // Weighted overall: Accuracy 30%, Relevance 30%, Communication 20%, Depth 20%
    const overallAnswerScore = (
      (averageAccuracy * 0.3) +
      (averageRelevance * 0.3) +
      (averageCommunication * 0.2) +
      (averageDepth * 0.2)
    ) / 10;  // Convert to 0-10 scale
    
    // Category breakdown
    const byCategory = {};
    answers.forEach(a => {
      const cat = a.questionId?.category || 'general';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(a.aiEvaluation?.overallScore || 0);
    });
    
    const categoryScores = {};
    for (const [cat, scores] of Object.entries(byCategory)) {
      categoryScores[`${cat}Score`] = scores.reduce((a, b) => a + b, 0) / scores.length;
    }
    
    return {
      totalQuestions: answers.length,
      averageRelevance,
      averageAccuracy,
      averageCommunication,
      averageDepth,
      overallAnswerScore,
      ...categoryScores
    };
  }

  /**
   * Calculate confidence metrics from video frames
   */
  calculateConfidenceMetrics(frames) {
    if (!frames || frames.length === 0) {
      return {
        eyeContactRatio: 50,
        postureStability: 50,
        facialCalmness: 50,
        confidenceScore: 5
      };
    }
    
    const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
    
    const eyeContactRatio = avg(frames.map(f => f.eyeContact || 0));
    const postureStability = avg(frames.map(f => f.posture || 0));
    const facialCalmness = avg(frames.map(f => f.facialTension || 0));
    
    // Weighted: Eye Contact 30%, Posture 35%, Calmness 35%
    const confidenceScore = (
      (eyeContactRatio * 0.30) +
      (postureStability * 0.35) +
      (facialCalmness * 0.35)
    ) / 10;  // Convert to 0-10 scale
    
    return {
      eyeContactRatio,
      postureStability,
      facialCalmness,
      confidenceScore
    };
  }
}

module.exports = new ScoringService();
```

---

## 11. File Upload Middleware

```javascript
// middleware/upload.js
const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024  // 5MB limit
  }
});

module.exports = upload;
```

---

## 12. Environment Variables

```env
# .env
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/clearview

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Google Gemini API (FREE)
GEMINI_API_KEY=your-gemini-api-key

# Python AI Service
AI_SERVICE_URL=http://localhost:5001

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

### Getting FREE Gemini API Key:
1. Go to: https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy and paste into `.env`

**FREE Tier Limits:**
- 15 requests per minute
- 1 million tokens per day
- 1,500 requests per day

---

## 13. Package Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "@google/generative-ai": "^0.1.3",
    "pdf-parse": "^1.1.1",
    "mammoth": "^1.6.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

---

## 14. Implementation Priority

### Phase 1: Resume Module (Week 1)
1. File upload middleware
2. PDF/DOCX text extraction
3. Gemini resume parsing
4. Resume model & routes

### Phase 2: Question Generation (Week 1-2)
5. Gemini question generation
6. Question model updates
7. Session creation with questions

### Phase 3: Answer Evaluation (Week 2)
8. Answer submission endpoint
9. Gemini answer evaluation
10. Real-time feedback

### Phase 4: Final Scoring (Week 3)
11. Enhanced scoring service
12. Gemini summary generation
13. Result compilation

### Phase 5: Integration (Week 3-4)
14. Full flow testing
15. Error handling
16. Deployment

---

## 15. FREE Deployment Solution

| Component | Platform | Free Tier |
|-----------|----------|-----------|
| Node.js Backend | **Render** | 750 hrs/month |
| Python AI Service | **Render** | 750 hrs/month |
| Database | **MongoDB Atlas** | 512MB forever |
| Frontend | **Vercel** | Unlimited |
| AI/LLM | **Google Gemini** | 1M tokens/day |

**Total Monthly Cost: $0**

---

> **Summary**: This enhanced backend uses **100% FREE tools** - Google Gemini for resume parsing, question generation, and answer evaluation. Combined with MediaPipe for confidence analysis. No paid APIs required!
