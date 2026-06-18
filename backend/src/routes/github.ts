import { Router, Request, Response } from 'express';
import { GithubAnalysisService } from '../services/githubAnalysisService';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { db } from '../db';
import { recalculateStudentProfile } from './student';

const router = Router();

// POST /api/github/analyze
router.post('/analyze', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { githubUrl } = req.body;
    console.log(`[API /api/github/analyze] Received githubUrl from request body: "${githubUrl}"`);
    
    if (!githubUrl) {
      return res.status(400).json({ success: false, message: 'githubUrl is required' });
    }

    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Requires student role' });
    }

    // Run the analysis
    const analysisResult = await GithubAnalysisService.analyze(githubUrl);
    
    if (!analysisResult.success || !analysisResult.data) {
      return res.status(400).json({ success: false, message: analysisResult.error || 'Analysis failed' });
    }

    const githubData = analysisResult.data;

    // Get student profile
    let profile = await db.getStudentProfileByUserId(req.user.id);
    if (!profile) {
      profile = await db.createOrUpdateStudentProfile(req.user.id, 'Anonymous Candidate', '', githubUrl, '', true, false);
    } else {
      // make sure github url is updated
      profile = await db.createOrUpdateStudentProfile(req.user.id, profile.full_name, profile.target_role, githubUrl, profile.linkedin_url, profile.certificates_included !== undefined ? profile.certificates_included : true, profile.dsa_included, profile.resume_url);
    }

    // Save detailed stats to DB
    await db.updateStudentGitHubStats(profile.id, {
      username: githubData.username,
      repos: githubData.publicRepos || 0,
      followers: githubData.followers || 0,
      stars: githubData.repositories.reduce((acc: number, curr: any) => acc + (curr.stars || 0), 0),
      score: githubData.githubScore || 0,
      accountAgeYears: githubData.accountCreatedAt ? Math.max(1, new Date().getFullYear() - new Date(githubData.accountCreatedAt).getFullYear()) : 1,
      breakdown: githubData.breakdown,
      repositories: githubData.repositories,
      techStacks: githubData.technologies,
      recommendations: githubData.recommendations,
      following: githubData.following || 0,
      publicRepos: githubData.publicRepos || 0,
      avatar: githubData.avatar,
      lastActivity: githubData.lastActivity,
      aiProjectComplexityScore: githubData.aiProjectComplexityScore || 0,
    });

    // Save detailed report fields to DB
    await db.updateStudentGitHubDetailedReport(profile.id, {
      githubHealthMetrics: githubData.healthMetrics,
      githubPortfolioGaps: githubData.portfolioGaps,
      githubCareerReview: githubData.detailedIssues,
      githubWowProjects: githubData.wowProjects || [],
      githubGrowthPlan: githubData.growthPlan,
      githubDetailedIssues: githubData.detailedIssues,
      githubDetailedRecs: githubData.detailedRecs || []
    });

    // Recalculate everything
    const details = await recalculateStudentProfile(profile.id);

    res.json({
      success: true,
      data: githubData,
      details // returning the full new profile Details with updated scores
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
