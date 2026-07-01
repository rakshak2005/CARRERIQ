import { Router, Response } from 'express';
import { db } from '../db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { calculateScores } from '../services/scoreEngine';
import { generateRecommendations } from '../services/aiService';
import { fetchGitHubStats } from '../services/githubService';

const router = Router();

// Helper to recalculate scores & AI recommendations
export const recalculateStudentProfile = async (studentId: number) => {
  const profile = await db.getStudentProfileById(studentId);
  if (!profile) throw new Error('Student profile not found');

  const projects = await db.getProjectsByStudentId(studentId);
  const certificates = await db.getCertificatesByStudentId(studentId);

  // Fetch and update GitHub stats if URL exists
  let githubScore = profile.github_score || 0;
  if (profile.github_breakdown) {
    let breakdown = profile.github_breakdown;
    if (typeof breakdown === 'string') {
      try {
        breakdown = JSON.parse(breakdown);
      } catch (e) {}
    }
    if (breakdown) {
      const gImpact = Math.min(20, breakdown.impact !== undefined ? breakdown.impact : (breakdown.activity || 0));
      const gQuality = Math.min(20, breakdown.quality !== undefined ? breakdown.quality : 0);
      const gComplexity = Math.min(20, breakdown.complexity !== undefined ? breakdown.complexity : 0);
      const gConsistency = Math.min(15, breakdown.consistency !== undefined ? breakdown.consistency : Math.round(Math.min(15, (breakdown.activity || 0) * 0.75)));
      const gTechDiversity = Math.min(15, breakdown.techDiversity !== undefined ? breakdown.techDiversity : 0);
      const gCommunity = Math.min(10, breakdown.community !== undefined ? breakdown.community : 0);
      githubScore = gImpact + gQuality + gComplexity + gConsistency + gTechDiversity + gCommunity;
    }
  }

  // Recalculate Resume Score dynamically
  let resumeScore = profile.resume_score || 0;
  if (profile.resume_role_match_score || profile.resume_skills_score || profile.resume_projects_score || profile.resume_experience_score) {
    resumeScore = Math.round(
      ((profile.resume_role_match_score || 0) * 0.40) +
      (((profile.resume_skills_score || 0) / 20) * 25) +
      (((profile.resume_projects_score || 0) / 20) * 20) +
      (((profile.resume_experience_score || 0) / 15) * 15)
    );
  }

  let updatedProfile = profile;

  // Use evaluated portfolio projects if they exist, otherwise fallback to raw manual projects
  const projectsToCalculate = (updatedProfile.portfolio_projects && updatedProfile.portfolio_projects.length > 0)
    ? updatedProfile.portfolio_projects
    : projects;

  // Compute scores
  const scoreInput = {
    targetRole: updatedProfile.target_role,
    resumeUrl: updatedProfile.resume_url,
    githubUrl: updatedProfile.github_url,
    linkedinUrl: updatedProfile.linkedin_url,
    dsaIncluded: updatedProfile.dsa_included,
    certificatesIncluded: updatedProfile.certificates_included !== undefined ? updatedProfile.certificates_included : true,
    projects: projectsToCalculate,
    certificates,
    githubScore,
    resumeScore,
    portfolioScore: updatedProfile.portfolio_score
  };

  const scores = calculateScores(scoreInput);

  // Update scores in db
  await db.updateStudentScore(studentId, scores.overallScore, {
    resumeScore: scores.categoryScores.resumeScore,
    projectsScore: scores.categoryScores.projectsScore,
    experienceScore: scores.categoryScores.experienceScore,
    onlinePresenceScore: scores.categoryScores.onlinePresenceScore,
    dsaScore: scores.categoryScores.dsaScore,
    githubScore: githubScore
  });

  // Generate recommendations
  const recommendations = generateRecommendations(updatedProfile, scores, projects, certificates);

  // Save recommendations
  await db.createRecommendations(studentId, recommendations);

  return {
    profile: { ...updatedProfile, overall_score: scores.overallScore, github_score: githubScore, resume_score: resumeScore },
    projects,
    certificates,
    scores: scores.categoryScores,
    overallScore: scores.overallScore,
    recommendations
  };
};

// GET /api/student/profile - Get profile dashboard details
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(403).json({ error: 'Not authenticated' });
    }

    let userId = req.user.id;
    if (req.user.role === 'admin' && req.query.impersonateUserId) {
      userId = parseInt(req.query.impersonateUserId as string, 10);
    } else if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Requires student role' });
    }

    let profile = await db.getStudentProfileByUserId(userId);
    
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

    const details = await recalculateStudentProfile(profile.id);
    res.json(details);
  } catch (error: any) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ error: 'Server error fetching profile details' });
  }
});

// POST /api/student/profile - Create or update profile metadata
router.post('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ error: 'Requires student role' });
    }

    const { fullName, targetRole, githubUrl, linkedinUrl, dsaIncluded, certificatesIncluded } = req.body;

    if (!fullName) {
      return res.status(400).json({ error: 'Full name is required' });
    }

    // Save profile metadata (keep existing resumeUrl)
    const profile = await db.createOrUpdateStudentProfile(
      req.user.id,
      fullName,
      targetRole || null,
      githubUrl || '',
      linkedinUrl || '',
      certificatesIncluded !== undefined ? certificatesIncluded : true,
      dsaIncluded || false
    );

    // Recalculate
    const details = await recalculateStudentProfile(profile.id);
    res.json({
      message: 'Profile updated successfully',
      ...details
    });
  } catch (error: any) {
    console.error('Error updating student profile:', error);
    res.status(500).json({ error: 'Server error updating profile details' });
  }
});

// POST /api/student/upload-resume - Upload resume file
router.post(
  '/upload-resume',
  authenticateToken,
  upload.single('resume'),
  async (req: AuthenticatedRequest, res: Response) => {
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
      let profile = await db.getStudentProfileByUserId(req.user.id);
      if (!profile) {
        // Create a default empty profile to link the resume to
        profile = await db.createOrUpdateStudentProfile(
          req.user.id,
          'Anonymous Candidate',
          '',
          '',
          '',
          true,
          false,
          resumeUrl
        );
      } else {
        // Update existing profile's resume
        profile = await db.createOrUpdateStudentProfile(
          req.user.id,
          profile.full_name,
          profile.target_role,
          profile.github_url,
          profile.linkedin_url,
          profile.certificates_included !== undefined ? profile.certificates_included : true,
          profile.dsa_included,
          resumeUrl
        );
      }

      // Recalculate
      const details = await recalculateStudentProfile(profile.id);
      res.json({
        message: 'Resume uploaded successfully',
        resumeUrl,
        ...details
      });
    } catch (error: any) {
      console.error('Error uploading resume:', error);
      res.status(500).json({ error: error.message || 'Server error uploading resume' });
    }
  }
);

// POST /api/student/projects - Add a new project
router.post('/projects', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ error: 'Requires student role' });
    }

    const { title, description, technologies, projectUrl } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Project title is required' });
    }

    // Get student profile
    let profile = await db.getStudentProfileByUserId(req.user.id);
    if (!profile) {
      profile = await db.createOrUpdateStudentProfile(req.user.id, 'Anonymous Candidate', '', '', '', true, false);
    }

    // Add project
    await db.addProject(profile.id, title, description || '', technologies || '', projectUrl || '');

    // Recalculate
    const details = await recalculateStudentProfile(profile.id);
    res.status(201).json({
      message: 'Project added successfully',
      ...details
    });
  } catch (error: any) {
    console.error('Error adding project:', error);
    res.status(500).json({ error: 'Server error adding project' });
  }
});

// DELETE /api/student/projects/:id - Remove a project
router.delete('/projects/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ error: 'Requires student role' });
    }

    const projectId = parseInt(req.params.id);
    const profile = await db.getStudentProfileByUserId(req.user.id);
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const deleted = await db.deleteProject(projectId, profile.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Project not found or not owned by this candidate' });
    }

    // Recalculate
    const details = await recalculateStudentProfile(profile.id);
    res.json({
      message: 'Project deleted successfully',
      ...details
    });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Server error deleting project' });
  }
});

import { evaluateProject, generatePortfolioInsights, calculatePortfolioScore } from '../services/projectScoringService';
import { generateWowProjects } from '../services/aiService';

// POST /api/student/portfolio/sync - Synchronize and evaluate all projects
router.post('/portfolio/sync', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ error: 'Requires student role' });
    }

    const profile = await db.getStudentProfileByUserId(req.user.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // 1. Gather Manual Projects
    const manualProjects = await db.getProjectsByStudentId(profile.id);
    
    // 2. Gather Resume Projects
    const resumeProjects = profile.resume_projects || [];

    // 3. Gather GitHub Projects
    const githubProjects = profile.github_repositories || [];
    
    // 4. Map into unified format
    const unifiedProjects: any[] = [];
    
    manualProjects.forEach(p => {
      unifiedProjects.push({
        title: p.title,
        description: p.description,
        technologies: typeof p.technologies === 'string' ? p.technologies.split(',').map((t: string) => t.trim()) : p.technologies,
        source: 'manual',
        liveUrl: p.projectUrl || '',
      });
    });

    resumeProjects.forEach((p: any) => {
      unifiedProjects.push({
        title: p.name || p.title,
        description: p.description,
        technologies: p.technologies || [],
        source: 'resume',
      });
    });

    githubProjects.forEach((p: any) => {
      unifiedProjects.push({
        title: p.name,
        description: p.description || '',
        technologies: p.detectedTechnologies || [],
        source: 'github',
        liveUrl: p.url || '',
      });
    });

    // 4. Evaluate all projects
    const targetRole = profile.target_role || 'Software Engineer';
    const evaluatedProjects = unifiedProjects.map(p => evaluateProject(p, targetRole));

    // 5. Generate Insights
    const insights = generatePortfolioInsights(evaluatedProjects, targetRole);
    
    // 6. Calculate Overall Score
    const portfolioScore = calculatePortfolioScore(evaluatedProjects);

    // 7. Check if we need to regenerate WOW projects
    let wowProjects = profile.portfolio_recommendations || [];
    const currentSkills = Object.keys(insights.technologyCoverage);
    
    // Regenerate if no WOW projects, or if we have less than 4, or force flag is passed
    if (wowProjects.length < 4 || req.body.forceRegenerate) {
      wowProjects = await generateWowProjects(targetRole, currentSkills);
    }

    // 8. Save to MongoDB
    // Using mongoose directly to update fields
    const mongoose = require('mongoose');
    const LocalStudentProfile = mongoose.models.LocalStudentProfile;
    await LocalStudentProfile.findByIdAndUpdate(profile.id, {
      portfolioProjects: evaluatedProjects,
      portfolioScore: portfolioScore,
      portfolioInsights: insights,
      portfolioRecommendations: wowProjects
    });

    // Recalculate main scores
    const details = await recalculateStudentProfile(profile.id);

    res.json({
      message: 'Portfolio synchronized successfully',
      portfolioScore,
      portfolioInsights: insights,
      portfolioProjects: evaluatedProjects,
      portfolioRecommendations: wowProjects,
      ...details
    });

  } catch (error: any) {
    console.error('Error syncing portfolio:', error);
    res.status(500).json({ error: error.message || 'Server error syncing portfolio' });
  }
});

// POST /api/student/certificates - Add a certificate
router.post('/certificates', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ error: 'Requires student role' });
    }

    const { name, issuer, issueDate, credentialUrl } = req.body;

    if (!name || !issuer) {
      return res.status(400).json({ error: 'Certificate name and issuer are required' });
    }

    // Get student profile
    let profile = await db.getStudentProfileByUserId(req.user.id);
    if (!profile) {
      profile = await db.createOrUpdateStudentProfile(req.user.id, 'Anonymous Candidate', '', '', '', true, false);
    }

    // Add certificate
    await db.addCertificate(profile.id, name, issuer, issueDate || '', credentialUrl || '');

    // Recalculate
    const details = await recalculateStudentProfile(profile.id);
    res.status(201).json({
      message: 'Certificate added successfully',
      ...details
    });
  } catch (error: any) {
    console.error('Error adding certificate:', error);
    res.status(500).json({ error: 'Server error adding certificate' });
  }
});

// DELETE /api/student/certificates/:id - Remove a certificate
router.delete('/certificates/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ error: 'Requires student role' });
    }

    const certId = parseInt(req.params.id);
    const profile = await db.getStudentProfileByUserId(req.user.id);
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const deleted = await db.deleteCertificate(certId, profile.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Certificate not found or not owned by this candidate' });
    }

    // Recalculate
    const details = await recalculateStudentProfile(profile.id);
    res.json({
      message: 'Certificate deleted successfully',
      ...details
    });
  } catch (error: any) {
    console.error('Error deleting certificate:', error);
    res.status(500).json({ error: 'Server error deleting certificate' });
  }
});

export default router;
