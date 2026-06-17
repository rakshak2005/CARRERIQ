"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateScores = void 0;
const calculateScores = (input) => {
    // 1. Resume Score (0-100)
    let resumeScore = 0;
    if (input.resumeUrl) {
        resumeScore = 75; // Base for upload
        if (input.resumeUrl.endsWith('.pdf')) {
            resumeScore += 15; // PDF bonus
        }
        else {
            resumeScore += 10;
        }
        if (input.targetRole && input.targetRole.length > 3) {
            resumeScore += 10; // Profile aligned
        }
    }
    resumeScore = Math.min(100, resumeScore);
    // 2. Projects Score (0-100)
    let projectsScore = 0;
    const projectCount = input.projects.length;
    if (projectCount > 0) {
        projectsScore = Math.min(100, projectCount * 30); // 30 points per project
        // Tech stack bonus
        const allHaveTech = input.projects.every(p => p.technologies && p.technologies.trim().length > 0);
        if (allHaveTech && projectCount >= 2) {
            projectsScore += 10;
        }
    }
    projectsScore = Math.min(100, projectsScore);
    // 3. Experience Score (Proxy based on Certificates and completeness)
    let experienceScore = 0;
    const certCount = input.certificates.length;
    if (certCount > 0) {
        experienceScore = Math.min(100, 50 + (certCount * 15)); // Starts at 50, +15 per certificate
    }
    else {
        // If no certificates, give a base score based on project complexity
        experienceScore = Math.min(100, projectCount * 20);
    }
    if (input.targetRole) {
        experienceScore += 10;
    }
    experienceScore = Math.min(100, experienceScore);
    // 4. Online Presence Score (0-100)
    let onlinePresenceScore = 0;
    if (input.githubUrl && input.githubUrl.trim().length > 0) {
        onlinePresenceScore += 50;
    }
    if (input.linkedinUrl && input.linkedinUrl.trim().length > 0) {
        onlinePresenceScore += 50;
    }
    // 5. DSA Score (0-100)
    let dsaScore = 0;
    if (input.dsaIncluded) {
        dsaScore = 80; // Base score when enabled
        if (input.githubUrl) {
            dsaScore += 10; // GitHub linked bonus
        }
        if (projectCount >= 2) {
            dsaScore += 10; // Complex projects build algorithms bonus
        }
    }
    else {
        dsaScore = 0; // Excluded/Not included
    }
    dsaScore = Math.min(100, dsaScore);
    // 6. Overall Weighted Score (0-100)
    let overallScore = 0;
    if (input.dsaIncluded) {
        // DSA is included in weights
        // Resume: 20%, Projects: 25%, Experience: 20%, Online Presence: 15%, DSA: 20%
        overallScore = Math.round((resumeScore * 0.20) +
            (projectsScore * 0.25) +
            (experienceScore * 0.20) +
            (onlinePresenceScore * 0.15) +
            (dsaScore * 0.20));
    }
    else {
        // DSA is NOT included in weights, redistribute the 20% of DSA to others
        // Resume: 25%, Projects: 35%, Experience: 25%, Online Presence: 15%
        overallScore = Math.round((resumeScore * 0.25) +
            (projectsScore * 0.35) +
            (experienceScore * 0.25) +
            (onlinePresenceScore * 0.15));
    }
    return {
        overallScore: Math.min(100, Math.max(0, overallScore)),
        categoryScores: {
            resumeScore,
            projectsScore,
            experienceScore,
            onlinePresenceScore,
            dsaScore
        }
    };
};
exports.calculateScores = calculateScores;
