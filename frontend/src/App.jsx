/**
 * ============================================
 * APP.JSX - Main Application Component
 * ============================================
 * 
 * This is the main component that sets up routing
 * and renders different pages based on the URL.
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Layout Components
import Navbar from './components/common/Navbar'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ResumeUploadPage from './pages/ResumeUploadPage'
import InterviewPage from './pages/InterviewPage'
import ResultsPage from './pages/ResultsPage'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
        return (
            <div className="page flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return children
}

function App() {
    const { isAuthenticated } = useAuth()

    return (
        <div className="app">
            {/* Show navbar only when logged in */}
            {isAuthenticated && <Navbar />}

            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={
                    isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
                } />
                <Route path="/register" element={
                    isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
                } />

                {/* Protected Routes */}
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                } />
                <Route path="/upload-resume" element={
                    <ProtectedRoute>
                        <ResumeUploadPage />
                    </ProtectedRoute>
                } />
                <Route path="/interview/:sessionId" element={
                    <ProtectedRoute>
                        <InterviewPage />
                    </ProtectedRoute>
                } />
                <Route path="/results/:sessionId" element={
                    <ProtectedRoute>
                        <ResultsPage />
                    </ProtectedRoute>
                } />

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </div>
    )
}

export default App
