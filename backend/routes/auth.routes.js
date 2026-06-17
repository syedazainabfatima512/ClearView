/**
 * ============================================
 * AUTH ROUTES - User Authentication Endpoints
 * ============================================
 * 
 * These routes handle user registration, login, and profile.
 * 
 * PUBLIC routes (no login needed):
 *   POST /api/auth/register - Create new account
 *   POST /api/auth/login - Log into account
 * 
 * PROTECTED routes (must be logged in):
 *   GET /api/auth/me - Get current user info
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth');

// ========== PUBLIC ROUTES ==========

// Register a new user
router.post('/register', authController.register);

// Login existing user
router.post('/login', authController.login);

// ========== PROTECTED ROUTES ==========

// Get current user info (must be logged in)
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
