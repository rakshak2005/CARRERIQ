import { Router, Request, Response } from 'express';
import { db } from '../db';
import { GithubAnalysisService } from '../services/githubAnalysisService';
import { generateDetailedCareerReview, generateWowProjects } from '../services/aiService';

const router = Router();

// Helper to extract email from authorization header (since we use simulated tokens right now)
// In a real app this would use the verifyFirebaseIdToken middleware
const getUserEmailFromToken = (req: Request) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  // If it's our simulated token format: simulated-token:email:uid
  if (token.startsWith('simulated-token:')) {
    return token.split(':')[1];
  }
  return null;
};

router.get('/', async (req: Request, res: Response) => {
  try {
    const email = getUserEmailFromToken(req);
    if (!email) return res.status(401).json({ error: 'Unauthorized' });

    const user = await db.getUserByEmail(email);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const profile = await db.getStudentProfileByUserId(user.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    // Check if we need to auto-regenerate (older than 24h)
    const lastAnalyzed = profile.github_last_detailed_analysis;
    const now = new Date();
    const needsRegeneration = !lastAnalyzed || !profile.github_health_metrics || (now.getTime() - new Date(lastAnalyzed).getTime() > 24 * 60 * 60 * 1000);

    if (needsRegeneration && profile.github_url) {
      console.log(`[GitHub Report] Auto-regenerating report for ${profile.github_url}`);
      return await regenerateReportForProfile(profile, res);
    }

    return res.json({ success: true, data: profile });
  } catch (error: any) {
    console.error('[GitHub Report GET Error]:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/regenerate', async (req: Request, res: Response) => {
  try {
    const email = getUserEmailFromToken(req);
    if (!email) return res.status(401).json({ error: 'Unauthorized' });

    const user = await db.getUserByEmail(email);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const profile = await db.getStudentProfileByUserId(user.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    if (!profile.github_url) {
      return res.status(400).json({ error: 'No GitHub URL provided in profile' });
    }

    console.log(`[GitHub Report] Force regenerating report for ${profile.github_url}`);
    return await regenerateReportForProfile(profile, res);
  } catch (error: any) {
    console.error('[GitHub Report REGENERATE Error]:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function regenerateReportForProfile(profile: any, res: Response) {
  try {
    // 1. Core rule-based analysis (fetches repos, computes metrics, gaps, growth plan, issues)
    const analysisRes = await GithubAnalysisService.analyze(profile.github_url);
    if (!analysisRes.success || !analysisRes.data) {
      return res.status(400).json({ error: analysisRes.error || 'Failed to analyze GitHub profile' });
    }

    const d = analysisRes.data;

    // 2. Run Gemini AI generation in parallel for Career Review and WOW Projects
    const [careerReview, wowProjects] = await Promise.all([
      generateDetailedCareerReview(
        d.username,
        profile.target_role || 'Software Engineer',
        d.technologies,
        d.repositories,
        d.githubScore
      ),
      generateWowProjects(
        profile.target_role || 'Software Engineer',
        d.technologies
      )
    ]);

    // 3. Save core stats
    await db.updateStudentGitHubStats(profile.user_id, {
      username: d.username,
      repos: d.repositories.length,
      followers: d.followers,
      stars: d.repositories.reduce((acc: number, r: any) => acc + (r.stars || 0), 0),
      score: d.githubScore,
      accountAgeYears: d.accountCreatedAt ? Math.max(1, Math.round((Date.now() - new Date(d.accountCreatedAt).getTime()) / (1000 * 3600 * 24 * 365))) : 1,
      breakdown: JSON.stringify(d.breakdown),
      repositories: JSON.stringify(d.repositories),
      techStacks: JSON.stringify(d.technologies),
      recommendations: JSON.stringify(d.recommendations),
      githubImprovementReport: JSON.stringify(d.githubImprovementReport),
      following: d.following,
      publicRepos: d.publicRepos,
      avatar: d.avatar,
      lastActivity: d.lastActivity,
      aiProjectComplexityScore: d.aiProjectComplexityScore || 0
    });

    // 4. Save new detailed report fields
    const updatedProfile = await db.updateStudentGitHubDetailedReport(profile.user_id, {
      githubHealthMetrics: d.healthMetrics,
      githubPortfolioGaps: d.portfolioGaps,
      githubGrowthPlan: d.growthPlan,
      githubDetailedIssues: d.detailedIssues,
      githubDetailedRecs: d.detailedRecs,
      githubCareerReview: careerReview,
      githubWowProjects: wowProjects
    });

    return res.json({ success: true, data: updatedProfile });
  } catch (error: any) {
    console.error('[GitHub Report Generation Error]:', error);
    return res.status(500).json({ error: 'Failed to generate comprehensive report' });
  }
}

export default router;
