import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ArrowRightIcon,
    CheckCircleIcon,
    DocumentIcon,
    SparkIcon,
    UploadIcon
} from '../components/common/AppIcons'
import { ResumeFlowIllustration } from '../components/illustrations/StoryIllustrations'
import { resumeService, interviewService } from '../services/api'
import './ResumeUploadPage.css'

const POLL_INTERVAL_MS = 1500
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const isResumeReady = (resume) => ['completed', 'partial'].includes(resume?.parsingStatus || resume?.status)

function ResumeUploadPage() {
    const [file, setFile] = useState(null)
    const [dragOver, setDragOver] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [parsing, setParsing] = useState(false)
    const [generating, setGenerating] = useState(false)
    const [parsedResume, setParsedResume] = useState(null)
    const [error, setError] = useState('')

    const fileInputRef = useRef(null)
    const navigate = useNavigate()

    const handleDragOver = (e) => {
        e.preventDefault()
        setDragOver(true)
    }

    const handleDragLeave = () => {
        setDragOver(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragOver(false)

        const droppedFile = e.dataTransfer.files[0]
        validateAndSetFile(droppedFile)
    }

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0]
        validateAndSetFile(selectedFile)
    }

    const validateAndSetFile = (selectedFile) => {
        setError('')

        if (!selectedFile) return

        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword'
        ]

        if (!allowedTypes.includes(selectedFile.type)) {
            setError('Please upload a PDF or Word document')
            return
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB')
            return
        }

        setFile(selectedFile)
    }

    const handleUpload = async () => {
        if (!file) return

        setUploading(true)
        setParsing(true)
        setError('')

        try {
            const response = await resumeService.upload(file)

            if (response.success) {
                setParsedResume(response.resume)
                const resumeId = response.resumeId || response.resume?.id
                let completed = false

                for (let attempt = 0; attempt < 80; attempt += 1) {
                    const resumeResponse = await resumeService.getById(resumeId)

                    if (resumeResponse.success) {
                        setParsedResume(resumeResponse.resume)

                        if (isResumeReady(resumeResponse.resume)) {
                            completed = true
                            break
                        }

                        if (resumeResponse.resume?.parsingStatus === 'failed') {
                            throw { response: { data: { message: resumeResponse.resume.parsingError || 'Resume parsing failed' } } }
                        }
                    }

                    await sleep(POLL_INTERVAL_MS)
                }

                if (!completed) {
                    throw { response: { data: { message: 'Resume analysis is taking longer than expected. Please try again in a moment.' } } }
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload resume')
            setParsedResume(null)
        } finally {
            setParsing(false)
            setUploading(false)
        }
    }

    const handleStartInterview = async () => {
        if (!parsedResume) return

        setGenerating(true)
        setError('')

        try {
            const response = await interviewService.generateQuestions(parsedResume.id)

            if (response.success) {
                for (let attempt = 0; attempt < 80; attempt += 1) {
                    const questionResponse = await interviewService.getQuestions(response.sessionId)

                    if (
                        questionResponse.success &&
                        questionResponse.status === 'questions_generated' &&
                        questionResponse.questions?.length > 0
                    ) {
                        navigate(`/interview/${response.sessionId}`)
                        return
                    }

                    if (questionResponse.status === 'failed') {
                        throw { response: { data: { message: questionResponse.processingError || 'Failed to generate questions' } } }
                    }

                    await sleep(POLL_INTERVAL_MS)
                }

                navigate(`/interview/${response.sessionId}`)
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate questions')
            setGenerating(false)
        }
    }

    const strengths = (parsedResume?.aiAnalysis?.keyStrengths || []).slice(0, 3)
    const watchouts = (parsedResume?.aiAnalysis?.potentialWeaknesses || []).slice(0, 3)
    const resumeReady = isResumeReady(parsedResume)

    return (
        <div className="upload-page">
            <div className="container">
                <header className="upload-header animate-fadeIn">
                    <div className="upload-header-copy">
                        <span className="section-kicker">Build a new session</span>
                        <h1>Turn your resume into a realistic interview round.</h1>
                        <p className="upload-subtitle">
                            We generate role-specific questions from your resume and keep the scoring honest once the interview starts.
                        </p>
                    </div>
                    <ResumeFlowIllustration className="upload-header-visual" />
                </header>

                <div className="upload-content">
                    {(!parsedResume || parsing) && (
                        <div className="upload-panel animate-slideUp">
                            <div className="step-indicator">
                                <span className="step active">1</span>
                                <span className="step-line"></span>
                                <span className="step">2</span>
                                <span className="step-line"></span>
                                <span className="step">3</span>
                            </div>

                            <div className="upload-panel-copy">
                                <span className="section-kicker">Step 1</span>
                                <h2>Upload your resume</h2>
                                <p>Select the version you want to practice from. PDF and Word files up to 5MB are supported.</p>
                            </div>

                            {error && <div className="upload-error">{error}</div>}

                            <div
                                className={`file-upload ${dragOver ? 'dragover' : ''} ${file ? 'has-file' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept=".pdf,.doc,.docx"
                                    hidden
                                />

                                {file ? (
                                    <div className="file-selected">
                                        <span className="upload-icon-shell"><DocumentIcon size={28} /></span>
                                        <span className="file-name">{file.name}</span>
                                        <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </div>
                                ) : (
                                    <>
                                        <span className="upload-icon-shell"><UploadIcon size={28} /></span>
                                        <p className="upload-text">
                                            Drag your resume here or <span>click to browse</span>
                                        </p>
                                        <p className="upload-hint">
                                            Use the version you would actually send to employers.
                                        </p>
                                    </>
                                )}
                            </div>

                            <div className="upload-note">
                                Strong delivery will not rescue weak answers later. The readiness score still depends mostly on content quality.
                            </div>

                            {file && (
                                <button
                                    className="btn btn-primary btn-lg"
                                    onClick={handleUpload}
                                    disabled={uploading}
                                >
                                    {parsing ? (
                                        <>
                                            <span className="spinner" style={{ width: 20, height: 20 }}></span>
                                            Analyzing resume...
                                        </>
                                    ) : (
                                        'Analyze resume'
                                    )}
                                </button>
                            )}
                        </div>
                    )}

                    {resumeReady && !generating && (
                        <div className="parsed-section animate-slideUp">
                            <div className="step-indicator">
                                <span className="step completed"><CheckCircleIcon size={16} /></span>
                                <span className="step-line active"></span>
                                <span className="step active">2</span>
                                <span className="step-line"></span>
                                <span className="step">3</span>
                            </div>

                            <div className="upload-panel-copy">
                                <span className="section-kicker">Step 2</span>
                                <h2>Review the extracted profile</h2>
                                <p>We use this summary to build the question set for your next practice round.</p>
                            </div>

                            <div className="parsed-resume-card">
                                <div className="parsed-header">
                                    <div>
                                        <h3>{parsedResume.personalInfo?.name || 'Your profile'}</h3>
                                        <p>{parsedResume.aiAnalysis?.primaryDomain || 'General practice'}</p>
                                    </div>
                                    <span className="badge badge-primary">
                                        {parsedResume.aiAnalysis?.experienceLevel || 'Professional'}
                                    </span>
                                </div>

                                <div className="parsed-skill-block">
                                    <span className="parsed-label">Key skills</span>
                                    <div className="skill-tags">
                                        {(parsedResume.skills?.technical || []).slice(0, 8).map((skill, i) => (
                                            <span key={i} className="skill-tag">{skill}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="parsed-insights-grid">
                                    <div className="parsed-insight-card">
                                        <span className="parsed-insight-icon"><SparkIcon size={18} /></span>
                                        <div>
                                            <span className="parsed-label">Strong signals</span>
                                            <ul>
                                                {strengths.map((item, index) => <li key={index}>{item}</li>)}
                                                {strengths.length === 0 && <li>No standout strengths were extracted.</li>}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="parsed-insight-card">
                                        <span className="parsed-insight-icon"><DocumentIcon size={18} /></span>
                                        <div>
                                            <span className="parsed-label">Possible weak spots</span>
                                            <ul>
                                                {watchouts.map((item, index) => <li key={index}>{item}</li>)}
                                                {watchouts.length === 0 && <li>No major gaps were highlighted from the resume alone.</li>}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button className="btn btn-primary btn-lg" onClick={handleStartInterview}>
                                Build interview set
                                <ArrowRightIcon size={16} />
                            </button>
                        </div>
                    )}

                    {generating && (
                        <div className="generating-section animate-fadeIn">
                            <div className="step-indicator">
                                <span className="step completed"><CheckCircleIcon size={16} /></span>
                                <span className="step-line active"></span>
                                <span className="step completed"><CheckCircleIcon size={16} /></span>
                                <span className="step-line active"></span>
                                <span className="step active">3</span>
                            </div>

                            <div className="generating-animation">
                                <div className="spinner" style={{ width: 60, height: 60 }}></div>
                                <h2>Building your interview set...</h2>
                                <p>Questions are being tailored to your domain, skill mix, and experience level.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ResumeUploadPage
