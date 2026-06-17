/**
 * ============================================
 * DATABASE CONFIGURATION FILE
 * ============================================
 * 
 * This file handles connecting our application to MongoDB database.
 * Think of MongoDB as a big filing cabinet where we store all our data.
 */

// We need the 'mongoose' library to talk to MongoDB
const mongoose = require('mongoose');

/**
 * connectDB - This function connects our app to the MongoDB database
 * 
 * It's like plugging in a phone charger - we need to connect first
 * before we can use the database.
 */
const connectDB = async () => {
    try {
        // Get the database address from our secret .env file
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        // If connection successful, show a happy message
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        // If something goes wrong, show error and stop the program
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1); // Exit with failure code
    }
};

// Make this function available to other files
module.exports = connectDB;
