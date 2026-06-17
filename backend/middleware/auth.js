/**
 * ============================================
 * AUTH MIDDLEWARE - Protects Routes
 * ============================================
 * 
 * This is like a security guard for our API.
 * It checks if the user has a valid "ID card" (JWT token)
 * before letting them access protected routes.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const jwtConfig = require('../config/jwt');

/**
 * authMiddleware - Verifies JWT token and adds user to request
 */
const authMiddleware = async (req, res, next) => {
    try {
        // Step 1: Get the token from the "Authorization" header
        // Format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        const authHeader = req.header('Authorization');

        // If no header, user is not logged in
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Extract just the token part (remove "Bearer ")
        const token = authHeader.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Invalid token format.'
            });
        }

        // Step 2: Verify the token is real and not expired
        const decoded = jwt.verify(token, jwtConfig.secret);

        // Step 3: Find the user in database
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Please login again.'
            });
        }

        // Step 4: Attach user info to the request object
        // Now other parts of our app can use req.user
        req.user = user;
        req.token = token;

        // Move on to the next middleware or route handler
        next();

    } catch (error) {
        // Token is invalid or expired
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Authentication error.'
        });
    }
};

module.exports = authMiddleware;
