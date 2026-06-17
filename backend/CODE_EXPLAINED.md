# ClearView Backend - Code Explained for Absolute Beginners 📚

> **Welcome!** This document explains EVERY line of code in the ClearView backend. 
> It's written so simply that even a 7-year-old could understand it!

---

## 📖 Table of Contents

1. [What is a Backend?](#what-is-a-backend)
2. [Our Project Structure](#our-project-structure)
3. [Package.json Explained](#packagejson-explained)
4. [Environment Variables (.env)](#environment-variables-env)
5. [Configuration Files](#configuration-files)
6. [Database Models](#database-models)
7. [Middleware](#middleware)
8. [Services](#services)
9. [Controllers](#controllers)
10. [Routes](#routes)
11. [Server.js - The Heart](#serverjs---the-heart)
12. [How Everything Works Together](#how-everything-works-together)

---

## What is a Backend?

Imagine a restaurant:
- **Frontend** = The dining area where customers sit (what users see)
- **Backend** = The kitchen where food is prepared (what users don't see)

The backend:
- Stores data (like a filing cabinet)
- Processes requests (like a chef processing orders)
- Keeps secrets safe (like passwords)
- Talks to AI (like a translator)

---

## Our Project Structure

```
backend/                     ← This is our kitchen!
├── config/                  ← Settings (like oven temperature)
│   ├── db.js               ← Database connection settings
│   ├── jwt.js              ← Login security settings
│   ├── gemini.js           ← AI settings
│   └── constants.js        ← Fixed values that never change
├── middleware/              ← Security guards
│   ├── auth.js             ← Checks if you're logged in
│   ├── upload.js           ← Handles file uploads
│   └── errorHandler.js     ← Catches errors
├── models/                  ← Blueprints for data
│   ├── User.js             ← User account blueprint
│   ├── Resume.js           ← Resume data blueprint
│   ├── Question.js         ← Interview question blueprint
│   ├── InterviewSession.js ← Interview session blueprint
│   └── Result.js           ← Results blueprint
├── services/                ← Workers that do specific jobs
│   ├── gemini.service.js   ← Talks to AI
│   ├── resume.service.js   ← Reads resume files
│   └── scoring.service.js  ← Calculates scores
├── controllers/             ← Managers that handle requests
│   ├── auth.controller.js  ← Handles login/register
│   ├── resume.controller.js ← Handles resume uploads
│   ├── interview.controller.js ← Handles interviews
│   └── feedback.controller.js ← Handles results
├── routes/                  ← Road signs (URL paths)
│   ├── auth.routes.js      ← /api/auth/...
│   ├── resume.routes.js    ← /api/resume/...
│   ├── interview.routes.js ← /api/interview/...
│   └── feedback.routes.js  ← /api/feedback/...
├── server.js                ← The main entrance
├── package.json             ← Shopping list of tools
└── .env                     ← Secret passwords
```

---

## Package.json Explained

```json
{
  "name": "clearview-backend",
```
👆 **name**: The name of our project. Like naming your pet!

```json
  "version": "1.0.0",
```
👆 **version**: Version number. 1.0.0 means first major release.

```json
  "description": "ClearView - AI-Based Resume-Personalized Interview System Backend",
```
👆 **description**: A short explanation of what this project does.

```json
  "main": "server.js",
```
👆 **main**: The starting point file. Like the front door of a house.

```json
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
```
👆 **scripts**: Commands we can run:
- `npm start` → Runs the server normally
- `npm run dev` → Runs with auto-restart when files change

```json
  "dependencies": {
    "@google/generative-ai": "^0.21.0",
```
👆 **@google/generative-ai**: Lets us talk to Google's Gemini AI (FREE!)

```json
    "bcryptjs": "^2.4.3",
```
👆 **bcryptjs**: Encrypts passwords so no one can read them

```json
    "cors": "^2.8.5",
```
👆 **cors**: Allows the frontend to talk to our backend

```json
    "dotenv": "^16.3.1",
```
👆 **dotenv**: Loads secret passwords from .env file

```json
    "express": "^4.18.2",
```
👆 **express**: The framework that makes building APIs easy (most important!)

```json
    "helmet": "^7.1.0",
```
👆 **helmet**: Adds security headers to protect against hackers

```json
    "jsonwebtoken": "^9.0.2",
```
👆 **jsonwebtoken**: Creates login tokens (like ID cards)

```json
    "mammoth": "^1.6.0",
```
👆 **mammoth**: Reads Word documents (.docx files)

```json
    "mongoose": "^8.0.0",
```
👆 **mongoose**: Helps us talk to MongoDB database

```json
    "morgan": "^1.10.0",
```
👆 **morgan**: Logs every request (shows who's visiting)

```json
    "multer": "^1.4.5-lts.1",
```
👆 **multer**: Handles file uploads

```json
    "pdf-parse": "^1.1.1"
```
👆 **pdf-parse**: Reads PDF files

---

## Environment Variables (.env)

Environment variables are like secret notes that only your application can read.

```env
NODE_ENV=development
```
👆 **NODE_ENV**: Tells the app if we're developing or in production
- `development` = We're building and testing
- `production` = Real users are using it

```env
PORT=5000
```
👆 **PORT**: Which "door number" our server listens on
- Think of it like an apartment number (5000 is common for development)

```env
MONGODB_URI=mongodb://localhost:27017/clearview
```
👆 **MONGODB_URI**: Address of our database
- `mongodb://` = We're using MongoDB
- `localhost` = On this computer
- `27017` = MongoDB's default port
- `clearview` = Name of our database

```env
JWT_SECRET=clearview-super-secret-jwt-key-2024
```
👆 **JWT_SECRET**: A secret password used to create login tokens
- NEVER share this! It's like the master key to everything

```env
JWT_EXPIRES_IN=7d
```
👆 **JWT_EXPIRES_IN**: How long login tokens last
- `7d` = 7 days (then user must login again)

```env
GEMINI_API_KEY=
```
👆 **GEMINI_API_KEY**: Your free API key from Google
- Get it at: https://aistudio.google.com/app/apikey
- This lets us use the AI for free!

---

## Configuration Files

### config/db.js - Database Connection

```javascript
const mongoose = require('mongoose');
```
👆 **require**: Like saying "give me the mongoose tool"
- `mongoose` is a library that helps us talk to MongoDB

```javascript
const connectDB = async () => {
```
👆 **async**: This function will do something that takes time (connecting to database)
- Think of it like making a phone call - you have to wait for someone to pick up

```javascript
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
```
👆 **try**: "Let's try this and hope it works"
- `await`: Wait until the connection is made
- `mongoose.connect()`: Actually connects to the database
- `process.env.MONGODB_URI`: Gets the address from our .env file

```javascript
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
```
👆 **console.log**: Prints a message so we know it worked
- Shows where we connected to

```javascript
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
```
👆 **catch**: If something goes wrong, do this instead
- `process.exit(1)`: Stop the program (1 means "something went wrong")

```javascript
module.exports = connectDB;
```
👆 **module.exports**: Makes this function available to other files
- Like putting something in a box so others can use it

---

### config/jwt.js - Login Token Settings

```javascript
module.exports = {
  secret: process.env.JWT_SECRET || 'fallback-secret-key',
```
👆 **secret**: The password used to create tokens
- `||` means "or" - if JWT_SECRET doesn't exist, use the fallback

```javascript
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
```
👆 **expiresIn**: How long tokens are valid
- After 7 days, user must login again

---

### config/gemini.js - AI Settings

```javascript
module.exports = {
  apiKey: process.env.GEMINI_API_KEY,
```
👆 Your secret key to use Gemini AI

```javascript
  model: 'gemini-1.5-flash',
```
👆 Which AI model to use
- `gemini-1.5-flash` is FREE and fast!

```javascript
  generationConfig: {
    temperature: 0.7,
```
👆 **temperature**: How creative the AI is
- 0 = Very strict and factual
- 1 = Very creative and random
- 0.7 = A nice balance

```javascript
    topP: 0.95,
    topK: 40,
```
👆 Technical settings that control how the AI picks words

```javascript
    maxOutputTokens: 4096
```
👆 Maximum length of AI's response
- ~4000 words

---

## Database Models

Models are like **blueprints** or **forms** that define what data looks like.

### models/User.js - User Account Blueprint

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
```
👆 Import the tools we need:
- `mongoose`: For creating the model
- `bcryptjs`: For encrypting passwords

```javascript
const userSchema = new mongoose.Schema({
```
👆 **Schema**: The blueprint/form definition
- Like a signup form with specific fields

```javascript
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
```
👆 **fullName field**:
- `type: String` → It's text
- `required: true` → Must fill this out
- `trim: true` → Remove extra spaces
- `maxlength: 100` → Maximum 100 characters

```javascript
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
```
👆 **email field**:
- `unique: true` → No two users can have the same email
- `lowercase: true` → Convert to lowercase (so "Test@Email.com" becomes "test@email.com")

```javascript
  password: {
    type: String,
    required: true,
    minlength: 8
  },
```
👆 **password field**:
- `minlength: 8` → At least 8 characters for security

```javascript
}, { timestamps: true });
```
👆 **timestamps**: Automatically adds:
- `createdAt`: When user was created
- `updatedAt`: When user info was last changed

```javascript
userSchema.pre('save', async function(next) {
```
👆 **pre('save')**: "Before saving, do this first"
- Like a security check before entering a building

```javascript
  if (!this.isModified('password')) {
    return next();
  }
```
👆 Only encrypt if password was changed
- If you only changed your name, don't mess with the password

```javascript
  this.password = await bcrypt.hash(this.password, 12);
```
👆 **bcrypt.hash**: Encrypts the password
- Turns "myPassword123" into "x7$#9kL..."
- The `12` is how strong the encryption is

```javascript
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```
👆 **comparePassword**: Checks if entered password matches
- Used during login
- Returns `true` if matches, `false` if not

```javascript
module.exports = mongoose.model('User', userSchema);
```
👆 Creates the model and makes it available
- 'User' is the name in the database

---

## Middleware

Middleware is like **security guards** that check things before allowing access.

### middleware/auth.js - Login Check

```javascript
const authMiddleware = async (req, res, next) => {
```
👆 A function that runs before the actual route
- `req` = incoming request info
- `res` = our response
- `next` = "okay, go to the next step"

```javascript
  const authHeader = req.header('Authorization');
```
👆 Get the token from the request header
- Like checking someone's ID card

```javascript
  if (!authHeader) {
    return res.status(401).json({ 
      success: false,
      message: 'Access denied. No token provided.' 
    });
  }
```
👆 If no token, reject with 401 (Unauthorized)
- "Sorry, you need to show ID"

```javascript
  const token = authHeader.replace('Bearer ', '');
```
👆 Extract just the token
- Authorization header looks like: "Bearer eyJhbG..."
- We remove "Bearer " to get just the token

```javascript
  const decoded = jwt.verify(token, jwtConfig.secret);
```
👆 **verify**: Check if token is real and valid
- Uses our secret key to decode it
- If fake or expired, throws an error

```javascript
  const user = await User.findById(decoded.userId).select('-password');
```
👆 Find the user in database
- `decoded.userId` = user's ID stored in token
- `.select('-password')` = don't include password in result

```javascript
  req.user = user;
  next();
```
👆 Attach user to request and continue
- Now other code can access `req.user`
- `next()` means "okay, proceed to the route"

---

### middleware/upload.js - File Upload Handler

```javascript
const storage = multer.memoryStorage();
```
👆 **memoryStorage**: Store uploaded file in RAM (memory)
- Fast but temporary
- Good for processing files immediately

```javascript
const fileFilter = (req, file, cb) => {
  if (constants.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type...'), false);
  }
};
```
👆 **fileFilter**: Decides which files to accept
- `cb(null, true)` = Accept the file
- `cb(error, false)` = Reject the file

```javascript
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: constants.MAX_FILE_SIZE }
});
```
👆 Create the upload handler with all our settings

---

## Services

Services are **specialized workers** that do specific jobs.

### services/gemini.service.js - AI Brain

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');
```
👆 Import Google's AI library

```javascript
this.genAI = new GoogleGenerativeAI(geminiConfig.apiKey);
```
👆 Create a connection to Gemini using our API key

```javascript
this.model = this.genAI.getGenerativeModel({ model: geminiConfig.model });
```
👆 Get the specific model we want to use (gemini-1.5-flash)

```javascript
async parseResume(resumeText) {
  const prompt = `...`;
  const result = await this.model.generateContent(prompt);
  const response = result.response.text();
  return JSON.parse(cleanJson);
}
```
👆 **parseResume function**:
1. Create a prompt telling AI what to do
2. Send it to AI and wait for response
3. Clean up the response
4. Convert to JavaScript object

---

### services/resume.service.js - Resume Reader

```javascript
async extractText(fileBuffer, mimeType) {
  if (mimeType === 'application/pdf') {
    const data = await pdfParse(fileBuffer);
    return data.text;
  }
```
👆 If it's a PDF, use pdf-parse library to get the text

```javascript
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  }
```
👆 If it's a Word document (.docx), use mammoth library

---

### services/scoring.service.js - Score Calculator

```javascript
const overallAnswerScore = (
  (averageAccuracy * SCORING_WEIGHTS.ACCURACY) +
  (averageRelevance * SCORING_WEIGHTS.RELEVANCE) +
  (averageCommunication * SCORING_WEIGHTS.COMMUNICATION) +
  (averageDepth * SCORING_WEIGHTS.DEPTH)
) / 10;
```
👆 **Weighted scoring formula**:
- Each metric has a weight (like how important it is)
- Multiply each score by its weight
- Add them all together
- Divide by 10 to get 0-10 scale

```javascript
const irs = ((aptitudeScore * 5) + (confidenceScore * 5)).toFixed(1);
```
👆 **IRS (Interview Readiness Score)**:
- 50% from aptitude (answers)
- 50% from confidence (video)
- Result is 0-100

```javascript
const passed = irs >= IRS_PASS_THRESHOLD;
```
👆 Pass if IRS is 60 or higher

---

## Controllers

Controllers are **managers** that receive requests and decide what to do.

### controllers/auth.controller.js - Login Manager

```javascript
const register = async (req, res) => {
```
👆 Function to create new user account

```javascript
  const { fullName, email, password } = req.body;
```
👆 Get data sent by the frontend
- This comes from the request body (like form data)

```javascript
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Email already registered.'
    });
  }
```
👆 Check if email is already used
- If yes, reject with error 400 (Bad Request)

```javascript
  const user = new User({ fullName, email, password });
  await user.save();
```
👆 Create new user and save to database
- Password gets encrypted automatically (by the pre-save hook)

```javascript
  const token = jwt.sign(
    { userId: user._id },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );
```
👆 Create a JWT token (login ID card)
- Contains user's ID
- Signed with our secret
- Expires in 7 days

```javascript
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: { id: user._id, fullName, email }
  });
```
👆 Send success response
- `201` = Created successfully
- Send token and user info (but NOT the password!)

---

## Routes

Routes are like **road signs** that direct traffic to the right place.

### routes/auth.routes.js

```javascript
const router = express.Router();
```
👆 Create a new router (like a mini-app for these routes)

```javascript
router.post('/register', authController.register);
```
👆 When someone sends POST request to /register:
- Call the register function from authController
- POST = sending data to server

```javascript
router.get('/me', authMiddleware, authController.getMe);
```
👆 When someone sends GET request to /me:
- First: Run authMiddleware (check if logged in)
- Then: Call getMe function
- GET = just getting data

```javascript
module.exports = router;
```
👆 Make this router available to other files

---

## Server.js - The Heart

This is where everything comes together!

```javascript
require('dotenv').config();
```
👆 MUST be first! Loads all .env variables

```javascript
const express = require('express');
const app = express();
```
👆 Create our Express application

```javascript
connectDB();
```
👆 Connect to MongoDB database

```javascript
app.use(helmet());
```
👆 Add security headers
- Like putting armor on our app

```javascript
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```
👆 Allow frontend to communicate with us
- Only from specific addresses (our frontend)

```javascript
app.use(express.json({ limit: '10mb' }));
```
👆 Parse JSON data in requests
- Limit to 10MB per request

```javascript
app.use('/api', routes);
```
👆 Mount all our routes under /api
- /api/auth/login
- /api/resume/upload
- etc.

```javascript
app.listen(PORT, () => {
  console.log('Server running...');
});
```
👆 Start listening for requests!
- Now our server is alive and waiting

---

## How Everything Works Together

### Example: User Registers

1. **Frontend** sends POST request to `/api/auth/register`
   ```json
   { "fullName": "Sara", "email": "sara@email.com", "password": "mypassword123" }
   ```

2. **server.js** receives request
   - Passes through `express.json()` middleware (parses JSON)

3. **Routes** direct to `/api/auth` → `/register`
   - Goes to `auth.routes.js`

4. **Controller** `auth.controller.js` handles it
   - Checks if email exists
   - Creates new User
   - Saves to database (password gets encrypted)
   - Creates JWT token
   - Sends response back

5. **Frontend** receives success response with token

---

### Example: Upload Resume and Get Questions

1. **Frontend** uploads resume PDF to `/api/resume/upload`

2. **upload.js middleware** handles file
   - Checks if it's PDF or Word
   - Stores in memory

3. **resume.controller.js** processes it
   - Calls `resumeService.parseResume()`

4. **resume.service.js** extracts text
   - Uses pdf-parse for PDFs
   - Sends text to `geminiService.parseResume()`

5. **gemini.service.js** talks to AI
   - Sends prompt to Gemini
   - Gets structured resume data back

6. **Controller** saves resume to database
   - Sends parsed data to frontend

7. **Frontend** calls `/api/interview/generate-questions`

8. **interview.controller.js** handles it
   - Gets resume from database
   - Calls `geminiService.generateQuestions()`

9. **AI** creates personalized questions based on resume

10. **Controller** saves questions and creates session
    - Sends questions to frontend

11. **User** answers questions
    - Each answer gets evaluated by AI
    - Video frames get analyzed for confidence

12. **Session completes**
    - All scores calculated
    - Final feedback generated
    - Results saved

---

## Quick Reference Card 🎯

### Common Patterns

```javascript
// Async function (does something that takes time)
async function doSomething() {
  const result = await slowOperation();
  return result;
}

// Try-catch (handle errors)
try {
  // risky code
} catch (error) {
  // handle error
}

// Export (share with other files)
module.exports = myFunction;

// Import (get from other files)
const myFunction = require('./myFile');

// Express route
router.post('/path', middleware, controller);

// Mongoose find
const user = await User.findOne({ email: 'test@test.com' });
const user = await User.findById(userId);

// Mongoose create
const newUser = new User({ name: 'Test' });
await newUser.save();

// Send response
res.status(200).json({ success: true, data: myData });
res.status(400).json({ success: false, message: 'Error!' });
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Success! |
| 201 | Created - New thing made! |
| 400 | Bad Request - Client sent wrong data |
| 401 | Unauthorized - Need to login |
| 404 | Not Found - Doesn't exist |
| 500 | Server Error - Something broke |

---

## Need Help? 🆘

1. **Error in terminal?** Read the error message carefully - it usually tells you what's wrong
2. **API not working?** Check if server is running and check the URL
3. **Database issues?** Make sure MongoDB is running
4. **AI not responding?** Check if GEMINI_API_KEY is set in .env

---

**Congratulations!** 🎉 You now understand how a real backend works!

This is the same structure used by professional developers at big companies.
You've learned: Express.js, MongoDB, JWT authentication, File uploads, AI integration, and more!

Keep learning and building! 💪
