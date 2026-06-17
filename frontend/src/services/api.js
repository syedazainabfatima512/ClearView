/**
 * ============================================
 * API SERVICE - All Backend Communication
 * ============================================
 *
 * This file handles all HTTP requests to the backend.
 * It's organized into services for each feature.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:5001'

// Helper to get auth header
const getAuthHeader = () => {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
}

// Generic fetch wrapper with error handling
const request = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`

    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...getAuthHeader()
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    }

    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
        throw { response: { data } }
    }

    return data
}

// ========== AUTH SERVICE ==========
export const authService = {
    register: (data) => request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    login: (data) => request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    getMe: () => request('/auth/me')
}

// ========== RESUME SERVICE ==========
export const resumeService = {
    upload: async (file) => {
        const formData = new FormData()
        formData.append('resume', file)

        const response = await fetch(`${API_BASE_URL}/resume/upload`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: formData
        })

        const data = await response.json()
        if (!response.ok) throw { response: { data } }
        return data
    },

    getAll: () => request('/resume/all'),

    getById: (id) => request(`/resume/${id}`),

    delete: (id) => request(`/resume/${id}`, { method: 'DELETE' })
}

// ========== INTERVIEW SERVICE ==========
export const interviewService = {
    /**
     * Generate fresh questions from a saved resume.
     * Returns { success, sessionId, totalQuestions, questions }
     */
    generateQuestions: (resumeId) => request('/interview/generate-questions', {
        method: 'POST',
        body: JSON.stringify({ resumeId })
    }),

    getQuestions: (sessionId) => request(`/interview/${sessionId}/questions`),

    startSession: (sessionId) => request(`/interview/${sessionId}/start`, {
        method: 'POST'
    }),

    /**
     * Submit an answer — lightweight save only, no mid-interview AI scoring.
     *
     * @param {string} sessionId
     * @param {string} questionId
     * @param {string} answer        - The final answer text
     * @param {number} responseTime  - ms since question was shown
     * @param {object} [confidenceSnapshot] - { eyeContact, posture, facialCalmness, sampleCount }
     * @param {object} [voiceMetrics]       - local audio capture metrics
     */
    submitAnswer: (sessionId, questionId, answer, responseTime, confidenceSnapshot, voiceMetrics) =>
        request(`/interview/${sessionId}/answer`, {
            method: 'POST',
            body: JSON.stringify({
                questionId,
                answer,
                responseTime,
                ...(confidenceSnapshot ? { confidenceSnapshot } : {}),
                ...(voiceMetrics ? { voiceMetrics } : {})
            })
        }),

    /** Kept for compatibility; frontend no longer calls this on every poll. */
    analyzeFrame: (sessionId, eyeContact, posture, facialTension) =>
        request(`/interview/${sessionId}/analyze-frame`, {
            method: 'POST',
            body: JSON.stringify({ eyeContact, posture, facialTension })
        }),

    complete: (sessionId) => request(`/interview/${sessionId}/complete`, {
        method: 'POST'
    })
}

// ========== FEEDBACK SERVICE ==========
export const feedbackService = {
    getResult: (sessionId) => request(`/feedback/${sessionId}`),

    getHistory: () => request('/feedback/history'),

    getStats: () => request('/feedback/stats')
}

// ========== AI SERVICE (Python) ==========
export const aiService = {
    analyzeFrame: async (frameBase64) => {
        const response = await fetch(`${AI_SERVICE_URL}/analyze-frame-simple`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ frame: frameBase64 })
        })
        return response.json()
    },

    health: async () => {
        const response = await fetch(`${AI_SERVICE_URL}/health`)
        return response.json()
    }
}
