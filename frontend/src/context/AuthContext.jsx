/**
 * ============================================
 * AUTH CONTEXT - Manages User Authentication
 * ============================================
 * 
 * This context provides authentication state throughout the app.
 * It handles login, logout, register, and token management.
 */

import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/api'

// Create the context
const AuthContext = createContext(null)

// Auth Provider component
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Check if user is authenticated
    const isAuthenticated = !!token && !!user

    // Load user on mount if token exists
    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    const response = await authService.getMe()
                    setUser(response.user)
                } catch (err) {
                    // Token might be invalid
                    console.error('Failed to load user:', err)
                    logout()
                }
            }
            setLoading(false)
        }

        loadUser()
    }, [token])

    // Register new user
    const register = async (fullName, email, password) => {
        try {
            setError(null)
            const response = await authService.register({ fullName, email, password })

            if (response.success) {
                setToken(response.token)
                setUser(response.user)
                localStorage.setItem('token', response.token)
                return { success: true }
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed'
            setError(message)
            return { success: false, error: message }
        }
    }

    // Login existing user
    const login = async (email, password) => {
        try {
            setError(null)
            const response = await authService.login({ email, password })

            if (response.success) {
                setToken(response.token)
                setUser(response.user)
                localStorage.setItem('token', response.token)
                return { success: true }
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Login failed'
            setError(message)
            return { success: false, error: message }
        }
    }

    // Logout user
    const logout = () => {
        setToken(null)
        setUser(null)
        localStorage.removeItem('token')
    }

    // Clear error
    const clearError = () => setError(null)

    const value = {
        user,
        token,
        loading,
        error,
        isAuthenticated,
        register,
        login,
        logout,
        clearError
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

// Custom hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
