/**
 * ============================================
 * INTERVIEW PAGE
 * ============================================
 *
 * The main interview room where:
 * - Video is captured for confidence analysis (buffered locally, sent on submit)
 * - Questions are displayed one at a time
 * - Answers are submitted (voice or text) — auto-advances, no mid-interview AI scoring
 * - All AI feedback is deferred to the final results page
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    CameraIcon,
    EyeIcon,
    MicIcon,
    SparkIcon,
    StopIcon,
    WaveIcon
} from '../components/common/AppIcons'
import { interviewService, aiService } from '../services/api'
import './InterviewPage.css'

// ──────────────────────────────────────────────────────────
// FILLER WORDS to detect for local voice analysis
// ──────────────────────────────────────────────────────────
const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'basically', 'literally', 'sort of', 'kind of', 'i mean', 'actually', 'so', 'right']
const FRAME_SAMPLE_INTERVAL = 5000 // ms between confidence polls
const QUESTION_POLL_INTERVAL = 1500
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function InterviewPage() {
    const { sessionId } = useParams()
    const navigate = useNavigate()

    // ── Interview state ──
    const [questions, setQuestions] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answer, setAnswer] = useState('')
    const [interimPreview, setInterimPreview] = useState('') // live speech preview (not saved to answer)
    const [isRecording, setIsRecording] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [submitSaved, setSubmitSaved] = useState(false) // brief "Saved!" state
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [startTime, setStartTime] = useState(null)
    const [completing, setCompleting] = useState(false)

    // ── Video refs ──
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const streamRef = useRef(null)

    // ── Speech recognition ──
    const recognitionRef = useRef(null)
    const finalTranscriptRef = useRef('') // accumulates final-only transcript segments
    const isRecordingRef = useRef(false)  // mirror of isRecording state for use in callbacks

    // ── Confidence buffering (per question) ──
    const confidenceBufferRef = useRef([]) // [{ eyeContact, posture, facialCalmness }]
    const frameInFlightRef = useRef(false)  // guard: skip if request already running
    const frameTimerRef = useRef(null)       // holds the recursive setTimeout id

    // ── Voice metrics (per question) ──
    const audioCtxRef = useRef(null)
    const analyserRef = useRef(null)
    const micSourceRef = useRef(null)
    const voiceMetricsRef = useRef(null) // populated on stopRecording

    // Speaking duration / pause tracking
    const speakingStartRef = useRef(null)
    const speakingDurationRef = useRef(0) // ms
    const pauseCountRef = useRef(0)
    const lastSilenceRef = useRef(null)
    const volumeSamplesRef = useRef([])
    const recordingStartRef = useRef(null)

    // Keep isRecordingRef in sync with state (avoids stale closure in speech onend)
    useEffect(() => { isRecordingRef.current = isRecording }, [isRecording])

    // ── Load questions ──
    useEffect(() => {
        loadQuestions()
        setupVideo()
        setupSpeechRecognition()

        return () => cleanup()
    }, [])

    const loadQuestions = async () => {
        try {
            for (let attempt = 0; attempt < 80; attempt += 1) {
                const response = await interviewService.getQuestions(sessionId)

                if (response.status === 'failed') {
                    throw new Error(response.processingError || 'Question generation failed')
                }

                if (response.success && response.questions?.length > 0 && response.status !== 'preparing') {
                    setQuestions(response.questions)
                    await interviewService.startSession(sessionId)
                    setStartTime(Date.now())
                    return
                }

                await sleep(QUESTION_POLL_INTERVAL)
            }

            throw new Error('Questions are still being prepared')
        } catch (err) {
            setError(err.message || 'Failed to load questions')
        } finally {
            setLoading(false)
        }
    }

    // ──────────────────────────────────────────────────────────
    // VIDEO SETUP
    // ──────────────────────────────────────────────────────────
    const setupVideo = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 640, height: 480 },
                audio: false
            })
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                streamRef.current = stream
            }
            startFramePolling()
        } catch (err) {
            console.error('Camera error:', err)
        }
    }

    // ──────────────────────────────────────────────────────────
    // CONFIDENCE POLLING (guarded, 5s recursive setTimeout)
    // ──────────────────────────────────────────────────────────
    const startFramePolling = useCallback(() => {
        const scheduleNext = () => {
            frameTimerRef.current = setTimeout(async () => {
                // Skip if tab is hidden, a frame request is already running, or
                // we're in the middle of submitting / completing
                const isBlocked = document.hidden || frameInFlightRef.current
                if (!isBlocked && videoRef.current && canvasRef.current) {
                    const canvas = canvasRef.current
                    const ctx = canvas.getContext('2d')
                    ctx.drawImage(videoRef.current, 0, 0, 320, 240)
                    const frameData = canvas.toDataURL('image/jpeg', 0.5)

                    frameInFlightRef.current = true
                    try {
                        const analysis = await aiService.analyzeFrame(frameData)
                        // Buffer locally — do NOT write to backend on every frame
                        const eyeContact = typeof analysis.eyeContact === 'number' ? analysis.eyeContact : null
                        const posture = typeof analysis.posture === 'number' ? analysis.posture : null
                        const facialCalmness = typeof analysis.facialTension === 'number'
                            ? 100 - analysis.facialTension
                            : null

                        if ([eyeContact, posture, facialCalmness].some(value => typeof value === 'number')) {
                            confidenceBufferRef.current.push({
                                eyeContact,
                                posture,
                                facialCalmness
                            })
                        }
                    } catch (_) {
                        // Silently ignore frame analysis errors
                    } finally {
                        frameInFlightRef.current = false
                    }
                }

                scheduleNext() // schedule the next iteration
            }, FRAME_SAMPLE_INTERVAL)
        }

        scheduleNext()
    }, [])

    // ──────────────────────────────────────────────────────────
    // SPEECH RECOGNITION
    // Interim results are shown as a live preview BELOW the textarea
    // and never written into the answer field directly.
    // Only high-confidence final results are appended to the textarea.
    // ──────────────────────────────────────────────────────────
    const CONFIDENCE_THRESHOLD = 0.60 // accept finals above this confidence

    const setupSpeechRecognition = () => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'
        recognition.maxAlternatives = 3 // get top-3 candidates; pick the most confident

        recognition.onresult = (event) => {
            let liveInterim = ''

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i]

                if (result.isFinal) {
                    // Pick the alternative with the highest confidence
                    let best = result[0]
                    for (let a = 1; a < result.length; a++) {
                        if (result[a].confidence > best.confidence) best = result[a]
                    }

                    const text = best.transcript.trim()
                    if (!text) continue

                    // Accept if confidence meets threshold OR if browser didn't report it (some browsers return 0)
                    if (best.confidence === 0 || best.confidence >= CONFIDENCE_THRESHOLD) {
                        finalTranscriptRef.current = finalTranscriptRef.current
                            ? finalTranscriptRef.current + ' ' + text
                            : text
                        // Update the textarea with the committed text
                        setAnswer(finalTranscriptRef.current)
                    }
                    // Clear the interim preview once a result is finalised
                    setInterimPreview('')
                } else {
                    // Show the best interim alternative as preview only
                    let bestInterim = result[0]
                    for (let a = 1; a < result.length; a++) {
                        if (result[a].confidence > bestInterim.confidence) bestInterim = result[a]
                    }
                    liveInterim += bestInterim.transcript
                }
            }

            if (liveInterim) setInterimPreview(liveInterim)
        }

        recognition.onerror = (event) => {
            // 'no-speech' and 'aborted' are normal; only log unexpected errors
            if (!['no-speech', 'aborted'].includes(event.error)) {
                console.error('Speech recognition error:', event.error)
            }
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                setIsRecording(false)
            }
        }

        recognition.onend = () => {
            setInterimPreview('')
            // Auto-restart only while still in recording mode
            // Use a ref to read current value without stale closure
            if (isRecordingRef.current) {
                try { recognition.start() } catch (_) {}
            }
        }

        recognitionRef.current = recognition
    }

    // ──────────────────────────────────────────────────────────
    // WEB AUDIO API — mic volume tracking for voice metrics
    // ──────────────────────────────────────────────────────────
    const startAudioCapture = async () => {
        try {
            const micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            const ctx = new (window.AudioContext || window.webkitAudioContext)()
            const source = ctx.createMediaStreamSource(micStream)
            const analyser = ctx.createAnalyser()
            analyser.fftSize = 256
            source.connect(analyser)

            audioCtxRef.current = ctx
            analyserRef.current = analyser
            micSourceRef.current = source

            // Reset per-answer metrics
            speakingStartRef.current = null
            speakingDurationRef.current = 0
            pauseCountRef.current = 0
            lastSilenceRef.current = null
            volumeSamplesRef.current = []
            recordingStartRef.current = Date.now()

            const SILENCE_THRESHOLD = 10
            const PAUSE_DEBOUNCE_MS = 500
            const dataArray = new Uint8Array(analyser.frequencyBinCount)

            const sampleVolume = () => {
                if (!analyserRef.current) return
                analyserRef.current.getByteFrequencyData(dataArray)
                const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
                volumeSamplesRef.current.push(volume)

                const isSpeaking = volume > SILENCE_THRESHOLD
                const now = Date.now()

                if (isSpeaking) {
                    if (!speakingStartRef.current) speakingStartRef.current = now
                    if (lastSilenceRef.current && (now - lastSilenceRef.current) > PAUSE_DEBOUNCE_MS) {
                        pauseCountRef.current += 1
                    }
                    lastSilenceRef.current = null
                } else {
                    if (speakingStartRef.current) {
                        speakingDurationRef.current += now - speakingStartRef.current
                        speakingStartRef.current = null
                        lastSilenceRef.current = now
                    }
                }

                // Keep sampling while audio context is open
                if (audioCtxRef.current?.state !== 'closed') {
                    requestAnimationFrame(sampleVolume)
                }
            }

            requestAnimationFrame(sampleVolume)
        } catch (err) {
            console.warn('Audio capture unavailable:', err)
        }
    }

    const stopAudioCapture = () => {
        if (!audioCtxRef.current) return

        // Finalize speaking duration if still counting
        if (speakingStartRef.current) {
            speakingDurationRef.current += Date.now() - speakingStartRef.current
            speakingStartRef.current = null
        }

        try { audioCtxRef.current.close() } catch (_) {}
        audioCtxRef.current = null
        analyserRef.current = null
        micSourceRef.current = null
    }

    const buildVoiceMetrics = (answerText, answerSource) => {
        const words = answerText.trim().split(/\s+/).filter(Boolean)
        const wordCount = words.length
        const speakingMs = speakingDurationRef.current || 0
        const wordsPerMinute = speakingMs > 0 ? parseFloat(((wordCount / speakingMs) * 60000).toFixed(1)) : 0

        // Count filler words
        const lowerText = answerText.toLowerCase()
        const fillerWordCount = FILLER_WORDS.reduce((count, filler) => {
            const regex = new RegExp(`\\b${filler}\\b`, 'gi')
            const matches = lowerText.match(regex)
            return count + (matches ? matches.length : 0)
        }, 0)
        const fillerWordRate = wordCount > 0 ? parseFloat((fillerWordCount / wordCount).toFixed(3)) : 0

        // Volume stats
        const samples = volumeSamplesRef.current
        const averageVolume = samples.length > 0
            ? parseFloat((samples.reduce((a, b) => a + b, 0) / samples.length).toFixed(2))
            : 0
        const volumeVariance = samples.length > 1
            ? samples.reduce((acc, v) => acc + Math.pow(v - averageVolume, 2), 0) / samples.length
            : 0
        const volumeStability = parseFloat(Math.max(0, 100 - Math.sqrt(volumeVariance)).toFixed(1))

        // Pause ratio: pause time / total elapsed
        const totalElapsed = recordingStartRef.current ? (Date.now() - recordingStartRef.current) : speakingMs
        const pauseRatio = totalElapsed > 0
            ? parseFloat(((totalElapsed - speakingMs) / totalElapsed).toFixed(3))
            : 0

        return {
            answerSource,
            wordCount,
            wordsPerMinute,
            fillerWordCount,
            fillerWordRate,
            speakingDurationMs: speakingMs,
            pauseCount: pauseCountRef.current,
            pauseRatio,
            averageVolume,
            volumeStability
        }
    }

    // ──────────────────────────────────────────────────────────
    // CONFIDENCE SNAPSHOT — average of buffered frames
    // ──────────────────────────────────────────────────────────
    const buildConfidenceSnapshot = () => {
        const buf = confidenceBufferRef.current
        if (buf.length === 0) return null

        const avg = (key) => {
            const values = buf
                .map(frame => frame[key])
                .filter((value) => typeof value === 'number')

            if (values.length === 0) return null

            return parseFloat((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1))
        }

        const eyeContact = avg('eyeContact')
        const posture = avg('posture')
        const facialCalmness = avg('facialCalmness')

        if ([eyeContact, posture, facialCalmness].every(value => value === null)) {
            return null
        }

        return {
            eyeContact,
            posture,
            facialCalmness,
            sampleCount: buf.length
        }
    }

    // ──────────────────────────────────────────────────────────
    // CLEANUP
    // ──────────────────────────────────────────────────────────
    const cleanup = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
        }
        if (frameTimerRef.current) {
            clearTimeout(frameTimerRef.current)
        }
        if (recognitionRef.current) {
            try { recognitionRef.current.stop() } catch (_) {}
        }
        stopAudioCapture()
    }

    // ──────────────────────────────────────────────────────────
    // TOGGLE RECORDING
    // ──────────────────────────────────────────────────────────
    const toggleRecording = () => {
        if (!recognitionRef.current) return

        if (isRecording) {
            isRecordingRef.current = false
            recognitionRef.current.stop()
            stopAudioCapture()
            setInterimPreview('')
            setIsRecording(false)
        } else {
            // Seed the running transcript with whatever is already in the textarea
            finalTranscriptRef.current = answer.trim()
            isRecordingRef.current = true
            recognitionRef.current.start()
            startAudioCapture()
            setIsRecording(true)
        }
    }

    // ──────────────────────────────────────────────────────────
    // RESET FOR NEXT QUESTION
    // ──────────────────────────────────────────────────────────
    const resetForNextQuestion = () => {
        finalTranscriptRef.current = ''
        confidenceBufferRef.current = []
        voiceMetricsRef.current = null
        speakingDurationRef.current = 0
        pauseCountRef.current = 0
        volumeSamplesRef.current = []
        recordingStartRef.current = null
        setAnswer('')
        setInterimPreview('')
        setStartTime(Date.now())
    }

    // ──────────────────────────────────────────────────────────
    // SUBMIT ANSWER
    // ──────────────────────────────────────────────────────────
    const handleSubmitAnswer = async () => {
        if (!answer.trim()) return

        // Stop recording if active
        if (isRecording) {
            try { recognitionRef.current?.stop() } catch (_) {}
            stopAudioCapture()
            setIsRecording(false)
        }

        setSubmitting(true)
        frameInFlightRef.current = true // pause confidence polling during submit

        const responseTime = Date.now() - (startTime || Date.now())
        const currentQuestion = questions[currentIndex]

        // Determine answer source
        const answerSource = isRecording ? 'voice' : (voiceMetricsRef.current ? 'mixed' : 'typed')
        const voiceMetrics = buildVoiceMetrics(answer, answerSource)
        const confidenceSnapshot = buildConfidenceSnapshot()

        try {
            await interviewService.submitAnswer(
                sessionId,
                currentQuestion.id,
                answer.trim(),
                responseTime,
                confidenceSnapshot,
                voiceMetrics
            )

            setSubmitSaved(true)
            setTimeout(() => {
                setSubmitSaved(false)
                setSubmitting(false)
                frameInFlightRef.current = false

                const isLast = currentIndex === questions.length - 1
                if (isLast) {
                    handleCompleteInterview()
                } else {
                    resetForNextQuestion()
                    setCurrentIndex(prev => prev + 1)
                }
            }, 600) // brief "Saved!" pause before advancing

        } catch (err) {
            setError('Failed to submit answer. Please try again.')
            setSubmitting(false)
            frameInFlightRef.current = false
        }
    }

    // ──────────────────────────────────────────────────────────
    // COMPLETE INTERVIEW
    // ──────────────────────────────────────────────────────────
    const handleCompleteInterview = async () => {
        setCompleting(true)
        frameInFlightRef.current = true // stop all polling

        try {
            const response = await interviewService.complete(sessionId)
            if (response.success) {
                navigate(`/results/${sessionId}`)
            }
        } catch (err) {
            setError('Failed to complete interview. Please try again.')
            setCompleting(false)
            frameInFlightRef.current = false
        }
    }

    // ──────────────────────────────────────────────────────────
    // RENDER STATES
    // ──────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="page flex items-center justify-center" style={{ paddingTop: 100 }}>
                <div className="spinner"></div>
            </div>
        )
    }

    if (completing) {
        return (
            <div className="page flex items-center justify-center flex-col gap-4" style={{ paddingTop: 100 }}>
                <div className="spinner"></div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                    Analyzing your interview... this may take a moment
                </p>
            </div>
        )
    }

    const currentQuestion = questions[currentIndex]
    const isLastQuestion = currentIndex === questions.length - 1
    const hasSpeechSupport = !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    const progressPercent = questions.length > 0
        ? Math.round(((currentIndex + 1) / questions.length) * 100)
        : 0

    return (
        <div className="interview-page">
            {/* Hidden canvas for frame capture */}
            <canvas ref={canvasRef} width="320" height="240" style={{ display: 'none' }} />

            {error && (
                <div className="error-banner">
                    {error}
                    <button onClick={() => setError('')} className="error-dismiss">x</button>
                </div>
            )}

            <div className="interview-container">
                <div className="video-section">
                    <div className="video-panel-header">
                        <div>
                            <span className="section-kicker">Camera</span>
                            <h2 className="panel-title">Practice view</h2>
                        </div>
                        <span className={`session-status ${isRecording ? 'live' : ''}`}>
                            <span className="recording-dot"></span>
                            {isRecording ? 'Recording' : 'Ready'}
                        </span>
                    </div>

                    <div className="video-container">
                        <video ref={videoRef} autoPlay muted playsInline />
                        <div className="video-overlay">
                            <span className={`recording-indicator ${isRecording ? 'active' : ''}`}>
                                {isRecording ? 'Answer capture is live' : 'Camera is on and waiting'}
                            </span>
                        </div>
                    </div>

                    <div className="video-tips">
                        <h3>What improves the next score</h3>
                        <div className="video-tip-list">
                            <div className="video-tip-item">
                                <CameraIcon size={16} />
                                <span>Keep your head and shoulders clearly framed.</span>
                            </div>
                            <div className="video-tip-item">
                                <EyeIcon size={16} />
                                <span>Look toward the lens while you answer.</span>
                            </div>
                            <div className="video-tip-item">
                                <WaveIcon size={16} />
                                <span>Pause to think, then speak at a steady pace.</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="question-section">
                    <div className="interview-progress">
                        <span className="progress-label">Question {currentIndex + 1} of {questions.length}</span>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                            />
                        </div>
                        <span className="progress-meta">{progressPercent}% complete</span>
                    </div>

                    {currentQuestion && (
                        <div className="question-card animate-slideUp">
                            <div className="question-meta">
                                <span className="badge badge-primary">{currentQuestion.category}</span>
                                <span className="badge badge-secondary">{currentQuestion.difficulty}</span>
                            </div>

                            <h2 className="question-text">{currentQuestion.text}</h2>

                            {currentQuestion.basedOn && (
                                <p className="question-context">{currentQuestion.basedOn}</p>
                            )}

                            {currentQuestion.tips && (
                                <div className="question-tip">
                                    <SparkIcon size={16} />
                                    <span>{currentQuestion.tips}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="answer-section">
                        <div className="answer-header">
                            <div>
                                <span className="section-kicker">Response</span>
                                <h3 className="panel-title">Give your best answer</h3>
                            </div>
                            <p className="answer-support">
                                Speak or type. Readiness is judged mostly by the quality of the answer itself.
                            </p>
                        </div>

                        <div className="answer-controls">
                            {hasSpeechSupport && (
                                <>
                                    <button
                                        className={`btn ${isRecording ? 'btn-recording' : 'btn-secondary'}`}
                                        onClick={toggleRecording}
                                        disabled={submitting}
                                        id="btn-voice-toggle"
                                    >
                                        <span className="button-icon">
                                            {isRecording ? <StopIcon size={14} /> : <MicIcon size={14} />}
                                        </span>
                                        {isRecording ? 'Stop recording' : 'Use microphone'}
                                    </button>
                                    <span className="answer-or">or type below</span>
                                </>
                            )}
                        </div>

                        <textarea
                            id="answer-textarea"
                            className="answer-input"
                            placeholder="Type or speak your answer..."
                            value={answer}
                            onChange={(e) => {
                                setAnswer(e.target.value)
                                // Keep finalTranscriptRef in sync when user edits manually
                                finalTranscriptRef.current = e.target.value
                            }}
                            rows={5}
                            disabled={submitting}
                        />

                        {isRecording && interimPreview && (
                            <div className="interim-preview" aria-live="polite">
                                <span className="interim-label">
                                    <MicIcon size={14} />
                                    Hearing now
                                </span>
                                <span className="interim-text">{interimPreview}</span>
                            </div>
                        )}

                        <button
                            id="btn-submit-answer"
                            className="btn btn-primary btn-lg"
                            onClick={handleSubmitAnswer}
                            disabled={!answer.trim() || submitting}
                        >
                            {submitting && submitSaved
                                ? 'Saved'
                                : submitting
                                    ? isLastQuestion ? 'Finishing...' : 'Saving...'
                                    : isLastQuestion
                                        ? 'Finish Interview'
                                        : 'Submit Answer'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InterviewPage
