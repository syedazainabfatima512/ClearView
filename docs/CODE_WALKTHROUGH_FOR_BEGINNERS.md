# ClearView Code Walkthrough for Beginners

This document explains the code file by file and block by block in plain English. It is written for someone who has little or no coding experience.

It is separate from the project-level guide. Read `docs/PROJECT_GUIDE_FOR_BEGINNERS.md` first if you want the non-technical overview.

## How to Read This Document

Code files are made of small pieces. You will see the same ideas many times:

| Word | Meaning |
| --- | --- |
| `import` | Bring code from another file or package into this file |
| `require` | Node.js version of importing code |
| `function` | A reusable set of instructions |
| `const` | A variable whose name will not be reassigned |
| `let` | A variable whose value may change |
| `async` | This function waits for slow work, like database or API calls |
| `await` | Wait here until the slow work finishes |
| `return` | Send a value back from a function |
| `export` or `module.exports` | Make code available to other files |
| `useState` | React memory for changing screen values |
| `useEffect` | React code that runs after the screen loads or after watched values change |
| `props` | Values passed into a React component |
| `req` | Backend request object, meaning what the user sent |
| `res` | Backend response object, meaning what the server sends back |
| `schema` | Database shape/template |

## Root-Level Files

### `package.json`

This root file only lists `puppeteer-core`. That means the root of the project is not the main app. The real apps are inside `frontend`, `backend`, and `ai-service`.

### `take_screenshot.js`

This is a utility script for screenshots. It is not part of the main interview flow.

### Existing Markdown/Document Files

Files like `FRONTEND_IMPLEMENTATION.md`, `BACKEND_FUNCTIONALITY_IMPLEMENTATION.md`, and `CLEARVIEW_SETUP_AND_TESTING.md` are older documentation. The new `docs` folder is organized for beginner reading.

## Frontend Code

The frontend is a React app. React builds the user interface from components. A component is usually a function that returns HTML-like code called JSX.

### `frontend/package.json`

Important parts:

- `scripts.dev`: runs the Vite development server.
- `scripts.build`: creates production files.
- `react` and `react-dom`: the main UI library.
- `react-router-dom`: lets the app show different pages based on URL.
- `chart.js` and `react-chartjs-2`: used for charts on results pages.
- `vite`: the development/build tool.

### `frontend/index.html`

This is the browser's starting HTML file.

Key idea:

- It contains a root element where React will place the whole app.
- It loads `src/main.jsx`, which starts the React application.

### `frontend/src/main.jsx`

This file starts React.

The usual structure is:

1. Import React and React DOM.
2. Import `BrowserRouter` so URL routing works.
3. Import `AuthProvider` so login state is available everywhere.
4. Import `App`.
5. Render the app into the HTML root element.

Plain English:

This file says, "Browser, put the ClearView React app inside the page, and wrap it with routing and login support."

### `frontend/src/App.jsx`

This is the main routing file.

Imports:

- `Routes`, `Route`, and `Navigate` come from React Router.
- `useAuth` reads login state.
- `Navbar` is the top navigation bar.
- Page components are imported so the router can show them.

`ProtectedRoute`:

- This small component protects private pages.
- It checks `isAuthenticated` and `loading`.
- If login status is still loading, it shows a spinner.
- If the user is not logged in, it redirects to `/login`.
- If the user is logged in, it shows the requested page.

`function App()`:

- Reads `isAuthenticated`.
- Shows the navbar only when the user is logged in.
- Defines all routes:
  - `/login`
  - `/register`
  - `/dashboard`
  - `/upload-resume`
  - `/interview/:sessionId`
  - `/results/:sessionId`
- Redirects unknown URLs back to `/dashboard`.

Important beginner detail:

`/interview/:sessionId` means the URL contains a changing value. Example: `/interview/662abc123`. The page can read `sessionId` from the URL.

### `frontend/src/context/AuthContext.jsx`

This file shares login information across the entire frontend.

Imports:

- `createContext` creates shared storage.
- `useContext` reads that shared storage.
- `useState` stores changing values.
- `useEffect` runs code when the component loads or when watched values change.
- `authService` calls backend auth APIs.

`const AuthContext = createContext(null)`:

Creates a shared container for authentication data.

`AuthProvider({ children })`:

This wraps the app and provides authentication values to all child components.

State values:

- `user`: the logged-in user's details.
- `token`: the JWT token from localStorage.
- `loading`: true while checking whether the saved token is valid.
- `error`: any login/register error.

`isAuthenticated`:

This is true only if both token and user exist.

`useEffect`:

When the app loads, if a token exists, it asks the backend `/auth/me` who the user is. If the token is invalid, it logs out.

`register(fullName, email, password)`:

1. Clears old errors.
2. Calls the backend register endpoint.
3. If successful, stores token and user.
4. Saves token in `localStorage`.
5. Returns success or failure for the page to use.

`login(email, password)`:

Same pattern as register, but calls the login endpoint.

`logout()`:

Clears token, user, and browser localStorage.

`useAuth()`:

This custom hook lets any component easily access auth data. It throws an error if someone tries to use it outside `AuthProvider`.

### `frontend/src/services/api.js`

This file is the frontend's communication center.

Top constants:

- `API_BASE_URL`: backend API URL, default `http://localhost:5000/api`.
- `AI_SERVICE_URL`: Python AI service URL, default `http://localhost:5001`.

`getAuthHeader()`:

1. Reads token from `localStorage`.
2. If a token exists, returns `{ Authorization: "Bearer token" }`.
3. If not, returns an empty object.

`request(endpoint, options = {})`:

This is a helper used for most backend calls.

Step by step:

1. Builds the full URL.
2. Creates default JSON headers.
3. Adds the auth token header.
4. Merges custom options.
5. Calls `fetch`.
6. Converts response to JSON.
7. If response failed, throws an error in a shape the pages expect.
8. Returns data if successful.

`authService`:

- `register(data)` posts to `/auth/register`.
- `login(data)` posts to `/auth/login`.
- `getMe()` gets `/auth/me`.

`resumeService`:

- `upload(file)` sends a file using `FormData`.
- `getAll()` gets all saved resumes.
- `getById(id)` gets one resume.
- `delete(id)` deletes one resume.

Special detail: resume upload does not set `Content-Type: application/json`, because file upload uses multipart form data. The browser sets the correct boundary automatically.

`interviewService`:

- `generateQuestions(resumeId)` starts question generation.
- `getQuestions(sessionId)` loads questions.
- `startSession(sessionId)` marks interview as started.
- `submitAnswer(...)` saves one answer and optional metrics.
- `analyzeFrame(...)` is kept for compatibility.
- `complete(sessionId)` completes and scores the interview.

`feedbackService`:

- `getResult(sessionId)` gets one final report.
- `getHistory()` gets past results.
- `getStats()` gets dashboard stats.

`aiService`:

- `analyzeFrame(frameBase64)` sends a camera image to Python.
- `health()` checks the Python service.

### `frontend/src/pages/LoginPage.jsx`

Purpose:

Shows the login form.

Common structure:

1. Uses `useState` to store email, password, loading, and form errors.
2. Uses `useAuth` to call `login`.
3. Uses `useNavigate` to move to the dashboard after success.
4. On submit, prevents normal browser form reload.
5. Calls `login(email, password)`.
6. If successful, navigates to `/dashboard`.

### `frontend/src/pages/RegisterPage.jsx`

Purpose:

Shows the registration form.

It is similar to LoginPage, but it collects:

- full name
- email
- password

It calls `register(fullName, email, password)` from `AuthContext`.

### `frontend/src/pages/DashboardPage.jsx`

Purpose:

Shows the user's workspace after login.

Imports:

- React hooks for state and loading.
- `Link` and `useNavigate` for navigation.
- `useAuth` for user information.
- icon components.
- dashboard illustration.
- `feedbackService`, `resumeService`, and `interviewService`.
- CSS file.

State values:

- `stats`: overall user statistics.
- `history`: recent results.
- `resumes`: saved resumes.
- `loading`: whether the dashboard is still loading.
- `startingInterviewFor`: resume ID currently being used to start an interview.

`useEffect(() => { loadDashboardData() }, [])`:

Runs once when the dashboard opens.

`loadDashboardData()`:

Uses `Promise.all` to request stats, history, and resumes at the same time. This is faster than waiting for one request, then the next.

`handleStartInterviewFromResume(resume)`:

1. Prevents double-click starts.
2. Saves which resume is starting.
3. Calls `interviewService.generateQuestions(resume.id)`.
4. If successful, navigates to the interview page.
5. Clears the starting state.

Render logic:

- If loading, show spinner.
- Create `firstName` from `user.fullName`.
- Build `statCards` array.
- Render:
  - header
  - stats cards
  - latest interview reviews
  - saved resumes
  - tips section

### `frontend/src/pages/ResumeUploadPage.jsx`

Purpose:

Lets the user upload a resume, review parsed data, and start an interview.

State values:

- `file`: selected resume file.
- `dragOver`: whether the user is dragging a file over the upload area.
- `uploading`: whether upload is happening.
- `parsing`: whether resume AI parsing is happening.
- `generating`: whether interview questions are being generated.
- `parsedResume`: resume data returned from backend.
- `error`: visible error text.

Refs:

- `fileInputRef`: lets the custom upload area trigger the hidden file input.

Important functions:

`handleDragOver(e)`:

Stops default browser behavior and highlights the drop area.

`handleDragLeave()`:

Removes the drag highlight.

`handleDrop(e)`:

Gets the dropped file and validates it.

`handleFileSelect(e)`:

Gets the selected file from the file picker.

`validateAndSetFile(selectedFile)`:

Checks:

- file exists
- file type is PDF/DOC/DOCX
- file size is under 5MB

If valid, it stores the file in state.

`handleUpload()`:

1. Turns on upload/parsing states.
2. Calls `resumeService.upload(file)`.
3. Stores returned parsed resume.
4. Shows error if upload fails.

`handleStartInterview()`:

1. Calls `interviewService.generateQuestions(parsedResume.id)`.
2. Navigates to `/interview/:sessionId`.

Render logic:

- Before parsing: show upload panel.
- After parsing: show extracted resume summary.
- While generating: show loading state.

### `frontend/src/pages/InterviewPage.jsx`

Purpose:

This is the main interview room.

It handles:

- question loading
- camera setup
- frame polling
- speech recognition
- local voice metrics
- answer submission
- session completion

Important constants:

- `FILLER_WORDS`: words like "um" and "uh" used to calculate filler word count.
- `FRAME_SAMPLE_INTERVAL`: how often camera frames are analyzed, currently 5000 milliseconds.

Important state:

- `questions`: all interview questions.
- `currentIndex`: which question is active.
- `answer`: current final answer text.
- `interimPreview`: live speech text that is not final yet.
- `isRecording`: whether microphone recording is active.
- `submitting`: whether an answer is being saved.
- `loading`: whether questions are loading.
- `error`: visible error.
- `startTime`: when the current question/session started.
- `completing`: whether final scoring is running.

Important refs:

Refs are like boxes that can hold values without causing the screen to rerender.

- `videoRef`: the video element.
- `canvasRef`: hidden canvas used to capture frames.
- `streamRef`: webcam stream.
- `recognitionRef`: browser speech recognition object.
- `finalTranscriptRef`: confirmed speech text.
- `confidenceBufferRef`: recent confidence scores.
- `frameInFlightRef`: prevents overlapping AI frame requests.
- `frameTimerRef`: stores timer ID.
- audio refs: used for voice volume, pauses, and speaking duration.

Main loading flow:

1. `useEffect` runs when the page opens.
2. `loadQuestions()` gets questions and starts session.
3. `setupVideo()` requests camera access.
4. `setupSpeechRecognition()` prepares speech-to-text.
5. Cleanup runs when leaving the page.

Camera flow:

1. Browser asks for camera permission.
2. Video stream is placed in the video element.
3. Every few seconds, the page copies a frame to a canvas.
4. The canvas is converted to base64.
5. The frame is sent to `aiService.analyzeFrame`.
6. Returned scores are stored in `confidenceBufferRef`.

Speech flow:

1. Browser speech recognition listens to the microphone.
2. Final transcript pieces are appended to the answer.
3. Interim transcript is shown as preview only.
4. Audio analysis tracks speaking time, pauses, volume, and filler words.

Answer submit flow:

1. The page calculates response time.
2. It summarizes buffered confidence metrics.
3. It builds voice metrics if available.
4. It calls `interviewService.submitAnswer`.
5. It moves to the next question.
6. If it was the last question, it completes the interview.

Completion flow:

1. Calls `interviewService.complete(sessionId)`.
2. Backend performs AI evaluation and scoring.
3. Frontend navigates to results.

### `frontend/src/pages/ResultsPage.jsx`

Purpose:

Shows the final interview report.

It usually:

1. Reads `sessionId` from URL.
2. Calls `feedbackService.getResult(sessionId)`.
3. Stores result in state.
4. Shows loading or error states.
5. Displays:
   - final Interview Readiness Score
   - aptitude score
   - confidence score
   - pass/needs work status
   - strengths
   - areas to improve
   - recommendations
   - per-question answer breakdown
   - voice delivery metrics

The results page is mostly display logic. The scoring already happened on the backend.

### `frontend/src/components/common/AppIcons.jsx`

Purpose:

Defines reusable SVG icon components.

`IconBase`:

This is a wrapper for every icon. It sets common SVG settings:

- width
- height
- viewBox
- no fill by default
- stroke color follows text color
- rounded line caps and joins
- hidden from screen readers with `aria-hidden`

Each exported icon:

- calls `IconBase`
- passes SVG paths inside it
- accepts `props` like `size` or `className`

Example:

`CameraIcon` draws camera paths. Any page can use `<CameraIcon size={20} />`.

### `frontend/src/components/common/BrandLogo.jsx`

Purpose:

Shows the ClearView logo mark and text.

Props:

- `compact`: makes the logo smaller.
- `stacked`: changes layout.
- `subtitle`: optional small text under the brand name.
- `className`: lets parent components add extra CSS class names.
- `emphasis`: adds a style variation.

`classes` array:

Builds a single class string from conditions. `filter(Boolean)` removes empty values.

Returned JSX:

- outer `<div>` with classes.
- `brand-mark` with inline SVG.
- `brand-copy` with ClearView text and optional subtitle.

### `frontend/src/components/common/Navbar.jsx`

Purpose:

Shows the logged-in navigation bar.

Imports:

- `Link`: clickable navigation without full page reload.
- `useLocation`: reads the current URL.
- `useNavigate`: navigates after logout.
- `useAuth`: gets user and logout function.
- `BrandLogo`: logo component.

`handleLogout()`:

1. Calls `logout()`.
2. Navigates to `/login`.

`isActive(path)`:

Checks whether current URL equals a navigation path.

Rendered parts:

- logo link to dashboard
- workspace link
- new session link
- signed-in user name
- sign out button

### Frontend CSS Files

CSS files control visual styling. They do not usually change application data.

Important CSS files:

- `frontend/src/index.css`: global styles, variables, buttons, layout helpers, animations.
- `frontend/src/pages/AuthPages.css`: login/register styling.
- `frontend/src/pages/DashboardPage.css`: dashboard layout.
- `frontend/src/pages/ResumeUploadPage.css`: resume upload layout.
- `frontend/src/pages/InterviewPage.css`: interview room layout.
- `frontend/src/pages/ResultsPage.css`: results report layout.
- `frontend/src/components/common/Navbar.css`: navbar styling.
- `frontend/src/components/common/BrandLogo.css`: logo styling.
- `frontend/src/components/illustrations/StoryIllustrations.css`: illustration styling.

How to understand a CSS rule:

```css
.navbar {
    position: sticky;
    top: 0;
}
```

Plain English:

- Find elements with class `navbar`.
- Make them stick near the top while scrolling.
- `top: 0` means the sticky position begins at the top edge.

## Backend Code

The backend is a Node.js Express API. It receives requests, talks to MongoDB, calls the LLM, and returns JSON.

### `backend/package.json`

Important scripts:

- `npm start`: runs `node server.js`.
- `npm run dev`: runs `nodemon server.js`, which restarts automatically when files change.

Important dependencies:

- `express`: API server.
- `mongoose`: MongoDB connection and models.
- `bcryptjs`: password encryption.
- `jsonwebtoken`: login tokens.
- `multer`: file uploads.
- `cors`: allows frontend to call backend.
- `helmet`: security headers.
- `morgan`: request logging.
- `dotenv`: reads `.env`.
- `pdf-parse`: extracts text from PDFs.
- `mammoth`: extracts text from Word files.
- `openai`: OpenAI-compatible LLM client.

### `backend/server.js`

Purpose:

This is the backend entry point. It starts the API.

Line-by-line style explanation:

`require('dotenv').config();`

Loads environment variables from a `.env` file before anything else needs them.

`const express = require('express');`

Imports Express.

`const cors = require('cors');`

Imports CORS support so browser requests from frontend are allowed.

`const helmet = require('helmet');`

Imports security header middleware.

`const morgan = require('morgan');`

Imports HTTP request logging.

`const { validateEnv } = require('./config/env');`

Imports a custom function that checks required variables.

`validateEnv();`

Stops the server early if important secrets/config values are missing.

`const connectDB = require('./config/db');`

Imports MongoDB connection function.

`const routes = require('./routes');`

Imports all API routes from the routes index.

`const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');`

Imports error handling functions.

`const app = express();`

Creates the Express app.

`connectDB();`

Connects to MongoDB.

`app.use(helmet());`

Adds security-related response headers.

`const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];`

Reads allowed frontend URLs from environment. If none are set, allows localhost frontend.

`app.use(cors({...}))`

Configures CORS rules.

`app.use(morgan(...))`

Logs requests. Development gets shorter colored logs; production gets detailed logs.

`app.use(express.json({ limit: '10mb' }));`

Allows JSON request bodies, up to 10MB for base64 images.

`app.use(express.urlencoded({ extended: true }));`

Allows form-style request bodies.

`app.use('/api', routes);`

Mounts all API routes under `/api`.

`app.get('/', ...)`

Creates a simple welcome route at the root URL.

`app.use(notFoundHandler);`

Handles requests to unknown routes.

`app.use(errorHandler);`

Handles unexpected errors.

`const PORT = process.env.PORT || 5000;`

Chooses server port.

`app.listen(PORT, ...)`

Starts the server.

`process.on('SIGTERM'...)` and `process.on('SIGINT'...)`

Listen for shutdown signals and exit cleanly.

`module.exports = app;`

Exports the Express app, useful for testing or reuse.

### `backend/config/constants.js`

Purpose:

Stores fixed values used throughout the backend.

Important exports:

- `QUESTION_CATEGORIES`: valid question types.
- `DIFFICULTY_LEVELS`: valid difficulty values.
- `SESSION_STATUS`: allowed interview statuses.
- `SCORING_WEIGHTS`: weights for answer and confidence scoring.
- `FINAL_SCORING_WEIGHTS`: aptitude/confidence split.
- `IRS_PASS_THRESHOLD`: minimum final score to pass.
- `MIN_APTITUDE_TO_PASS`: prevents confidence from rescuing poor content.
- `DEFAULT_TIME_LIMIT`: question time.
- `DEFAULT_QUESTION_COUNT`: number of generated questions.
- `MAX_FILE_SIZE`: upload limit.
- `ALLOWED_FILE_TYPES`: accepted resume file MIME types.

### `backend/config/db.js`

Purpose:

Connects backend to MongoDB.

`const mongoose = require('mongoose');`

Imports Mongoose.

`const connectDB = async () => { ... }`

Defines an async function because database connection takes time.

`mongoose.connect(process.env.MONGODB_URI)`

Connects to the database URL from environment variables.

`process.exit(1)`

Stops the backend if database connection fails.

### `backend/config/env.js`

Purpose:

Checks that required environment variables exist.

`REQUIRED_ENV_VARS`:

Currently requires:

- `MONGODB_URI`
- `JWT_SECRET`
- `LLM_API_KEY`

`validateEnv()`:

Finds missing variables and throws an error if any are missing.

### `backend/config/jwt.js`

Purpose:

Central JWT token settings.

Exports:

- `secret`: used to sign and verify tokens.
- `expiresIn`: token lifetime, default 7 days.
- `refreshExpiresIn`: refresh token lifetime, currently 30 days.

### `backend/config/llm.js`

Purpose:

Central LLM settings.

`toNumber(value, fallback)`:

Converts environment variables from text into numbers safely.

Exports:

- `apiKey`
- `baseURL`
- `model`
- `temperature`
- `topP`
- `maxTokens`

### `backend/config/gemini.js`

This file is a compatibility shim that exports `./llm`. That means old code that imports `gemini` still receives the current LLM config.

### `backend/routes/index.js`

Purpose:

Combines route files.

`router.use('/auth', authRoutes)`

Means routes from `auth.routes.js` become `/api/auth/...`.

Other route groups:

- `/resume`
- `/interview`
- `/feedback`

`router.get('/health', ...)`

Returns a simple JSON response to prove backend is running.

### `backend/routes/auth.routes.js`

Purpose:

Defines auth URLs.

Routes:

- `POST /register`: calls `authController.register`.
- `POST /login`: calls `authController.login`.
- `GET /me`: first runs `authMiddleware`, then calls `authController.getMe`.

### `backend/routes/resume.routes.js`

Purpose:

Defines resume URLs.

`router.use(authMiddleware)`

Every route below it requires login.

`router.post('/upload', upload.single('resume'), handleUploadError, resumeController.uploadResume)`

This route:

1. Receives one uploaded file named `resume`.
2. Handles upload errors.
3. Calls the controller to parse and save it.

Other routes:

- `GET /all`
- `GET /:id`
- `DELETE /:id`

### `backend/routes/interview.routes.js`

Purpose:

Defines interview URLs.

All routes require login.

Routes:

- `POST /generate-questions`
- `GET /:sessionId/questions`
- `POST /:sessionId/start`
- `POST /:sessionId/answer`
- `POST /:sessionId/analyze-frame`
- `POST /:sessionId/complete`

### `backend/routes/feedback.routes.js`

Purpose:

Defines result and statistics URLs.

All routes require login.

Routes:

- `GET /history`
- `GET /stats`
- `GET /:sessionId`

### `backend/middleware/auth.js`

Purpose:

Protects private backend routes.

Step by step:

1. Reads `Authorization` header.
2. If missing, returns 401.
3. Removes `Bearer ` from the header to get the token.
4. Verifies the token with JWT secret.
5. Finds the user in MongoDB.
6. If user exists, attaches user to `req.user`.
7. Calls `next()` so the request can continue.
8. If token is invalid or expired, returns an error.

Why `req.user` matters:

Controllers can use `req.user._id` to make sure users only access their own data.

### `backend/middleware/upload.js`

Purpose:

Handles resume uploads.

`multer.memoryStorage()`:

Stores uploaded files temporarily in memory instead of saving them to disk.

`fileFilter(req, file, cb)`:

Checks whether the uploaded file MIME type is allowed.

`upload = multer({...})`:

Creates configured upload middleware with storage, filter, and file size limit.

`handleUploadError(err, req, res, next)`:

Turns upload errors into user-friendly JSON responses.

### `backend/middleware/errorHandler.js`

Purpose:

Central error handling.

`errorHandler`:

Logs the error and returns a JSON response.

`notFoundHandler`:

Returns 404 for unknown routes.

`asyncHandler`:

Utility that catches errors in async route handlers. It exists, although most controllers currently use their own try/catch blocks.

### `backend/models/User.js`

Purpose:

Defines how user accounts are stored.

Fields:

- `fullName`: required text, max 100 characters.
- `email`: required, unique, lowercased.
- `password`: required, minimum 8 characters.
- `lastLogin`: date.
- `totalTests`: starts at 0.
- `averageIRS`: starts at 0.

`timestamps: true`:

Automatically adds `createdAt` and `updatedAt`.

`userSchema.pre('save', async function(next) { ... })`:

Runs before saving a user.

Important logic:

- If password was not changed, do nothing.
- If password was changed, hash it with bcrypt.

`comparePassword(candidatePassword)`:

Compares a typed password with the encrypted stored password.

### `backend/models/Resume.js`

Purpose:

Stores parsed resume data.

Important fields:

- `userId`: who owns the resume.
- `originalFileName`: uploaded file name.
- `personalInfo`: name, email, phone, links.
- `summary`: resume summary.
- `skills`: technical, soft, tools, languages.
- `experience`: jobs.
- `education`: schools/degrees.
- `projects`: project details.
- `certifications`: certificates.
- `aiAnalysis`: domain, level, strengths, weaknesses, suggested topics.
- `parsedAt`: when parsed.

### `backend/models/Question.js`

Purpose:

Stores AI-generated interview questions.

Important fields:

- `sessionId`: interview session this belongs to.
- `resumeId`: resume used to create it.
- `questionText`: actual question.
- `category`: technical, behavioral, situational, project, or general.
- `basedOn`: resume context.
- `relatedSkill`: skill from resume.
- `relatedExperience`: related job/experience.
- `expectedKeyPoints`: what a good answer should include.
- `difficultyLevel`: easy, medium, or hard.
- `timeLimit`: default 120 seconds.
- `tips`: hint for the candidate.
- `isAIGenerated`: true by default.

### `backend/models/InterviewSession.js`

Purpose:

Tracks one interview attempt.

Important fields:

- `userId`: candidate.
- `resumeId`: resume used.
- `status`: preparing, questions_generated, in_progress, completed, abandoned.
- `questions`: ordered question references.
- `answers`: all answers.
- `confidenceFrames`: camera-derived confidence samples.
- `startTime`, `endTime`, `totalDuration`.

Inside each answer:

- `questionId`
- `answerText`
- `responseTime`
- `answeredAt`
- `voiceMetrics`
- `aiEvaluation`

Inside `voiceMetrics`:

Stores browser-measured speech delivery data, such as word count, words per minute, filler word rate, pauses, and volume stability.

Inside `aiEvaluation`:

Stores AI scores and feedback for one answer.

### `backend/models/Result.js`

Purpose:

Stores final interview report.

Important groups:

- `answerPerformance`: averages and category scores.
- `confidenceMetrics`: eye contact, posture, calmness, confidence score.
- `voiceMetrics`: aggregated delivery metrics.
- final scores:
  - `aptitudeScore`
  - `confidenceScore`
  - `interviewReadinessScore`
  - `passed`
- AI feedback:
  - `overallFeedback`
  - `strengths`
  - `areasToImprove`
  - `recommendations`
  - `interviewReadiness`
  - `nextSteps`

### `backend/models/index.js`

Purpose:

Exports all models from one place.

Instead of importing each model separately, other files can write:

```js
const { Result, InterviewSession } = require('../models');
```

### `backend/controllers/auth.controller.js`

Purpose:

Handles register, login, and current-user requests.

`register(req, res)`:

1. Reads `fullName`, `email`, and `password`.
2. Validates required fields.
3. Checks if email already exists.
4. Checks password length.
5. Creates a new user.
6. Saves user, triggering password hashing.
7. Creates JWT token.
8. Sends token and safe user data back.

`login(req, res)`:

1. Reads email and password.
2. Validates both are present.
3. Finds user by email.
4. Compares password using `comparePassword`.
5. Updates `lastLogin`.
6. Creates JWT token.
7. Sends token and safe user data back.

`getMe(req, res)`:

1. Uses `req.user` from auth middleware.
2. Finds the user in DB.
3. Excludes password.
4. Sends user info.

### `backend/controllers/resume.controller.js`

Purpose:

Handles resume upload and retrieval.

`uploadResume(req, res)`:

1. Checks that a file exists.
2. Reads `buffer`, `mimetype`, and `originalname`.
3. Calls `resumeService.parseResume`.
4. Creates a new Resume document.
5. Saves it.
6. Sends a summarized response.

`getResume(req, res)`:

Finds one resume by ID and user ID. This prevents users from accessing other users' resumes.

`getAllResumes(req, res)`:

Finds all resumes for the logged-in user, selecting only fields needed for lists.

`deleteResume(req, res)`:

Deletes one resume belonging to the logged-in user.

### `backend/controllers/interview.controller.js`

Purpose:

Handles the complete interview lifecycle.

`generateQuestions(req, res)`:

1. Reads `resumeId`.
2. Validates it exists.
3. Finds the resume owned by the current user.
4. Calls `llmService.generateQuestions`.
5. Creates an `InterviewSession`.
6. Saves each question.
7. Adds each question to the session in order.
8. Sends session ID and questions to frontend.

`startSession(req, res)`:

1. Finds the session owned by the user.
2. If already in progress, returns existing start time.
3. If completed, rejects.
4. Sets status to `in_progress`.
5. Sets start time.

`getQuestions(req, res)`:

1. Finds session.
2. Populates question details.
3. Sends question list to frontend.

`submitAnswer(req, res)`:

1. Reads question ID, answer text, response time, confidence snapshot, and voice metrics.
2. Finds the session.
3. Saves the answer.
4. Stores confidence snapshot as a weighted frame entry.
5. Saves session.
6. Does not call the LLM yet.

`analyzeFrame(req, res)`:

Compatibility route. It saves individual frame confidence data if called.

`completeSession(req, res)`:

This is one of the most important functions.

Step by step:

1. Finds the session and populates questions and resume.
2. Marks session completed.
3. Calculates total duration.
4. Builds `answersForBatch`, a clean list of all questions and answers.
5. Aggregates confidence frames into one confidence summary.
6. Aggregates voice metrics into one voice summary.
7. Tries `llmService.assessInterviewBatch`.
8. If batch assessment fails, uses individual `llmService.evaluateAnswer` calls.
9. Writes evaluations back into `session.answers`.
10. Saves session.
11. Calls `scoringService.calculateFinalScores`.
12. Uses AI summary from batch result or calls `llmService.generateFinalSummary`.
13. Adds feedback fields to the result.
14. Saves result.
15. Updates user stats.
16. Sends final summary to frontend.

### `backend/controllers/feedback.controller.js`

Purpose:

Returns final results and dashboard stats.

`getResult(req, res)`:

1. Finds a `Result` by session ID and user ID.
2. Loads the session with question details.
3. Builds an answer breakdown.
4. Sends scores, feedback, metrics, and per-question details.

`getHistory(req, res)`:

1. Finds all results for user.
2. Populates resume info.
3. Sorts newest first.
4. Sends a compact list for dashboard.

`getStats(req, res)`:

1. Gets all user results.
2. If none, returns zeros.
3. Calculates total interviews.
4. Calculates pass rate.
5. Calculates average IRS, aptitude, and confidence.
6. Finds best score.
7. Calculates trend when enough results exist.

### `backend/services/resume.service.js`

Purpose:

Extracts text from resume files and sends it to AI for parsing.

`extractText(fileBuffer, mimeType)`:

1. If PDF, uses `pdfParse`.
2. If Word file, uses `mammoth.extractRawText`.
3. If neither, throws unsupported file error.

`parseResume(fileBuffer, mimeType)`:

1. Extracts raw text.
2. Checks enough text was extracted.
3. Calls `llmService.parseResume(rawText)`.
4. Returns structured resume data.

### `backend/services/llm.service.js`

Purpose:

The AI brain of the backend.

Constructor:

Creates an OpenAI-compatible client using:

- API key
- base URL

JSON cleanup helpers:

- `stripCodeFences(content)`: removes ```json wrappers.
- `removeInvisibleCharacters(content)`: removes invisible text characters.
- `findFirstJsonBoundary(content)`: finds first `{` or `[`.
- `extractBalancedJson(content)`: extracts a complete JSON object or array.
- `normalizeJsonText(rawContent)`: runs cleanup steps together.
- `extractContent(completion)`: reads message text from LLM response.
- `parseJsonResponse(completion, contextLabel)`: parses cleaned JSON or throws a helpful error.
- `createJsonCompletion(prompt, contextLabel)`: sends a prompt and expects JSON back.

Main AI methods:

`parseResume(resumeText)`:

Asks AI to turn raw resume text into structured JSON containing personal info, skills, experience, education, projects, certifications, and AI analysis.

`generateQuestions(parsedResume, questionCount)`:

Asks AI to create personalized interview questions from the parsed resume.

`evaluateAnswer(question, answer)`:

Scores one answer. If the answer is empty or too short, returns zero-like scores without calling AI.

`assessInterviewBatch(interviewData)`:

Scores all answers in one AI call and asks for overall summary feedback.

`generateFinalSummary(sessionData)`:

Creates final human-readable feedback if batch summary was not available.

Important design:

Every AI method asks for valid JSON only. That makes frontend/backend handling predictable.

### `backend/services/scoring.service.js`

Purpose:

Calculates all numeric scores after answer evaluations exist.

`calculateFinalScores(session)`:

1. Calls `calculateAnswerPerformance`.
2. Calls `calculateConfidenceMetrics`.
3. Calls `calculateVoiceMetrics`.
4. Converts answer score to aptitude score.
5. Converts confidence metrics to confidence score.
6. Calculates final IRS.
7. Checks pass/fail.
8. Creates a `Result` document but does not save it yet.

`calculateAnswerPerformance(session)`:

1. Gets all answers.
2. If none, returns zeros.
3. Extracts AI evaluations.
4. Calculates average relevance, accuracy, communication, and depth.
5. Applies answer scoring weights.
6. Groups scores by question category.
7. Finds strongest and weakest category.

`calculateConfidenceMetrics(frames)`:

1. If no frames, returns zeros.
2. Calculates weighted averages for eye contact, posture, and facial calmness.
3. Applies confidence weights.
4. Returns score and sample count.

`calculateVoiceMetrics(answers)`:

1. Collects voice metrics from answers.
2. If none, returns zeros.
3. Separates spoken answers from typed answers.
4. Calculates totals and averages.

`updateUserStats(userId, newIRS)`:

1. Finds the user.
2. Increments total tests.
3. Recalculates average IRS.
4. Saves user.

### `backend/services/gemini.service.js`

Compatibility shim. It exports `llm.service.js` so old imports still work.

## AI Service Code

The AI service is a Python Flask app. It analyzes webcam images sent by the frontend.

### `ai-service/requirements.txt`

Important packages:

- `flask`: Python API server.
- `flask-cors`: allows browser requests.
- `mediapipe`: face and pose detection.
- `numpy`: numerical image arrays.
- `pillow`: image support.
- `gunicorn`: production server option.
- `python-dotenv`: environment variables.
- `msvc-runtime`: Windows runtime support.

### `ai-service/app.py`

Purpose:

Starts the Python AI API.

Imports:

- `os`: reads environment variables.
- `base64`: decodes image strings.
- `cv2`: OpenCV image decoding.
- `numpy`: turns bytes into arrays.
- Flask tools: create app, read requests, return JSON.
- `CORS`: allows frontend calls.
- `load_dotenv`: loads `.env`.
- custom analyzer classes.

App setup:

1. Loads environment variables.
2. Creates Flask app.
3. Reads allowed origins.
4. Enables CORS.
5. Creates one `FaceAnalyzer`.
6. Creates one `PoseAnalyzer`.
7. Creates one `ConfidenceEngine`.

`decode_base64_image(base64_string)`:

1. Removes data URL prefix if present.
2. Decodes base64 text into bytes.
3. Converts bytes to NumPy array.
4. Uses OpenCV to decode image.
5. Returns image or `None`.

`/health`:

Returns service status and active analyzers.

`/analyze-frame`:

Full analysis endpoint.

Step by step:

1. Reads JSON body.
2. Checks frame exists.
3. Decodes image.
4. Runs face analyzer.
5. Runs pose analyzer.
6. Combines scores with confidence engine.
7. Returns detailed scores.

`/analyze-frame-simple`:

Simpler endpoint for frontend.

Returns:

- `eyeContact`
- `posture`
- `facialTension`

If anything fails, returns neutral values so the interview does not crash.

`/reset`:

Clears pose and confidence history.

`/feedback`:

Turns confidence scores into readable feedback messages.

Error handlers:

- 404 returns "Endpoint not found".
- 500 returns "Internal server error".

Run block:

`if __name__ == '__main__':`

Only runs when starting this file directly with `python app.py`.

It reads port/debug settings and starts Flask.

### `ai-service/services/face_analysis.py`

Purpose:

Uses MediaPipe Face Mesh to estimate eye contact and facial calmness.

Setup:

- Imports MediaPipe, OpenCV, and NumPy.
- Creates `mp_face_mesh`.

`FaceAnalyzer.__init__()`:

Creates a Face Mesh detector with:

- one face max
- refined landmarks
- detection confidence
- tracking confidence

It also defines landmark groups:

- left eye
- right eye
- left iris
- right iris
- lips
- eyebrows
- nose tip

`analyze_frame(image)`:

1. Converts BGR image to RGB.
2. Sends image to MediaPipe.
3. If no face is found, returns eye contact 0 and neutral calmness.
4. Gets landmarks.
5. Calculates eye contact.
6. Calculates facial tension.
7. Converts tension into calmness by doing `100 - tension`.
8. Returns scores.

`_calculate_eye_contact(landmarks, width, height)`:

1. Finds iris centers.
2. Finds eye centers.
3. Measures how far iris is from eye center.
4. Converts deviation into a 0-100 score.
5. Reduces score if nose position suggests head turned away.

`_calculate_facial_tension(landmarks)`:

Looks for rough signs of tension:

- raised eyebrows
- compressed lips
- furrowed brow
- jaw clench approximation

Returns 0-100 tension, where higher means more tense.

`_get_center(landmarks, indices)`:

Averages several landmark points into one center point.

`release()`:

Closes MediaPipe resources.

### `ai-service/services/pose_analysis.py`

Purpose:

Uses MediaPipe Pose to estimate posture and stability.

`PoseAnalyzer.__init__(history_size=10)`:

1. Creates MediaPipe pose detector.
2. Creates a `deque` for position history.
3. Stores landmark names for nose, shoulders, ears, and hips.

`analyze_frame(image)`:

1. Converts BGR to RGB.
2. Processes image with MediaPipe Pose.
3. If no body is detected, returns neutral posture.
4. Calculates posture quality.
5. Calculates movement stability.
6. Combines posture and stability:
   - 60 percent posture
   - 40 percent stability

`_calculate_posture(landmarks)`:

Checks:

- shoulder alignment
- head alignment
- forward lean
- slouching

Returns 0-100 posture score.

`_calculate_stability(landmarks)`:

1. Stores current nose and shoulder positions.
2. Compares recent frames.
3. More movement means lower stability.
4. Less movement means higher stability.

`reset_history()`:

Clears stored positions.

`release()`:

Closes MediaPipe resources.

### `ai-service/services/confidence_engine.py`

Purpose:

Combines face and pose scores into one confidence score.

Weights:

- eye contact: 30 percent
- posture: 35 percent
- facial calmness: 35 percent

`__init__()`:

Creates score history for smoothing. Smoothing prevents the score from jumping too wildly between frames.

`calculate_confidence(face_data, pose_data)`:

1. Reads eye contact from face data.
2. Reads facial calmness from face data.
3. Reads posture from pose data.
4. Applies weights.
5. Saves score in history.
6. Averages recent scores.
7. Returns total score, raw score, individual metrics, detection flags, and weighted breakdown.

`get_feedback(confidence_data)`:

Turns scores into written feedback.

`reset()`:

Clears score history.

### `ai-service/services/__init__.py`

Purpose:

Makes these imports easier:

```python
from services.face_analysis import FaceAnalyzer
from services.pose_analysis import PoseAnalyzer
from services.confidence_engine import ConfidenceEngine
```

It also defines `__all__`, which lists the public classes in this package.

## Data Flow Examples

### Example 1: Register

Frontend:

`RegisterPage.jsx` calls `register(...)`.

Auth context:

`AuthContext.jsx` calls `authService.register(...)`.

API service:

`api.js` sends `POST /auth/register`.

Backend route:

`auth.routes.js` sends request to `authController.register`.

Controller:

`auth.controller.js` creates user and token.

Model:

`User.js` hashes password before saving.

Response:

Frontend saves token and opens dashboard.

### Example 2: Upload Resume

Frontend:

`ResumeUploadPage.jsx` validates file and calls `resumeService.upload(file)`.

API service:

`api.js` sends file to `/resume/upload`.

Backend route:

`resume.routes.js` uses `upload.single('resume')`.

Middleware:

`upload.js` checks file type and size.

Controller:

`resume.controller.js` calls `resumeService.parseResume`.

Service:

`resume.service.js` extracts text and calls `llmService.parseResume`.

LLM:

`llm.service.js` asks AI for structured JSON.

Database:

`Resume.js` stores parsed data.

Response:

Frontend shows extracted resume summary.

### Example 3: Complete Interview

Frontend:

`InterviewPage.jsx` calls `interviewService.complete(sessionId)`.

Backend:

`interview.controller.js` loads session, answers, questions, and resume.

LLM:

`llm.service.js` evaluates all answers.

Scoring:

`scoring.service.js` calculates final scores.

Database:

`Result.js` stores final report.

Frontend:

`ResultsPage.jsx` displays report.

## Beginner Checklist for Editing This Project

Before changing a file, ask:

1. Is this frontend, backend, or AI service?
2. Is this file showing UI, handling an API request, storing data, or calculating something?
3. If I change a backend response, does the frontend expect the old shape?
4. If I change a model field, do controllers and pages also need updates?
5. If I change scoring weights, should result labels and docs also be updated?
6. If I change an API URL, did I update `frontend/src/services/api.js`?
7. If I add protected backend routes, did I include `authMiddleware`?
8. If I add a file upload type, did I update both frontend validation and backend `ALLOWED_FILE_TYPES`?

## What "Line by Line" Means in Practice

For a real project, many lines repeat the same patterns. Once you understand these patterns, you can read almost any line:

- Imports bring tools in.
- State stores changing screen data.
- Event handlers respond to clicks, typing, drag/drop, recording, and submit.
- Services make API calls.
- Routes connect URLs to controller functions.
- Controllers read requests, validate input, call services/models, and send responses.
- Models define database structure.
- Services contain reusable business logic.
- CSS classes style the HTML/JSX elements.

When reading any file, start at the top and ask:

1. What does this file import?
2. What variables or constants does it define?
3. What functions does it define?
4. What does it export?
5. Which other file uses that export?

That is the safest way to understand code one line at a time.

