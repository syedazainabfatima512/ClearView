/**
 * ============================================
 * INTERVIEW ROUTES - Interview Session Management
 * ============================================
 * 
 * All routes require authentication.
 * 
 * POST /api/interview/generate-questions - Generate AI questions from resume
 * GET /api/interview/:sessionId/questions - Get session questions
 * POST /api/interview/:sessionId/start - Start the interview
 * POST /api/interview/:sessionId/answer - Submit and evaluate answer
 * POST /api/interview/:sessionId/analyze-frame - Process video frame
 * POST /api/interview/:sessionId/complete - Complete the interview
 */

const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interview.controller');
const authMiddleware = require('../middleware/auth');

// All interview routes require authentication
router.use(authMiddleware);

// Generate personalized questions based on resume
router.post('/generate-questions', interviewController.generateQuestions);

// Get questions for a session
router.get('/:sessionId/questions', interviewController.getQuestions);

// Start an interview session
router.post('/:sessionId/start', interviewController.startSession);

// Submit an answer (gets evaluated by AI)
router.post('/:sessionId/answer', interviewController.submitAnswer);

// Send video frame for confidence analysis
router.post('/:sessionId/analyze-frame', interviewController.analyzeFrame);

// Complete the interview and get final results
router.post('/:sessionId/complete', interviewController.completeSession);

module.exports = router;
