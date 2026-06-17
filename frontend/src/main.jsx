/**
 * ============================================
 * MAIN.JSX - React Application Entry Point
 * ============================================
 * 
 * This is where our React app starts!
 * It wraps everything with providers and renders to the DOM.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

// Find the 'root' div in index.html and render our app inside
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>,
)
