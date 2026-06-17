"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCandidateSummary = exports.generateRecommendations = void 0;
const generateRecommendations = (profile, scores, projects, certificates) => {
    const recommendations = [];
    const targetRole = profile.target_role || 'Software Engineer';
    // 1. Resume recommendations
    if (!profile.resume_url) {
        recommendations.push({
            category: 'Resume',
            recommendation: `Upload your resume to calculate your actual Resume score and unlock target role alignment checks for "${targetRole}".`
        });
    }
    else if (scores.categoryScores.resumeScore < 85) {
        recommendations.push({
            category: 'Resume',
            recommendation: `Your resume is uploaded, but your resume score can be improved. Make sure your resume is in PDF format and explicitly matches keywords found in "${targetRole}" job descriptions.`
        });
    }
    // 2. Projects recommendations
    if (projects.length === 0) {
        recommendations.push({
            category: 'Projects',
            recommendation: `You haven't added any projects. Add at least 2 key projects demonstrating practical skills in technologies related to "${targetRole}".`
        });
    }
    else if (projects.length < 3) {
        recommendations.push({
            category: 'Projects',
            recommendation: `You currently have ${projects.length} project(s). Candidates with 3 solid projects show a higher readiness rating. Consider adding a project focused on advanced topics (e.g. state management, system design, or database caching).`
        });
    }
    // Check technologies
    const missingTech = projects.some(p => !p.technologies || p.technologies.trim().length === 0);
    if (missingTech) {
        recommendations.push({
            category: 'Projects',
            recommendation: 'Specify the technologies used for all of your projects. Recruiters filter candidates based on matching tech stacks.'
        });
    }
    // 3. Online Presence recommendations
    if (!profile.github_url || !profile.linkedin_url) {
        const missing = [];
        if (!profile.github_url)
            missing.push('GitHub');
        if (!profile.linkedin_url)
            missing.push('LinkedIn');
        recommendations.push({
            category: 'Online Presence',
            recommendation: `Your online presence score is at ${scores.categoryScores.onlinePresenceScore}%. Please add links to your ${missing.join(' and ')} profile(s) to optimize recruiter visibility.`
        });
    }
    // 4. DSA recommendations
    if (!profile.dsa_included) {
        recommendations.push({
            category: 'DSA & Algorithms',
            recommendation: `Data Structures & Algorithms (DSA) evaluation is currently turned OFF. For top tech roles, enabling the DSA toggle and studying arrays, trees, and system design can boost your overall score and recruiter ranking.`
        });
    }
    else if (scores.categoryScores.dsaScore < 90) {
        recommendations.push({
            category: 'DSA & Algorithms',
            recommendation: 'Your DSA is toggled ON. Continue practicing medium-difficulty problems on Leetcode (specifically Graph algorithms and Dynamic Programming) to push this score to 95+.'
        });
    }
    // 5. Certificates recommendations
    if (certificates.length === 0) {
        recommendations.push({
            category: 'Certifications',
            recommendation: `Add industry-standard certifications (e.g. AWS Cloud, Google Analytics, or React Developer certs) to validate your skills. Candidates with certifications receive 2x more recruiter outreach.`
        });
    }
    // Fallback default recommendation if profile is already very high
    if (recommendations.length === 0) {
        recommendations.push({
            category: 'Next Steps',
            recommendation: `Your readiness profile is stellar! Keep your GitHub active with regular commits, and prepare for behavioral and technical screening rounds.`
        });
    }
    return recommendations;
};
exports.generateRecommendations = generateRecommendations;
const generateCandidateSummary = (profile, scores, projects, certificates) => {
    const name = profile.full_name;
    const role = profile.target_role || 'General Software Engineering';
    const overall = scores.overallScore;
    const strengths = [];
    const weaknesses = [];
    let verdict = 'Interview';
    // Evaluate Strengths & Weaknesses
    if (scores.categoryScores.resumeScore >= 85)
        strengths.push('Strong resume format and structure');
    if (projects.length >= 2)
        strengths.push(`Proven practical project implementation (${projects.length} projects listed)`);
    if (scores.categoryScores.onlinePresenceScore === 100)
        strengths.push('Excellent online footprint with GitHub and LinkedIn both present');
    if (certificates.length >= 2)
        strengths.push(`Multiple professional certifications (${certificates.length})`);
    if (profile.dsa_included && scores.categoryScores.dsaScore >= 80)
        strengths.push('DSA preparation is active and verified');
    if (!profile.resume_url)
        weaknesses.push('Resume upload is missing');
    if (projects.length < 2)
        weaknesses.push('Limited project repository (needs more complex build examples)');
    if (!profile.github_url || !profile.linkedin_url)
        weaknesses.push('Incomplete professional networks (GitHub/LinkedIn missing)');
    if (!profile.dsa_included)
        weaknesses.push('No formal DSA preparation declared');
    // Verdict logic
    if (overall >= 85 && projects.length >= 2 && profile.resume_url) {
        verdict = 'Strong Hire';
    }
    else if (overall >= 60) {
        verdict = 'Interview';
    }
    else {
        verdict = 'Keep on File';
    }
    // Generate detailed summary text
    let summary = `${name} shows a job readiness level of ${overall}% for the role of ${role}. `;
    if (verdict === 'Strong Hire') {
        summary += `They possess a highly complete profile with strong evidence of technical proficiency through multiple projects (${projects.map(p => p.title).join(', ')}) and structured certifications. Highly recommended for immediate technical assessment.`;
    }
    else if (verdict === 'Interview') {
        summary += `The candidate has a solid foundation, especially in ${scores.categoryScores.projectsScore >= 70 ? 'practical project work' : 'overall credentials'}. However, they would benefit from ${weaknesses.length > 0 ? weaknesses[0].toLowerCase() : 'expanding their profile details'}. Recommend moving forward with an initial screening round.`;
    }
    else {
        summary += `The candidate's profile is currently underdeveloped for this target role. There is a lack of primary components such as a resume or active coding project. Recommend keeping them on file until updates are posted.`;
    }
    return {
        summary,
        strengths: strengths.length > 0 ? strengths : ['Basic profile info submitted'],
        weaknesses: weaknesses.length > 0 ? weaknesses : ['No critical improvements pending'],
        verdict
    };
};
exports.generateCandidateSummary = generateCandidateSummary;
