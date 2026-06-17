/**
 * ============================================
 * ROUTES INDEX - Central Route Registration
 * ============================================
 * 
 * This file combines all routes and makes them accessible
 * from a single place. The server.js imports this file.
 */

const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth.routes');
const resumeRoutes = require('./resume.routes');
const interviewRoutes = require('./interview.routes');
const feedbackRoutes = require('./feedback.routes');

// Register routes with their base paths
router.use('/auth', authRoutes);       // /api/auth/...
router.use('/resume', resumeRoutes);   // /api/resume/...
router.use('/interview', interviewRoutes); // /api/interview/...
router.use('/feedback', feedbackRoutes);   // /api/feedback/...

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'ClearView API is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
