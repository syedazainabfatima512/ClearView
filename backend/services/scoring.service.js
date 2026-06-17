/**
 * ============================================
 * SCORING SERVICE - Calculates All Scores
 * ============================================
 * 
 * This service handles all score calculations:
 * - Answer performance scores
 * - Confidence scores (from video analysis)
 * - Final Interview Readiness Score (IRS)
 */

const Result = require('../models/Result');
const {
    SCORING_WEIGHTS,
    FINAL_SCORING_WEIGHTS,
    IRS_PASS_THRESHOLD,
    MIN_APTITUDE_TO_PASS
} = require('../config/constants');

class ScoringService {

    /**
     * ========================================
     * CALCULATE FINAL SCORES - Main function
     * ========================================
     * Takes session data and calculates all final scores
     */
    async calculateFinalScores(session) {
        // Calculate answer performance
        const answerPerformance = this.calculateAnswerPerformance(session);

        // Calculate confidence from video frames
        const confidenceMetrics = this.calculateConfidenceMetrics(session.confidenceFrames);

        // Aggregate voice delivery metrics
        const voiceMetrics = this.calculateVoiceMetrics(session.answers);

        // Calculate final scores (0-10 scale)
        const aptitudeScore = parseFloat(answerPerformance.overallAnswerScore.toFixed(1));
        const confidenceScore = parseFloat(confidenceMetrics.confidenceScore.toFixed(1));

        // Content should dominate readiness. If confidence data is missing,
        // do not inflate the result with neutral defaults.
        const hasConfidenceData = (confidenceMetrics.sampleCount || 0) > 0;
        const aptitudeWeight = hasConfidenceData ? FINAL_SCORING_WEIGHTS.APTITUDE : 1;
        const confidenceWeight = hasConfidenceData ? FINAL_SCORING_WEIGHTS.CONFIDENCE : 0;

        const irs = parseFloat((
            (aptitudeScore * 10 * aptitudeWeight) +
            (confidenceScore * 10 * confidenceWeight)
        ).toFixed(1));

        const passed = irs >= IRS_PASS_THRESHOLD && aptitudeScore >= MIN_APTITUDE_TO_PASS;

        // Create result document
        const result = new Result({
            sessionId: session._id,
            userId: session.userId,
            resumeId: session.resumeId,
            answerPerformance,
            confidenceMetrics,
            voiceMetrics,
            aptitudeScore,
            confidenceScore,
            interviewReadinessScore: irs,
            passed
        });

        return result;
    }

    /**
     * ========================================
     * CALCULATE ANSWER PERFORMANCE
     * ========================================
     * Analyzes all answers and calculates aggregate scores
     */
    calculateAnswerPerformance(session) {
        const answers = session?.answers || [];

        // Default scores if no answers
        if (!answers || answers.length === 0) {
            return {
                totalQuestions: 0,
                averageRelevance: 0,
                averageAccuracy: 0,
                averageCommunication: 0,
                averageDepth: 0,
                overallAnswerScore: 0,
                strongestCategory: 'none',
                weakestCategory: 'none'
            };
        }

        // Extract all AI evaluations
        const evaluations = answers.map(a => a.aiEvaluation || {});

        // Helper function to calculate average
        const avg = (arr, key) => {
            const valid = arr.filter(s => s[key] !== undefined && s[key] !== null);
            if (valid.length === 0) return 0;
            return valid.reduce((sum, s) => sum + s[key], 0) / valid.length;
        };

        // Calculate averages for each metric
        const averageRelevance = avg(evaluations, 'relevanceScore');
        const averageAccuracy = avg(evaluations, 'accuracyScore');
        const averageCommunication = avg(evaluations, 'communicationScore');
        const averageDepth = avg(evaluations, 'depthScore');

        // Calculate weighted overall score
        const overallAnswerScore = (
            (averageAccuracy * SCORING_WEIGHTS.ACCURACY) +
            (averageRelevance * SCORING_WEIGHTS.RELEVANCE) +
            (averageCommunication * SCORING_WEIGHTS.COMMUNICATION) +
            (averageDepth * SCORING_WEIGHTS.DEPTH)
        ) / 10;  // Convert to 0-10 scale

        // Calculate scores by category
        const questionCategoryMap = new Map(
            (session?.questions || [])
                .map((q) => {
                    const populatedQuestion = q.questionId;
                    const questionId = populatedQuestion?._id?.toString?.() || populatedQuestion?.toString?.();

                    if (!questionId) {
                        return null;
                    }

                    return [questionId, populatedQuestion?.category || 'general'];
                })
                .filter(Boolean)
        );

        const byCategory = {};
        answers.forEach(a => {
            const cat = questionCategoryMap.get(a.questionId?.toString()) || 'general';
            if (!byCategory[cat]) byCategory[cat] = [];
            byCategory[cat].push(a.aiEvaluation?.overallScore || 0);
        });

        const categoryScores = {};
        let strongest = { category: 'none', score: -1 };
        let weakest = { category: 'none', score: 101 };

        for (const [cat, scores] of Object.entries(byCategory)) {
            const catAvg = scores.reduce((a, b) => a + b, 0) / scores.length;
            categoryScores[`${cat}Score`] = catAvg;

            if (catAvg > strongest.score) {
                strongest = { category: cat, score: catAvg };
            }
            if (catAvg < weakest.score) {
                weakest = { category: cat, score: catAvg };
            }
        }

        return {
            totalQuestions: answers.length,
            averageRelevance,
            averageAccuracy,
            averageCommunication,
            averageDepth,
            overallAnswerScore,
            strongestCategory: strongest.category,
            weakestCategory: weakest.category,
            ...categoryScores
        };
    }

    /**
     * ========================================
     * CALCULATE CONFIDENCE METRICS
     * ========================================
     * Analyzes video frames to calculate confidence score
     */
    calculateConfidenceMetrics(frames) {
        // Default values if no video data
        if (!frames || frames.length === 0) {
            return {
                eyeContactRatio: 0,
                postureStability: 0,
                facialCalmness: 0,
                confidenceScore: 0,
                sampleCount: 0
            };
        }

        const weightedAverage = (items, key) => {
            const valid = items.filter((item) => item[key] !== undefined && item[key] !== null);

            if (valid.length === 0) {
                return 0;
            }

            const totalWeight = valid.reduce((sum, item) => sum + (item.sampleCount || 1), 0);
            if (totalWeight === 0) {
                return 0;
            }

            return valid.reduce(
                (sum, item) => sum + (item[key] * (item.sampleCount || 1)),
                0
            ) / totalWeight;
        };

        const sampleCount = frames.reduce((sum, frame) => sum + (frame.sampleCount || 0), 0);

        if (sampleCount === 0) {
            return {
                eyeContactRatio: 0,
                postureStability: 0,
                facialCalmness: 0,
                confidenceScore: 0,
                sampleCount: 0
            };
        }

        // Calculate averages for each metric
        const eyeContactRatio = weightedAverage(frames, 'eyeContact');
        const postureStability = weightedAverage(frames, 'posture');
        const facialCalmness = weightedAverage(frames, 'facialTension');

        // Calculate weighted confidence score
        const confidenceScore = (
            (eyeContactRatio * SCORING_WEIGHTS.EYE_CONTACT) +
            (postureStability * SCORING_WEIGHTS.POSTURE) +
            (facialCalmness * SCORING_WEIGHTS.FACIAL_CALMNESS)
        ) / 10;  // Convert to 0-10 scale

        return {
            eyeContactRatio,
            postureStability,
            facialCalmness,
            confidenceScore,
            sampleCount
        };
    }

    /**
     * ========================================
     * CALCULATE VOICE METRICS
     * ========================================
     * Aggregates browser-side voice delivery metrics captured per answer
     */
    calculateVoiceMetrics(answers) {
        const answerList = answers || [];
        const voiceEntries = answerList
            .map((answer) => answer.voiceMetrics)
            .filter(Boolean);

        if (voiceEntries.length === 0) {
            return {
                capturedAnswers: 0,
                captureRate: 0,
                totalWordCount: 0,
                totalFillerWords: 0,
                averageFillerWordRate: 0,
                averageWordsPerMinute: 0,
                averageSpeakingDurationMs: 0,
                averagePauseCount: 0,
                averagePauseRatio: 0,
                averageVolume: 0,
                averageVolumeStability: 0
            };
        }

        const spokenEntries = voiceEntries.filter(
            (entry) => entry.answerSource !== 'typed' && (entry.speakingDurationMs || 0) > 0
        );

        const avg = (entries, key) => {
            const valid = entries.filter((entry) => entry[key] !== undefined && entry[key] !== null);

            if (valid.length === 0) {
                return 0;
            }

            return valid.reduce((sum, entry) => sum + entry[key], 0) / valid.length;
        };

        const totalWordCount = voiceEntries.reduce((sum, entry) => sum + (entry.wordCount || 0), 0);
        const totalFillerWords = voiceEntries.reduce((sum, entry) => sum + (entry.fillerWordCount || 0), 0);
        const capturedAnswers = spokenEntries.length;
        const captureRate = answerList.length > 0 ? (capturedAnswers / answerList.length) * 100 : 0;

        return {
            capturedAnswers,
            captureRate,
            totalWordCount,
            totalFillerWords,
            averageFillerWordRate: avg(voiceEntries, 'fillerWordRate'),
            averageWordsPerMinute: avg(spokenEntries, 'wordsPerMinute'),
            averageSpeakingDurationMs: avg(spokenEntries, 'speakingDurationMs'),
            averagePauseCount: avg(spokenEntries, 'pauseCount'),
            averagePauseRatio: avg(spokenEntries, 'pauseRatio'),
            averageVolume: avg(spokenEntries, 'averageVolume'),
            averageVolumeStability: avg(spokenEntries, 'volumeStability')
        };
    }

    /**
     * ========================================
     * UPDATE USER STATISTICS
     * ========================================
     * Updates user's average IRS and test count
     */
    async updateUserStats(userId, newIRS) {
        const User = require('../models/User');
        const user = await User.findById(userId);

        if (user) {
            const newTotal = user.totalTests + 1;
            const newAverage = ((user.averageIRS * user.totalTests) + newIRS) / newTotal;

            user.totalTests = newTotal;
            user.averageIRS = parseFloat(newAverage.toFixed(1));
            await user.save();
        }
    }
}

module.exports = new ScoringService();
