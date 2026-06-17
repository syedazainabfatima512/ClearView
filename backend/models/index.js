/**
 * ============================================
 * MODELS INDEX - Export All Models Together
 * ============================================
 * 
 * This file lets us import all models from one place.
 * Instead of: const User = require('./models/User')
 * We can do: const { User } = require('./models')
 */

const User = require('./User');
const Resume = require('./Resume');
const Question = require('./Question');
const InterviewSession = require('./InterviewSession');
const Result = require('./Result');

module.exports = {
    User,
    Resume,
    Question,
    InterviewSession,
    Result
};
