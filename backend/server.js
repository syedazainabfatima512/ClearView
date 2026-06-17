/**
 * ============================================
 * CLEARVIEW BACKEND - Main Server File
 * ============================================
 * 
 * This is the entry point of our application.
 * It sets up the Express server, connects to the database,
 * and registers all middleware and routes.
 * 
 * Think of this as the "main door" to our application.
 * Everything starts here!
 */

// ========== LOAD ENVIRONMENT VARIABLES ==========
// This MUST be at the very top before anything else
require('dotenv').config();

// ========== IMPORT DEPENDENCIES ==========
const express = require('express');      // Web framework
const cors = require('cors');           // Cross-Origin Resource Sharing
const helmet = require('helmet');       // Security headers
const morgan = require('morgan');       // Request logging

const { validateEnv } = require('./config/env');

// Validate required configuration before loading modules that depend on it
validateEnv();

// Import our custom modules
const connectDB = require('./config/db');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// ========== CREATE EXPRESS APP ==========
const app = express();

// ========== CONNECT TO DATABASE ==========
connectDB();

// ========== MIDDLEWARE SETUP ==========

// Security headers (protects against common vulnerabilities)
app.use(helmet());

// CORS - Allow requests from frontend
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use(cors({
    origin: allowedOrigins,
    credentials: true,  // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging (shows each request in console)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));  // Colorful logs for development
} else {
    app.use(morgan('combined'));  // Detailed logs for production
}

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));  // Increase limit for base64 images

// Parse URL-encoded data (from forms)
app.use(express.urlencoded({ extended: true }));

// ========== API ROUTES ==========

// Mount all routes under /api prefix
app.use('/api', routes);

// Welcome route for root path
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to ClearView API',
        version: '1.0.0',
        documentation: '/api/health'
    });
});

// ========== ERROR HANDLING ==========

// Handle 404 - Route not found
app.use(notFoundHandler);

// Handle all other errors
app.use(errorHandler);

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║                                                ║');
    console.log('║         🎯 ClearView Backend Server           ║');
    console.log('║                                                ║');
    console.log('╠════════════════════════════════════════════════╣');
    console.log(`║  🚀 Server running on port: ${PORT}               ║`);
    console.log(`║  📝 Environment: ${process.env.NODE_ENV || 'development'}              ║`);
    console.log(`║  💾 Database: MongoDB                          ║`);
    console.log('║                                                ║');
    console.log('║  API Endpoints:                                ║');
    console.log('║  • POST /api/auth/register                     ║');
    console.log('║  • POST /api/auth/login                        ║');
    console.log('║  • POST /api/resume/upload                     ║');
    console.log('║  • POST /api/interview/generate-questions      ║');
    console.log('║  • GET  /api/feedback/history                  ║');
    console.log('║                                                ║');
    console.log('╚════════════════════════════════════════════════╝');
    console.log('');
});

// ========== GRACEFUL SHUTDOWN ==========
// Handle shutdown signals gracefully
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

module.exports = app;
