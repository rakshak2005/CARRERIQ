import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { triggerGitHubAnalysis } from '../services/queue';
import { parseGitHubUsername } from '../services/githubService';
import { analysisDb } from '../db/mongoService';

const router = Router();

// POST /api/analysis/trigger - Enqueues a new profile analysis
router.post('/trigger', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ error: 'Requires student role' });
    }

    const { githubUrl } = req.body;
    if (!githubUrl) {
      return res.status(400).json({ error: 'GitHub Profile URL is required' });
    }

    const username = parseGitHubUsername(githubUrl);
    if (!username) {
      return res.status(400).json({ error: 'Invalid GitHub URL format' });
    }

    // Check if profile was analyzed in the last 24 hours
    const existingProfile = await analysisDb.findProfileByUrl(githubUrl);
    if (existingProfile && existingProfile.githubImprovementReport) {
      const hoursSinceAnalysis = (Date.now() - new Date(existingProfile.metadata.lastAnalyzed).getTime()) / (1000 * 60 * 60);
      if (hoursSinceAnalysis < 24) {
        const repos = await analysisDb.findRepositories(existingProfile._id.toString());
        return res.status(200).json({
          status: 'completed',
          progressMessage: 'Loaded from cache',
          jobId: 'cached',
          profile: existingProfile,
          repositories: repos
        });
      }
    }

    // Create a new Job tracker (could be SQL, MongoDB, or in-memory depending on config)
    const newJob = await analysisDb.createJob(githubUrl);

    // Trigger analysis job (either via BullMQ/Redis or Simulated In-Memory Queue)
    await triggerGitHubAnalysis(req.user.id, githubUrl, (newJob._id as any).toString());

    return res.status(202).json({
      jobId: newJob._id,
      status: 'pending',
      progress: 0,
      progressMessage: 'Analysis job queued...'
    });

  } catch (error: any) {
    console.error('[Route Trigger Error]:', error);
    return res.status(500).json({ error: 'Server error triggering profile analysis' });
  }
});

// GET /api/analysis/status/:jobId - Poll status of the analysis job
router.get('/status/:jobId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { jobId } = req.params;
    
    // Check if it was cached
    if (jobId === 'cached') {
      return res.status(400).json({ error: 'Cannot query cached job ID status' });
    }

    const job = await analysisDb.findJobById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Analysis job tracker not found' });
    }

    // If completed, attach results
    if (job.status === 'completed') {
      const profile = await analysisDb.findProfileByUrl(job.githubUrl);
      let repos: any[] = [];
      if (profile) {
        repos = await analysisDb.findRepositories(profile._id.toString());
      }
      return res.json({
        status: job.status,
        progress: job.progress,
        progressMessage: job.progressMessage,
        profile,
        repositories: repos
      });
    }

    return res.json({
      status: job.status,
      progress: job.progress,
      progressMessage: job.progressMessage,
      error: job.error
    });

  } catch (error: any) {
    console.error('[Route Status Error]:', error);
    return res.status(500).json({ error: 'Server error retrieving analysis status' });
  }
});

// GET /api/analysis/dashboard/:username - Load profile dashboard details directly
router.get('/dashboard/:username', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { username } = req.params;
    const profile = await analysisDb.findProfileByUsername(username);
    if (!profile) {
      return res.status(404).json({ error: 'CareerIQ Profile not found' });
    }

    const repositories = await analysisDb.findRepositories(profile._id.toString());

    return res.json({
      profile,
      repositories
    });

  } catch (error: any) {
    console.error('[Route Dashboard Error]:', error);
    return res.status(500).json({ error: 'Server error loading career dashboard' });
  }
});

export default router;
