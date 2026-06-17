# ClearView Frontend - Code Explained for Beginners 📚

> This document explains EVERY part of the React frontend so simply
> that even a 7-year-old could understand it!

---

## 📖 Table of Contents

1. [What is a Frontend?](#what-is-a-frontend)
2. [Our Tech Stack](#our-tech-stack)
3. [Project Structure](#project-structure)
4. [Main Files Explained](#main-files-explained)
5. [React Concepts](#react-concepts)
6. [Context & State](#context--state)
7. [API Service](#api-service)
8. [Pages Explained](#pages-explained)
9. [CSS Design System](#css-design-system)
10. [How It All Works](#how-it-all-works)

---

## What is a Frontend?

The **frontend** is what users SEE and INTERACT with.

Think of a restaurant:
- **Frontend** = The dining area, menu, tables (what you see)
- **Backend** = The kitchen (where food is made, hidden from view)

The frontend:
- Shows buttons, forms, and pages
- Captures user input (clicks, typing)
- Displays data from the backend
- Makes everything look beautiful!

---

## Our Tech Stack

### React ⚛️
```
React is like LEGO blocks for websites.
You build small pieces (components) and combine them!
```

### Vite ⚡
```
Vite is a super-fast tool that:
- Runs your code during development
- Builds it for production
- Updates instantly when you save changes
```

### React Router 🗺️
```
React Router handles navigation:
- /login → Shows Login page
- /dashboard → Shows Dashboard
- /interview/123 → Shows Interview page
```

---

## Project Structure

```
frontend/
├── index.html           ← The ONE HTML file (React fills it in)
├── package.json         ← List of dependencies
├── vite.config.js       ← Vite settings
└── src/
    ├── main.jsx         ← Entry point (starts React)
    ├── App.jsx          ← Main component with routes
    ├── index.css        ← Global styles (design system)
    ├── context/
    │   └── AuthContext.jsx   ← Login state management
    ├── services/
    │   └── api.js       ← Talks to the backend
    ├── components/
    │   └── common/
    │       ├── Navbar.jsx    ← Top navigation bar
    │       └── Navbar.css
    └── pages/
        ├── LoginPage.jsx     ← Login form
        ├── RegisterPage.jsx  ← Registration form
        ├── DashboardPage.jsx ← Main hub after login
        ├── ResumeUploadPage.jsx ← Upload resume
        ├── InterviewPage.jsx ← Interview room
        └── ResultsPage.jsx   ← Final scores
```

---

## Main Files Explained

### index.html - The Shell

```html
<!DOCTYPE html>
<html lang="en">
```
👆 Tells browser: "This is an HTML document in English"

```html
  <head>
    <meta charset="UTF-8" />
```
👆 Use UTF-8 encoding (supports emojis and special characters! 😊)

```html
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
```
👆 Makes the page responsive on phones and tablets

```html
    <title>ClearView - AI Interview Practice</title>
```
👆 The text shown in browser tab

```html
  <body>
    <div id="root"></div>
```
👆 **This is important!** React will put everything inside this div

```html
    <script type="module" src="/src/main.jsx"></script>
```
👆 Load our React code

---

### main.jsx - Starting React

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
```
👆 **import**: Get tools from other files
- `React`: The core library
- `ReactDOM`: Connects React to the actual webpage

```jsx
import { BrowserRouter } from 'react-router-dom'
```
👆 **BrowserRouter**: Enables page navigation without reloading

```jsx
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'
```
👆 Import our components and styles

```jsx
ReactDOM.createRoot(document.getElementById('root')).render(
```
👆 Find the `<div id="root">` and prepare to put content inside

```jsx
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
```
👆 **Nesting providers** (like Russian dolls 🪆):
- `StrictMode`: Helps catch bugs during development
- `BrowserRouter`: Enables routing
- `AuthProvider`: Shares login state everywhere
- `App`: Our actual application

---

### App.jsx - The Router

```jsx
import { Routes, Route, Navigate } from 'react-router-dom'
```
👆 Tools for defining pages and navigation

```jsx
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return <div className="spinner"></div>
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}
```
👆 **ProtectedRoute**: A guard that checks if you're logged in
- If loading → Show spinner
- If not logged in → Send to login page
- If logged in → Show the page (`children`)

```jsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/dashboard" element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  } />
</Routes>
```
👆 **Routes**: Define which component shows for each URL
- `/login` → Show LoginPage (no protection needed)
- `/dashboard` → Show DashboardPage (protected!)

---

## React Concepts

### Components
```jsx
function MyButton() {
  return <button>Click me!</button>
}
```
👆 A component is just a function that returns HTML-like code (JSX)

### Props (Properties)
```jsx
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>
}

// Using it:
<Greeting name="Sara" />
// Shows: Hello, Sara!
```
👆 Props are like passing arguments to a function

### State (useState)
```jsx
const [count, setCount] = useState(0)
```
👆 **State** is data that can change
- `count`: Current value (starts at 0)
- `setCount`: Function to update the value
- When state changes, React re-renders the component!

```jsx
<button onClick={() => setCount(count + 1)}>
  Clicked {count} times
</button>
```

### Effects (useEffect)
```jsx
useEffect(() => {
  // This runs when component loads
  fetchData()
}, [])  // Empty array = only run once
```
👆 **useEffect** runs code at specific times:
- When component first appears
- When certain values change

---

## Context & State

### AuthContext.jsx - Login State Manager

```jsx
const AuthContext = createContext(null)
```
👆 Create a "container" that can be accessed from anywhere

```jsx
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
```
👆 **AuthProvider**: Wraps the app and provides login state
- `user`: Currently logged in user (or null)
- `token`: JWT token from localStorage

```jsx
  const login = async (email, password) => {
    const response = await authService.login({ email, password })
    
    if (response.success) {
      setToken(response.token)
      setUser(response.user)
      localStorage.setItem('token', response.token)
    }
  }
```
👆 **login function**:
1. Call backend API
2. If successful, save token and user
3. Store token in localStorage (survives page refresh)

```jsx
  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
  }
```
👆 **logout**: Clear everything

```jsx
export function useAuth() {
  return useContext(AuthContext)
}
```
👆 **useAuth hook**: Easy way to access auth state from any component

**Using it:**
```jsx
function SomeComponent() {
  const { user, login, logout, isAuthenticated } = useAuth()
  
  if (isAuthenticated) {
    return <p>Welcome, {user.fullName}!</p>
  }
}
```

---

## API Service

### api.js - Backend Communication

```jsx
const API_BASE_URL = 'http://localhost:5000/api'
```
👆 Where our backend lives

```jsx
const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}
```
👆 **getAuthHeader**: Adds the login token to requests
- Format: `Authorization: Bearer eyJhbG...`
- The backend checks this to know who you are

```jsx
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, config)
  const data = await response.json()
  
  return data
}
```
👆 **request function**: Generic fetcher
1. Build the full URL
2. Send the request with `fetch`
3. Convert response to JSON
4. Return the data

```jsx
export const authService = {
  register: (data) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  login: (data) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}
```
👆 **Services**: Organized functions for each API area

**Using it:**
```jsx
const result = await authService.login({ 
  email: 'test@test.com', 
  password: 'password123' 
})
```

---

## Pages Explained

### LoginPage.jsx

```jsx
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')
```
👆 Four pieces of state for the form

```jsx
const handleSubmit = async (e) => {
  e.preventDefault()  // Don't refresh the page!
```
👆 **e.preventDefault()**: Stops form from refreshing the page

```jsx
  const result = await login(email, password)
  
  if (result.success) {
    navigate('/dashboard')  // Go to dashboard!
  } else {
    setError(result.error)  // Show error message
  }
```
👆 Try to login, then either navigate or show error

```jsx
<input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```
👆 **Controlled input**: 
- `value={email}`: Shows current state
- `onChange`: Updates state when user types

---

### InterviewPage.jsx - The Main Event!

#### Video Capture
```jsx
const setupVideo = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: 640, height: 480 },
    audio: false
  })
  
  videoRef.current.srcObject = stream
}
```
👆 **getUserMedia**: Ask browser for camera access
- Returns a "stream" of video data
- We attach it to a `<video>` element

#### Frame Analysis
```jsx
const startFrameAnalysis = () => {
  setInterval(async () => {
    // Draw video frame to canvas
    ctx.drawImage(videoRef.current, 0, 0, 320, 240)
    
    // Convert to base64 image
    const frameData = canvas.toDataURL('image/jpeg', 0.5)
    
    // Send to AI service
    const analysis = await aiService.analyzeFrame(frameData)
  }, 2000)  // Every 2 seconds
}
```
👆 Every 2 seconds:
1. Take a screenshot of the video
2. Convert to base64 (text format)
3. Send to Python AI service
4. Get back eye contact, posture scores

#### Speech Recognition
```jsx
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
recognitionRef.current = new SpeechRecognition()
recognitionRef.current.continuous = true

recognitionRef.current.onresult = (event) => {
  let transcript = ''
  for (let i = event.resultIndex; i < event.results.length; i++) {
    transcript += event.results[i][0].transcript
  }
  setAnswer(transcript)
}
```
👆 **Web Speech API** (built into browsers!):
- `continuous = true`: Keep listening
- `onresult`: Called when speech is recognized
- Result contains the transcribed text

---

## CSS Design System

### index.css - Variables

```css
:root {
  --primary-500: #0066e6;
  --bg-primary: #0a0a0f;
  --text-primary: #ffffff;
}
```
👆 **CSS Variables**: Define colors once, use everywhere
- `:root` means these apply to the whole document
- `--name`: Variable name (always starts with --)
- Use with `var(--primary-500)`

### Dark Theme
```css
body {
  background: var(--bg-primary);  /* Very dark blue-black */
  color: var(--text-primary);     /* White text */
}
```

### Glassmorphism
```css
.glass {
  background: rgba(255, 255, 255, 0.05);  /* Very transparent white */
  backdrop-filter: blur(10px);            /* Blur what's behind */
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```
👆 **Glassmorphism**: Modern frosted-glass effect

### Gradient Text
```css
.text-gradient {
  background: linear-gradient(135deg, #0066e6, #9333ea);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```
👆 Makes text have a gradient color (like "ClearView" logo)

### Button Styles
```css
.btn-primary {
  background: var(--gradient-primary);
  color: white;
  box-shadow: 0 0 20px rgba(0, 102, 230, 0.3);  /* Glow effect */
  transition: all 0.25s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);  /* Float up on hover */
}
```
👆 Buttons that glow and float on hover!

### Animations
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slideUp {
  animation: slideUp 0.5s ease forwards;
}
```
👆 **@keyframes**: Define animation steps
- Elements start invisible and 20px down
- They fade in and slide up over 0.5 seconds

---

## How It All Works

### User Flow

```
1. User visits site
   ↓
2. App.jsx checks if logged in (token in localStorage?)
   ↓
3. Not logged in → Redirect to /login
   ↓
4. User fills form, clicks "Sign In"
   ↓
5. LoginPage calls authService.login()
   ↓
6. api.js sends POST to backend
   ↓
7. Backend returns { success: true, token, user }
   ↓
8. AuthContext saves token to localStorage
   ↓
9. navigate('/dashboard') → User sees Dashboard!
```

### Interview Flow

```
1. User uploads resume → resumeService.upload()
   ↓
2. AI parses resume → Shows parsed data
   ↓
3. User clicks "Generate Questions"
   ↓
4. interviewService.generateQuestions()
   ↓
5. Navigate to /interview/:sessionId
   ↓
6. InterviewPage:
   - Starts video capture
   - Loads questions
   - Sends frames to AI every 2 seconds
   ↓
7. User answers (speak or type)
   ↓
8. Submit → AI evaluates → Show feedback
   ↓
9. Finish → Navigate to Results page
   ↓
10. Show final IRS score and recommendations
```

---

## Quick Reference 🎯

### React Hooks
| Hook | Purpose |
|------|---------|
| `useState` | Store and update data |
| `useEffect` | Run code on mount/update |
| `useContext` | Access shared state (like auth) |
| `useRef` | Reference DOM elements |
| `useNavigate` | Navigate to other pages |
| `useParams` | Get URL parameters |

### File Types
| Extension | Purpose |
|-----------|---------|
| `.jsx` | React component (JavaScript + HTML) |
| `.js` | Regular JavaScript |
| `.css` | Styles |

### Common Patterns

**Conditional Rendering:**
```jsx
{isLoading ? <Spinner /> : <Content />}
```

**List Rendering:**
```jsx
{items.map((item) => (
  <div key={item.id}>{item.name}</div>
))}
```

**Form Handling:**
```jsx
<form onSubmit={handleSubmit}>
  <input value={text} onChange={(e) => setText(e.target.value)} />
  <button type="submit">Submit</button>
</form>
```

---

## Need Help? 🆘

1. **Component not rendering?** Check for typos in import/export
2. **State not updating?** Make sure you're using `setState`, not modifying directly
3. **API not working?** Check browser console for errors, verify backend is running
4. **Styles not applying?** Make sure CSS file is imported

---

**Congratulations!** 🎉 You now understand a complete React application!

You've learned:
- React components and hooks
- State management with Context
- API communication with fetch
- Modern CSS with variables and animations
- Video capture and speech recognition

This is real professional-level code used at companies like Facebook, Netflix, and Airbnb! 💪
