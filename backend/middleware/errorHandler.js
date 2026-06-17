/**
 * ============================================
 * ERROR HANDLER MIDDLEWARE - Catches All Errors
 * ============================================
 * 
 * This is a safety net that catches any errors in our app.
 * Instead of crashing, it sends a nice error message to the user.
 */

/**
 * Global Error Handler
 * This catches errors from all routes and sends appropriate responses
 */
const errorHandler = (err, req, res, next) => {
    // Log the error for debugging (developers can see this)
    console.error('❌ Error:', err.stack);

    // Get the status code (default to 500 if not set)
    const statusCode = err.statusCode || 500;

    // Prepare the error response
    const response = {
        success: false,
        message: err.message || 'Internal Server Error',

        // Only show error details in development mode
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            error: err
        })
    };

    res.status(statusCode).json(response);
};

/**
 * 404 Not Found Handler
 * This catches requests to routes that don't exist
 */
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
};

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors automatically
 * 
 * Usage: router.get('/route', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler
};
