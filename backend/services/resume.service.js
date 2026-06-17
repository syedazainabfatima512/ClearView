/**
 * ============================================
 * RESUME SERVICE - Handles Resume Processing
 * ============================================
 *
 * Extracts local text immediately, builds a useful local profile,
 * and optionally enriches it with bounded NVIDIA NIM parsing.
 */

const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const llmService = require('./llm.service');

const TECH_SKILLS = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB',
    'SQL', 'MySQL', 'PostgreSQL', 'Python', 'Django', 'Flask', 'Java',
    'Spring', 'C++', 'C#', '.NET', 'PHP', 'Laravel', 'HTML', 'CSS',
    'Tailwind', 'Bootstrap', 'Redux', 'Next.js', 'Vue', 'Angular', 'REST',
    'GraphQL', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git',
    'Linux', 'Machine Learning', 'Data Analysis', 'TensorFlow', 'PyTorch',
    'Pandas', 'NumPy', 'Firebase', 'Figma', 'Jira'
];

const SOFT_SKILLS = [
    'Communication', 'Leadership', 'Problem Solving', 'Teamwork',
    'Collaboration', 'Time Management', 'Critical Thinking',
    'Adaptability', 'Presentation', 'Mentoring'
];

const LANGUAGES = [
    'English', 'Urdu', 'Arabic', 'French', 'Spanish', 'German', 'Chinese',
    'Hindi', 'Punjabi'
];

class ResumeService {
    async extractText(fileBuffer, mimeType) {
        try {
            if (mimeType === 'application/pdf') {
                const data = await pdfParse(fileBuffer);
                return data.text;
            }

            if (
                mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                mimeType === 'application/msword'
            ) {
                const result = await mammoth.extractRawText({ buffer: fileBuffer });
                return result.value;
            }

            throw new Error('Unsupported file type');
        } catch (error) {
            console.error('Text extraction error:', error);
            throw new Error(`Failed to extract text from file: ${error.message}`);
        }
    }

    normalizeText(text) {
        return String(text || '')
            .replace(/\r/g, '\n')
            .replace(/[ \t]+/g, ' ')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    getLines(text) {
        return this.normalizeText(text)
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);
    }

    findFirstMatch(text, regex) {
        const match = String(text || '').match(regex);
        return match ? match[0].trim() : '';
    }

    extractName(lines) {
        const blocked = /(resume|curriculum|vitae|email|phone|linkedin|github|portfolio|address|summary|objective|experience|education|skills)/i;
        const candidate = lines.find((line) => {
            const clean = line.replace(/[|,]/g, ' ').trim();
            const words = clean.split(/\s+/).filter(Boolean);
            return clean.length >= 3 &&
                clean.length <= 60 &&
                words.length <= 5 &&
                !blocked.test(clean) &&
                !/@|https?:|www\.|\d{3,}/i.test(clean);
        });

        return candidate || '';
    }

    extractKnownItems(text, knownItems) {
        const lower = text.toLowerCase();
        return knownItems.filter((item) => {
            const pattern = new RegExp(`(^|[^a-z0-9+#.])${item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').toLowerCase()}([^a-z0-9+#.]|$)`, 'i');
            return pattern.test(lower);
        });
    }

    inferDomain(skills) {
        const lower = skills.map((skill) => skill.toLowerCase());

        if (lower.some((skill) => ['react', 'vue', 'angular', 'html', 'css', 'next.js'].includes(skill))) {
            return 'Frontend Development';
        }
        if (lower.some((skill) => ['node.js', 'express', 'django', 'flask', 'spring', '.net'].includes(skill))) {
            return 'Backend Development';
        }
        if (lower.some((skill) => ['machine learning', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'data analysis'].includes(skill))) {
            return 'Data Science';
        }
        if (lower.some((skill) => ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'linux'].includes(skill))) {
            return 'Cloud or DevOps';
        }

        return skills.length > 0 ? 'Software Development' : 'General Practice';
    }

    inferExperienceLevel(text) {
        const normalized = text.toLowerCase();
        const yearMatches = [...normalized.matchAll(/(\d+)\+?\s*(?:years|yrs)/g)]
            .map((match) => Number(match[1]))
            .filter(Number.isFinite);
        const maxYears = yearMatches.length > 0 ? Math.max(...yearMatches) : 0;

        if (/\b(senior|lead|principal|manager|architect)\b/.test(normalized) || maxYears >= 6) {
            return 'Senior';
        }
        if (/\b(intern|trainee|fresh|entry level|junior)\b/.test(normalized) || (yearMatches.length > 0 && maxYears <= 1)) {
            return 'Entry';
        }
        return 'Mid';
    }

    extractSection(text, sectionName, maxChars = 700) {
        const escaped = sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`${escaped}\\s*[:\\n]([\\s\\S]{0,${maxChars}}?)(?:\\n\\s*(?:experience|education|skills|projects|certifications|summary|objective)\\b|$)`, 'i');
        const match = text.match(regex);
        return match ? this.normalizeText(match[1]).slice(0, maxChars) : '';
    }

    parseLocalResume(rawText) {
        const text = this.normalizeText(rawText);
        const lines = this.getLines(text);
        const email = this.findFirstMatch(text, /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
        const phone = this.findFirstMatch(text, /(?:\+?\d[\d\s().-]{7,}\d)/);
        const linkedin = this.findFirstMatch(text, /https?:\/\/(?:www\.)?linkedin\.com\/[^\s]+/i);
        const github = this.findFirstMatch(text, /https?:\/\/(?:www\.)?github\.com\/[^\s]+/i);
        const portfolio = this.findFirstMatch(text, /https?:\/\/(?!.*(?:linkedin|github))[^\s]+/i);
        const technical = this.extractKnownItems(text, TECH_SKILLS);
        const soft = this.extractKnownItems(text, SOFT_SKILLS);
        const languages = this.extractKnownItems(text, LANGUAGES);
        const tools = technical.filter((skill) => ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'Linux', 'Firebase', 'Figma', 'Jira'].includes(skill));
        const primaryDomain = this.inferDomain(technical);
        const summary = this.extractSection(text, 'summary', 450) ||
            this.extractSection(text, 'objective', 450) ||
            lines.slice(1, 5).join(' ').slice(0, 450);

        return {
            personalInfo: {
                name: this.extractName(lines),
                email,
                phone,
                location: '',
                linkedin,
                github,
                portfolio
            },
            summary,
            skills: {
                technical,
                soft,
                tools,
                languages
            },
            experience: [],
            education: [],
            projects: [],
            certifications: [],
            aiAnalysis: {
                primaryDomain,
                experienceLevel: this.inferExperienceLevel(text),
                keyStrengths: technical.slice(0, 4).map((skill) => `Resume mentions ${skill}.`),
                potentialWeaknesses: [],
                suggestedQuestionTopics: technical.slice(0, 8)
            }
        };
    }

    chooseString(primary, fallback) {
        return typeof primary === 'string' && primary.trim() ? primary.trim() : (fallback || '');
    }

    chooseArray(primary, fallback) {
        if (Array.isArray(primary) && primary.length > 0) {
            return [...new Set(primary.filter(Boolean))];
        }
        return Array.isArray(fallback) ? [...new Set(fallback.filter(Boolean))] : [];
    }

    mergeParsedData(localData, aiData) {
        const local = localData || {};
        const ai = aiData || {};

        return {
            personalInfo: {
                name: this.chooseString(ai.personalInfo?.name, local.personalInfo?.name),
                email: this.chooseString(ai.personalInfo?.email, local.personalInfo?.email),
                phone: this.chooseString(ai.personalInfo?.phone, local.personalInfo?.phone),
                location: this.chooseString(ai.personalInfo?.location, local.personalInfo?.location),
                linkedin: this.chooseString(ai.personalInfo?.linkedin, local.personalInfo?.linkedin),
                github: this.chooseString(ai.personalInfo?.github, local.personalInfo?.github),
                portfolio: this.chooseString(ai.personalInfo?.portfolio, local.personalInfo?.portfolio)
            },
            summary: this.chooseString(ai.summary, local.summary),
            skills: {
                technical: this.chooseArray(ai.skills?.technical, local.skills?.technical),
                soft: this.chooseArray(ai.skills?.soft, local.skills?.soft),
                tools: this.chooseArray(ai.skills?.tools, local.skills?.tools),
                languages: this.chooseArray(ai.skills?.languages, local.skills?.languages)
            },
            experience: this.chooseArray(ai.experience, local.experience),
            education: this.chooseArray(ai.education, local.education),
            projects: this.chooseArray(ai.projects, local.projects),
            certifications: this.chooseArray(ai.certifications, local.certifications),
            aiAnalysis: {
                primaryDomain: this.chooseString(ai.aiAnalysis?.primaryDomain, local.aiAnalysis?.primaryDomain),
                experienceLevel: this.chooseString(ai.aiAnalysis?.experienceLevel, local.aiAnalysis?.experienceLevel),
                keyStrengths: this.chooseArray(ai.aiAnalysis?.keyStrengths, local.aiAnalysis?.keyStrengths),
                potentialWeaknesses: this.chooseArray(ai.aiAnalysis?.potentialWeaknesses, local.aiAnalysis?.potentialWeaknesses),
                suggestedQuestionTopics: this.chooseArray(ai.aiAnalysis?.suggestedQuestionTopics, local.aiAnalysis?.suggestedQuestionTopics)
            }
        };
    }

    async parseResumeTextWithAi(rawText, localData) {
        const aiData = await llmService.parseResume(rawText);
        return this.mergeParsedData(localData, aiData);
    }

    async parseResume(fileBuffer, mimeType) {
        const rawText = await this.extractText(fileBuffer, mimeType);

        if (!rawText || rawText.trim().length < 50) {
            throw new Error('Could not extract enough text from resume. Please ensure the file is not empty or corrupted.');
        }

        const localData = this.parseLocalResume(rawText);
        return this.parseResumeTextWithAi(rawText, localData);
    }
}

module.exports = new ResumeService();
