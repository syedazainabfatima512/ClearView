/**
 * ============================================
 * CONSTANTS - Fixed Values Used Throughout App
 * ============================================
 * 
 * Constants are like rules that never change.
 * We put them here so we can easily update them in one place.
 */

module.exports = {
    // Question categories for interviews
    QUESTION_CATEGORIES: ['technical', 'behavioral', 'situational', 'project', 'general'],

    // Difficulty levels for questions
    DIFFICULTY_LEVELS: ['easy', 'medium', 'hard'],

    // Interview session statuses
    SESSION_STATUS: {
        PREPARING: 'preparing',
        QUESTIONS_GENERATED: 'questions_generated',
        IN_PROGRESS: 'in_progress',
        COMPLETED: 'completed',
        ABANDONED: 'abandoned'
    },

    // Scoring weights
    SCORING_WEIGHTS: {
        // For Confidence Score
        EYE_CONTACT: 0.30,      // 30%
        POSTURE: 0.35,          // 35%
        FACIAL_CALMNESS: 0.35,  // 35%

        // For Answer Score
        ACCURACY: 0.35,         // 35%
        RELEVANCE: 0.30,        // 30%
        COMMUNICATION: 0.20,    // 20%
        DEPTH: 0.15             // 15%
    },

    // Final readiness score weighting
    FINAL_SCORING_WEIGHTS: {
        APTITUDE: 0.75,
        CONFIDENCE: 0.25
    },

    // IRS Pass Threshold
    IRS_PASS_THRESHOLD: 70,  // Need 70% or higher to pass
    MIN_APTITUDE_TO_PASS: 6.5, // Weak answers cannot pass on presentation alone

    // Default time limit per question (in seconds)
    DEFAULT_TIME_LIMIT: 120,  // 2 minutes

    // Number of questions to generate per interview
    DEFAULT_QUESTION_COUNT: 10,

    // File upload limits
    MAX_FILE_SIZE: 5 * 1024 * 1024,  // 5MB in bytes

    // Allowed file types for resume upload
    ALLOWED_FILE_TYPES: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
    ]
};
