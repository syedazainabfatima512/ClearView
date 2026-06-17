/**
 * ============================================
 * ENVIRONMENT VALIDATION
 * ============================================
 *
 * Validates the minimum required configuration before the
 * application starts serving requests.
 */

const REQUIRED_ENV_VARS = ['MONGODB_URI', 'JWT_SECRET', 'LLM_API_KEY'];

const validateEnv = () => {
    const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name]?.trim());

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
};

module.exports = {
    validateEnv
};
