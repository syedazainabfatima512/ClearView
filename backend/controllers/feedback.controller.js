/**
 * ============================================
 * FEEDBACK CONTROLLER - Get Interview Results
 * ============================================
 * 
 * This controller handles:
 * - Getting detailed results for a session
 * - Getting user's result history
 * - Getting user statistics
 */

const { Result, InterviewSession } = require('../models');

/**
 * ========================================
 * GET RESULT - Detailed result for session
 * ========================================
 * GET /api/feedback/:sessionId
 */
const getResult = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const result = await Result.findOne({
            sessionId: sessionId,
            userId: req.user._id
        });

        if (!result) {
            const session = await InterviewSession.findOne({
                _id: sessionId,
                userId: req.user._id
            });

            if (session?.status === 'analyzing') {
                return res.status(202).json({
                    success: true,
                    status: 'analyzing',
                    message: 'Interview analysis is still running.'
                });
            }

            if (session?.status === 'failed') {
                return res.status(500).json({
                    success: false,
                    status: 'failed',
                    message: session.processingError || 'Interview analysis failed.'
                });
            }

            return res.status(404).json({
                success: false,
                message: 'Result not found. Interview may not be completed yet.'
            });
        }

        // Get session with answers for detailed breakdown
        const session = await InterviewSession.findById(sessionId)
            .populate('questions.questionId');

        // Build detailed answer breakdown
        const answerBreakdown = session.answers.map((a, index) => {
            const questionData = session.questions.find(
                q => q.questionId._id.toString() === a.questionId.toString()
            );

            return {
                questionNumber: index + 1,
                question: questionData?.questionId?.questionText || 'Unknown',
                category: questionData?.questionId?.category || 'general',
                answer: a.answerText,
                responseTime: a.responseTime,
                evaluation: a.aiEvaluation
            };
        });

        res.json({
            success: true,
            status: 'completed',
            result: {
                id: result._id,
                sessionId: result.sessionId,

                // Main Scores
                aptitudeScore: result.aptitudeScore,
                confidenceScore: result.confidenceScore,
                interviewReadinessScore: result.interviewReadinessScore,
                passed: result.passed,

                // Answer Performance
                answerPerformance: result.answerPerformance,

                // Confidence Metrics
                confidenceMetrics: result.confidenceMetrics,

                // Voice Delivery Metrics (aggregated from per-answer local capture)
                voiceMetrics: result.voiceMetrics || {},

                // AI Feedback
                overallFeedback: result.overallFeedback,
                strengths: result.strengths,
                areasToImprove: result.areasToImprove,
                recommendations: result.recommendations,
                interviewReadiness: result.interviewReadiness,
                nextSteps: result.nextSteps,

                // Detailed per-question breakdown
                answerBreakdown,

                // Metadata
                completedAt: result.createdAt
            }
        });

    } catch (error) {
        console.error('Get result error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get result',
            error: error.message
        });
    }
};

/**
 * ========================================
 * GET HISTORY - All user's results
 * ========================================
 * GET /api/feedback/history
 */
const getHistory = async (req, res) => {
    try {
        const results = await Result.find({ userId: req.user._id })
            .populate({
                path: 'resumeId',
                select: 'originalFileName personalInfo.name aiAnalysis.primaryDomain'
            })
            .sort({ createdAt: -1 });  // Newest first

        res.json({
            success: true,
            count: results.length,
            history: results.map(r => ({
                id: r._id,
                sessionId: r.sessionId,
                resumeName: r.resumeId?.originalFileName || 'Unknown',
                candidateName: r.resumeId?.personalInfo?.name || 'Unknown',
                domain: r.resumeId?.aiAnalysis?.primaryDomain || 'Not specified',
                aptitudeScore: r.aptitudeScore,
                confidenceScore: r.confidenceScore,
                irs: r.interviewReadinessScore,
                passed: r.passed,
                completedAt: r.createdAt
            }))
        });

    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get history',
            error: error.message
        });
    }
};

/**
 * ========================================
 * GET STATS - User's overall statistics
 * ========================================
 * GET /api/feedback/stats
 */
const getStats = async (req, res) => {
    try {
        const results = await Result.find({ userId: req.user._id });

        if (results.length === 0) {
            return res.json({
                success: true,
                stats: {
                    totalInterviews: 0,
                    averageIRS: 0,
                    passRate: 0,
                    averageAptitude: 0,
                    averageConfidence: 0,
                    bestScore: 0,
                    recentTrend: 'No data'
                }
            });
        }

        // Calculate statistics
        const totalInterviews = results.length;
        const passedCount = results.filter(r => r.passed).length;
        const passRate = ((passedCount / totalInterviews) * 100).toFixed(1);

        const avgIRS = results.reduce((sum, r) => sum + r.interviewReadinessScore, 0) / totalInterviews;
        const avgAptitude = results.reduce((sum, r) => sum + r.aptitudeScore, 0) / totalInterviews;
        const avgConfidence = results.reduce((sum, r) => sum + r.confidenceScore, 0) / totalInterviews;

        const bestScore = Math.max(...results.map(r => r.interviewReadinessScore));

        // Calculate trend (last 3 vs previous 3)
        let recentTrend = 'Stable';
        if (results.length >= 6) {
            const recent = results.slice(0, 3);
            const previous = results.slice(3, 6);
            const recentAvg = recent.reduce((sum, r) => sum + r.interviewReadinessScore, 0) / 3;
            const previousAvg = previous.reduce((sum, r) => sum + r.interviewReadinessScore, 0) / 3;

            if (recentAvg > previousAvg + 5) {
                recentTrend = 'Improving';
            } else if (recentAvg < previousAvg - 5) {
                recentTrend = 'Declining';
            }
        }

        res.json({
            success: true,
            stats: {
                totalInterviews,
                averageIRS: parseFloat(avgIRS.toFixed(1)),
                passRate: parseFloat(passRate),
                averageAptitude: parseFloat(avgAptitude.toFixed(1)),
                averageConfidence: parseFloat(avgConfidence.toFixed(1)),
                bestScore,
                recentTrend
            }
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get stats',
            error: error.message
        });
    }
};

module.exports = {
    getResult,
    getHistory,
    getStats
};
