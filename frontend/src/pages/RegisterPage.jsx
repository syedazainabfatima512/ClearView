import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BrandLogo from '../components/common/BrandLogo'
import { ChartIcon, DocumentIcon, MessageIcon } from '../components/common/AppIcons'
import './AuthPages.css'

function RegisterPage() {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const { register } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters')
            return
        }

        setLoading(true)
        const result = await register(fullName, email, password)

        if (result.success) {
            navigate('/dashboard')
        } else {
            setError(result.error || 'Registration failed')
        }

        setLoading(false)
    }

    return (
        <div className="auth-page">
            <div className="auth-shell animate-slideUp">
                <section className="auth-showcase">
                    <BrandLogo
                        stacked
                        subtitle="Interview practice that gives straight answers"
                        className="brand-logo-on-dark"
                    />

                    <div className="auth-showcase-copy">
                        <span className="section-kicker">Set up your workspace</span>
                        <h1 className="auth-showcase-title">
                            Practice before the real interview and see where your answers actually stand.
                        </h1>
                        <p className="auth-showcase-text">
                            Upload a resume, generate focused questions, and get feedback that values substance over polish.
                        </p>
                    </div>

                    <div className="auth-feature-list">
                        <div className="auth-feature-card">
                            <span className="auth-feature-icon"><DocumentIcon size={20} /></span>
                            <div>
                                <strong>Resume-led sessions</strong>
                                <span>Questions are grounded in your projects, tools, and experience level.</span>
                            </div>
                        </div>
                        <div className="auth-feature-card">
                            <span className="auth-feature-icon"><MessageIcon size={20} /></span>
                            <div>
                                <strong>Candid review</strong>
                                <span>Missed points and weak explanations are surfaced directly.</span>
                            </div>
                        </div>
                        <div className="auth-feature-card">
                            <span className="auth-feature-icon"><ChartIcon size={20} /></span>
                            <div>
                                <strong>Readable progress</strong>
                                <span>Track improvement over time without inflated pass rates.</span>
                            </div>
                        </div>
                    </div>
                </section>

                <form onSubmit={handleSubmit} className="auth-form">
                    <span className="section-kicker">Create account</span>
                    <h2 className="auth-title">Create your account</h2>
                    <p className="auth-description">
                        Start with a focused setup and practice against a stricter scoring model.
                    </p>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enter your full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Create a password (min 8 characters)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg auth-submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner" style={{ width: 20, height: 20 }}></span>
                                Creating account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>

                    <p className="auth-footer">
                        Already have an account?{' '}
                        <Link to="/login" className="auth-link">
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default RegisterPage
