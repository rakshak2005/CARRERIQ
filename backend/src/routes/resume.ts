import { Router, Response } from 'express';
import { db } from '../db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { extractTextFromFile, analyzeResumeRuleBased, analyzeResumeWithAI } from '../services/resumeService';
import { recalculateStudentProfile } from './student';

const router = Router();

// POST /api/resume/upload - Upload resume file, extract, analyze and calculate
router.post(
  '/upload',
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

      const resumeUrl = `uploads/${req.file.filename}`;
      let profile = await db.getStudentProfileByUserId(req.user.id);
      
      // Get target role for matching
      const targetRole = profile ? profile.target_role : '';

      // 1. Extract Text
      let text = '';
      try {
        text = await extractTextFromFile(resumeUrl, req.file.mimetype);
      } catch (err: any) {
        console.error('Extraction Error:', err);
        return res.status(400).json({ error: err.message || 'Error extracting text from file' });
      }

      // 2. Guaranteed Rule-Based Analysis
      const ruleBasedResults = analyzeResumeRuleBased(text, targetRole);

      // 3. Fallback AI Analysis
      const finalAnalysis = await analyzeResumeWithAI(text, targetRole, ruleBasedResults);

      // 4. Create/Update Profile with new comprehensive fields
      if (!profile) {
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

      // We need to inject these directly to DB since createOrUpdateStudentProfile doesn't accept 20 params
      await db.updateStudentResumeAnalysis(profile.id, {
        resumeScore: finalAnalysis.score,
        resumeATSScore: finalAnalysis.atsScore,
        resumeSkillsScore: finalAnalysis.skillsScore,
        resumeProjectsScore: finalAnalysis.projectsScore,
        resumeExperienceScore: finalAnalysis.experienceScore,
        resumeCertificationScore: finalAnalysis.certificationScore,
        resumeProfessionalPresenceScore: finalAnalysis.professionalPresenceScore,
        resumeRoleMatchScore: finalAnalysis.roleMatchScore,
        resumeStrengths: finalAnalysis.strengths,
        resumeWeaknesses: finalAnalysis.weaknesses,
        resumeMissingKeywords: finalAnalysis.missingKeywords,
        resumeRecommendedSkills: finalAnalysis.recommendedSkills,
        resumeSummary: finalAnalysis.summary,
        resumeProjects: finalAnalysis.extractedProjects,
        resumeSkills: finalAnalysis.extractedSkills,
        resumeLastAnalyzed: new Date(),
        resumeFileName: req.file.originalname,
        resumeText: text.substring(0, 50000) // Truncate text just in case
      });

      // Recalculate
      const details = await recalculateStudentProfile(profile.id);
      res.json({
        message: 'Resume analyzed successfully',
        resumeUrl,
        ...details
      });
    } catch (error: any) {
      console.error('Error analyzing resume:', error);
      res.status(500).json({ error: error.message || 'Server error analyzing resume' });
    }
  }
);

export default router;
