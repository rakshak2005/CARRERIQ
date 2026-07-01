export interface ScoreInput {
  targetRole: string | null;
  resumeUrl: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  dsaIncluded: boolean;
  certificatesIncluded: boolean;
  projects: any[];
  certificates: any[];
  githubScore?: number;
  resumeScore?: number;
  portfolioScore?: number;
}

export interface ScoreOutput {
  overallScore: number;
  categoryScores: {
    resumeScore: number;
    projectsScore: number;
    experienceScore: number;
    onlinePresenceScore: number;
    dsaScore: number;
  };
}

export const calculateScores = (input: ScoreInput): ScoreOutput => {
  // 1. Resume Score (0-100)
  let resumeScore = 0;
  if (input.resumeScore !== undefined && input.resumeScore > 0) {
    resumeScore = input.resumeScore;
  } else if (input.resumeUrl) {
    resumeScore = 75;
    if (input.resumeUrl.endsWith('.pdf')) {
      resumeScore += 15;
    } else {
      resumeScore += 10;
    }
    if (input.targetRole && input.targetRole.length > 3) {
      resumeScore += 10;
    }
  }
  resumeScore = Math.min(100, resumeScore);

  // 2. Projects Score (0-100)
  let projectsScore = 0;
  if (input.portfolioScore !== undefined && input.portfolioScore > 0) {
    projectsScore = input.portfolioScore;
  } else {
    const projectCount = input.projects.length;
    if (projectCount > 0) {
      projectsScore = Math.min(100, projectCount * 30);
      const allHaveTech = input.projects.every(p => p.technologies && p.technologies.trim().length > 0);
      if (allHaveTech && projectCount >= 2) {
        projectsScore += 10;
      }
    }
  }
  projectsScore = Math.min(100, projectsScore);

  // 3. Experience Score (Proxy based on Certificates)
  let experienceScore = 0;
  const certCount = input.certificates.length;
  if (certCount > 0) {
    experienceScore = Math.min(100, certCount * 25);
  } else {
    experienceScore = 0;
  }

  // 4. Online Presence Score (Proxy for LinkedIn - 0-100)
  let onlinePresenceScore = 0;
  if (input.linkedinUrl && input.linkedinUrl.trim().length > 0) {
    onlinePresenceScore += 100;
  }
  onlinePresenceScore = Math.min(100, onlinePresenceScore);

  // 5. DSA Score (0-100)
  let dsaScore = 0;
  if (input.dsaIncluded) {
    dsaScore = 80;
    if (input.githubUrl) {
      dsaScore += 10;
    }
    if (input.projects.length >= 2) {
      dsaScore += 10;
    }
  } else {
    dsaScore = 0;
  }
  dsaScore = Math.min(100, dsaScore);

  // 6. Overall Weighted Score (0-100)
  let overallScore: number;
  const activeGithubScore = input.githubScore || 0;

  // Weights (100% Total): GitHub 45%, Resume 35%, Projects 20%
  overallScore = Math.round(
    (resumeScore * 0.35) +
    (activeGithubScore * 0.45) +
    (projectsScore * 0.20)
  );

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
