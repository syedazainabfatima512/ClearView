# ClearView - Enhanced Frontend Implementation Plan

> **Project**: AI-Based Resume-Personalized Interview System  
> **Technology Stack**: React.js, Plain CSS, WebRTC API, Web Speech API, Chart.js  
> **Focus**: Zero-cost implementation using FREE tools and APIs

---

## 🔥 KEY ENHANCEMENT: Resume-Based Personalized Interview

The system now supports:
1. **Resume Upload** - User uploads their CV/resume (PDF/DOCX)
2. **AI Question Generation** - AI reads resume and generates personalized interview questions
3. **Voice-Based Answering** - User speaks answers, captured via Web Speech API (FREE)
4. **AI Answer Analysis** - AI evaluates answer quality, relevance, and depth

---

## 1. Enhanced Project Structure

```
clearview-frontend/
├── public/
│   └── assets/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Loader.jsx
│   │   │   └── Timer.jsx
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   └── RegisterForm.jsx
│   │   ├── resume/                    # NEW: Resume Module
│   │   │   ├── ResumeUpload.jsx       # Resume upload component
│   │   │   ├── ResumeUpload.css
│   │   │   ├── ResumePreview.jsx      # Preview parsed resume
│   │   │   ├── ResumePreview.css
│   │   │   └── SkillsDisplay.jsx      # Show extracted skills
│   │   ├── interview/
│   │   │   ├── VideoCapture.jsx
│   │   │   ├── QuestionDisplay.jsx
│   │   │   ├── VoiceAnswerInput.jsx   # NEW: Voice input component
│   │   │   ├── VoiceAnswerInput.css
│   │   │   ├── TextAnswerInput.jsx    # NEW: Text fallback
│   │   │   ├── InterviewRoom.jsx      # Enhanced with AI questions
│   │   │   ├── AIQuestionCard.jsx     # NEW: Display AI-generated question
│   │   │   └── AnswerFeedback.jsx     # NEW: Real-time answer feedback
│   │   ├── dashboard/
│   │   │   ├── DashboardHome.jsx
│   │   │   ├── TestHistory.jsx
│   │   │   └── ScoreCard.jsx
│   │   └── feedback/
│   │       ├── FeedbackDashboard.jsx
│   │       ├── AnswerAnalysisCard.jsx # NEW: Detailed answer analysis
│   │       ├── SkillMatchChart.jsx    # NEW: Skills vs answers
│   │       ├── AptitudeScoreChart.jsx
│   │       ├── ConfidenceScoreChart.jsx
│   │       ├── IRSDisplay.jsx
│   │       └── RawMetricsCard.jsx
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── ResumeUploadPage.jsx       # NEW: Resume upload page
│   │   ├── InterviewPrepPage.jsx      # NEW: Pre-interview with questions preview
│   │   ├── InterviewPage.jsx          # Enhanced
│   │   ├── FeedbackPage.jsx           # Enhanced
│   │   └── NotFoundPage.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── InterviewContext.jsx
│   │   └── ResumeContext.jsx          # NEW: Resume state management
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useWebcam.js
│   │   ├── useMicrophone.js
│   │   ├── useSpeechRecognition.js    # NEW: Web Speech API hook
│   │   └── useTimer.js
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── resumeService.js           # NEW: Resume API calls
│   │   ├── interviewService.js        # Enhanced
│   │   └── feedbackService.js
│   └── utils/
│       ├── validators.js
│       ├── formatters.js
│       ├── speechUtils.js             # NEW: Speech utilities
│       └── constants.js
└── package.json
```

---

## 2. Enhanced User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENHANCED USER JOURNEY                        │
└─────────────────────────────────────────────────────────────────┘

1. REGISTER/LOGIN
        │
        ▼
2. UPLOAD RESUME (PDF/DOCX)
        │
        ▼
3. AI PARSES RESUME → Extracts:
   • Personal Info
   • Skills (Technical & Soft)
   • Work Experience
   • Education
   • Projects
        │
        ▼
4. AI GENERATES PERSONALIZED QUESTIONS based on:
   • Technical skills mentioned
   • Work experience (behavioral questions)
   • Projects (explain/challenges)
   • Domain knowledge
        │
        ▼
5. INTERVIEW SESSION
   • Camera ON (confidence analysis)
   • User speaks answers (voice captured)
   • AI transcribes in real-time
   • Next question generated dynamically
        │
        ▼
6. AI ANALYZES EACH ANSWER for:
   • Relevance to question
   • Technical accuracy
   • Communication clarity
   • Depth of response
        │
        ▼
7. FEEDBACK DASHBOARD
   • Answer-by-answer analysis
   • Aptitude Score + Confidence Score
   • Interview Readiness Score (IRS)
   • Improvement suggestions
```

---

## 3. New Components Implementation

### 3.1 Resume Upload Component

```jsx
// components/resume/ResumeUpload.jsx
import { useState, useRef } from 'react';
import './ResumeUpload.css';

const ResumeUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const validateAndSetFile = (file) => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or Word document');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('File size must be less than 5MB');
      return;
    }
    
    setFile(file);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);
    
    try {
      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        onUploadSuccess(data.parsedResume);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="resume-upload-container">
      <div 
        className={`drop-zone ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => validateAndSetFile(e.target.files[0])}
          hidden
        />
        
        <div className="drop-zone-content">
          <i className="upload-icon">📄</i>
          <h3>Drop your resume here</h3>
          <p>or click to browse</p>
          <span className="file-types">PDF, DOC, DOCX (Max 5MB)</span>
        </div>
      </div>
      
      {file && (
        <div className="file-preview">
          <span>{file.name}</span>
          <button onClick={() => setFile(null)}>✕</button>
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
      
      <button 
        className="upload-btn"
        onClick={handleUpload}
        disabled={!file || uploading}
      >
        {uploading ? 'Analyzing Resume...' : 'Upload & Analyze'}
      </button>
    </div>
  );
};

export default ResumeUpload;
```

### 3.2 Voice Answer Input Component (FREE - Web Speech API)

```jsx
// components/interview/VoiceAnswerInput.jsx
import { useState, useEffect, useRef } from 'react';
import './VoiceAnswerInput.css';

const VoiceAnswerInput = ({ onTranscript, onComplete, isActive }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      let finalTranscript = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
        onTranscript(transcript + finalTranscript);
      }
      setInterimTranscript(interimText);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      if (isListening) {
        // Restart if still supposed to be listening
        recognitionRef.current.start();
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setInterimTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    onComplete(transcript);
  };

  return (
    <div className="voice-answer-container">
      <div className="transcript-display">
        <p className="final-transcript">{transcript}</p>
        <p className="interim-transcript">{interimTranscript}</p>
        {!transcript && !interimTranscript && (
          <p className="placeholder">Your answer will appear here as you speak...</p>
        )}
      </div>
      
      <div className="voice-controls">
        <button 
          className={`mic-btn ${isListening ? 'listening' : ''}`}
          onClick={toggleListening}
        >
          {isListening ? '🎙️ Listening...' : '🎤 Start Speaking'}
        </button>
        
        <button 
          className="submit-answer-btn"
          onClick={handleSubmit}
          disabled={!transcript}
        >
          Submit Answer
        </button>
      </div>
      
      {isListening && (
        <div className="listening-indicator">
          <span className="pulse"></span>
          <span>Recording your answer...</span>
        </div>
      )}
    </div>
  );
};

export default VoiceAnswerInput;
```

### 3.3 Custom Hook for Speech Recognition

```jsx
// hooks/useSpeechRecognition.js
import { useState, useEffect, useRef, useCallback } from 'react';

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let final = '';
        let interim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          setTranscript(prev => prev + ' ' + final);
        }
        setInterimTranscript(interim);
      };

      recognitionRef.current.onerror = (event) => {
        setError(event.error);
        setIsListening(false);
      };
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setInterimTranscript('');
      setError(null);
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript
  };
};
```

### 3.4 Enhanced Interview Room

```jsx
// components/interview/InterviewRoom.jsx
import { useState, useEffect, useContext } from 'react';
import VideoCapture from './VideoCapture';
import AIQuestionCard from './AIQuestionCard';
import VoiceAnswerInput from './VoiceAnswerInput';
import TextAnswerInput from './TextAnswerInput';
import Timer from '../common/Timer';
import { InterviewContext } from '../../context/InterviewContext';
import { interviewService } from '../../services/interviewService';
import './InterviewRoom.css';

const InterviewRoom = () => {
  const { 
    session, 
    currentQuestion, 
    questionIndex,
    totalQuestions,
    goToNextQuestion,
    submitAnswer 
  } = useContext(InterviewContext);
  
  const [inputMode, setInputMode] = useState('voice'); // 'voice' or 'text'
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState(null);

  const handleAnswerSubmit = async (answer) => {
    setIsSubmitting(true);
    
    try {
      // Send answer for AI evaluation
      const result = await interviewService.submitAnswer(
        session.id,
        currentQuestion.id,
        answer
      );
      
      setAnswerFeedback(result.feedback);
      await submitAnswer(answer, result);
      
      // Wait a moment to show feedback, then next question
      setTimeout(() => {
        goToNextQuestion();
        setCurrentAnswer('');
        setAnswerFeedback(null);
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="interview-room">
      {/* Header */}
      <header className="interview-header">
        <div className="progress">
          Question {questionIndex + 1} of {totalQuestions}
        </div>
        <Timer duration={currentQuestion?.timeLimit || 120} />
        <div className="session-info">
          Session: {session?.id?.slice(-6)}
        </div>
      </header>

      {/* Main Content */}
      <div className="interview-content">
        {/* Left: Video Feed */}
        <div className="video-section">
          <VideoCapture />
          <div className="video-label">Your camera feed</div>
        </div>

        {/* Right: Question & Answer */}
        <div className="qa-section">
          {/* AI Generated Question */}
          <AIQuestionCard 
            question={currentQuestion}
            category={currentQuestion?.category}
            basedOn={currentQuestion?.basedOn} // e.g., "Based on your React experience"
          />

          {/* Answer Input Toggle */}
          <div className="input-mode-toggle">
            <button 
              className={inputMode === 'voice' ? 'active' : ''}
              onClick={() => setInputMode('voice')}
            >
              🎤 Voice Answer
            </button>
            <button 
              className={inputMode === 'text' ? 'active' : ''}
              onClick={() => setInputMode('text')}
            >
              ⌨️ Type Answer
            </button>
          </div>

          {/* Answer Input */}
          {inputMode === 'voice' ? (
            <VoiceAnswerInput 
              onTranscript={setCurrentAnswer}
              onComplete={handleAnswerSubmit}
              isActive={!isSubmitting}
            />
          ) : (
            <TextAnswerInput 
              value={currentAnswer}
              onChange={setCurrentAnswer}
              onSubmit={handleAnswerSubmit}
              isSubmitting={isSubmitting}
            />
          )}

          {/* Real-time Answer Feedback */}
          {answerFeedback && (
            <div className="answer-feedback">
              <h4>Quick Feedback:</h4>
              <p>{answerFeedback.summary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;
```

### 3.5 AI Question Display Card

```jsx
// components/interview/AIQuestionCard.jsx
import './AIQuestionCard.css';

const AIQuestionCard = ({ question, category, basedOn }) => {
  const getCategoryIcon = (cat) => {
    switch(cat) {
      case 'technical': return '💻';
      case 'behavioral': return '🤝';
      case 'situational': return '📊';
      case 'project': return '🚀';
      default: return '❓';
    }
  };

  const getCategoryColor = (cat) => {
    switch(cat) {
      case 'technical': return '#2196F3';
      case 'behavioral': return '#4CAF50';
      case 'situational': return '#FF9800';
      case 'project': return '#9C27B0';
      default: return '#607D8B';
    }
  };

  return (
    <div className="ai-question-card">
      {/* Category Badge */}
      <div 
        className="category-badge"
        style={{ backgroundColor: getCategoryColor(category) }}
      >
        {getCategoryIcon(category)} {category?.toUpperCase()}
      </div>

      {/* Based On (Resume Context) */}
      {basedOn && (
        <div className="based-on">
          <span className="icon">📄</span>
          <span>{basedOn}</span>
        </div>
      )}

      {/* Question Text */}
      <div className="question-text">
        <h2>{question?.text}</h2>
      </div>

      {/* Tips */}
      {question?.tips && (
        <div className="question-tips">
          <strong>💡 Tip:</strong> {question.tips}
        </div>
      )}
    </div>
  );
};

export default AIQuestionCard;
```

---

## 4. Enhanced Routing

```jsx
// App.js
<BrowserRouter>
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    
    {/* Protected Routes */}
    <Route element={<ProtectedRoute />}>
      <Route path="/dashboard" element={<DashboardPage />} />
      
      {/* NEW: Resume Upload Flow */}
      <Route path="/resume/upload" element={<ResumeUploadPage />} />
      <Route path="/resume/preview" element={<ResumePreviewPage />} />
      
      {/* NEW: Interview Prep (shows generated questions) */}
      <Route path="/interview/prep/:sessionId" element={<InterviewPrepPage />} />
      
      {/* Interview & Feedback */}
      <Route path="/interview/:sessionId" element={<InterviewPage />} />
      <Route path="/feedback/:sessionId" element={<FeedbackPage />} />
    </Route>
    
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
</BrowserRouter>
```

---

## 5. Resume Upload Page

```jsx
// pages/ResumeUploadPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ResumeUpload from '../components/resume/ResumeUpload';
import ResumePreview from '../components/resume/ResumePreview';
import './ResumeUploadPage.css';

const ResumeUploadPage = () => {
  const [parsedResume, setParsedResume] = useState(null);
  const [step, setStep] = useState('upload'); // 'upload' | 'preview' | 'generating'
  const navigate = useNavigate();

  const handleUploadSuccess = (data) => {
    setParsedResume(data);
    setStep('preview');
  };

  const handleStartInterview = async () => {
    setStep('generating');
    
    // API call to generate questions
    const response = await fetch('/api/interview/generate-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ resumeId: parsedResume.id })
    });
    
    const { sessionId } = await response.json();
    navigate(`/interview/prep/${sessionId}`);
  };

  return (
    <div className="resume-upload-page">
      <div className="container">
        {/* Progress Steps */}
        <div className="progress-steps">
          <div className={`step ${step === 'upload' ? 'active' : 'completed'}`}>
            1. Upload Resume
          </div>
          <div className={`step ${step === 'preview' ? 'active' : step === 'generating' ? 'completed' : ''}`}>
            2. Review
          </div>
          <div className={`step ${step === 'generating' ? 'active' : ''}`}>
            3. Generate Questions
          </div>
        </div>

        {/* Content */}
        {step === 'upload' && (
          <div className="upload-section">
            <h1>Upload Your Resume</h1>
            <p>Our AI will analyze your resume and create personalized interview questions</p>
            <ResumeUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        )}

        {step === 'preview' && parsedResume && (
          <div className="preview-section">
            <h1>Review Extracted Information</h1>
            <ResumePreview data={parsedResume} />
            <button className="start-btn" onClick={handleStartInterview}>
              Generate Interview Questions →
            </button>
          </div>
        )}

        {step === 'generating' && (
          <div className="generating-section">
            <div className="loader"></div>
            <h2>AI is preparing your personalized interview...</h2>
            <p>Analyzing your skills, experience, and projects</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUploadPage;
```

---

## 6. Enhanced Feedback Dashboard

```jsx
// components/feedback/AnswerAnalysisCard.jsx
const AnswerAnalysisCard = ({ questionAnswer }) => {
  const { question, answer, analysis } = questionAnswer;
  
  return (
    <div className="answer-analysis-card">
      <div className="question-section">
        <span className="category-tag">{question.category}</span>
        <h4>{question.text}</h4>
        <p className="based-on">{question.basedOn}</p>
      </div>
      
      <div className="answer-section">
        <h5>Your Answer:</h5>
        <p>{answer}</p>
      </div>
      
      <div className="analysis-section">
        <h5>AI Analysis:</h5>
        
        <div className="metrics-grid">
          <div className="metric">
            <span className="label">Relevance</span>
            <div className="score-bar">
              <div 
                className="fill" 
                style={{ width: `${analysis.relevance}%` }}
              />
            </div>
            <span className="value">{analysis.relevance}%</span>
          </div>
          
          <div className="metric">
            <span className="label">Technical Accuracy</span>
            <div className="score-bar">
              <div 
                className="fill" 
                style={{ width: `${analysis.accuracy}%` }}
              />
            </div>
            <span className="value">{analysis.accuracy}%</span>
          </div>
          
          <div className="metric">
            <span className="label">Communication</span>
            <div className="score-bar">
              <div 
                className="fill" 
                style={{ width: `${analysis.communication}%` }}
              />
            </div>
            <span className="value">{analysis.communication}%</span>
          </div>
          
          <div className="metric">
            <span className="label">Depth</span>
            <div className="score-bar">
              <div 
                className="fill" 
                style={{ width: `${analysis.depth}%` }}
              />
            </div>
            <span className="value">{analysis.depth}%</span>
          </div>
        </div>
        
        <div className="ai-feedback">
          <strong>Feedback:</strong>
          <p>{analysis.feedback}</p>
        </div>
        
        <div className="improvement-tip">
          <strong>💡 Improvement Tip:</strong>
          <p>{analysis.improvementTip}</p>
        </div>
      </div>
    </div>
  );
};

export default AnswerAnalysisCard;
```

---

## 7. Services Layer Enhancement

```javascript
// services/resumeService.js
import api from './api';

export const resumeService = {
  // Upload resume for parsing
  upload: async (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    
    return api.upload('/resume/upload', formData);
  },
  
  // Get parsed resume data
  getParsed: (resumeId) => api.fetch(`/resume/${resumeId}`),
  
  // Get user's resumes
  getAll: () => api.fetch('/resume/all'),
  
  // Delete a resume
  delete: (resumeId) => api.fetch(`/resume/${resumeId}`, { method: 'DELETE' })
};

// services/interviewService.js (Enhanced)
export const interviewService = {
  // Generate questions based on resume
  generateQuestions: (resumeId) => 
    api.fetch('/interview/generate-questions', {
      method: 'POST',
      body: JSON.stringify({ resumeId })
    }),
  
  // Start interview session
  startSession: (sessionId) => 
    api.fetch(`/interview/${sessionId}/start`, { method: 'POST' }),
  
  // Get current question
  getCurrentQuestion: (sessionId) => 
    api.fetch(`/interview/${sessionId}/current-question`),
  
  // Submit answer for AI evaluation
  submitAnswer: (sessionId, questionId, answer) =>
    api.fetch(`/interview/${sessionId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ questionId, answer })
    }),
  
  // Analyze video frame for confidence
  analyzeFrame: (sessionId, frameData) =>
    api.fetch(`/interview/${sessionId}/analyze-frame`, {
      method: 'POST',
      body: JSON.stringify({ frame: frameData })
    }),
  
  // Complete interview
  complete: (sessionId) =>
    api.fetch(`/interview/${sessionId}/complete`, { method: 'POST' })
};
```

---

## 8. FREE Tools Summary

| Feature | FREE Tool | Notes |
|---------|-----------|-------|
| Speech-to-Text | **Web Speech API** | Browser native, no API key |
| Resume Parsing | **pdf-parse** / **mammoth** | Open source libraries |
| Question Generation | **Google Gemini API (Free)** | 15 RPM free tier |
| Answer Analysis | **Google Gemini API (Free)** | 15 RPM free tier |
| Confidence Analysis | **MediaPipe** | 100% FREE |
| Charts | **Chart.js** | MIT License |
| Frontend Hosting | **Vercel** | Unlimited free |

---

## 9. Browser Compatibility for Speech API

| Browser | Web Speech API Support |
|---------|------------------------|
| Chrome | ✅ Full Support |
| Edge | ✅ Full Support |
| Safari | ✅ Full Support (macOS/iOS) |
| Firefox | ⚠️ Limited (requires flag) |
| Opera | ✅ Full Support |

> **Fallback**: Text input provided for browsers without speech support.

---

## 10. Implementation Priority

### Phase 1: Resume Module (Week 1)
1. Resume upload component
2. Resume preview component
3. Resume context setup

### Phase 2: Enhanced Interview (Week 2)
4. Voice answer input (Web Speech API)
5. Text answer fallback
6. AI question display card
7. Enhanced interview room

### Phase 3: Feedback Enhancement (Week 3)
8. Answer analysis cards
9. Skill match visualization
10. Enhanced feedback dashboard

### Phase 4: Integration & Polish (Week 4)
11. Full flow testing
12. Error handling
13. Animations
14. Deployment

---

> **Next**: See `BACKEND_FUNCTIONALITY_IMPLEMENTATION.md` for the enhanced backend with AI question generation and answer analysis.
