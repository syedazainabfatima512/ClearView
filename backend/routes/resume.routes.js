/**
 * ============================================
 * RESUME ROUTES - Resume Upload & Management
 * ============================================
 * 
 * All routes require authentication (must be logged in).
 * 
 * POST /api/resume/upload - Upload and parse a resume
 * GET /api/resume/all - Get all user's resumes
 * GET /api/resume/:id - Get specific resume by ID
 * DELETE /api/resume/:id - Delete a resume
 */

const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resume.controller');
const authMiddleware = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

// All resume routes require authentication
router.use(authMiddleware);

// Upload and parse a new resume
// The 'resume' is the field name in the form data
router.post('/upload',
    upload.single('resume'),
    handleUploadError,
    resumeController.uploadResume
);

// Get all resumes for the logged-in user
router.get('/all', resumeController.getAllResumes);

// Get a specific resume by ID
router.get('/:id', resumeController.getResume);

// Delete a resume
router.delete('/:id', resumeController.deleteResume);

module.exports = router;
