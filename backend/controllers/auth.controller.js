/**
 * ============================================
 * AUTH CONTROLLER - Handles User Authentication
 * ============================================
 * 
 * This controller manages:
 * - User registration (sign up)
 * - User login
 * - Getting current user info
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const jwtConfig = require('../config/jwt');

/**
 * ========================================
 * REGISTER - Create new user account
 * ========================================
 * POST /api/auth/register
 */
const register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Validation: Check all required fields
        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide fullName, email, and password'
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered. Please login instead.'
            });
        }

        // Password validation
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        // Create new user (password will be hashed by the pre-save hook)
        const user = new User({
            fullName,
            email: email.toLowerCase(),
            password
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            jwtConfig.secret,
            { expiresIn: jwtConfig.expiresIn }
        );

        // Send success response (don't include password!)
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.',
            error: error.message
        });
    }
};

/**
 * ========================================
 * LOGIN - Authenticate existing user
 * ========================================
 * POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update last login time
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            jwtConfig.secret,
            { expiresIn: jwtConfig.expiresIn }
        );

        // Send success response
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                totalTests: user.totalTests,
                averageIRS: user.averageIRS,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.',
            error: error.message
        });
    }
};

/**
 * ========================================
 * GET ME - Get current user info
 * ========================================
 * GET /api/auth/me (requires authentication)
 */
const getMe = async (req, res) => {
    try {
        // req.user is set by auth middleware
        const user = await User.findById(req.user._id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                totalTests: user.totalTests,
                averageIRS: user.averageIRS,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user info',
            error: error.message
        });
    }
};

module.exports = {
    register,
    login,
    getMe
};
