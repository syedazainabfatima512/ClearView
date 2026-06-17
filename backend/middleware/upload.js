/**
 * ============================================
 * FILE UPLOAD MIDDLEWARE - Handles Resume Uploads
 * ============================================
 * 
 * This uses 'multer' library to handle file uploads.
 * Think of it as a mail room that receives packages (files),
 * checks if they're the right type, and passes them along.
 */

const multer = require('multer');
const constants = require('../config/constants');

/**
 * STORAGE CONFIGURATION
 * We use memory storage - files are stored in RAM temporarily,
 * not saved to disk. This is faster for processing.
 */
const storage = multer.memoryStorage();

/**
 * FILE FILTER
 * This decides which files are allowed.
 * Only PDF and Word documents (resumes) are accepted.
 */
const fileFilter = (req, file, cb) => {
    // Check if the file type is in our allowed list
    if (constants.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
        // Accept the file
        cb(null, true);
    } else {
        // Reject the file with an error
        cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'), false);
    }
};

/**
 * CREATE THE UPLOAD MIDDLEWARE
 */
const upload = multer({
    storage: storage,           // Where to store files (memory)
    fileFilter: fileFilter,     // Which files to accept
    limits: {
        fileSize: constants.MAX_FILE_SIZE  // Max 5MB
    }
});

/**
 * ERROR HANDLER for file uploads
 * Provides user-friendly error messages
 */
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Multer-specific errors
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 5MB.'
            });
        }
        return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`
        });
    } else if (err) {
        // Other errors (like invalid file type)
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next();
};

module.exports = {
    upload,
    handleUploadError
};
