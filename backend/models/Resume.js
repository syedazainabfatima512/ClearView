/**
 * ============================================
 * RESUME MODEL - Stores Parsed Resume Data
 * ============================================
 * 
 * When a user uploads their resume (PDF/DOCX),
 * our AI reads it and extracts all the important info.
 * This model stores that extracted information.
 */

const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    // Who uploaded this resume
    userId: {
        type: mongoose.Schema.Types.ObjectId,  // References User model
        ref: 'User',
        required: true
    },

    // Original file name
    originalFileName: {
        type: String,
        required: true
    },

    // Path where file is stored (optional)
    fileUrl: {
        type: String
    },

    // Async parsing state. The local parse is saved immediately, then AI
    // enrichment updates the same document in the background.
    parsingStatus: {
        type: String,
        enum: ['processing', 'completed', 'partial', 'failed'],
        default: 'processing'
    },
    parsingSource: {
        type: String,
        enum: ['local', 'ai', 'local_fallback'],
        default: 'local'
    },
    parsingError: {
        type: String
    },

    // ============ PERSONAL INFORMATION ============
    personalInfo: {
        name: String,
        email: String,
        phone: String,
        location: String,
        linkedin: String,
        github: String,
        portfolio: String
    },

    // Professional summary/objective from resume
    summary: {
        type: String
    },

    // ============ SKILLS ============
    skills: {
        // Programming languages, frameworks, etc.
        technical: [String],    // Example: ["JavaScript", "Python", "React"]

        // Soft skills
        soft: [String],         // Example: ["Leadership", "Communication"]

        // Tools and software
        tools: [String],        // Example: ["Git", "Docker", "VS Code"]

        // Spoken languages
        languages: [String]     // Example: ["English", "Spanish"]
    },

    // ============ WORK EXPERIENCE ============
    experience: [{
        company: String,
        title: String,          // Job title
        location: String,
        startDate: String,
        endDate: String,        // Can be "Present"
        description: String,
        highlights: [String]    // Bullet points of achievements
    }],

    // ============ EDUCATION ============
    education: [{
        institution: String,    // School/University name
        degree: String,         // Bachelor's, Master's, etc.
        field: String,          // Computer Science, etc.
        graduationDate: String,
        gpa: String
    }],

    // ============ PROJECTS ============
    projects: [{
        name: String,
        description: String,
        technologies: [String],
        link: String
    }],

    // ============ CERTIFICATIONS ============
    certifications: [{
        name: String,
        issuer: String,
        date: String
    }],

    // ============ AI ANALYSIS ============
    // This is what the AI figures out about the candidate
    aiAnalysis: {
        // Main field (e.g., "Frontend Development")
        primaryDomain: String,

        // Experience level: Entry, Mid, Senior
        experienceLevel: String,

        // Top strengths identified
        keyStrengths: [String],

        // Areas that might need improvement
        potentialWeaknesses: [String],

        // Topics AI suggests asking about
        suggestedQuestionTopics: [String]
    },

    // When the resume was parsed
    parsedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
