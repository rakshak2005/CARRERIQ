"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recalculateStudentProfile = void 0;
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const scoreEngine_1 = require("../services/scoreEngine");
const aiService_1 = require("../services/aiService");
const router = (0, express_1.Router)();
// Helper to recalculate scores & AI recommendations
const recalculateStudentProfile = async (studentId) => {
    const profile = await db_1.db.getStudentProfileById(studentId);
    if (!profile)
        throw new Error('Student profile not found');
    const projects = await db_1.db.getProjectsByStudentId(studentId);
    const certificates = await db_1.db.getCertificatesByStudentId(studentId);
    // Compute scores
    const scoreInput = {
        targetRole: profile.target_role,
        resumeUrl: profile.resume_url,
        githubUrl: profile.github_url,
        linkedinUrl: profile.linkedin_url,
        dsaIncluded: profile.dsa_included,
        projects,
        certificates,
    };
    const scores = (0, scoreEngine_1.calculateScores)(scoreInput);
    // Update scores in db
    await db_1.db.updateStudentScore(studentId, scores.overallScore, {
        resumeScore: scores.categoryScores.resumeScore,
        projectsScore: scores.categoryScores.projectsScore,
        experienceScore: scores.categoryScores.experienceScore,
        onlinePresenceScore: scores.categoryScores.onlinePresenceScore,
        dsaScore: scores.categoryScores.dsaScore,
    });
    // Generate recommendations
    const recommendations = (0, aiService_1.generateRecommendations)(profile, scores, projects, certificates);
    // Save recommendations
    await db_1.db.createRecommendations(studentId, recommendations);
    return {
        profile: { ...profile, overall_score: scores.overallScore },
        projects,
        certificates,
        scores: scores.categoryScores,
        overallScore: scores.overallScore,
        recommendations
    };
};
exports.recalculateStudentProfile = recalculateStudentProfile;
// GET /api/student/profile - Get profile dashboard details
router.get('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'student') {
            return res.status(403).json({ error: 'Requires student role' });
        }
        let profile = await db_1.db.getStudentProfileByUserId(req.user.id);
        // If profile doesn't exist, return empty template but don't error out
        if (!profile) {
            return res.json({
                profile: null,
                projects: [],
                certificates: [],
                scores: { resumeScore: 0, projectsScore: 0, experienceScore: 0, onlinePresenceScore: 0, dsaScore: 0 },
                overallScore: 0,
                recommendations: []
            });
        }
        const details = await (0, exports.recalculateStudentProfile)(profile.id);
        res.json(details);
    }
    catch (error) {
        console.error('Error fetching student profile:', error);
        res.status(500).json({ error: 'Server error fetching profile details' });
    }
});
// POST /api/student/profile - Create or update profile metadata
router.post('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'student') {
            return res.status(403).json({ error: 'Requires student role' });
        }
        const { fullName, targetRole, githubUrl, linkedinUrl, dsaIncluded } = req.body;
        if (!fullName) {
            return res.status(400).json({ error: 'Full name is required' });
        }
        // Save profile metadata (keep existing resumeUrl)
        const profile = await db_1.db.createOrUpdateStudentProfile(req.user.id, fullName, targetRole || null, githubUrl || '', linkedinUrl || '', dsaIncluded || false);
        // Recalculate
        const details = await (0, exports.recalculateStudentProfile)(profile.id);
        res.json({
            message: 'Profile updated successfully',
            ...details
        });
    }
    catch (error) {
        console.error('Error updating student profile:', error);
        res.status(500).json({ error: 'Server error updating profile details' });
    }
});
// POST /api/student/upload-resume - Upload resume file
router.post('/upload-resume', auth_1.authenticateToken, upload_1.upload.single('resume'), async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'student') {
            return res.status(403).json({ error: 'Requires student role' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        // Relative path to store in db
        const resumeUrl = `uploads/${req.file.filename}`;
        // Find or create profile to associate with
        let profile = await db_1.db.getStudentProfileByUserId(req.user.id);
        if (!profile) {
            // Create a default empty profile to link the resume to
            profile = await db_1.db.createOrUpdateStudentProfile(req.user.id, 'Anonymous Candidate', '', '', '', false, resumeUrl);
        }
        else {
            // Update existing profile's resume
            profile = await db_1.db.createOrUpdateStudentProfile(req.user.id, profile.full_name, profile.target_role, profile.github_url, profile.linkedin_url, profile.dsa_included, resumeUrl);
        }
        // Recalculate
        const details = await (0, exports.recalculateStudentProfile)(profile.id);
        res.json({
            message: 'Resume uploaded successfully',
            resumeUrl,
            ...details
        });
    }
    catch (error) {
        console.error('Error uploading resume:', error);
        res.status(500).json({ error: error.message || 'Server error uploading resume' });
    }
});
// POST /api/student/projects - Add a new project
router.post('/projects', auth_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'student') {
            return res.status(403).json({ error: 'Requires student role' });
        }
        const { title, description, technologies, projectUrl } = req.body;
        if (!title) {
            return res.status(400).json({ error: 'Project title is required' });
        }
        // Get student profile
        let profile = await db_1.db.getStudentProfileByUserId(req.user.id);
        if (!profile) {
            profile = await db_1.db.createOrUpdateStudentProfile(req.user.id, 'Anonymous Candidate', '', '', '', false);
        }
        // Add project
        await db_1.db.addProject(profile.id, title, description || '', technologies || '', projectUrl || '');
        // Recalculate
        const details = await (0, exports.recalculateStudentProfile)(profile.id);
        res.status(201).json({
            message: 'Project added successfully',
            ...details
        });
    }
    catch (error) {
        console.error('Error adding project:', error);
        res.status(500).json({ error: 'Server error adding project' });
    }
});
// DELETE /api/student/projects/:id - Remove a project
router.delete('/projects/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'student') {
            return res.status(403).json({ error: 'Requires student role' });
        }
        const projectId = parseInt(req.params.id);
        const profile = await db_1.db.getStudentProfileByUserId(req.user.id);
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        const deleted = await db_1.db.deleteProject(projectId, profile.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Project not found or not owned by this candidate' });
        }
        // Recalculate
        const details = await (0, exports.recalculateStudentProfile)(profile.id);
        res.json({
            message: 'Project deleted successfully',
            ...details
        });
    }
    catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Server error deleting project' });
    }
});
// POST /api/student/certificates - Add a certificate
router.post('/certificates', auth_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'student') {
            return res.status(403).json({ error: 'Requires student role' });
        }
        const { name, issuer, issueDate, credentialUrl } = req.body;
        if (!name || !issuer) {
            return res.status(400).json({ error: 'Certificate name and issuer are required' });
        }
        // Get student profile
        let profile = await db_1.db.getStudentProfileByUserId(req.user.id);
        if (!profile) {
            profile = await db_1.db.createOrUpdateStudentProfile(req.user.id, 'Anonymous Candidate', '', '', '', false);
        }
        // Add certificate
        await db_1.db.addCertificate(profile.id, name, issuer, issueDate || '', credentialUrl || '');
        // Recalculate
        const details = await (0, exports.recalculateStudentProfile)(profile.id);
        res.status(201).json({
            message: 'Certificate added successfully',
            ...details
        });
    }
    catch (error) {
        console.error('Error adding certificate:', error);
        res.status(500).json({ error: 'Server error adding certificate' });
    }
});
// DELETE /api/student/certificates/:id - Remove a certificate
router.delete('/certificates/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'student') {
            return res.status(403).json({ error: 'Requires student role' });
        }
        const certId = parseInt(req.params.id);
        const profile = await db_1.db.getStudentProfileByUserId(req.user.id);
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        const deleted = await db_1.db.deleteCertificate(certId, profile.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Certificate not found or not owned by this candidate' });
        }
        // Recalculate
        const details = await (0, exports.recalculateStudentProfile)(profile.id);
        res.json({
            message: 'Certificate deleted successfully',
            ...details
        });
    }
    catch (error) {
        console.error('Error deleting certificate:', error);
        res.status(500).json({ error: 'Server error deleting certificate' });
    }
});
exports.default = router;
