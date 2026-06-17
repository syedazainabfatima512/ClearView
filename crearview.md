INTERNATIONAL ISLAMIC UNIVERSITY ISLAMABAD DEPARTMENT OF SOFTWARE ENGINEERING

FYP PROPOSAL

ClearView
AI-Based Aptitude Interview Test

PRESENTED BY:

Maryam Noor	4226-FBAS/BSSE/F21 SUPERVISOR:
Madam Saba Taimouri
    1. Introduction

Preparing for interviews is challenging. People often feel stressed, forget answers, or avoid eye contact. Even skilled candidates may not realize how they appear. To solve these issues, a system is needed that can guide users, analyze their behavior, and help them improve. ClearView is an AI-based interview practice system that evaluates both aptitude and confidence, providing logical, analytical, and verbal questions. After each session, it gives a Feedback Report with Aptitude Score, Confidence Score, and Interview Readiness Score.
    2. Problem Statement

Traditional interview tools are incomplete. Most focus on either aptitude or mock interviews, not both. Several key problems exist:
Key issues identified include:

    1. Limited Evaluation
    2. Manual Observation Required
    3. No Automated Feedback
    4. Fragmented Platforms

There is a need for a unified AI solution that runs aptitude tests, analyzes confidence, and provides structured scoring system.
    3. Existing Systems

Many platforms help with interviews or aptitude, but none give a full AI-based, all-in- one solution. Most focus on only one area and miss key features like answer aptitude, confidence analysis or combined scoring.
A review of popular tools shows these gaps:
    1. InterviewBuddy / Pramp: Mock interviews only, no AI video analysis, no aptitude.
    2. SHL / Mettl / TestGorilla: Strong aptitude tests, no live confidence or expression tracking.
    3. LinkedIn Skill Tests / HireVue: Limited AI checks, no confidence analysis.
    4. Google Interview Warmup: Only text practice, no video, audio, or confidence analysis.
    5. BigInterview: Video recording but no automatic AI evaluation.

    4. Proposed System

ClearView is a web-based platform that combines aptitude testing with AI video, and confidence analysis. It uses computer vision and audio processing to check knowledge, confidence, eye contact, posture, facial tension in one place.
        4.1. System Objectives

The system aims to:
            ▪ Run live aptitude interviews using webcam and mic.
            ▪ Measure confidence through eye contact, posture, facial tension.
            ▪ Give post-session scores.
            ▪ Generate a final Interview Readiness Score (IRS) indicating pass or fail.
            ▪ Show all results in a clean Feedback Dashboard.

        4.2. System Overview

    • During the live interview:

        ◦ The system tracks facial tension, eye contact, and posture for confidence.
        ◦ Questions cover logical, analytical, and verbal reasoning.

    • After the session:

        ◦ AI evaluates the full performance.
        ◦ Feedback dashboard shows raw metrics (answer correctness, response timing, eye contact, posture, facial tension), Aptitude Score, Confidence Score, and the final IRS. The final IRS indicates that weather the candidate has passed of failed.
    5. Project Scope

ClearView is built for students and job seekers who want to improve interview performance through AI-based aptitude tests and clear feedback through raw metrics and scores.
        5.1. System Focus

The system focuses on two major areas:

    • Aptitude and Reasoning: Tests logical, analytical, and verbal skills and measures answer correctness and response time.
    • Confidence Analysis: Measures confidence, facial tension, and posture through AI video processing.
        5.2. Target Users

    • Students preparing for admissions or job interviews.
    • Job seekers improving communication and confidence.

        5.3. Modules Included

The proposed system includes the following modules:

    • Authentication Module: The candiate Registers and log in to the system securely
    • Aptitude Interview Test: Real-time logical, analytical, and verbal questions and measures the answer correctness and response timing.
    • Confidence Indicators: Eye contact, posture, facial tension.
    • Feedback Dashboard: Shows Aptitude Score, Confidence Score, suggestions, and IRS.
    6. System Roles

    1) Candidate

        ◦ Register and log in securely.
        ◦ Take live aptitude interviews using webcam and mic.
        ◦ Answer logical, analytical, and verbal reasoning questions.
        ◦ Receive automatic feedback with Aptitude Score, Confidence Score, Raw Metrics, and Final Interview Readiness Score (IRS) and the final pass or fail.
        ◦ View results on the Feedback Dashboard.

    2) AI System (ClearView Engine)

        ◦ Conduct the live aptitude interview.
        ◦ Measure confidence through eye contact, posture, facial tension.
        ◦ Check correctness and timing of aptitude answers.
        ◦ Generate post-session scoring showing if the candidate passed or failed the test.

    7. System Features

    1. User Registration & Login:

        ◦ Provides secure and efficient registration for new users.
        ◦ Allows authenticated login to prevent unauthorized access.
        ◦ Ensures that each user can access only their own data.

    2. Dashboard Module:

        ◦ Acts as the main control center for candidates.
        ◦ Allows users to start new tests and view post-session performance metrics, including aptitude score, and confidence scores.
    3. Video Interview Mode:

        ◦ Conducts the interview through webcam and microphone.

    4. Aptitude Test Engine:

        ◦ Generates logical, analytical, and verbal reasoning questions for the candidate.
        ◦ Times each response to check decision-making speed.
        ◦ Ensures variety and fairness in questions for multiple attempts.
Output: List of questions with response times for each.

    5. Answer Relevance & Scoring:

        ◦ Checks the candidate’s answers for correctness and completeness.
        ◦ Uses response time to evaluate decision speed.
        ◦ Produces a clear Aptitude Score based on performance.
Output: Aptitude Score (e.g., 0–10 or percentage).

    6. Confidence Analysis

Evaluates confidence using,

        ◦ Eye-contact ratio (30%): How often the candidate looks at the camera. More eye contact means more confidence. Eye contact automatically shows the head position.
        ◦ Body-posture stability (35%): Checks if the candidate sits straight or keeps shaking. Stable posture shows confidence.
        ◦ Facial Tension (35%): Checks if the face stays calm or looks stressed (lip press, eyebrow tension, jaw stress).
Output: Confidence Score (0–10)

    7. Final Interview Readiness Score (IRS)

        ◦ Combines Aptitude Score and Confidence Score into a single metric.
        ◦ Shows pass or fail based on the final IRS.
Output: Final Interview Readiness Score with pass/fail result.

    8. Feedback Dashboard:

        ◦ Displays all post-interview results in an easy-to-read format.
        ◦ Shows raw metrics (eye contact, posture, facial tension, answer correctness and response time), Aptitude Score, and IRS.
        ◦ Helps candidates identify strengths and areas to improve.

7. Use Case Model

    9. System Working

    10. System Models


















    11. Tools and Technologies

Front End:

        ◦ React.js (Interactive user interface)
        ◦ Plain CSS (Styling and layout)
        ◦ WebRTC API (Video and audio access)
        ◦ Chart.js (Result visualization)

Backend:

        ◦ Node.js (Server runtime)
        ◦ Express.js (API and routing)
        ◦ JWT (Secure authentication)
        ◦ Python (AI processing service)
        ◦ MediaPipe (Facial landmark)

Browsers:

        ◦ Google Chrome
        ◦ Microsoft Edge
        ◦ Mozilla Firefox

Tools for Development:

        ◦ VS Code (Code editor)

Database:

        ◦ MongoDB (Main database)

These technologies together support a practical, efficient AI-driven interview system designed for post-interview analysis of audio and video data.
    12. References

        ◦ Facial Expression Analysis in AI-Driven Video Interviews
        ◦ Multimodal Behavioral Analytics for Interview Assessment
        ◦ AI-Based Interview Evaluator (Emotion & Confidence)
        ◦ Rai, Navya S. et al. “AI Based Interview Evaluator: An Emotion and Confidence Classifier,” ResearchGate
        ◦ Posture Recognition Survey, “A Survey on Artificial Intelligence in Posture Recognition,” PMC
        ◦ SimInterview: Transforming Business Education through LLM-Based Simulated Multilingual Interview Training System
        ◦ AI-Based Mock Interview System – Sandesh Dunbale et al.