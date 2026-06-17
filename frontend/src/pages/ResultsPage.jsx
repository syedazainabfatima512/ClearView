import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    ChartIcon,
    CheckCircleIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ClipboardIcon,
    FlagIcon,
    GaugeIcon,
    MessageIcon,
    PauseIcon,
    SparkIcon,
    VolumeIcon
} from '../components/common/AppIcons'
import { ResultsAuditIllustration } from '../components/illustrations/StoryIllustrations'
import { feedbackService } from '../services/api'
import './ResultsPage.css'

const pct = (val, fallback = 0) =>
    val !== undefined && val !== null ? Math.round(val) : fallback

const RESULT_POLL_INTERVAL = 1500
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const scoreClass = (score) => {
    if (score >= 75) return 'score-high'
    if (score >= 55) return 'score-mid'
    return 'score-low'
}

function ResultsPage() {
    const { sessionId } = useParams()
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(true)
    const [analyzing, setAnalyzing] = useState(false)
    const [error, setError] = useState('')
    const [expandedAnswers, setExpandedAnswers] = useState({})

    useEffect(() => {
        let cancelled = false

        const pollResults = async () => {
            setLoading(true)
            setError('')

            for (let attempt = 0; attempt < 120; attempt += 1) {
                try {
                    const response = await feedbackService.getResult(sessionId)
                    if (cancelled) return

                    if (response.status === 'analyzing') {
                        setAnalyzing(true)
                        setLoading(false)
                        await sleep(RESULT_POLL_INTERVAL)
                        continue
                    }

                    if (response.success) {
                        setResult(response.result)
                        setAnalyzing(false)
                        setLoading(false)
                        return
                    }
                } catch (err) {
                    if (!cancelled) {
                        setError(err.response?.data?.message || 'Failed to load results')
                        setAnalyzing(false)
                        setLoading(false)
                    }
                    return
                }
            }

            if (!cancelled) {
                setError('Interview analysis is taking longer than expected. Please refresh in a moment.')
                setAnalyzing(false)
                setLoading(false)
            }
        }

        pollResults()

        return () => {
            cancelled = true
        }
    }, [sessionId])

    const toggleAnswer = (idx) =>
        setExpandedAnswers(prev => ({ ...prev, [idx]: !prev[idx] }))

    if (loading || analyzing) {
        return (
            <div className="page flex items-center justify-center flex-col gap-4" style={{ paddingTop: 100 }}>
                <div className="spinner"></div>
                {analyzing && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                        Analyzing your interview...
                    </p>
                )}
            </div>
        )
    }

    if (error || !result) {
        return (
            <div className="page flex items-center justify-center flex-col gap-4" style={{ paddingTop: 100 }}>
                <p>{error || 'Results not found'}</p>
                <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
            </div>
        )
    }

    const vm = result.voiceMetrics || {}
    const hasVoiceData = vm.capturedAnswers > 0
    const hasConfidenceData = (result.confidenceMetrics?.sampleCount || 0) > 0
    const readinessTitle = result.passed
        ? 'Ready for live interviews'
        : 'Not ready for live interviews yet'
    const readinessSummary = result.interviewReadiness || (
        result.passed
            ? 'Your answers were strong enough to hold up in a real interview setting.'
            : 'Your current answers still need more depth, precision, or structure before a real interview.'
    )
    const confidenceNote = hasConfidenceData
        ? 'Presentation contributed to the result, but answer quality still carried most of the score.'
        : 'Camera data was not captured, so readiness was based on answer quality alone.'
    const strengths = result.strengths?.length
        ? result.strengths
        : ['No strengths were strong or consistent enough to stand out clearly in this session.']
    const areasToImprove = result.areasToImprove?.length
        ? result.areasToImprove
        : ['No detailed improvement list was returned, but the overall score still indicates more practice is needed.']
    const nextSteps = (result.nextSteps?.length ? result.nextSteps : result.recommendations)?.length
        ? (result.nextSteps?.length ? result.nextSteps : result.recommendations)
        : ['Repeat the interview with tighter structure, stronger evidence, and more accurate detail in each answer.']

    return (
        <div className="results-page">
            <div className="container">
                <header className="results-header animate-fadeIn">
                    <div className="results-header-copy">
                        <span className="section-kicker">Interview review</span>
                        <h1>Here is the honest read on that session.</h1>
                        <p className="results-date">
                            Completed on {new Date(result.completedAt).toLocaleDateString('en-US', {
                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                            })}
                        </p>
                    </div>
                    <ResultsAuditIllustration className="results-header-visual" result={result} />
                </header>

                <div className="main-score-card animate-slideUp">
                    <div className={`score-circle large ${result.passed ? 'passed' : 'failed'}`}>
                        <span className="score-value">{result.interviewReadinessScore}</span>
                        <span className="score-label">IRS</span>
                    </div>

                    <div className="score-status">
                        <span className={`status-badge ${result.passed ? 'passed' : 'failed'}`}>
                            {result.passed ? 'Interview ready' : 'Needs more work'}
                        </span>
                        <h2>{readinessTitle}</h2>
                        <p>{readinessSummary}</p>
                        <div className="score-policy">
                            <ChartIcon size={16} />
                            <span>{confidenceNote}</span>
                        </div>
                    </div>
                </div>

                <div className="scores-grid animate-slideUp">
                    <div className="score-card">
                        <div className="score-card-header">
                            <span className="score-card-icon"><ClipboardIcon size={18} /></span>
                            <div>
                                <h3>Answer quality</h3>
                                <p>Content leads the final readiness score.</p>
                            </div>
                        </div>

                        <div className="score-display">
                            <span className="score-big">{result.aptitudeScore}</span>
                            <span className="score-max">/10</span>
                        </div>

                        <div className="score-details">
                            <div className="detail-row">
                                <span>Relevance</span>
                                <span>{pct(result.answerPerformance?.averageRelevance)}%</span>
                            </div>
                            <div className="detail-row">
                                <span>Accuracy</span>
                                <span>{pct(result.answerPerformance?.averageAccuracy)}%</span>
                            </div>
                            <div className="detail-row">
                                <span>Communication</span>
                                <span>{pct(result.answerPerformance?.averageCommunication)}%</span>
                            </div>
                            <div className="detail-row">
                                <span>Depth</span>
                                <span>{pct(result.answerPerformance?.averageDepth)}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="score-card">
                        <div className="score-card-header">
                            <span className="score-card-icon"><CheckCircleIcon size={18} /></span>
                            <div>
                                <h3>Presentation</h3>
                                <p>Helpful context, but not enough to hide weak answers.</p>
                            </div>
                        </div>

                        <div className="score-display">
                            <span className="score-big">{result.confidenceScore}</span>
                            <span className="score-max">/10</span>
                        </div>

                        <div className="score-details">
                            <div className="detail-row">
                                <span>Eye Contact</span>
                                <span>{hasConfidenceData ? `${pct(result.confidenceMetrics?.eyeContactRatio)}%` : 'Not captured'}</span>
                            </div>
                            <div className="detail-row">
                                <span>Posture</span>
                                <span>{hasConfidenceData ? `${pct(result.confidenceMetrics?.postureStability)}%` : 'Not captured'}</span>
                            </div>
                            <div className="detail-row">
                                <span>Calmness</span>
                                <span>{hasConfidenceData ? `${pct(result.confidenceMetrics?.facialCalmness)}%` : 'Not captured'}</span>
                            </div>
                            <div className="detail-row">
                                <span>Samples</span>
                                <span>{result.confidenceMetrics?.sampleCount || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="feedback-card animate-slideUp">
                    <div className="feedback-header">
                        <div>
                            <span className="section-kicker">Evaluator notes</span>
                            <h2>Where the session held up and where it did not</h2>
                        </div>
                    </div>

                    <div className="feedback-content">
                        <p className="overall-feedback">{result.overallFeedback}</p>
                    </div>

                    <div className="feedback-lists">
                        <div className="feedback-list">
                            <h4><CheckCircleIcon size={16} /> What held up</h4>
                            <ul>
                                {strengths.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>

                        <div className="feedback-list">
                            <h4><FlagIcon size={16} /> What needs work</h4>
                            <ul>
                                {areasToImprove.map((a, i) => <li key={i}>{a}</li>)}
                            </ul>
                        </div>
                    </div>

                    <div className="recommendations">
                        <h4><SparkIcon size={16} /> Next steps</h4>
                        <ul>
                            {nextSteps.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                {result.answerBreakdown && result.answerBreakdown.length > 0 && (
                    <div className="answer-breakdown-section animate-slideUp">
                        <div className="feedback-header">
                            <div>
                                <span className="section-kicker">Per-answer review</span>
                                <h2>Answer breakdown</h2>
                            </div>
                            <p className="section-subtitle">
                                Open each answer to see the exact score split and the missed points.
                            </p>
                        </div>

                        <div className="answer-breakdown-list">
                            {result.answerBreakdown.map((item, idx) => {
                                const ev = item.evaluation || {}
                                const overall = pct(ev.overallScore)
                                const isOpen = !!expandedAnswers[idx]

                                return (
                                    <div key={idx} className={`breakdown-card ${scoreClass(overall)}`}>
                                        <button
                                            className="breakdown-header"
                                            onClick={() => toggleAnswer(idx)}
                                            aria-expanded={isOpen}
                                            id={`breakdown-toggle-${idx}`}
                                        >
                                            <div className="breakdown-header-left">
                                                <span className="breakdown-number">Q{item.questionNumber}</span>
                                                <span className="breakdown-category badge badge-primary">
                                                    {item.category}
                                                </span>
                                                <span className="breakdown-question-preview">{item.question}</span>
                                            </div>

                                            <div className="breakdown-header-right">
                                                <span className={`breakdown-score-badge ${scoreClass(overall)}`}>
                                                    {overall}%
                                                </span>
                                                <span className="breakdown-chevron">
                                                    {isOpen ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
                                                </span>
                                            </div>
                                        </button>

                                        {isOpen && (
                                            <div className="breakdown-body animate-slideUp">
                                                <div className="breakdown-answer-box">
                                                    <h4>Your answer</h4>
                                                    <p>{item.answer || <em style={{ opacity: 0.5 }}>No answer recorded</em>}</p>
                                                </div>

                                                <div className="breakdown-scores-row">
                                                    {[
                                                        ['Relevance', ev.relevanceScore],
                                                        ['Accuracy', ev.accuracyScore],
                                                        ['Communication', ev.communicationScore],
                                                        ['Depth', ev.depthScore]
                                                    ].map(([label, val]) => (
                                                        <div key={label} className="breakdown-score-pill">
                                                            <span className="pill-label">{label}</span>
                                                            <span className={`pill-value ${scoreClass(pct(val))}`}>
                                                                {pct(val)}%
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {ev.feedback && (
                                                    <div className="breakdown-feedback">
                                                        <h4><MessageIcon size={16} /> Feedback</h4>
                                                        <p>{ev.feedback}</p>
                                                    </div>
                                                )}

                                                <div className="breakdown-points-row">
                                                    {ev.keyPointsCovered?.length > 0 && (
                                                        <div className="breakdown-points covered">
                                                            <h4><CheckCircleIcon size={16} /> Covered</h4>
                                                            <ul>
                                                                {ev.keyPointsCovered.map((pt, i) => (
                                                                    <li key={i}>{pt}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {ev.missedPoints?.length > 0 && (
                                                        <div className="breakdown-points missed">
                                                            <h4><FlagIcon size={16} /> Missed</h4>
                                                            <ul>
                                                                {ev.missedPoints.map((pt, i) => (
                                                                    <li key={i}>{pt}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>

                                                {ev.improvementTips && (
                                                    <div className="breakdown-tip">
                                                        <SparkIcon size={16} />
                                                        <p>{ev.improvementTips}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                <div className="voice-section animate-slideUp">
                    <div className="feedback-header">
                        <div>
                            <span className="section-kicker">Delivery notes</span>
                            <h2>Voice delivery</h2>
                        </div>
                        <p className="section-subtitle">
                            Supplemental metrics from spoken answers only. They help explain delivery but do not rescue weak content.
                        </p>
                    </div>

                    {!hasVoiceData ? (
                        <p className="voice-no-data">
                            No voice data was captured for this interview. Use the microphone in the next round if you want pacing and filler-word feedback.
                        </p>
                    ) : (
                        <div className="voice-metrics-grid">
                            <div className="voice-metric-card">
                                <span className="vm-icon"><MessageIcon size={18} /></span>
                                <span className="vm-value">{vm.totalWordCount ?? '—'}</span>
                                <span className="vm-label">Total words</span>
                            </div>
                            <div className="voice-metric-card">
                                <span className="vm-icon"><GaugeIcon size={18} /></span>
                                <span className="vm-value">
                                    {vm.averageWordsPerMinute ? Math.round(vm.averageWordsPerMinute) : '—'}
                                </span>
                                <span className="vm-label">Average WPM</span>
                            </div>
                            <div className="voice-metric-card">
                                <span className="vm-icon"><FlagIcon size={18} /></span>
                                <span className="vm-value">{vm.totalFillerWords ?? '—'}</span>
                                <span className="vm-label">Filler words</span>
                            </div>
                            <div className="voice-metric-card">
                                <span className="vm-icon"><PauseIcon size={18} /></span>
                                <span className="vm-value">
                                    {vm.averagePauseCount !== undefined ? Math.round(vm.averagePauseCount) : '—'}
                                </span>
                                <span className="vm-label">Average pauses</span>
                            </div>
                            <div className="voice-metric-card">
                                <span className="vm-icon"><ChartIcon size={18} /></span>
                                <span className="vm-value">
                                    {vm.averagePauseRatio !== undefined
                                        ? `${Math.round(vm.averagePauseRatio * 100)}%`
                                        : '—'}
                                </span>
                                <span className="vm-label">Silence ratio</span>
                            </div>
                            <div className="voice-metric-card">
                                <span className="vm-icon"><VolumeIcon size={18} /></span>
                                <span className="vm-value">
                                    {vm.averageVolumeStability !== undefined
                                        ? `${Math.round(vm.averageVolumeStability)}%`
                                        : '—'}
                                </span>
                                <span className="vm-label">Volume stability</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="results-actions">
                    <Link to="/upload-resume" className="btn btn-primary btn-lg">
                        Start New Interview
                    </Link>
                    <Link to="/dashboard" className="btn btn-secondary btn-lg">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default ResultsPage
