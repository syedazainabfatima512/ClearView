# ClearView Setup and Full Testing Guide

## What This Project Needs
ClearView has 3 parts that must run together:

1. `frontend` - React/Vite app on `http://localhost:3000`
2. `backend` - Node/Express API on `http://localhost:5000`
3. `ai-service` - Python/Flask MediaPipe service on `http://localhost:5001`

You also need:

- A running MongoDB database
- A valid NVIDIA API key for the LLM
- Node.js and npm
- Python and pip
- A browser with camera access
- A sample resume file in `.pdf`, `.doc`, or `.docx` format under 5 MB

## Recommended Local Setup
- `Node.js`: 18+ is a safe choice
- `npm`: comes with Node.js
- `Python`: for the `ai-service` on Windows, use `Python 3.11`
- `MongoDB`: local MongoDB Community Server or MongoDB Atlas
- Browser: Chrome or Edge is best because speech recognition support is better there

### Important Python Note For Windows
The AI service uses MediaPipe's legacy `solutions` API (`face_mesh` and `pose`), and that stack is not reliable on this Windows machine with Python 3.12. The stable path for this project is:

- `Python 3.11`
- a fresh `.venv`
- the pinned `ai-service/requirements.txt`

If `py -3.11` does not work on your PC, install Python 3.11 first, then continue.

## Env Files You Should Create
This repo already includes example env files. Create real local env files from them.

### 1. Backend env
From `backend/.env.example`, create `backend/.env`

```powershell
cd backend
Copy-Item .env.example .env
```

Set these values in `backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/clearview
JWT_SECRET=replace-with-a-strong-secret
JWT_EXPIRES_IN=7d
LLM_API_KEY=your-rotated-nvidia-api-key
LLM_BASE_URL=https://integrate.api.nvidia.com/v1
LLM_MODEL=minimaxai/minimax-m2.7
LLM_TEMPERATURE=1
LLM_TOP_P=0.95
LLM_MAX_TOKENS=8192
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

Notes:

- `LLM_API_KEY` is required
- Rotate the NVIDIA key that was pasted in chat before using it
- If you use MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string

### 2. Frontend env
From `frontend/.env.example`, create `frontend/.env.local` or `frontend/.env`

```powershell
cd ..\frontend
Copy-Item .env.example .env.local
```

Recommended values:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_AI_SERVICE_URL=http://localhost:5001
```

### 3. AI service env
From `ai-service/.env.example`, create `ai-service/.env`

```powershell
cd ..\ai-service
Copy-Item .env.example .env
```

Recommended values:

```env
PORT=5001
DEBUG=True
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## First-Time Installation

### Backend
```powershell
cd backend
npm install
```

### Frontend
```powershell
cd ..\frontend
npm install
```

### AI service
```powershell
cd ..\ai-service
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

If PowerShell blocks activation, open a fresh terminal and run:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\.venv\Scripts\Activate.ps1
```

If you already created a broken `.venv` with Python 3.12, delete that `.venv` folder first and recreate it with Python 3.11.

## How To Run The App
Use 3 terminals.

### Terminal 1: Start backend
```powershell
cd backend
npm run dev
```

Expected result:

- backend starts on `http://localhost:5000`
- `http://localhost:5000/api/health` returns a healthy response

### Terminal 2: Start AI service
```powershell
cd ai-service
.\.venv\Scripts\Activate.ps1
python app.py
```

Expected result:

- AI service starts on `http://localhost:5001`
- `http://localhost:5001/health` returns a healthy response

### Terminal 3: Start frontend
```powershell
cd frontend
npm run dev
```

Expected result:

- frontend opens on `http://localhost:3000`

## Quick Pre-Flight Checks
Before full user testing, confirm:

1. MongoDB is running and the backend does not crash on startup
2. Backend health works at `http://localhost:5000/api/health`
3. AI service health works at `http://localhost:5001/health`
4. Frontend loads in the browser
5. Camera permission prompt appears when you start an interview

## Full End-to-End User Test

### Test 1: Registration
1. Open `http://localhost:3000`
2. You should be redirected to login if not authenticated
3. Open the register page
4. Create a new account with:
   - full name
   - email
   - password with at least 8 characters
5. Expected result:
   - registration succeeds
   - you are redirected to the dashboard

### Test 2: Dashboard empty state
1. On a new account, check the dashboard
2. Expected result:
   - stats show zero or empty values
   - no interview history yet
   - no resumes uploaded yet
   - `+ New Interview` is visible

### Test 3: Resume upload and parsing
1. Click `+ New Interview`
2. Upload a real resume file:
   - `pdf`, `doc`, or `docx`
   - under 5 MB
3. Click `Upload & Analyze`
4. Expected result:
   - upload succeeds
   - AI parsing completes
   - parsed profile card appears
   - name, domain, experience level, and some skills are shown

If this fails, usually one of these is missing:

- invalid `LLM_API_KEY`
- backend cannot reach NVIDIA API
- MongoDB is not connected
- resume file is too large or unsupported

### Test 4: Personalized question generation
1. On the parsed resume screen, click `Generate Interview Questions`
2. Expected result:
   - a session is created
   - you are redirected to `/interview/:sessionId`
   - question 1 loads
   - the session starts successfully

### Test 5: Camera and voice setup
1. Allow camera access in the browser
2. Optional: try speech input with the `Speak` button
3. Expected result:
   - video preview appears
   - no blocking errors on the page
   - speech input works in supported browsers

Notes:

- Typing answers is enough if speech recognition is unavailable
- For a full confidence-analysis test, camera access should be allowed

### Test 6: Answering interview questions
1. Answer each question by typing or speaking
2. Click `Submit Answer`
3. After each answer, check:
   - relevance score
   - accuracy score
   - communication score
   - depth score
   - overall score
   - feedback tip text
4. Click `Next Question`
5. Repeat until the last question

Expected result:

- each answer is evaluated successfully
- feedback appears after each submission
- progress bar moves forward correctly

### Test 7: Completing the interview
1. On the final question, submit the answer
2. Click `Finish Interview`
3. Expected result:
   - interview completes without crashing
   - results page loads automatically

### Test 8: Results page
On the results page, verify:

- Interview Readiness Score is shown
- pass/fail status is shown
- aptitude score is shown
- confidence score is shown
- overall feedback is shown
- strengths are listed
- areas to improve are listed
- recommendations are listed

### Test 9: Dashboard after one interview
1. Return to the dashboard
2. Expected result:
   - recent interview appears
   - stats are updated
   - uploaded resume appears in the resume list

### Test 10: Results history
1. Click an interview from recent history
2. Expected result:
   - result page opens for that session
   - prior results remain accessible

## Extra Negative Tests
These are useful for FYP demos and QA.

### Invalid resume test
- Upload a non-document file
- Expected: frontend blocks it or backend rejects it cleanly

### Oversized resume test
- Upload a file bigger than 5 MB
- Expected: upload is rejected with a clear error

### Missing camera permission
- Deny camera access
- Expected: interview still works, but confidence analysis is limited

### Missing LLM key
- Remove `LLM_API_KEY` from `backend/.env`
- Restart backend
- Expected: backend fails fast with a clear env validation error

### Wrong API base URL
- Put the wrong backend URL in `frontend/.env.local`
- Expected: login/upload/interview calls fail

## What Else Is Needed For A Good Demo
For a clean FYP presentation, prepare these before demo day:

- A rotated and tested NVIDIA API key
- A working MongoDB database with stable internet
- One strong sample resume and one weaker sample resume
- A laptop/browser with camera permission already allowed
- A backup browser tab open for:
  - frontend
  - backend health endpoint
  - AI service health endpoint
- At least one completed interview already stored in MongoDB for history/demo fallback

## Common Problems

### Backend exits immediately
Check:
- `backend/.env` exists
- `MONGODB_URI` is valid
- `JWT_SECRET` is set
- `LLM_API_KEY` is set

### Resume upload fails
Check:
- NVIDIA key is valid
- internet is available
- resume is under 5 MB
- file type is supported

### Frontend loads but API calls fail
Check:
- backend is running on port `5000`
- frontend env points to the correct backend URL
- `ALLOWED_ORIGINS` includes the frontend URL

### Camera analysis does not work
Check:
- AI service is running on port `5001`
- frontend env points to the correct AI service URL
- browser camera permission is allowed

### AI service fails while importing `mediapipe`
If you see errors like:

- `module 'mediapipe' has no attribute 'solutions'`
- `DLL load failed while importing _framework_bindings`

use this fix:

1. Install Python 3.11
2. Recreate `ai-service/.venv` with `py -3.11 -m venv .venv`
3. Activate it and run `pip install -r requirements.txt`

This project currently depends on MediaPipe's older solutions API, which is why that version matters.

### Speech input does not work
Check:
- use Chrome or Edge
- browser microphone/speech features are enabled
- type answers manually if speech recognition is unsupported

## Recommended Test Order For Demo Day
1. Start MongoDB
2. Start backend
3. Start AI service
4. Start frontend
5. Confirm both health endpoints
6. Register or log in
7. Upload resume
8. Generate questions
9. Answer 2-3 questions live
10. Complete the interview
11. Show results and dashboard history

## Useful URLs
- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:5000/api/health`
- AI service health: `http://localhost:5001/health`
