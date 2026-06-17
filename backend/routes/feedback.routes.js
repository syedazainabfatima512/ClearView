/**
 * ============================================
 * FEEDBACK ROUTES - Results & Statistics
 * ============================================
 * 
 * All routes require authentication.
 * 
 * GET /api/feedback/history - Get all past results
 * GET /api/feedback/stats - Get user statistics
 * GET /api/feedback/:sessionId - Get detailed result for a session
 */

const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');
const authMiddleware = require('../middleware/auth');

// All feedback routes require authentication
router.use(authMiddleware);

// Get user's result history
router.get('/history', feedbackController.getHistory);

// Get user's statistics
router.get('/stats', feedbackController.getStats);

// Get detailed result for a specific session
router.get('/:sessionId', feedbackController.getResult);

module.exports = router;
