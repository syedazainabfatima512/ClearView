🎯 ClearView — AI-Based Interview Preparation System
ClearView is an AI-powered interview preparation system that helps students and job seekers improve their interview performance — and helps organizations hire faster with structured, unbiased, and measurable candidate evaluation.

📌 Overview

ClearView generates interview questions based on a candidate's resume, then conducts a live interview session using the candidate's webcam and microphone. During the session, it evaluates both the accuracy of answers and the candidate's confidence level in real time, producing a detailed results dashboard at the end.

⚙️ How It Works
Candidate uploads their resume.
ClearView generates tailored interview questions based on resume content.
A live interview session runs via webcam and microphone.
The system analyzes responses and non-verbal signals in real time.
A results dashboard summarizes performance across multiple scoring dimensions.
🔍 What ClearView Analyzes
Accuracy of answers
Response time
Eye contact
Posture
Facial tension
📊 Results Dashboard
Metric	Description
Aptitude Score	Measures correctness and quality of answers
Confidence Score	Derived from posture, eye contact, and facial tension
Interview Readiness Score (IRS)	Combined score indicating overall interview readiness
Pass/Fail Status	Final outcome based on aggregated performance
🛠️ Tech Stack
Frontend
Technology	Purpose
React.js	Builds the interactive UI for candidates and admins (registration, login, dashboard, resume upload, live interview, results)
Plain CSS	Styling, layout, and responsive design across devices
WebRTC API	Real-time webcam/microphone access during live interviews
Chart.js	Visualizes Aptitude, Confidence, and Interview Readiness scores
Backend
Technology	Purpose
Node.js	Non-blocking, event-driven server handling multiple simultaneous interview sessions
Express.js	RESTful API routing and middleware
JWT	Secure, stateless authentication and authorization
Python (AI Service)	Separate service for resume analysis and interview response evaluation
AI & Computer Vision
Technology	Purpose
MediaPipe	Real-time facial landmark detection — eye position, head movement, facial tension, posture
Database
Technology	Purpose
MongoDB	Flexible, scalable storage for user profiles, resumes, sessions, metrics, and results
Dev Tools & Browser Support
Editor: Visual Studio Code
Supported Browsers: Google Chrome, Microsoft Edge, Mozilla Firefox (required for WebRTC support)
🏗️ System Architecture
┌─────────────┐      ┌──────────────┐      ┌──────────────────┐
│   React.js   │ <--> │  Node.js /   │ <--> │  Python AI Service │
│  (Frontend)  │      │  Express API │      │  (Resume + CV/NLP) │
└─────────────┘      └──────────────┘      └──────────────────┘
                             │
                             ▼
                        ┌─────────┐
                        │ MongoDB │
                        └─────────┘
🎯 Goal

To provide a structured, unbiased, and measurable interview preparation platform using artificial intelligence — benefiting both candidates preparing for interviews and organizations aiming to hire more efficiently.

📁 Project Structure
ClearView/
├── frontend/                # React.js web client
│   ├── src/
│   │   ├── components/      # UI elements (Navbar, ResumeUpload, LiveInterview, Charts)
│   │   ├── pages/            # Registration, Login, Dashboard, Interview, Results
│   │   └── App.js
│   └── package.json
├── backend/                 # Node.js & Express RESTful API
│   ├── src/
│   │   ├── controllers/      # Auth, Resume, Interview, Results handlers
│   │   ├── middleware/        # JWT authentication
│   │   ├── models/            # MongoDB schemas (User, Resume, Session, Scores)
│   │   └── server.js
│   └── package.json
└── ai_service/               # Python AI processing service
    ├── resume_analysis/       # Resume parsing and question generation
    ├── evaluation/             # Answer accuracy and response-time scoring
    ├── cv_module/              # MediaPipe-based eye contact, posture, facial tension detection
    └── requirements.txt
🚀 Getting Started
bash
git clone https://github.com/<your-username>/ClearView.git
Install dependencies for frontend and backend (npm install in each directory).
Set up a MongoDB instance and add your connection string to the environment config.
Set up the Python AI service and install required packages (MediaPipe, etc.).
Add environment variables for JWT secret and any API keys.
Run the frontend, backend, and AI service concurrently.
🤝 Contributing

Contributions, issues, and feature suggestions are welcome. Feel free to open an issue or submit a pull request.
