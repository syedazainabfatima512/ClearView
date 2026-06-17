/**
 * ============================================
 * RESUME CONTROLLER - Handles Resume Operations
 * ============================================
 *
 * Upload returns quickly with local extracted data, then NVIDIA NIM
 * enrichment runs in the background with a strict timeout.
 */

const Resume = require('../models/Resume');
const resumeService = require('../services/resume.service');

const formatResume = (resume) => ({
    id: resume._id,
    fileName: resume.originalFileName,
    status: resume.parsingStatus,
    parsingStatus: resume.parsingStatus,
    parsingSource: resume.parsingSource,
    parsingError: resume.parsingError,
    personalInfo: resume.personalInfo,
    skills: resume.skills,
    experience: resume.experience?.length || 0,
    education: resume.education?.length || 0,
    projects: resume.projects?.length || 0,
    aiAnalysis: resume.aiAnalysis,
    parsedAt: resume.parsedAt,
    uploadedAt: resume.createdAt
});

const queueBackgroundTask = (label, task) => {
    setImmediate(() => {
        task().catch((error) => {
            console.error(`${label} failed:`, error);
        });
    });
};

const enrichResumeInBackground = async (resumeId, rawText, localData) => {
    const resume = await Resume.findById(resumeId);
    if (!resume) return;

    try {
        const parsedData = await resumeService.parseResumeTextWithAi(rawText, localData);

        resume.set({
            ...parsedData,
            parsingStatus: 'completed',
            parsingSource: 'ai',
            parsingError: '',
            parsedAt: new Date()
        });

        await resume.save();
        console.log(`Resume AI enrichment completed: ${resume._id}`);
    } catch (error) {
        resume.parsingStatus = 'partial';
        resume.parsingSource = 'local_fallback';
        resume.parsingError = error.message || 'AI parsing timed out. Local resume data was saved instead.';
        resume.parsedAt = new Date();
        await resume.save();
        console.warn(`Resume AI enrichment fell back to local data: ${resume._id}`);
    }
};

const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded. Please upload a PDF or Word document.'
            });
        }

        const { buffer, mimetype, originalname } = req.file;
        console.log(`Processing resume upload: ${originalname}`);

        const rawText = await resumeService.extractText(buffer, mimetype);

        if (!rawText || rawText.trim().length < 50) {
            return res.status(400).json({
                success: false,
                message: 'Could not extract enough text from resume. Please ensure the file is not empty or corrupted.'
            });
        }

        const localData = resumeService.parseLocalResume(rawText);
        const resume = new Resume({
            userId: req.user._id,
            originalFileName: originalname,
            ...localData,
            parsingStatus: 'processing',
            parsingSource: 'local'
        });

        await resume.save();

        queueBackgroundTask('resume AI enrichment', () =>
            enrichResumeInBackground(resume._id, rawText, localData)
        );

        res.status(202).json({
            success: true,
            message: 'Resume uploaded. AI enrichment is running in the background.',
            resumeId: resume._id,
            status: resume.parsingStatus,
            resume: formatResume(resume)
        });
    } catch (error) {
        console.error('Resume upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload resume. Please try again.',
            error: error.message
        });
    }
};

const getResume = async (req, res) => {
    try {
        const resume = await Resume.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        res.json({
            success: true,
            status: resume.parsingStatus,
            resume: formatResume(resume)
        });
    } catch (error) {
        console.error('Get resume error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get resume',
            error: error.message
        });
    }
};

const getAllResumes = async (req, res) => {
    try {
        const resumes = await Resume.find({ userId: req.user._id })
            .select('originalFileName personalInfo.name aiAnalysis.primaryDomain aiAnalysis.experienceLevel parsingStatus parsingSource createdAt')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: resumes.length,
            resumes: resumes.map((resume) => ({
                id: resume._id,
                fileName: resume.originalFileName,
                name: resume.personalInfo?.name || 'Unknown',
                domain: resume.aiAnalysis?.primaryDomain || 'Not specified',
                level: resume.aiAnalysis?.experienceLevel || 'Not specified',
                status: resume.parsingStatus,
                parsingStatus: resume.parsingStatus,
                parsingSource: resume.parsingSource,
                uploadedAt: resume.createdAt
            }))
        });
    } catch (error) {
        console.error('Get all resumes error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get resumes',
            error: error.message
        });
    }
};

const deleteResume = async (req, res) => {
    try {
        const result = await Resume.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        res.json({
            success: true,
            message: 'Resume deleted successfully'
        });
    } catch (error) {
        console.error('Delete resume error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete resume',
            error: error.message
        });
    }
};

module.exports = {
    uploadResume,
    getResume,
    getAllResumes,
    deleteResume
};
