/**
 * ============================================
 * USER MODEL - Stores User Account Information
 * ============================================
 * 
 * This is like a template for storing user data.
 * Each user who signs up will have their info stored
 * following this exact structure.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the structure of a User document
const userSchema = new mongoose.Schema({
    // User's full name
    fullName: {
        type: String,        // It's a text value
        required: true,      // They MUST provide this
        trim: true,          // Remove extra spaces
        maxlength: 100       // Max 100 characters
    },

    // User's email address
    email: {
        type: String,
        required: true,
        unique: true,        // No two users can have same email
        lowercase: true,     // Convert to lowercase
        trim: true
    },

    // User's password (will be encrypted)
    password: {
        type: String,
        required: true,
        minlength: 8         // At least 8 characters
    },

    // When the user last logged in
    lastLogin: {
        type: Date           // Date and time
    },

    // How many tests the user has taken
    totalTests: {
        type: Number,
        default: 0           // Starts at 0
    },

    // User's average Interview Readiness Score
    averageIRS: {
        type: Number,
        default: 0
    }
}, {
    // Automatically add createdAt and updatedAt fields
    timestamps: true
});

/**
 * PRE-SAVE HOOK
 * This runs automatically BEFORE saving a user to the database.
 * We use it to encrypt the password so it's not stored as plain text.
 */
userSchema.pre('save', async function (next) {
    // Only hash password if it was changed
    if (!this.isModified('password')) {
        return next();
    }

    // Encrypt the password with bcrypt (12 rounds of salting)
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

/**
 * METHOD: comparePassword
 * Checks if the entered password matches the stored encrypted password.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Create and export the User model
module.exports = mongoose.model('User', userSchema);
