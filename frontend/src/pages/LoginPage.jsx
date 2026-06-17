import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BrandLogo from '../components/common/BrandLogo'
import { ChartIcon, DocumentIcon, MessageIcon } from '../components/common/AppIcons'
import './AuthPages.css'

function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const result = await login(email, password)

        if (result.success) {
            navigate('/dashboard')
        } else {
            setError(result.error || 'Login failed')
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
                        <span className="section-kicker">Practice with intent</span>
                        <h1 className="auth-showcase-title">
                            Build confidence without getting fake comfort from the score.
                        </h1>
                        <p className="auth-showcase-text">
                            ClearView turns your resume into role-specific interview sessions and grades the substance of your answers first.
                        </p>
                    </div>

                    <div className="auth-feature-list">
                        <div className="auth-feature-card">
                            <span className="auth-feature-icon"><DocumentIcon size={20} /></span>
                            <div>
                                <strong>Resume-specific prompts</strong>
                                <span>Your practice session is shaped by your actual experience.</span>
                            </div>
                        </div>
                        <div className="auth-feature-card">
                            <span className="auth-feature-icon"><MessageIcon size={20} /></span>
                            <div>
                                <strong>Blunt feedback</strong>
                                <span>Weak answers are called out clearly instead of being softened.</span>
                            </div>
                        </div>
                        <div className="auth-feature-card">
                            <span className="auth-feature-icon"><ChartIcon size={20} /></span>
                            <div>
                                <strong>Transparent scoring</strong>
                                <span>Answer quality drives readiness more than presentation polish.</span>
                            </div>
                        </div>
                    </div>
                </section>

                <form onSubmit={handleSubmit} className="auth-form">
                    <span className="section-kicker">Sign in</span>
                    <h2 className="auth-title">Welcome back</h2>
                    <p className="auth-description">
                        Pick up where you left off and continue practicing with honest scoring.
                    </p>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

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
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>

                    <p className="auth-footer">
                        Don't have an account?{' '}
                        <Link to="/register" className="auth-link">
                            Create one
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default LoginPage
