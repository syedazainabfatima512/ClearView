/**
 * ============================================
 * HELPER UTILITIES - Common Functions
 * ============================================
 * 
 * This file contains helper functions used across
 * the application.
 */

/**
 * Calculate average of an array
 */
const average = (arr) => {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
};

/**
 * Format date to readable string
 */
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Generate a random string (for IDs, etc.)
 */
const generateRandomString = (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

/**
 * Safely parse JSON (returns null if invalid)
 */
const safeParseJSON = (str) => {
    try {
        return JSON.parse(str);
    } catch (e) {
        return null;
    }
};

/**
 * Clean JSON response from AI (removes markdown code blocks)
 */
const cleanAIJSON = (response) => {
    return response
        .replace(/```json\n?/gi, '')
        .replace(/\n?```/g, '')
        .trim();
};

/**
 * Delay execution (useful for rate limiting)
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    average,
    formatDate,
    generateRandomString,
    safeParseJSON,
    cleanAIJSON,
    delay
};
