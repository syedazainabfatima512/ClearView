/**
 * ============================================
 * RESULT MODEL - Stores Final Interview Results
 * ============================================
 * 
 * After an interview is completed, we calculate all the
 * scores and store the final results here.
 */

const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    // Link to the interview session
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InterviewSession',
        required: true
    },

    // Who took this interview
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

    // ============ ANSWER PERFORMANCE ============
    answerPerformance: {
        totalQuestions: Number,

        // Average scores across all answers (0-100)
        averageRelevance: Number,
        averageAccuracy: Number,
        averageCommunication: Number,
        averageDepth: Number,

        // Final answer score (0-10)
        overallAnswerScore: Number,

        // Best and worst areas
        strongestCategory: String,
        weakestCategory: String,

        // Scores by question category (0-100)
        technicalScore: Number,
        behavioralScore: Number,
        situationalScore: Number,
        projectScore: Number
    },

    // ============ CONFIDENCE METRICS ============
    confidenceMetrics: {
        eyeContactRatio: Number,    // 0-100
        postureStability: Number,   // 0-100
        facialCalmness: Number,     // 0-100
        confidenceScore: Number,    // Final (0-10)
        sampleCount: Number
    },

    // ============ VOICE DELIVERY METRICS ============
    voiceMetrics: {
        capturedAnswers: Number,
        captureRate: Number,
        totalWordCount: Number,
        totalFillerWords: Number,
        averageFillerWordRate: Number,
        averageWordsPerMinute: Number,
        averageSpeakingDurationMs: Number,
        averagePauseCount: Number,
        averagePauseRatio: Number,
        averageVolume: Number,
        averageVolumeStability: Number
    },

    // ============ FINAL SCORES ============
    aptitudeScore: Number,              // Based on answers (0-10)
    confidenceScore: Number,            // Based on video (0-10)
    interviewReadinessScore: Number,    // Combined IRS (0-100)
    passed: Boolean,                    // True if IRS >= 60

    // ============ AI FEEDBACK ============
    overallFeedback: String,
    strengths: [String],
    areasToImprove: [String],
    recommendations: [String],
    interviewReadiness: String,
    nextSteps: [String],

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Result', resultSchema);
