import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    CameraIcon,
    ChartIcon,
    CheckCircleIcon,
    DocumentIcon,
    ListIcon,
    PlayIcon,
    TargetIcon,
    TrophyIcon,
    WaveIcon
} from '../components/common/AppIcons'
import { DashboardSignalsIllustration } from '../components/illustrations/StoryIllustrations'
import { feedbackService, resumeService, interviewService } from '../services/api'
import './DashboardPage.css'

function DashboardPage() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [stats, setStats] = useState(null)
    const [history, setHistory] = useState([])
    const [resumes, setResumes] = useState([])
    const [loading, setLoading] = useState(true)
    const [startingInterviewFor, setStartingInterviewFor] = useState(null)

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        try {
            const [statsRes, historyRes, resumesRes] = await Promise.all([
                feedbackService.getStats(),
                feedbackService.getHistory(),
                resumeService.getAll()
            ])

            if (statsRes.success) setStats(statsRes.stats)
            if (historyRes.success) setHistory(historyRes.history.slice(0, 5))
            if (resumesRes.success) setResumes(resumesRes.resumes)
        } catch (error) {
            console.error('Dashboard load error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleStartInterviewFromResume = async (resume) => {
        if (startingInterviewFor) return

        setStartingInterviewFor(resume.id)
        try {
            const response = await interviewService.generateQuestions(resume.id)
            if (response.success && response.sessionId) {
                navigate(`/interview/${response.sessionId}`)
            }
        } catch (err) {
            console.error('Failed to start interview from resume:', err)
            alert('Could not start interview. Please try again.')
        } finally {
            setStartingInterviewFor(null)
        }
    }

    if (loading) {
        return (
            <div className="page flex items-center justify-center" style={{ paddingTop: 100 }}>
                <div className="spinner"></div>
            </div>
        )
    }

    const firstName = user?.fullName?.split(' ')[0] || 'there'
    const statCards = [
        {
            icon: <TargetIcon size={20} />,
            label: 'Sessions completed',
            value: stats?.totalInterviews || 0
        },
        {
            icon: <ChartIcon size={20} />,
            label: 'Average readiness',
            value: `${stats?.averageIRS || 0}%`
        },
        {
            icon: <CheckCircleIcon size={20} />,
            label: 'Pass rate',
            value: `${stats?.passRate || 0}%`
        },
        {
            icon: <TrophyIcon size={20} />,
            label: 'Best round',
            value: `${stats?.bestScore || 0}%`
        }
    ]

    return (
        <div className="dashboard-page">
            <div className="container">
                <header className="dashboard-header animate-fadeIn">
                    <div className="dashboard-header-copy">
                        <span className="section-kicker">Your practice workspace</span>
                        <h1 className="dashboard-title">Good to see you, {firstName}.</h1>
                        <p className="dashboard-subtitle">
                            Choose a resume, run a session, and review feedback that reflects the real quality of your answers.
                        </p>
                    </div>

                    <div className="dashboard-header-side">
                        <DashboardSignalsIllustration className="dashboard-header-visual" />
                        <div className="dashboard-header-actions">
                            <span className="dashboard-note">Answer quality carries the most weight in readiness scoring.</span>
                            <Link to="/upload-resume" className="btn btn-primary btn-lg">
                                Start interview
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="stats-grid animate-slideUp">
                    {statCards.map((stat) => (
                        <div key={stat.label} className="stat-card">
                            <div className="stat-icon">{stat.icon}</div>
                            <div className="stat-content">
                                <span className="stat-label">{stat.label}</span>
                                <span className="stat-value">{stat.value}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="dashboard-grid">
                    <section className="dashboard-section animate-slideUp">
                        <div className="section-header">
                            <div>
                                <span className="section-kicker">Recent work</span>
                                <h2 className="section-title">Latest interview reviews</h2>
                            </div>
                            <span className="section-caption">Tap a session to open the full breakdown.</span>
                        </div>

                        {history.length === 0 ? (
                            <div className="empty-state">
                                <p>You have not completed an interview yet.</p>
                                <Link to="/upload-resume" className="btn btn-secondary">
                                    Start your first session
                                </Link>
                            </div>
                        ) : (
                            <div className="interview-list">
                                {history.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        className="interview-item"
                                        onClick={() => navigate(`/results/${item.sessionId}`)}
                                    >
                                        <div className="interview-info">
                                            <span className="interview-domain">{item.domain}</span>
                                            <span className="interview-date">
                                                {new Date(item.completedAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>

                                        <div className="interview-meta">
                                            <span className={`result-chip ${item.passed ? 'passed' : 'failed'}`}>
                                                {item.passed ? 'Ready' : 'Needs work'}
                                            </span>
                                            <span className="interview-score">{item.irs}%</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="dashboard-section animate-slideUp">
                        <div className="section-header">
                            <div>
                                <span className="section-kicker">Resume library</span>
                                <h2 className="section-title">Saved resumes</h2>
                            </div>
                            <span className="section-caption">Each session starts fresh.</span>
                        </div>

                        {resumes.length === 0 ? (
                            <div className="empty-state">
                                <p>No resumes uploaded yet.</p>
                                <Link to="/upload-resume" className="btn btn-secondary">
                                    Upload a resume
                                </Link>
                            </div>
                        ) : (
                            <div className="resume-list">
                                {resumes.map((resume) => (
                                    <div key={resume.id} className="resume-item">
                                        <div className="resume-icon">
                                            <DocumentIcon size={18} />
                                        </div>
                                        <div className="resume-info">
                                            <span className="resume-name">{resume.name || 'Resume'}</span>
                                            <span className="resume-domain">{resume.domain}</span>
                                        </div>
                                        <div className="resume-actions">
                                            <span className="badge badge-primary">{resume.level}</span>
                                            <button
                                                id={`btn-start-interview-${resume.id}`}
                                                className="btn btn-secondary btn-sm resume-start-btn"
                                                onClick={() => handleStartInterviewFromResume(resume)}
                                                disabled={!!startingInterviewFor}
                                                title="Start a fresh interview with this resume"
                                            >
                                                <PlayIcon size={12} />
                                                {startingInterviewFor === resume.id ? 'Starting...' : 'Run session'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                <section className="tips-section animate-fadeIn">
                    <div className="section-header">
                        <div>
                            <span className="section-kicker">Small upgrades</span>
                            <h2 className="section-title">Three habits that improve the next round</h2>
                        </div>
                    </div>

                    <div className="tips-grid">
                        <div className="tip-card">
                            <span className="tip-icon"><CameraIcon size={22} /></span>
                            <h3>Frame the camera well</h3>
                            <p>Keep your head and shoulders visible so posture and eye contact can be measured consistently.</p>
                        </div>
                        <div className="tip-card">
                            <span className="tip-icon"><ListIcon size={22} /></span>
                            <h3>Answer in structure</h3>
                            <p>Lead with the takeaway, then support it with the reasoning, example, or tradeoff behind it.</p>
                        </div>
                        <div className="tip-card">
                            <span className="tip-icon"><WaveIcon size={22} /></span>
                            <h3>Control your pace</h3>
                            <p>Pause to think, then speak steadily. Rushed answers usually lose clarity faster than they gain confidence.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default DashboardPage
