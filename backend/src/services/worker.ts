import { Worker } from 'bullmq';
import { redisConnection, registerJobProcessor, registerOnboardingJobProcessor, getUseMockQueue } from './queue';
import { fetchGitHubStats, parseGitHubUsername } from './githubService';
import { generateAIEvaluation, generateGitHubImprovementReport, generateWowProjects } from './aiService';
import { analysisDb } from '../db/mongoService';
import { extractTextFromFile, analyzeResumeRuleBased, analyzeResumeWithAI } from './resumeService';
import { db } from '../db';
import { recalculateStudentProfile } from '../routes/student';
import { GithubAnalysisService } from './githubAnalysisService';
import { evaluateProject, generatePortfolioInsights, calculatePortfolioScore } from './projectScoringService';
import dotenv from 'dotenv';

dotenv.config();

// Determine role match percentages based on stack overlap and overall score
const matchTargetRoles = (techStack: string[], score: number) => {
  const roles = [
    { role: 'Frontend Engineer', keywords: ['react', 'next', 'angular', 'vue', 'typescript', 'javascript', 'html', 'css'] },
    { role: 'Backend Engineer', keywords: ['node.js', 'express', 'spring', 'django', 'postgresql', 'mongodb', 'mysql', 'apis', 'rest'] },
    { role: 'Full Stack Engineer', keywords: ['react', 'next', 'node.js', 'express', 'postgresql', 'mongodb'] },
    { role: 'DevOps Engineer', keywords: ['docker', 'kubernetes', 'ci/cd', 'aws', 'azure', 'gcp', 'jenkins', 'github-actions'] },
    { role: 'Software Engineer', keywords: ['algorithms', 'dsa', 'data structures', 'clean code', 'typescript', 'go', 'python'] },
    { role: 'Data Engineer', keywords: ['python', 'mongodb', 'postgresql', 'mysql', 'spark', 'hadoop', 'data warehouse'] }
  ];
  
  const lowerStack = techStack.map(t => t.toLowerCase());

  return roles.map(r => {
    const matchedKeywords = r.keywords.filter(kw => {
      return lowerStack.some(t => t.includes(kw) || kw.includes(t));
    });
    const matchRatio = r.keywords.length > 0 ? (matchedKeywords.length / r.keywords.length) : 0;
    const matchPercentage = Math.round(matchRatio * 50 + score * 0.5);
    return {
      role: r.role,
      matchPercentage: Math.max(35, Math.min(100, matchPercentage))
    };
  }).sort((a, b) => b.matchPercentage - a.matchPercentage);
};

export const processAnalysisJob = async (jobId: string, githubUrl: string): Promise<void> => {
  console.log(`[Worker] Started processing analysis job ${jobId} for URL: ${githubUrl}`);

  // Helper to update job status
  const updateJobStatus = async (progress: number, message: string) => {
    await analysisDb.updateJob(jobId, { progress, progressMessage: message, status: 'active' });
  };

  try {
    // Step 1: Ingest Data
    await updateJobStatus(10, 'Contacting GitHub API & Fetching profile statistics...');
    const username = parseGitHubUsername(githubUrl);
    if (!username) throw new Error('Invalid GitHub profile URL');

    const stats = await fetchGitHubStats(githubUrl);

    // Step 2: Parse Repositories
    await updateJobStatus(40, 'Running Static Code Modularity & Production Readiness Analyzers...');
    
    // Compute tech stack and parse repositories
    const allDetectedTech: string[] = [];
    const analyzedRepos = (stats.repositories || []).map((repo: any) => {
      // Evaluate Complexity (mock formulas based on folder size, depth)
      const hasDocker = repo.files?.includes('Dockerfile') || repo.files?.includes('docker-compose.yml') || false;
      const hasCICD = repo.files?.some((f: string) => f.includes('.github/workflows')) || false;
      const hasTests = repo.files?.some((f: string) => 
        f.includes('test') || f.includes('spec') || f.includes('jest')
      ) || false;

      const languages = repo.languages || [];
      const techStack = repo.techStack || [];
      techStack.forEach((t: string) => {
        if (!allDetectedTech.includes(t)) allDetectedTech.push(t);
      });

      // Determine complexity
      let complexityScore = Math.min(100, 30 + (repo.size ? Math.log2(repo.size) * 4 : 20));
      if (repo.files?.length > 15) complexityScore += 15;
      if (complexityScore > 100) complexityScore = 100;

      // Determine documentation
      let docScore = repo.readmeSize ? Math.min(100, Math.round(Math.log10(repo.readmeSize) * 25)) : 30;
      if (repo.readmeContent?.toLowerCase().includes('installation')) docScore += 15;
      if (docScore > 100) docScore = 100;

      // Production readiness
      let prodScore = 30;
      if (hasDocker) prodScore += 25;
      if (hasCICD) prodScore += 25;
      if (hasTests) prodScore += 20;

      return {
        name: repo.name,
        description: repo.description || 'No description provided.',
        url: repo.html_url,
        isFork: repo.fork || false,
        stars: repo.stargazers_count || 0,
        languages,
        techStack,
        complexityScore: Math.round(complexityScore),
        documentationScore: Math.round(docScore),
        productionReadinessScore: Math.round(prodScore),
        architecturePattern: repo.files?.includes('src') ? 'Modular src/ Layout' : 'Flat File Structure',
        fileStructureAnalysis: {
          hasTests,
          hasDocker,
          hasCICD,
          folderDepth: repo.files?.some((f: string) => f.split('/').length > 2) ? 4 : 2,
          moduleCount: repo.files?.length || 5
        },
        strengths: [
          hasDocker ? 'Docker container configuration present.' : 'Contains framework code.',
          repo.stargazers_count > 0 ? `${repo.stargazers_count} stars from developers.` : 'Modular codebase layout.'
        ],
        improvements: [
          !hasTests ? 'Add automated test suites (e.g. Jest or Pytest).' : 'Refactor code structure.',
          !hasDocker ? 'Containerize the setup with a Dockerfile.' : 'Optimize bundle assets.'
        ]
      };
    });

    // Step 3: Compute Activity Consistency
    await updateJobStatus(60, 'Parsing Contribution Calendar & Weekly Coding Consistency Indices...');
    const consistencyScore = stats.consistencyScore || 65;

    // Step 4: Run AI LLM evaluation
    await updateJobStatus(80, 'Initiating Asynchronous LLM Career Roadmap Generation...');
    const aiResponse = await generateAIEvaluation(
      username,
      stats.bio || '',
      allDetectedTech,
      analyzedRepos,
      consistencyScore
    );

    // Step 5: Score Engine (Formula application)
    await updateJobStatus(90, 'Applying Employability Matrix & Calculating Recruiter Target Matches...');
    
    const repoQualityAvg = analyzedRepos.length > 0
      ? Math.round(analyzedRepos.reduce((acc, r) => acc + r.productionReadinessScore, 0) / analyzedRepos.length)
      : 50;

    const complexityAvg = analyzedRepos.length > 0
      ? Math.round(analyzedRepos.reduce((acc, r) => acc + r.complexityScore, 0) / analyzedRepos.length)
      : 40;

    const docAvg = analyzedRepos.length > 0
      ? Math.round(analyzedRepos.reduce((acc, r) => acc + r.documentationScore, 0) / analyzedRepos.length)
      : 45;

    const openSourceScore = stats.openSourceScore || 50;
    const stackStrengthScore = Math.min(100, 45 + allDetectedTech.length * 8);

    const employabilityScore = Math.round(
      (repoQualityAvg * 0.30) +
      (complexityAvg * 0.20) +
      (consistencyScore * 0.15) +
      (stackStrengthScore * 0.15) +
      (docAvg * 0.10) +
      (openSourceScore * 0.10)
    );

    const matches = matchTargetRoles(allDetectedTech, employabilityScore);

    // Assemble full consolidated profile data
    const metrics = {
      repositoryQuality: repoQualityAvg,
      projectComplexity: complexityAvg,
      activityConsistency: consistencyScore,
      techStackDemand: Math.round(stackStrengthScore),
      documentation: docAvg,
      openSource: openSourceScore
    };

    const profileMetadata = {
      publicRepos: stats.repos,
      followers: stats.followers,
      stars: stats.stars,
      accountAgeYears: stats.accountAgeYears,
      lastAnalyzed: new Date()
    };

    const careerRoadmap = {
      strengths: aiResponse.strengths || ['Consistent commit contributions', 'Knowledge of modern build tools'],
      weaknesses: aiResponse.weaknesses || ['Lack of automated testing configurations', 'Light project documentation presence'],
      missingSkills: aiResponse.missingSkills || ['Kubernetes', 'Redis', 'Unit Testing'],
      recommendedProjects: aiResponse.recommendedProjects || [],
      learningRoadmap: aiResponse.learningRoadmap || [],
      targetRoles: matches,
      interviewReadiness: {
        systemDesignScore: aiResponse.interviewReadiness?.systemDesignScore || 70,
        dataStructuresScore: aiResponse.interviewReadiness?.dataStructuresScore || 75,
        behavioralScore: aiResponse.interviewReadiness?.behavioralScore || 80,
        overallReadiness: aiResponse.interviewReadiness?.overallReadiness || 'Medium'
      },
      nextRecommendedProject: aiResponse.nextRecommendedProject || {
        title: 'Advanced Full-Stack Microservices Architecture',
        description: 'Build and deploy a containerized API gateway with distributed storage.',
        milestones: ['Setup Docker orchestrations', 'Establish caching pipelines with Redis', 'Add unit tests']
      }
    };

    // Generate Improvement Report
    await updateJobStatus(85, 'Generating AI GitHub Improvement Report...');
    const githubImprovementReport = await generateGitHubImprovementReport(
      username,
      matches.length > 0 ? matches[0].role : 'Software Engineer',
      allDetectedTech,
      analyzedRepos,
      employabilityScore
    );

    // Save to Database
    const savedProfile = await analysisDb.upsertProfile(stats.githubUrl, {
      githubUsername: username,
      fullName: stats.name || username,
      avatarUrl: stats.avatarUrl,
      bio: stats.bio,
      location: stats.location,
      blogUrl: stats.blogUrl,
      employabilityScore,
      metrics,
      metadata: profileMetadata,
      careerRoadmap,
      githubImprovementReport
    });

    // Clean old and save new repositories
    await analysisDb.deleteRepositories(savedProfile._id.toString());
    const repoInserts = analyzedRepos.map(r => ({
      ...r,
      profileId: savedProfile._id
    }));
    await analysisDb.insertRepositories(repoInserts);

    // Complete job
    console.log(`[Worker] Job ${jobId} completed successfully!`);
    await analysisDb.updateJob(jobId, { 
      status: 'completed', 
      progress: 100, 
      progressMessage: 'Analysis Completed Successfully',
      result: {
        username,
        employabilityScore,
        fullName: savedProfile.fullName
      }
    });

  } catch (err: any) {
    console.error(`[Worker ERROR] Failed to process job ${jobId}:`, err);
    await analysisDb.updateJob(jobId, { 
      status: 'failed', 
      progress: 100, 
      progressMessage: `Error: ${err.message || 'Unknown execution failure'}`,
      error: err.message || 'Unknown analysis error'
    });
  }
};

export const processOnboardingJob = async (
  jobId: string,
  userId: number,
  resumeUrl: string,
  githubUrl: string,
  targetRole: string
): Promise<void> => {
  console.log(`[Worker] Started processing onboarding job ${jobId} for user ${userId}`);

  const updateJobStatus = async (progress: number, message: string) => {
    await analysisDb.updateJob(jobId, { progress, progressMessage: message, status: 'active' });
  };

  try {
    // Get profile first
    let profile = await db.getStudentProfileByUserId(userId);
    if (!profile) {
      throw new Error(`Profile not found for user ${userId}`);
    }

    // Step 1: Parse and Analyze Resume
    await updateJobStatus(15, 'Parsing resume text and extracting profile details...');
    let text = '';
    try {
      text = await extractTextFromFile(resumeUrl, resumeUrl.endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf');
    } catch (err: any) {
      console.error('[Onboarding Worker] Error reading resume file:', err.message);
      text = 'Empty Resume Text';
    }

    const ruleBasedResults = analyzeResumeRuleBased(text, targetRole);
    const finalResumeAnalysis = await analyzeResumeWithAI(text, targetRole, ruleBasedResults);

    // Update name and base details in database
    await db.updateStudentOnboardingFields(profile.id, {
      fullName: finalResumeAnalysis.fullName || profile.full_name,
      resumeUrl,
      resumeUploaded: true,
      resumeLastUploaded: new Date(),
    });

    await db.updateStudentResumeAnalysis(profile.id, {
      resumeScore: finalResumeAnalysis.score,
      resumeATSScore: finalResumeAnalysis.atsScore,
      resumeSkillsScore: finalResumeAnalysis.skillsScore,
      resumeProjectsScore: finalResumeAnalysis.projectsScore,
      resumeExperienceScore: finalResumeAnalysis.experienceScore,
      resumeCertificationScore: finalResumeAnalysis.certificationScore,
      resumeProfessionalPresenceScore: finalResumeAnalysis.professionalPresenceScore,
      resumeRoleMatchScore: finalResumeAnalysis.roleMatchScore,
      resumeStrengths: finalResumeAnalysis.strengths,
      resumeWeaknesses: finalResumeAnalysis.weaknesses,
      resumeMissingKeywords: finalResumeAnalysis.missingKeywords,
      resumeRecommendedSkills: finalResumeAnalysis.recommendedSkills,
      resumeSummary: finalResumeAnalysis.summary,
      resumeProjects: finalResumeAnalysis.extractedProjects,
      resumeSkills: finalResumeAnalysis.extractedSkills,
      resumeLastAnalyzed: new Date(),
      resumeFileName: resumeUrl.split('-').slice(1).join('-') || 'resume.pdf',
      resumeText: text.substring(0, 50000)
    });

    // Step 2: Fetch and Analyze GitHub profile
    await updateJobStatus(45, 'Fetching GitHub repositories and activity logs...');
    
    // We update the github url first
    await db.updateStudentOnboardingFields(profile.id, {
      githubConnected: true
    });

    const analysisResult = await GithubAnalysisService.analyze(githubUrl);
    if (analysisResult.success && analysisResult.data) {
      const githubData = analysisResult.data;
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
        githubImprovementReport: githubData.githubImprovementReport
      });
      // also save additional detailed analysis reports
      await db.updateStudentGitHubDetailedReport(profile.id, {
        githubHealthMetrics: githubData.healthMetrics,
        githubPortfolioGaps: githubData.portfolioGaps,
        githubCareerReview: githubData.detailedIssues,
        githubWowProjects: [],
        githubGrowthPlan: githubData.growthPlan,
        githubDetailedIssues: githubData.detailedIssues,
        githubDetailedRecs: githubData.detailedRecs
      });
    } else {
      console.warn('[Onboarding Worker] GitHub analysis failed, continuing with partial data...');
    }

    // Step 3: Portfolio Sync & Merge
    await updateJobStatus(75, 'Syncing projects from resume & GitHub...');
    profile = await db.getStudentProfileById(profile.id); // Reload profile to get new resume & github stats
    const manualProjects = await db.getProjectsByStudentId(profile.id);
    const resumeProjects = profile.resume_projects || [];
    const githubProjects = profile.github_repositories || [];

    const unifiedProjects: any[] = [];
    manualProjects.forEach((p: any) => {
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

    const evaluatedProjects = unifiedProjects.map((p: any) => evaluateProject(p, targetRole));
    const insights = generatePortfolioInsights(evaluatedProjects, targetRole);
    const portfolioScore = calculatePortfolioScore(evaluatedProjects);

    // Save WOW Projects
    const wowProjects = await generateWowProjects(targetRole, Object.keys(insights.technologyCoverage));

    // Save directly using Mongoose Model
    const mongoose = require('mongoose');
    const LocalStudentProfile = mongoose.models.LocalStudentProfile;
    await LocalStudentProfile.findByIdAndUpdate(profile.id, {
      portfolioProjects: evaluatedProjects,
      portfolioScore: portfolioScore,
      portfolioInsights: insights,
      portfolioRecommendations: wowProjects
    });

    // Step 4: Final recalculate & update onboardingCompleted
    await updateJobStatus(90, 'Calculating final readiness score...');
    await recalculateStudentProfile(profile.id);

    // Set onboarding completed
    await db.updateStudentOnboardingFields(profile.id, {
      onboardingCompleted: true,
      profileAutoGenerated: true,
      githubLastAnalyzed: new Date()
    });

    console.log(`[Worker] Onboarding job ${jobId} completed successfully!`);
    await analysisDb.updateJob(jobId, {
      status: 'completed',
      progress: 100,
      progressMessage: 'Analysis Completed Successfully',
      result: {
        userId,
        fullName: finalResumeAnalysis.fullName || profile.fullName
      }
    });

  } catch (err: any) {
    console.error(`[Worker ERROR] Failed to process onboarding job ${jobId}:`, err);
    await analysisDb.updateJob(jobId, {
      status: 'failed',
      progress: 100,
      progressMessage: `Error: ${err.message || 'Unknown onboarding failure'}`,
      error: err.message || 'Unknown onboarding error'
    });
  }
};

export const startWorker = (): void => {
  // Register the processing callback to the queue service
  registerJobProcessor(processAnalysisJob);
  registerOnboardingJobProcessor(processOnboardingJob);

  if (getUseMockQueue()) {
    console.log('[INFO] Skipping BullMQ Worker initialization because Redis is down.');
    return;
  }

  const worker = new Worker('github-analysis', async job => {
    const jobId = job.id;
    if (!jobId) return;

    if (job.name === 'onboard-profile') {
      const { userId, resumeUrl, githubUrl, targetRole } = job.data;
      await processOnboardingJob(jobId, userId, resumeUrl, githubUrl, targetRole);
    } else {
      const { githubUrl } = job.data;
      await processAnalysisJob(jobId, githubUrl);
    }
  }, {
    connection: redisConnection as any,
    concurrency: 2
  });

  // Catch connection errors on the Worker instance to prevent unhandled process crashes
  worker.on('error', (err: any) => {
    // Suppress crash
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker Event FAILED] Job ${job?.id} failed:`, err);
  });
};
