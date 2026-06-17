/**
 * ============================================
 * INTERVIEW CONTROLLER - Manages Interview Sessions
 * ============================================
 *
 * Long NVIDIA NIM work is queued in-process so API requests return
 * quickly. The UI polls session/result endpoints for readiness.
 */

const { InterviewSession, Question, Resume, Result } = require('../models');
const llmService = require('../services/llm.service');
const scoringService = require('../services/scoring.service');
const { DEFAULT_QUESTION_COUNT } = require('../config/constants');

const serializeQuestion = (question, index) => ({
    id: question._id,
    order: index + 1,
    text: question.questionText,
    category: question.category,
    basedOn: question.basedOn,
    difficulty: question.difficultyLevel,
    tips: question.tips,
    timeLimit: question.timeLimit
});

const queueBackgroundTask = (label, task) => {
    setImmediate(() => {
        task().catch((error) => {
            console.error(`${label} failed:`, error);
        });
    });
};

const normalizeQuestion = (question) => ({
    questionText: question.questionText || 'Tell me about a relevant experience from your resume.',
    category: ['technical', 'behavioral', 'situational', 'project', 'general'].includes(question.category)
        ? question.category
        : 'general',
    basedOn: question.basedOn || '',
    relatedSkill: question.relatedSkill || '',
    expectedKeyPoints: Array.isArray(question.expectedKeyPoints) ? question.expectedKeyPoints.slice(0, 5) : [],
    difficultyLevel: ['easy', 'medium', 'hard'].includes(question.difficultyLevel) ? question.difficultyLevel : 'medium',
    tips: question.tips || '',
    timeLimit: Number.isFinite(Number(question.timeLimit)) ? Number(question.timeLimit) : 120
});

const saveQuestionsForSession = async (session, generatedQuestions, source) => {
    await Question.deleteMany({ sessionId: session._id });

    session.questions = [];
    session.questionGenerationSource = source;
    session.processingError = '';

    const questionDocs = [];
    for (let i = 0; i < generatedQuestions.length; i += 1) {
        const item = normalizeQuestion(generatedQuestions[i]);
        const question = new Question({
            sessionId: session._id,
            resumeId: session.resumeId,
            questionText: item.questionText,
            category: item.category,
            basedOn: item.basedOn,
            relatedSkill: item.relatedSkill,
            expectedKeyPoints: item.expectedKeyPoints,
            difficultyLevel: item.difficultyLevel,
            tips: item.tips,
            timeLimit: item.timeLimit,
            isAIGenerated: source === 'ai'
        });

        await question.save();

        session.questions.push({
            questionId: question._id,
            order: i + 1
        });

        questionDocs.push(question);
    }

    session.status = 'questions_generated';
    await session.save();
    return questionDocs;
};

const generateQuestionsInBackground = async (sessionId) => {
    const session = await InterviewSession.findById(sessionId);
    if (!session) return;

    const resume = await Resume.findById(session.resumeId);
    if (!resume) {
        session.status = 'failed';
        session.processingError = 'Resume not found while generating questions.';
        await session.save();
        return;
    }

    try {
        const aiQuestions = await llmService.generateQuestions(resume, DEFAULT_QUESTION_COUNT);
        if (!Array.isArray(aiQuestions) || aiQuestions.length === 0) {
            throw new Error('AI returned no usable questions.');
        }
        await saveQuestionsForSession(session, aiQuestions.slice(0, DEFAULT_QUESTION_COUNT), 'ai');
        console.log(`Generated AI questions for session: ${session._id}`);
    } catch (error) {
        console.warn(`AI question generation timed out; using local fallback for session ${session._id}:`, error.message);
        const fallbackQuestions = llmService.generateFallbackQuestions(resume, DEFAULT_QUESTION_COUNT);
        session.processingError = error.message;
        await saveQuestionsForSession(session, fallbackQuestions, 'local_fallback');
    }
};

const generateQuestions = async (req, res) => {
    try {
        const { resumeId } = req.body;

        if (!resumeId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a resumeId'
            });
        }

        const resume = await Resume.findOne({
            _id: resumeId,
            userId: req.user._id
        });

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        const session = new InterviewSession({
            userId: req.user._id,
            resumeId: resume._id,
            status: 'preparing'
        });

        await session.save();

        queueBackgroundTask('question generation', () =>
            generateQuestionsInBackground(session._id)
        );

        res.status(202).json({
            success: true,
            message: 'Question generation started.',
            status: session.status,
            sessionId: session._id,
            totalQuestions: 0,
            questions: []
        });
    } catch (error) {
        console.error('Generate questions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to start question generation',
            error: error.message
        });
    }
};

const startSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await InterviewSession.findOne({
            _id: sessionId,
            userId: req.user._id
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        if (session.status === 'preparing') {
            return res.status(409).json({
                success: false,
                message: 'Questions are still being generated.'
            });
        }

        if (session.status === 'in_progress') {
            return res.json({
                success: true,
                message: 'Session already in progress',
                sessionId: session._id,
                startTime: session.startTime
            });
        }

        if (['analyzing', 'completed'].includes(session.status)) {
            return res.status(400).json({
                success: false,
                message: 'Session is already finished or being analyzed.'
            });
        }

        session.status = 'in_progress';
        session.startTime = session.startTime || new Date();
        await session.save();

        res.json({
            success: true,
            message: 'Interview session started',
            sessionId: session._id,
            startTime: session.startTime
        });
    } catch (error) {
        console.error('Start session error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to start session',
            error: error.message
        });
    }
};

const getQuestions = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await InterviewSession.findOne({
            _id: sessionId,
            userId: req.user._id
        }).populate('questions.questionId');

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        const questions = (session.questions || [])
            .filter((entry) => entry.questionId)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((entry, index) => serializeQuestion(entry.questionId, index));

        res.json({
            success: true,
            sessionId: session._id,
            status: session.status,
            questionGenerationSource: session.questionGenerationSource,
            processingError: session.processingError,
            totalQuestions: questions.length,
            questions
        });
    } catch (error) {
        console.error('Get questions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get questions',
            error: error.message
        });
    }
};

const submitAnswer = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { questionId, answer, responseTime, confidenceSnapshot, voiceMetrics } = req.body;

        if (!questionId || !answer) {
            return res.status(400).json({
                success: false,
                message: 'Please provide questionId and answer'
            });
        }

        const session = await InterviewSession.findOne({
            _id: sessionId,
            userId: req.user._id
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        const answerRecord = {
            questionId: question._id,
            answerText: answer,
            responseTime: responseTime || 0,
            answeredAt: new Date()
        };

        if (voiceMetrics && typeof voiceMetrics === 'object') {
            answerRecord.voiceMetrics = voiceMetrics;
        }

        session.answers.push(answerRecord);

        if (confidenceSnapshot && typeof confidenceSnapshot === 'object') {
            session.confidenceFrames.push({
                timestamp: new Date(),
                eyeContact: confidenceSnapshot.eyeContact ?? undefined,
                posture: confidenceSnapshot.posture ?? undefined,
                facialTension: confidenceSnapshot.facialCalmness ?? undefined,
                sampleCount: confidenceSnapshot.sampleCount ?? 1
            });
        }

        await session.save();

        res.json({
            success: true,
            message: 'Answer saved successfully',
            answeredAt: answerRecord.answeredAt
        });
    } catch (error) {
        console.error('Submit answer error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit answer',
            error: error.message
        });
    }
};

const analyzeFrame = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { eyeContact, posture, facialTension } = req.body;

        const session = await InterviewSession.findOne({
            _id: sessionId,
            userId: req.user._id
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        session.confidenceFrames.push({
            timestamp: new Date(),
            eyeContact: eyeContact ?? undefined,
            posture: posture ?? undefined,
            facialTension: facialTension ?? undefined,
            sampleCount: 1
        });

        await session.save();

        res.json({
            success: true,
            message: 'Frame analyzed',
            frameCount: session.confidenceFrames.length
        });
    } catch (error) {
        console.error('Analyze frame error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to analyze frame',
            error: error.message
        });
    }
};

const buildAssessmentInput = (session) => session.answers.map((answer, index) => {
    const questionEntry = session.questions.find((entry) =>
        entry.questionId._id.toString() === answer.questionId.toString()
    );

    return {
        answerIndex: index + 1,
        questionDoc: questionEntry?.questionId || null,
        question: questionEntry?.questionId?.questionText || 'Unknown question',
        category: questionEntry?.questionId?.category || 'general',
        expectedKeyPoints: questionEntry?.questionId?.expectedKeyPoints || [],
        answer: answer.answerText || ''
    };
});

const buildConfidenceSummary = (frames = []) => {
    if (frames.length === 0) {
        return { eyeContact: 0, posture: 0, facialCalmness: 0, totalSamples: 0 };
    }

    const weightedAvg = (key) => {
        const valid = frames.filter((frame) => frame[key] !== undefined && frame[key] !== null);
        const validWeight = valid.reduce((sum, frame) => sum + (frame.sampleCount || 0), 0);
        if (valid.length === 0 || validWeight === 0) return 0;

        return valid.reduce(
            (sum, frame) => sum + ((frame[key] || 0) * (frame.sampleCount || 0)),
            0
        ) / validWeight;
    };

    return {
        eyeContact: parseFloat(weightedAvg('eyeContact').toFixed(1)),
        posture: parseFloat(weightedAvg('posture').toFixed(1)),
        facialCalmness: parseFloat(weightedAvg('facialTension').toFixed(1)),
        totalSamples: frames.reduce((sum, frame) => sum + (frame.sampleCount || 0), 0)
    };
};

const buildVoiceSummary = (answers = []) => {
    const voiceEntries = answers.map((answer) => answer.voiceMetrics).filter(Boolean);
    if (voiceEntries.length === 0) return {};

    return {
        capturedAnswers: voiceEntries.length,
        averageWordsPerMinute: parseFloat(
            (voiceEntries.reduce((sum, item) => sum + (item.wordsPerMinute || 0), 0) / voiceEntries.length).toFixed(1)
        ),
        averageFillerWordRate: parseFloat(
            (voiceEntries.reduce((sum, item) => sum + (item.fillerWordRate || 0), 0) / voiceEntries.length).toFixed(2)
        ),
        averagePauseRatio: parseFloat(
            (voiceEntries.reduce((sum, item) => sum + (item.pauseRatio || 0), 0) / voiceEntries.length).toFixed(2)
        )
    };
};

const applyEvaluation = (session, answerIndex, evaluation) => {
    const target = session.answers[answerIndex - 1];
    if (!target) return;

    target.aiEvaluation = {
        relevanceScore: evaluation.relevanceScore || 0,
        accuracyScore: evaluation.accuracyScore || 0,
        communicationScore: evaluation.communicationScore || 0,
        depthScore: evaluation.depthScore || 0,
        overallScore: evaluation.overallScore || 0,
        feedback: evaluation.feedback || '',
        keyPointsCovered: evaluation.keyPointsCovered || [],
        missedPoints: evaluation.missedPoints || [],
        improvementTips: evaluation.improvementTips || ''
    };
};

const evaluateAnswers = async (session, answersForBatch, confSummary, voiceSummary) => {
    const aiAnswers = [];
    let usedLocal = false;

    answersForBatch.forEach((item) => {
        const localEvaluation = llmService.getLocalAnswerEvaluation(
            item.questionDoc || { expectedKeyPoints: item.expectedKeyPoints },
            item.answer
        );

        if (localEvaluation) {
            usedLocal = true;
            applyEvaluation(session, item.answerIndex, localEvaluation);
        } else {
            aiAnswers.push(item);
        }
    });

    if (aiAnswers.length === 0) {
        return { summary: null, source: 'local_fallback' };
    }

    try {
        const batchResult = await llmService.assessInterviewBatch({
            candidateName: session.resumeId?.personalInfo?.name || 'Candidate',
            domain: session.resumeId?.aiAnalysis?.primaryDomain || 'Software Development',
            confidenceSummary: confSummary,
            voiceMetrics: voiceSummary,
            answers: aiAnswers
        });

        (batchResult.answerEvaluations || []).forEach((evaluation) => {
            applyEvaluation(session, evaluation.answerIndex, evaluation);
        });

        aiAnswers.forEach((item) => {
            if (session.answers[item.answerIndex - 1]?.aiEvaluation?.overallScore === undefined) {
                applyEvaluation(
                    session,
                    item.answerIndex,
                    llmService.buildHeuristicEvaluation(
                        item.questionDoc || { expectedKeyPoints: item.expectedKeyPoints },
                        item.answer,
                        'NVIDIA NIM did not return an evaluation for this answer.'
                    )
                );
            }
        });

        return {
            summary: batchResult.summary || null,
            source: usedLocal ? 'mixed' : 'ai'
        };
    } catch (error) {
        console.warn('Batch assessment failed, using per-answer/local fallback:', error.message);

        for (const item of aiAnswers) {
            try {
                const evaluation = await llmService.evaluateAnswer(
                    item.questionDoc || { questionText: item.question, expectedKeyPoints: item.expectedKeyPoints },
                    item.answer
                );
                applyEvaluation(session, item.answerIndex, evaluation);
            } catch (evalError) {
                applyEvaluation(
                    session,
                    item.answerIndex,
                    llmService.buildHeuristicEvaluation(
                        item.questionDoc || { expectedKeyPoints: item.expectedKeyPoints },
                        item.answer,
                        'NVIDIA NIM evaluation timed out.'
                    )
                );
            }
        }

        return { summary: null, source: usedLocal ? 'mixed' : 'local_fallback' };
    }
};

const processSessionCompletion = async (sessionId) => {
    const existingResult = await Result.findOne({ sessionId });
    if (existingResult) {
        await InterviewSession.findByIdAndUpdate(sessionId, { status: 'completed', processingError: '' });
        return;
    }

    const session = await InterviewSession.findById(sessionId)
        .populate('questions.questionId')
        .populate('resumeId');

    if (!session) return;

    try {
        const answersForBatch = buildAssessmentInput(session);
        const confSummary = buildConfidenceSummary(session.confidenceFrames || []);
        const voiceSummary = buildVoiceSummary(session.answers || []);
        const assessment = await evaluateAnswers(session, answersForBatch, confSummary, voiceSummary);

        session.analysisSource = assessment.source;
        await session.save();

        const result = await scoringService.calculateFinalScores(session);

        let summary = assessment.summary;
        if (!summary) {
            try {
                summary = await llmService.generateFinalSummary({
                    candidateName: session.resumeId?.personalInfo?.name || 'Candidate',
                    domain: session.resumeId?.aiAnalysis?.primaryDomain || 'Software Development',
                    answers: session.answers.map((answer) => {
                        const questionEntry = session.questions.find((entry) =>
                            entry.questionId._id.toString() === answer.questionId.toString()
                        );
                        return {
                            question: questionEntry?.questionId?.questionText || 'Unknown question',
                            category: questionEntry?.questionId?.category || 'general',
                            overallScore: answer.aiEvaluation?.overallScore || 0,
                            feedback: answer.aiEvaluation?.feedback || 'No feedback'
                        };
                    }),
                    confidence: {
                        eyeContact: result.confidenceMetrics.eyeContactRatio,
                        posture: result.confidenceMetrics.postureStability,
                        calmness: result.confidenceMetrics.facialCalmness
                    },
                    voiceMetrics: voiceSummary,
                    irs: result.interviewReadinessScore,
                    passed: result.passed
                });
            } catch (summaryError) {
                summary = llmService.buildFallbackSummary({}, result);
            }
        }

        result.overallFeedback = summary.overallFeedback;
        result.strengths = summary.strengths || [];
        result.areasToImprove = summary.areasToImprove || [];
        result.recommendations = summary.recommendations || [];
        result.interviewReadiness = summary.interviewReadiness || '';
        result.nextSteps = summary.nextSteps || [];

        await result.save();
        await scoringService.updateUserStats(session.userId, result.interviewReadinessScore);

        session.status = 'completed';
        session.processingError = '';
        await session.save();

        console.log(`Session completed with IRS: ${result.interviewReadinessScore}`);
    } catch (error) {
        console.error('Background interview completion failed:', error);
        session.status = 'failed';
        session.processingError = error.message;
        await session.save();
    }
};

const completeSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await InterviewSession.findOne({
            _id: sessionId,
            userId: req.user._id
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        const existingResult = await Result.findOne({
            sessionId: session._id,
            userId: req.user._id
        });

        if (existingResult) {
            return res.json({
                success: true,
                status: 'completed',
                message: 'Interview already completed.',
                sessionId: session._id
            });
        }

        if (session.status === 'analyzing') {
            return res.status(202).json({
                success: true,
                status: 'analyzing',
                message: 'Interview analysis is already running.',
                sessionId: session._id
            });
        }

        session.status = 'analyzing';
        session.endTime = new Date();
        session.totalDuration = session.startTime ? session.endTime - session.startTime : 0;
        session.processingError = '';
        await session.save();

        queueBackgroundTask('interview completion', () =>
            processSessionCompletion(session._id)
        );

        res.status(202).json({
            success: true,
            status: 'analyzing',
            message: 'Interview analysis started.',
            sessionId: session._id
        });
    } catch (error) {
        console.error('Complete session error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to start interview analysis',
            error: error.message
        });
    }
};

module.exports = {
    generateQuestions,
    startSession,
    getQuestions,
    submitAnswer,
    analyzeFrame,
    completeSession
};
