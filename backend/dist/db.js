"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let useMockDb = false;
let pool = null;
// Mock database storage
const mockDb = {
    users: [],
    studentProfiles: [],
    recruiterProfiles: [],
    projects: [],
    certificates: [],
    categoryScores: [],
    aiRecommendations: [],
    userIdCounter: 1,
    profileIdCounter: 1,
    recruiterIdCounter: 1,
    projectIdCounter: 1,
    certificateIdCounter: 1,
    categoryScoreIdCounter: 1,
    aiRecommendationIdCounter: 1,
};
// Seed mock data for easy initial recruiter view
const seedMockData = () => {
    console.log('[INFO] Seeding in-memory database with test candidates...');
    // Create 3 students
    const students = [
        { email: 'alex.coder@example.com', name: 'Alex Rivera', role: 'student', password: 'password123' },
        { email: 'sarah.ds@example.com', name: 'Sarah Chen', role: 'student', password: 'password123' },
        { email: 'mark.dev@example.com', name: 'Mark Johnson', role: 'student', password: 'password123' }
    ];
    students.forEach((s, idx) => {
        const userId = mockDb.userIdCounter++;
        mockDb.users.push({
            id: userId,
            email: s.email,
            password_hash: '$2a$10$7c6cW3kdXpxqeeETFTLLeeBatM9WupFutOccf2HX1zkTTwJeX779.', // mock hash
            role: s.role,
            created_at: new Date()
        });
        const profileId = mockDb.profileIdCounter++;
        const targetRoles = ['Frontend Engineer', 'Data Scientist', 'Fullstack Developer'];
        const resumes = ['uploads/alex_resume.pdf', 'uploads/sarah_resume.pdf', 'uploads/mark_resume.pdf'];
        const githubs = ['https://github.com/alexrivera', 'https://github.com/sarahchen-ds', 'https://github.com/markjohnson-dev'];
        const linkedins = ['https://linkedin.com/in/alexrivera', 'https://linkedin.com/in/sarahchen-ds', 'https://linkedin.com/in/markjohnson-dev'];
        mockDb.studentProfiles.push({
            id: profileId,
            user_id: userId,
            full_name: s.name,
            target_role: targetRoles[idx],
            resume_url: resumes[idx],
            github_url: githubs[idx],
            linkedin_url: linkedins[idx],
            dsa_included: idx !== 0, // alex false, others true
            overall_score: idx === 0 ? 82 : idx === 1 ? 94 : 70,
            created_at: new Date()
        });
        // Add projects
        if (idx === 0) {
            mockDb.projects.push({ id: mockDb.projectIdCounter++, student_id: profileId, title: 'Portfolio Website', description: 'Personal portfolio with sleek transitions and responsive layout', technologies: 'React, CSS Grid, Framer Motion', project_url: 'https://alexrivera.dev' });
            mockDb.projects.push({ id: mockDb.projectIdCounter++, student_id: profileId, title: 'E-commerce UI', description: 'Product grid with search and shopping cart functionality', technologies: 'React, Redux, Vanilla CSS', project_url: 'https://shop-alex.dev' });
        }
        else if (idx === 1) {
            mockDb.projects.push({ id: mockDb.projectIdCounter++, student_id: profileId, title: 'Predictive Analytics Dashboard', description: 'Machine learning model dashboard displaying user churn forecasts', technologies: 'Python, Flask, React, ChartJS', project_url: 'https://churn-predict.ai' });
        }
        else {
            mockDb.projects.push({ id: mockDb.projectIdCounter++, student_id: profileId, title: 'Task Manager API', description: 'RESTful API with user authentication and task CRUD operations', technologies: 'Node.js, Express, MongoDB', project_url: 'https://github.com/markjohnson-dev/task-api' });
        }
        // Add certificates
        if (idx === 0) {
            mockDb.certificates.push({ id: mockDb.certificateIdCounter++, student_id: profileId, name: 'Advanced CSS and Sass', issuer: 'Udemy', issue_date: '2025-10', credential_url: 'https://udemy.com/cert/123' });
        }
        else if (idx === 1) {
            mockDb.certificates.push({ id: mockDb.certificateIdCounter++, student_id: profileId, name: 'Google Data Analytics Professional Certificate', issuer: 'Coursera', issue_date: '2025-12', credential_url: 'https://coursera.org/cert/456' });
            mockDb.certificates.push({ id: mockDb.certificateIdCounter++, student_id: profileId, name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', issue_date: '2026-02', credential_url: 'https://aws.amazon.com/cert/789' });
        }
        // Add scores
        const categoryScores = idx === 0 ?
            { id: mockDb.categoryScoreIdCounter++, student_id: profileId, resume_score: 85, projects_score: 80, experience_score: 75, online_presence_score: 90, dsa_score: 0 } :
            idx === 1 ?
                { id: mockDb.categoryScoreIdCounter++, student_id: profileId, resume_score: 95, projects_score: 90, experience_score: 90, online_presence_score: 95, dsa_score: 92 } :
                { id: mockDb.categoryScoreIdCounter++, student_id: profileId, resume_score: 70, projects_score: 65, experience_score: 60, online_presence_score: 80, dsa_score: 75 };
        mockDb.categoryScores.push(categoryScores);
        // Add AI recommendations
        if (idx === 0) {
            mockDb.aiRecommendations.push({ id: mockDb.aiRecommendationIdCounter++, student_id: profileId, category: 'Projects', recommendation: 'Your UI projects look great! Adding a full-stack project with backend integration (e.g. Node.js + DB) would make your profile more competitive.' });
            mockDb.aiRecommendations.push({ id: mockDb.aiRecommendationIdCounter++, student_id: profileId, category: 'DSA', recommendation: 'DSA is currently toggled OFF. For top tier engineering roles, solidifying core algorithms and toggling DSA ON is highly recommended.' });
        }
        else if (idx === 1) {
            mockDb.aiRecommendations.push({ id: mockDb.aiRecommendationIdCounter++, student_id: profileId, category: 'General', recommendation: 'Excellent profile alignment. Resume score is 95% and online presence is strong. You are ready to apply for junior/mid-level Data Scientist roles.' });
        }
        else {
            mockDb.aiRecommendations.push({ id: mockDb.aiRecommendationIdCounter++, student_id: profileId, category: 'Resume', recommendation: 'Consider tailoring your resume to emphasize specific Node.js and REST API projects. Elaborate on tech stacks used in bullet points.' });
            mockDb.aiRecommendations.push({ id: mockDb.aiRecommendationIdCounter++, student_id: profileId, category: 'Online Presence', recommendation: 'Link your LinkedIn profile to expand recruiter reach. Adding certifications in backend technologies would also help.' });
        }
    });
    // Create 1 recruiter
    const recruiterUserId = mockDb.userIdCounter++;
    mockDb.users.push({
        id: recruiterUserId,
        email: 'hr@google.com',
        password_hash: '$2a$10$7c6cW3kdXpxqeeETFTLLeeBatM9WupFutOccf2HX1zkTTwJeX779.',
        role: 'recruiter',
        created_at: new Date()
    });
    mockDb.recruiterProfiles.push({
        id: mockDb.recruiterIdCounter++,
        user_id: recruiterUserId,
        full_name: 'Jane Recruiter',
        company_name: 'Google',
        company_website: 'https://careers.google.com',
        industry: 'Technology',
        created_at: new Date()
    });
};
// Test PG Connection
if (process.env.DATABASE_URL) {
    pool = new pg_1.Pool({
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 5000,
    });
    pool.query('SELECT NOW()')
        .then(() => {
        console.log('[SUCCESS] Successfully connected to PostgreSQL Database.');
    })
        .catch((err) => {
        console.warn('[WARNING] Failed to connect to PostgreSQL. Falling back to In-Memory Database.');
        console.warn('[REASON]', err.message);
        useMockDb = true;
        seedMockData();
    });
}
else {
    console.warn('[WARNING] DATABASE_URL not set in .env. Falling back to In-Memory Database.');
    useMockDb = true;
    seedMockData();
}
// DB access client methods
exports.db = {
    query: async (text, params) => {
        if (useMockDb || !pool) {
            throw new Error('Using in-memory database. Direct queries not supported. Use high-level db methods.');
        }
        return pool.query(text, params);
    },
    // Users
    createUser: async (email, passwordHash, role) => {
        if (useMockDb || !pool) {
            const existingUser = mockDb.users.find(u => u.email === email);
            if (existingUser)
                throw new Error('duplicate key value violates unique constraint');
            const id = mockDb.userIdCounter++;
            const newUser = { id, email, password_hash: passwordHash, role, created_at: new Date() };
            mockDb.users.push(newUser);
            return newUser;
        }
        const res = await pool.query('INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING *', [email, passwordHash, role]);
        return res.rows[0];
    },
    getUserByEmail: async (email) => {
        if (useMockDb || !pool) {
            return mockDb.users.find(u => u.email === email) || null;
        }
        const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return res.rows[0] || null;
    },
    getUserById: async (id) => {
        if (useMockDb || !pool) {
            return mockDb.users.find(u => u.id === id) || null;
        }
        const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        return res.rows[0] || null;
    },
    // Student Profiles
    getStudentProfileByUserId: async (userId) => {
        if (useMockDb || !pool) {
            return mockDb.studentProfiles.find(p => p.user_id === userId) || null;
        }
        const res = await pool.query('SELECT * FROM student_profiles WHERE user_id = $1', [userId]);
        return res.rows[0] || null;
    },
    getStudentProfileById: async (id) => {
        if (useMockDb || !pool) {
            return mockDb.studentProfiles.find(p => p.id === id) || null;
        }
        const res = await pool.query('SELECT * FROM student_profiles WHERE id = $1', [id]);
        return res.rows[0] || null;
    },
    createOrUpdateStudentProfile: async (userId, fullName, targetRole, githubUrl, linkedinUrl, dsaIncluded, resumeUrl) => {
        if (useMockDb || !pool) {
            let profile = mockDb.studentProfiles.find(p => p.user_id === userId);
            if (profile) {
                profile.full_name = fullName;
                profile.target_role = targetRole;
                profile.github_url = githubUrl;
                profile.linkedin_url = linkedinUrl;
                profile.dsa_included = dsaIncluded;
                if (resumeUrl !== undefined) {
                    profile.resume_url = resumeUrl;
                }
                profile.updated_at = new Date();
            }
            else {
                profile = {
                    id: mockDb.profileIdCounter++,
                    user_id: userId,
                    full_name: fullName,
                    target_role: targetRole,
                    resume_url: resumeUrl || null,
                    github_url: githubUrl,
                    linkedin_url: linkedinUrl,
                    dsa_included: dsaIncluded,
                    overall_score: 0,
                    created_at: new Date(),
                    updated_at: new Date(),
                };
                mockDb.studentProfiles.push(profile);
            }
            return profile;
        }
        const currentProfile = await exports.db.getStudentProfileByUserId(userId);
        let res;
        if (currentProfile) {
            const fields = [fullName, targetRole, githubUrl, linkedinUrl, dsaIncluded, userId];
            let queryStr = 'UPDATE student_profiles SET full_name = $1, target_role = $2, github_url = $3, linkedin_url = $4, dsa_included = $5, updated_at = NOW()';
            if (resumeUrl !== undefined) {
                fields.splice(5, 0, resumeUrl);
                queryStr += `, resume_url = $6 WHERE user_id = $7 RETURNING *`;
            }
            else {
                queryStr += ` WHERE user_id = $6 RETURNING *`;
            }
            res = await pool.query(queryStr, fields);
        }
        else {
            res = await pool.query('INSERT INTO student_profiles (user_id, full_name, target_role, github_url, linkedin_url, dsa_included, resume_url, overall_score) VALUES ($1, $2, $3, $4, $5, $6, $7, 0) RETURNING *', [userId, fullName, targetRole, githubUrl, linkedinUrl, dsaIncluded, resumeUrl || null]);
        }
        return res.rows[0];
    },
    updateStudentScore: async (studentId, overallScore, catScores) => {
        if (useMockDb || !pool) {
            // Update overall score in profile
            const profile = mockDb.studentProfiles.find(p => p.id === studentId);
            if (profile) {
                profile.overall_score = overallScore;
            }
            // Update detailed category scores
            let scoreRecord = mockDb.categoryScores.find(s => s.student_id === studentId);
            if (scoreRecord) {
                scoreRecord.resume_score = catScores.resumeScore;
                scoreRecord.projects_score = catScores.projectsScore;
                scoreRecord.experience_score = catScores.experienceScore;
                scoreRecord.online_presence_score = catScores.onlinePresenceScore;
                scoreRecord.dsa_score = catScores.dsaScore;
                scoreRecord.updated_at = new Date();
            }
            else {
                scoreRecord = {
                    id: mockDb.categoryScoreIdCounter++,
                    student_id: studentId,
                    resume_score: catScores.resumeScore,
                    projects_score: catScores.projectsScore,
                    experience_score: catScores.experienceScore,
                    online_presence_score: catScores.onlinePresenceScore,
                    dsa_score: catScores.dsaScore,
                    updated_at: new Date()
                };
                mockDb.categoryScores.push(scoreRecord);
            }
            return { overallScore, categoryScores: scoreRecord };
        }
        await pool.query('UPDATE student_profiles SET overall_score = $1, updated_at = NOW() WHERE id = $2', [overallScore, studentId]);
        const checkScores = await pool.query('SELECT id FROM category_scores WHERE student_id = $1', [studentId]);
        let scoresRes;
        if (checkScores.rows.length > 0) {
            scoresRes = await pool.query('UPDATE category_scores SET resume_score = $1, projects_score = $2, experience_score = $3, online_presence_score = $4, dsa_score = $5, updated_at = NOW() WHERE student_id = $6 RETURNING *', [catScores.resumeScore, catScores.projectsScore, catScores.experienceScore, catScores.onlinePresenceScore, catScores.dsaScore, studentId]);
        }
        else {
            scoresRes = await pool.query('INSERT INTO category_scores (student_id, resume_score, projects_score, experience_score, online_presence_score, dsa_score) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [studentId, catScores.resumeScore, catScores.projectsScore, catScores.experienceScore, catScores.onlinePresenceScore, catScores.dsaScore]);
        }
        return { overallScore, categoryScores: scoresRes.rows[0] };
    },
    // Recruiter Profiles
    getRecruiterProfileByUserId: async (userId) => {
        if (useMockDb || !pool) {
            return mockDb.recruiterProfiles.find(p => p.user_id === userId) || null;
        }
        const res = await pool.query('SELECT * FROM recruiter_profiles WHERE user_id = $1', [userId]);
        return res.rows[0] || null;
    },
    createOrUpdateRecruiterProfile: async (userId, fullName, companyName, companyWebsite, industry) => {
        if (useMockDb || !pool) {
            let profile = mockDb.recruiterProfiles.find(p => p.user_id === userId);
            if (profile) {
                profile.full_name = fullName;
                profile.company_name = companyName;
                profile.company_website = companyWebsite;
                profile.industry = industry;
                profile.updated_at = new Date();
            }
            else {
                profile = {
                    id: mockDb.recruiterIdCounter++,
                    user_id: userId,
                    full_name: fullName,
                    company_name: companyName,
                    company_website: companyWebsite,
                    industry: industry,
                    created_at: new Date(),
                    updated_at: new Date(),
                };
                mockDb.recruiterProfiles.push(profile);
            }
            return profile;
        }
        const currentProfile = await exports.db.getRecruiterProfileByUserId(userId);
        let res;
        if (currentProfile) {
            res = await pool.query('UPDATE recruiter_profiles SET full_name = $1, company_name = $2, company_website = $3, industry = $4, updated_at = NOW() WHERE user_id = $5 RETURNING *', [fullName, companyName, companyWebsite, industry, userId]);
        }
        else {
            res = await pool.query('INSERT INTO recruiter_profiles (user_id, full_name, company_name, company_website, industry) VALUES ($1, $2, $3, $4, $5) RETURNING *', [userId, fullName, companyName, companyWebsite, industry]);
        }
        return res.rows[0];
    },
    // Projects
    getProjectsByStudentId: async (studentId) => {
        if (useMockDb || !pool) {
            return mockDb.projects.filter(p => p.student_id === studentId);
        }
        const res = await pool.query('SELECT * FROM projects WHERE student_id = $1', [studentId]);
        return res.rows[0] || [];
    },
    addProject: async (studentId, title, description, technologies, projectUrl) => {
        if (useMockDb || !pool) {
            const id = mockDb.projectIdCounter++;
            const newProj = { id, student_id: studentId, title, description, technologies, project_url: projectUrl };
            mockDb.projects.push(newProj);
            return newProj;
        }
        const res = await pool.query('INSERT INTO projects (student_id, title, description, technologies, project_url) VALUES ($1, $2, $3, $4, $5) RETURNING *', [studentId, title, description, technologies, projectUrl]);
        return res.rows[0];
    },
    deleteProject: async (id, studentId) => {
        if (useMockDb || !pool) {
            const idx = mockDb.projects.findIndex(p => p.id === id && p.student_id === studentId);
            if (idx !== -1) {
                mockDb.projects.splice(idx, 1);
                return true;
            }
            return false;
        }
        const res = await pool.query('DELETE FROM projects WHERE id = $1 AND student_id = $2', [id, studentId]);
        return (res.rowCount ?? 0) > 0;
    },
    // Certificates
    getCertificatesByStudentId: async (studentId) => {
        if (useMockDb || !pool) {
            return mockDb.certificates.filter(c => c.student_id === studentId);
        }
        const res = await pool.query('SELECT * FROM certificates WHERE student_id = $1', [studentId]);
        return res.rows || [];
    },
    addCertificate: async (studentId, name, issuer, issueDate, credentialUrl, filePath) => {
        if (useMockDb || !pool) {
            const id = mockDb.certificateIdCounter++;
            const newCert = { id, student_id: studentId, name, issuer, issue_date: issueDate, credential_url: credentialUrl, file_path: filePath || null };
            mockDb.certificates.push(newCert);
            return newCert;
        }
        const res = await pool.query('INSERT INTO certificates (student_id, name, issuer, issue_date, credential_url, file_path) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [studentId, name, issuer, issueDate, credentialUrl, filePath || null]);
        return res.rows[0];
    },
    deleteCertificate: async (id, studentId) => {
        if (useMockDb || !pool) {
            const idx = mockDb.certificates.findIndex(c => c.id === id && c.student_id === studentId);
            if (idx !== -1) {
                mockDb.certificates.splice(idx, 1);
                return true;
            }
            return false;
        }
        const res = await pool.query('DELETE FROM certificates WHERE id = $1 AND student_id = $2', [id, studentId]);
        return (res.rowCount ?? 0) > 0;
    },
    // Category Scores
    getCategoryScoresByStudentId: async (studentId) => {
        if (useMockDb || !pool) {
            return mockDb.categoryScores.find(s => s.student_id === studentId) || null;
        }
        const res = await pool.query('SELECT * FROM category_scores WHERE student_id = $1', [studentId]);
        return res.rows[0] || null;
    },
    // AI Recommendations
    getRecommendationsByStudentId: async (studentId) => {
        if (useMockDb || !pool) {
            return mockDb.aiRecommendations.filter(r => r.student_id === studentId);
        }
        const res = await pool.query('SELECT * FROM ai_recommendations WHERE student_id = $1', [studentId]);
        return res.rows || [];
    },
    createRecommendations: async (studentId, recommendations) => {
        if (useMockDb || !pool) {
            // Clear old
            mockDb.aiRecommendations = mockDb.aiRecommendations.filter(r => r.student_id !== studentId);
            const inserted = [];
            recommendations.forEach(r => {
                const newRec = {
                    id: mockDb.aiRecommendationIdCounter++,
                    student_id: studentId,
                    category: r.category,
                    recommendation: r.recommendation,
                    created_at: new Date()
                };
                mockDb.aiRecommendations.push(newRec);
                inserted.push(newRec);
            });
            return inserted;
        }
        // Delete existing
        await pool.query('DELETE FROM ai_recommendations WHERE student_id = $1', [studentId]);
        const inserted = [];
        for (const r of recommendations) {
            const res = await pool.query('INSERT INTO ai_recommendations (student_id, category, recommendation) VALUES ($1, $2, $3) RETURNING *', [studentId, r.category, r.recommendation]);
            inserted.push(res.rows[0]);
        }
        return inserted;
    },
    // Recruiter Dashboard Queries
    getAllCandidates: async (filters) => {
        if (useMockDb || !pool) {
            let filtered = [...mockDb.studentProfiles];
            if (filters.search) {
                const search = filters.search.toLowerCase();
                filtered = filtered.filter(p => p.full_name.toLowerCase().includes(search));
            }
            if (filters.targetRole) {
                const role = filters.targetRole.toLowerCase();
                filtered = filtered.filter(p => p.target_role && p.target_role.toLowerCase().includes(role));
            }
            if (filters.minScore !== undefined) {
                filtered = filtered.filter(p => p.overall_score >= filters.minScore);
            }
            if (filters.dsaRequired) {
                filtered = filtered.filter(p => p.dsa_included === true);
            }
            // Sort by overall_score descending
            filtered.sort((a, b) => b.overall_score - a.overall_score);
            // Map scores along
            return filtered.map(profile => {
                const score = mockDb.categoryScores.find(s => s.student_id === profile.id) || null;
                return {
                    ...profile,
                    category_scores: score
                };
            });
        }
        let queryStr = `
      SELECT sp.*, 
        json_build_object(
          'id', cs.id,
          'resume_score', cs.resume_score,
          'projects_score', cs.projects_score,
          'experience_score', cs.experience_score,
          'online_presence_score', cs.online_presence_score,
          'dsa_score', cs.dsa_score
        ) as category_scores
      FROM student_profiles sp
      LEFT JOIN category_scores cs ON sp.id = cs.student_id
      WHERE 1=1
    `;
        const params = [];
        let paramIdx = 1;
        if (filters.search) {
            queryStr += ` AND sp.full_name ILIKE $${paramIdx}`;
            params.push(`%${filters.search}%`);
            paramIdx++;
        }
        if (filters.targetRole) {
            queryStr += ` AND sp.target_role ILIKE $${paramIdx}`;
            params.push(`%${filters.targetRole}%`);
            paramIdx++;
        }
        if (filters.minScore !== undefined) {
            queryStr += ` AND sp.overall_score >= $${paramIdx}`;
            params.push(filters.minScore);
            paramIdx++;
        }
        if (filters.dsaRequired) {
            queryStr += ` AND sp.dsa_included = TRUE`;
        }
        queryStr += ` ORDER BY sp.overall_score DESC`;
        const res = await pool.query(queryStr, params);
        return res.rows;
    },
    getCandidateDetail: async (studentId) => {
        const profile = await exports.db.getStudentProfileById(studentId);
        if (!profile)
            return null;
        const projects = await exports.db.getProjectsByStudentId(studentId);
        const certificates = await exports.db.getCertificatesByStudentId(studentId);
        const categoryScores = await exports.db.getCategoryScoresByStudentId(studentId);
        const recommendations = await exports.db.getRecommendationsByStudentId(studentId);
        return {
            profile,
            projects,
            certificates,
            categoryScores,
            recommendations
        };
    }
};
