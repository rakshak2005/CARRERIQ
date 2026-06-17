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
}

export interface ScoreOutput {
  overallScore: number;
  categoryScores: {
    resumeScore: number;
    projectsScore: number;
    experienceScore: number; // calculated proxy for profile completeness/projects
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
    resumeScore = 75; // Legacy Base for upload
    if (input.resumeUrl.endsWith('.pdf')) {
      resumeScore += 15; // PDF bonus
    } else {
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

  // 3. Experience Score (Proxy based on Certificates)
  let experienceScore = 0;
  const certCount = input.certificates.length;
  if (certCount > 0) {
    experienceScore = Math.min(100, certCount * 25); // +25 per certificate
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
    dsaScore = 80; // Base score when enabled
    if (input.githubUrl) {
      dsaScore += 10; // GitHub linked bonus
    }
    if (projectCount >= 2) {
      dsaScore += 10; // Complex projects build algorithms bonus
    }
  } else {
    dsaScore = 0; // Excluded/Not included
  }
  dsaScore = Math.min(100, dsaScore);

  // 6. Overall Weighted Score (0-100)
  let overallScore: number;
  if (input.certificatesIncluded) {
    // Weights (100% Total): Resume 35%, GitHub 30%, Projects 25%, Certifications 10%
    overallScore = Math.round(
      (resumeScore * 0.35) +
      ((input.githubScore || 0) * 0.30) +
      (projectsScore * 0.25) +
      (experienceScore * 0.10)
    );
  } else {
    // Certificates excluded — redistribute: Resume 39%, GitHub 33%, Projects 28%
    overallScore = Math.round(
      (resumeScore * 0.39) +
      ((input.githubScore || 0) * 0.33) +
      (projectsScore * 0.28)
    );
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
