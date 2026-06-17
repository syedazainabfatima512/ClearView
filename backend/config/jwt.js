/**
 * ============================================
 * JWT (JSON Web Token) CONFIGURATION
 * ============================================
 * 
 * JWT is like a special ID card that proves who you are.
 * When you login, we give you this ID card, and you show it
 * every time you want to access something protected.
 */

module.exports = {
    // The secret password used to create tokens (keep this super secret!)
    secret: process.env.JWT_SECRET,

    // How long the token is valid (7 days)
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',

    // For refresh tokens (30 days)
    refreshExpiresIn: '30d'
};
