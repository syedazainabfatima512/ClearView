# ClearView Project Guide for Beginners

This document explains the ClearView project without assuming coding experience. It focuses on what the project does, how the pieces connect, and what happens when a user moves through the application.

For code-by-code explanations, read `docs/CODE_WALKTHROUGH_FOR_BEGINNERS.md`.

## 1. What ClearView Is

ClearView is an AI-based interview practice system.

A user can:

1. Create an account or log in.
2. Upload a resume file.
3. Let AI read the resume and extract useful information.
4. Generate interview questions based on that resume.
5. Take an interview in the browser.
6. Answer questions by typing or speaking.
7. Let the system analyze answer quality, camera confidence, and voice delivery.
8. See final feedback and an Interview Readiness Score.

The project is split into three main applications:

| Part | Folder | Main Language | Job |
| --- | --- | --- | --- |
| Frontend | `frontend` | JavaScript and React | What the user sees in the browser |
| Backend | `backend` | JavaScript and Node.js | API, database, login, resume parsing, scoring |
| AI Service | `ai-service` | Python | Camera frame analysis using MediaPipe |

## 2. Big Picture Flow

Think of the system as three people working together.

The frontend is the receptionist. It shows screens, buttons, forms, the webcam view, and the final report.

The backend is the office manager. It checks who the user is, stores information in MongoDB, accepts uploaded resumes, asks the LLM for questions and feedback, and calculates final scores.

The AI service is the body-language assistant. It receives webcam frames and estimates eye contact, posture, and facial calmness.

## 3. User Journey

### Step 1: Register or Login

Files involved:

- `frontend/src/pages/RegisterPage.jsx`
- `frontend/src/pages/LoginPage.jsx`
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/services/api.js`
- `backend/routes/auth.routes.js`
- `backend/controllers/auth.controller.js`
- `backend/models/User.js`
- `backend/middleware/auth.js`

What happens:

1. The user types their name, email, and password.
2. The frontend sends this data to the backend.
3. The backend checks the data.
4. The backend stores the user in MongoDB.
5. The password is encrypted before saving.
6. The backend returns a JWT token.
7. The frontend saves that token in browser `localStorage`.
8. Future requests include the token so the backend knows who is using the app.

### Step 2: Dashboard

Files involved:

- `frontend/src/pages/DashboardPage.jsx`
- `backend/routes/feedback.routes.js`
- `backend/controllers/feedback.controller.js`
- `backend/routes/resume.routes.js`
- `backend/controllers/resume.controller.js`

What happens:

1. The dashboard asks the backend for statistics.
2. It also asks for recent interview history.
3. It asks for saved resumes.
4. The page shows cards like total sessions, average readiness, pass rate, and best round.
5. The user can start a new session from an existing resume.

### Step 3: Upload Resume

Files involved:

- `frontend/src/pages/ResumeUploadPage.jsx`
- `frontend/src/services/api.js`
- `backend/routes/resume.routes.js`
- `backend/middleware/upload.js`
- `backend/controllers/resume.controller.js`
- `backend/services/resume.service.js`
- `backend/services/llm.service.js`
- `backend/models/Resume.js`

What happens:

1. The user drags a resume file or chooses it from the file picker.
2. The frontend checks that it is PDF, DOC, or DOCX and less than 5MB.
3. The frontend sends the file as `FormData`.
4. The backend upload middleware checks the file type and size again.
5. The resume service extracts plain text from the file.
6. The LLM service asks an AI model to turn that text into structured resume data.
7. The backend saves the parsed resume in MongoDB.
8. The frontend shows the extracted profile summary.

### Step 4: Generate Interview Questions

Files involved:

- `frontend/src/pages/ResumeUploadPage.jsx`
- `frontend/src/pages/DashboardPage.jsx`
- `backend/routes/interview.routes.js`
- `backend/controllers/interview.controller.js`
- `backend/services/llm.service.js`
- `backend/models/Question.js`
- `backend/models/InterviewSession.js`

What happens:

1. The user clicks to build or run an interview.
2. The frontend sends the resume ID to the backend.
3. The backend loads the parsed resume.
4. The LLM service generates personalized questions.
5. The backend creates an interview session.
6. Each generated question is saved in the database.
7. The frontend navigates to `/interview/:sessionId`.

### Step 5: Take Interview

Files involved:

- `frontend/src/pages/InterviewPage.jsx`
- `frontend/src/services/api.js`
- `ai-service/app.py`
- `ai-service/services/face_analysis.py`
- `ai-service/services/pose_analysis.py`
- `ai-service/services/confidence_engine.py`
- `backend/controllers/interview.controller.js`
- `backend/models/InterviewSession.js`

What happens:

1. The interview page loads questions for the session.
2. It starts the browser camera.
3. It can start speech recognition for spoken answers.
4. Every few seconds, the frontend captures a webcam frame.
5. The frame is sent to the Python AI service.
6. The AI service returns eye contact, posture, and facial tension/calmness.
7. The frontend keeps those measurements in memory.
8. When the user submits an answer, the frontend sends:
   - question ID
   - answer text
   - response time
   - confidence summary
   - voice metrics if available
9. The backend saves the answer.

Important design decision: this project does not evaluate every answer with the LLM immediately. It saves answers during the interview, then evaluates them together when the interview is completed. That makes the interview smoother and reduces repeated AI calls.

### Step 6: Complete Interview

Files involved:

- `frontend/src/pages/InterviewPage.jsx`
- `backend/controllers/interview.controller.js`
- `backend/services/llm.service.js`
- `backend/services/scoring.service.js`
- `backend/models/Result.js`

What happens:

1. The user finishes the final question.
2. The frontend calls the backend complete endpoint.
3. The backend marks the session as completed.
4. The backend sends all answers to the LLM service for batch evaluation.
5. If batch evaluation fails, the backend tries per-answer evaluation.
6. The scoring service calculates:
   - answer performance
   - confidence metrics
   - voice metrics
   - aptitude score
   - confidence score
   - final Interview Readiness Score
7. The backend saves the final result.
8. The user statistics are updated.
9. The frontend opens the results page.

### Step 7: View Results

Files involved:

- `frontend/src/pages/ResultsPage.jsx`
- `backend/routes/feedback.routes.js`
- `backend/controllers/feedback.controller.js`
- `backend/models/Result.js`
- `backend/models/InterviewSession.js`

What happens:

1. The results page asks the backend for the result connected to the session.
2. The backend returns final scores, feedback, strengths, improvement areas, recommendations, voice metrics, and per-question answer breakdown.
3. The frontend renders charts, cards, feedback sections, and detailed answer review.

## 4. Folder-by-Folder Explanation

### Root Folder

| File or Folder | Meaning |
| --- | --- |
| `frontend` | React browser app |
| `backend` | Node.js API server |
| `ai-service` | Python webcam analysis service |
| `banner.html` | Standalone banner or presentation page |
| `bannerSS` | Screenshots/images used by banner or documentation |
| `ClearView.txt`, `ClearView.docx`, `crearview.md` | Existing project writeups |
| `FRONTEND_IMPLEMENTATION.md` | Existing frontend implementation notes |
| `BACKEND_FUNCTIONALITY_IMPLEMENTATION.md` | Existing backend implementation notes |
| `CLEARVIEW_SETUP_AND_TESTING.md` | Existing setup/testing guide |
| `package.json` | Root package only includes Puppeteer tooling |
| `take_screenshot.js` | Script for taking screenshots |
| `docs` | New beginner-friendly documentation folder |

### Frontend Folder

| File or Folder | Meaning |
| --- | --- |
| `frontend/package.json` | Lists frontend dependencies and scripts |
| `frontend/vite.config.js` | Vite setup for running/building React |
| `frontend/index.html` | HTML page where React gets mounted |
| `frontend/src/main.jsx` | Starts React and attaches it to the page |
| `frontend/src/App.jsx` | Main routing file |
| `frontend/src/index.css` | Global CSS styles |
| `frontend/src/context/AuthContext.jsx` | Login state shared across the app |
| `frontend/src/services/api.js` | All calls to backend and AI service |
| `frontend/src/pages` | Main screens |
| `frontend/src/components/common` | Shared UI pieces like navbar, logo, icons |
| `frontend/src/components/illustrations` | Decorative/visual React illustrations |
| `frontend/public/favicon.svg` | Browser tab icon |

### Backend Folder

| File or Folder | Meaning |
| --- | --- |
| `backend/package.json` | Lists backend dependencies and scripts |
| `backend/server.js` | Starts the Express API server |
| `backend/config` | Environment, database, JWT, LLM, and constants setup |
| `backend/routes` | Defines API URL paths |
| `backend/controllers` | Handles requests and responses |
| `backend/services` | Business logic such as resume parsing and scoring |
| `backend/models` | MongoDB data shapes |
| `backend/middleware` | Reusable request checks like auth and file upload |
| `backend/models_list.json` | Model-related metadata/listing |
| `backend/diagnostic.js`, `backend/diagnostic_long.js` | Diagnostic scripts |

### AI Service Folder

| File or Folder | Meaning |
| --- | --- |
| `ai-service/app.py` | Starts the Flask API server |
| `ai-service/requirements.txt` | Python dependencies |
| `ai-service/services/face_analysis.py` | Face and eye-contact analysis |
| `ai-service/services/pose_analysis.py` | Body posture analysis |
| `ai-service/services/confidence_engine.py` | Combines face and pose into confidence |
| `ai-service/services/__init__.py` | Makes service classes importable |

## 5. Main Technologies Used

### React

React is used to build the browser interface. Each screen is a component, which means it is a reusable function that returns visible UI.

### React Router

React Router changes pages inside the browser without fully reloading the website. It controls URLs like `/login`, `/dashboard`, and `/interview/:sessionId`.

### Vite

Vite runs and builds the frontend quickly during development.

### Express

Express is the backend web framework. It receives HTTP requests and sends JSON responses.

### MongoDB and Mongoose

MongoDB stores users, resumes, questions, interview sessions, and final results. Mongoose defines the shape of each stored item.

### JWT

JWT tokens prove the user is logged in. The frontend stores the token and sends it with protected API requests.

### Multer

Multer handles resume file uploads.

### PDF Parse and Mammoth

`pdf-parse` extracts text from PDF files. `mammoth` extracts text from Word documents.

### OpenAI-Compatible Client

The backend uses the `openai` package with a configurable base URL. In this project, the default base URL points to NVIDIA's OpenAI-compatible API.

### Flask

Flask runs the Python AI service.

### MediaPipe

MediaPipe analyzes faces and body poses from video frames.

## 6. Database Collections

The backend models define the database collections.

### User

Stores:

- full name
- email
- encrypted password
- last login
- total tests
- average Interview Readiness Score

### Resume

Stores:

- uploaded file name
- parsed personal info
- skills
- work experience
- education
- projects
- certifications
- AI analysis of domain, level, strengths, and weaknesses

### Question

Stores:

- question text
- category
- what resume item it is based on
- related skill
- expected key points
- difficulty
- time limit

### InterviewSession

Stores:

- user ID
- resume ID
- session status
- questions
- answers
- answer evaluations
- confidence frames
- voice metrics
- start and end time

### Result

Stores:

- final aptitude score
- final confidence score
- Interview Readiness Score
- pass/fail status
- answer performance
- confidence metrics
- voice delivery metrics
- final AI feedback
- strengths and recommendations

## 7. API Map

All backend routes start with `/api`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Log in |
| `GET` | `/api/auth/me` | Get logged-in user |
| `POST` | `/api/resume/upload` | Upload and parse resume |
| `GET` | `/api/resume/all` | List user's resumes |
| `GET` | `/api/resume/:id` | Get one resume |
| `DELETE` | `/api/resume/:id` | Delete one resume |
| `POST` | `/api/interview/generate-questions` | Generate questions |
| `GET` | `/api/interview/:sessionId/questions` | Get session questions |
| `POST` | `/api/interview/:sessionId/start` | Start interview |
| `POST` | `/api/interview/:sessionId/answer` | Save an answer |
| `POST` | `/api/interview/:sessionId/analyze-frame` | Save confidence frame |
| `POST` | `/api/interview/:sessionId/complete` | Complete and score interview |
| `GET` | `/api/feedback/history` | User result history |
| `GET` | `/api/feedback/stats` | User statistics |
| `GET` | `/api/feedback/:sessionId` | One detailed result |

Python AI service routes:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Check AI service health |
| `POST` | `/analyze-frame` | Full confidence analysis |
| `POST` | `/analyze-frame-simple` | Simple frontend-friendly analysis |
| `POST` | `/reset` | Reset analyzer state |
| `POST` | `/feedback` | Convert confidence scores into text feedback |

## 8. Environment Variables

The backend requires:

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign login tokens |
| `LLM_API_KEY` | API key for the LLM provider |

Optional backend variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `5000` | Backend server port |
| `NODE_ENV` | `development` | Environment mode |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | Frontend URLs allowed by CORS |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `LLM_BASE_URL` | `https://integrate.api.nvidia.com/v1` | LLM API base URL |
| `LLM_MODEL` | `minimaxai/minimax-m2.7` | Model name |
| `LLM_TEMPERATURE` | `1` | Creativity setting |
| `LLM_TOP_P` | `0.95` | Sampling setting |
| `LLM_MAX_TOKENS` | `8192` | Max response size |

Frontend variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:5000/api` | Backend API URL |
| `VITE_AI_SERVICE_URL` | `http://localhost:5001` | Python AI service URL |

AI service variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `5001` | Python service port |
| `DEBUG` | `True` | Flask debug mode |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | Browser origins allowed by CORS |

## 9. How to Run the Project

Open three terminals.

### Terminal 1: Backend

```bash
cd backend
npm install
npm run dev
```

The backend runs on port `5000` by default.

### Terminal 2: AI Service

```bash
cd ai-service
pip install -r requirements.txt
python app.py
```

The AI service runs on port `5001` by default.

### Terminal 3: Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite prints the frontend URL in the terminal.

## 10. Scoring Logic in Plain English

ClearView calculates several scores.

### Answer Performance

Each answer is judged by:

- relevance: did the answer address the question?
- accuracy: was the answer correct?
- communication: was the answer clear?
- depth: did it show real understanding?

The weights are:

- accuracy: 35 percent
- relevance: 30 percent
- communication: 20 percent
- depth: 15 percent

### Confidence

The camera confidence score uses:

- eye contact: 30 percent
- posture: 35 percent
- facial calmness: 35 percent

### Final Interview Readiness Score

The final readiness score uses:

- aptitude/content: 75 percent
- confidence/body language: 25 percent

If no confidence data exists, the system gives full weight to aptitude instead of adding fake neutral confidence.

The pass threshold is currently `70`. There is also a minimum aptitude score requirement of `6.5`, so body language alone cannot pass a weak interview.

## 11. Important Project Design Choices

### Authentication Protects Private Data

Resume, interview, and feedback routes require a valid token. This prevents one user from opening another user's resumes or results.

### Files Are Processed in Memory

Uploaded resumes are stored temporarily in memory rather than saved to disk. The backend reads the file buffer, extracts text, and saves only parsed resume data.

### LLM Responses Must Be JSON

The backend asks the AI model to return strict JSON. The LLM service also cleans common formatting problems, such as code fences, before parsing the response.

### Final Evaluation Is Batched

The system evaluates all answers at the end. This is usually faster and produces more consistent final feedback.

### Frontend Captures Voice Metrics Locally

The interview page calculates pacing, filler words, pauses, and volume-related metrics in the browser, then sends summaries to the backend.

## 12. Best Reading Order for a Non-Coder

1. Read this file completely.
2. Open `frontend/src/App.jsx` to understand pages.
3. Open `frontend/src/services/api.js` to understand communication.
4. Open `backend/server.js` to understand the backend entry point.
5. Open `backend/routes/index.js` to see route grouping.
6. Open each route file.
7. Open the matching controller file.
8. Open the matching model file.
9. Open `backend/services/scoring.service.js`.
10. Open `ai-service/app.py`.
11. Open the AI service files in `ai-service/services`.

## 13. Simple Mental Model

If you remember only one thing, remember this:

Frontend shows the screens. Backend owns users, resumes, questions, interviews, and results. AI service reads webcam frames. MongoDB stores the data. The LLM reads resumes, writes questions, grades answers, and creates feedback.

