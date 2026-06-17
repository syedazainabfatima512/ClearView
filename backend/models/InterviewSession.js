/**
 * ============================================
 * INTERVIEW SESSION MODEL - Tracks Each Interview
 * ============================================
 * 
 * This stores everything about one interview session:
 * - The questions asked
 * - The user's answers
 * - Video analysis data (confidence metrics)
 */

const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema({
    // Who is taking this interview
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Which resume was used
    resumeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
        required: true
    },

    // Current status of the interview
    status: {
        type: String,
        enum: ['preparing', 'questions_generated', 'in_progress', 'analyzing', 'completed', 'abandoned', 'failed'],
        default: 'preparing'
    },

    processingError: {
        type: String
    },

    questionGenerationSource: {
        type: String,
        enum: ['ai', 'local_fallback'],
        default: 'ai'
    },

    analysisSource: {
        type: String,
        enum: ['ai', 'mixed', 'local_fallback'],
        default: 'ai'
    },

    // List of questions for this session
    questions: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question'
        },
        order: Number  // Question order (1, 2, 3, etc.)
    }],

    // User's answers with AI evaluations
    answers: [{
        // Which question this answer is for
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question'
        },

        // The actual answer (transcribed from speech or typed)
        answerText: String,

        // How long it took to answer (in milliseconds)
        responseTime: Number,

        // When the answer was submitted
        answeredAt: Date,

        // ============ LOCAL VOICE METRICS ============
        voiceMetrics: {
            answerSource: {
                type: String,
                enum: ['typed', 'voice', 'mixed'],
                default: 'typed'
            },
            wordCount: Number,
            wordsPerMinute: Number,
            fillerWordCount: Number,
            fillerWordRate: Number,
            speakingDurationMs: Number,
            pauseCount: Number,
            pauseRatio: Number,
            averageVolume: Number,
            volumeStability: Number
        },

        // ============ AI EVALUATION OF ANSWER ============
        aiEvaluation: {
            // How relevant is the answer to the question (0-100)
            relevanceScore: Number,

            // Is the information technically correct (0-100)
            accuracyScore: Number,

            // How clear and well-structured is the answer (0-100)
            communicationScore: Number,

            // Does the answer show deep understanding (0-100)
            depthScore: Number,

            // Weighted average of all scores (0-100)
            overallScore: Number,

            // AI feedback text
            feedback: String,

            // Which expected points were covered
            keyPointsCovered: [String],

            // Which expected points were missed
            missedPoints: [String],

            // Specific improvement tip
            improvementTips: String
        }
    }],

    // ============ CONFIDENCE ANALYSIS DATA ============
    // Data from video analysis (sent every few seconds)
    confidenceFrames: [{
        timestamp: Date,
        eyeContact: Number,     // 0-100
        posture: Number,        // 0-100
        facialTension: Number,  // 0-100 (100 = calm)
        sampleCount: {
            type: Number,
            default: 1
        }
    }],

    // When the interview started
    startTime: Date,

    // When the interview ended
    endTime: Date,

    // Total duration in milliseconds
    totalDuration: Number

}, { timestamps: true });

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
