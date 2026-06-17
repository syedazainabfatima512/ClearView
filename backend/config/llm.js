/**
 * ============================================
 * LLM CONFIGURATION
 * ============================================
 *
 * This app uses an OpenAI-compatible client pointed at
 * NVIDIA's hosted inference API for resume parsing,
 * question generation, answer evaluation, and summaries.
 */

const toNumber = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const toInteger = (value, fallback) => Math.trunc(toNumber(value, fallback));
const clampTokens = (value, fallback) => Math.max(1, Math.min(4096, toInteger(value, fallback)));

module.exports = {
    apiKey: process.env.LLM_API_KEY,
    baseURL: process.env.LLM_BASE_URL || 'https://integrate.api.nvidia.com/v1',
    model: process.env.LLM_MODEL || 'minimaxai/minimax-m2.7',
    temperature: toNumber(process.env.LLM_TEMPERATURE, 0.2),
    topP: toNumber(process.env.LLM_TOP_P, 0.95),
    maxTokens: clampTokens(process.env.LLM_MAX_TOKENS, 4096),
    timeoutMs: toInteger(process.env.LLM_TIMEOUT_MS, 25000),
    maxRetries: toInteger(process.env.LLM_MAX_RETRIES, 0),
    taskMaxTokens: {
        resumeParse: clampTokens(process.env.LLM_RESUME_MAX_TOKENS, 1400),
        questionGeneration: clampTokens(process.env.LLM_QUESTION_MAX_TOKENS, 2500),
        answerEvaluation: clampTokens(process.env.LLM_ANSWER_MAX_TOKENS, 900),
        batchAssessment: clampTokens(process.env.LLM_BATCH_MAX_TOKENS, 3500),
        finalSummary: clampTokens(process.env.LLM_SUMMARY_MAX_TOKENS, 1200)
    },
    inputLimits: {
        resumeTextChars: toInteger(process.env.LLM_RESUME_TEXT_CHARS, 9000),
        answerChars: toInteger(process.env.LLM_ANSWER_CHARS, 1600),
        batchAnswerChars: toInteger(process.env.LLM_BATCH_ANSWER_CHARS, 900)
    }
};
