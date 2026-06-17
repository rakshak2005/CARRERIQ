"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const aiService_1 = require("../services/aiService");
const router = (0, express_1.Router)();
// GET /api/recruiter/candidates - Search, filter, and rank all candidates
router.get('/candidates', auth_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'recruiter') {
            return res.status(403).json({ error: 'Requires recruiter role' });
        }
        const { search, targetRole, minScore, dsaRequired } = req.query;
        const filters = {
            search: search ? String(search) : undefined,
            targetRole: targetRole ? String(targetRole) : undefined,
            minScore: minScore ? parseInt(String(minScore)) : undefined,
            dsaRequired: dsaRequired === 'true'
        };
        const candidates = await db_1.db.getAllCandidates(filters);
        res.json(candidates);
    }
    catch (error) {
        console.error('Error fetching candidates:', error);
        res.status(500).json({ error: 'Server error fetching candidates' });
    }
});
// GET /api/recruiter/candidates/:id - Get full breakdown and AI candidate summary
router.get('/candidates/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'recruiter') {
            return res.status(403).json({ error: 'Requires recruiter role' });
        }
        const studentId = parseInt(req.params.id);
        const details = await db_1.db.getCandidateDetail(studentId);
        if (!details) {
            return res.status(404).json({ error: 'Candidate profile not found' });
        }
        // Re-pack category scores in the format expected by score calculator
        const mockScoreInput = {
            targetRole: details.profile.target_role,
            resumeUrl: details.profile.resume_url,
            githubUrl: details.profile.github_url,
            linkedinUrl: details.profile.linkedin_url,
            dsaIncluded: details.profile.dsa_included,
            projects: details.projects,
            certificates: details.certificates
        };
        // Calculate score
        const scoreOutput = {
            overallScore: details.profile.overall_score,
            categoryScores: {
                resumeScore: details.categoryScores?.resume_score || 0,
                projectsScore: details.categoryScores?.projects_score || 0,
                experienceScore: details.categoryScores?.experience_score || 0,
                onlinePresenceScore: details.categoryScores?.online_presence_score || 0,
                dsaScore: details.categoryScores?.dsa_score || 0
            }
        };
        // Generate AI Summary
        const aiSummary = (0, aiService_1.generateCandidateSummary)(details.profile, scoreOutput, details.projects, details.certificates);
        res.json({
            ...details,
            aiSummary
        });
    }
    catch (error) {
        console.error('Error fetching candidate detail:', error);
        res.status(500).json({ error: 'Server error fetching candidate details' });
    }
});
// POST /api/recruiter/profile - Save or update company profile
router.post('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'recruiter') {
            return res.status(403).json({ error: 'Requires recruiter role' });
        }
        const { fullName, companyName, companyWebsite, industry } = req.body;
        if (!fullName || !companyName) {
            return res.status(400).json({ error: 'Full name and company name are required' });
        }
        const profile = await db_1.db.createOrUpdateRecruiterProfile(req.user.id, fullName, companyName, companyWebsite || '', industry || '');
        res.json({
            message: 'Recruiter profile updated successfully',
            profile
        });
    }
    catch (error) {
        console.error('Error updating recruiter profile:', error);
        res.status(500).json({ error: 'Server error updating recruiter profile' });
    }
});
// GET /api/recruiter/profile - Get current recruiter profile
router.get('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'recruiter') {
            return res.status(403).json({ error: 'Requires recruiter role' });
        }
        const profile = await db_1.db.getRecruiterProfileByUserId(req.user.id);
        res.json(profile);
    }
    catch (error) {
        console.error('Error fetching recruiter profile:', error);
        res.status(500).json({ error: 'Server error fetching recruiter profile' });
    }
});
exports.default = router;
