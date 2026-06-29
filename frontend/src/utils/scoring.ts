export interface ScoringBreakdown {
  github: number;
  resume: number;
  projects: number;
  certificates: number;
  careerReadiness: number;
}

export interface ClientScoreInput {
  resumeUrl: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  certificatesIncluded: boolean;
  projects: any[];
  certificates: any[];
  githubScore: number;
  githubBreakdown: {
    impact: number;
    quality: number;
    complexity: number;
    consistency: number;
    techDiversity: number;
    community: number;
  } | null;
  resumeBreakdown: {
    roleMatch: number;
    skills: number;
    projects: number;
    experience: number;
  } | null;
}

export interface ClientScoreOutput {
  overallScore: number;
  categoryScores: {
    resumeScore: number;
    projectsScore: number;
    experienceScore: number;
    onlinePresenceScore: number;
    dsaScore: number;
  };
  breakdown: ScoringBreakdown;
  calculations: {
    resumeFormula: string;
    projectsFormula: string;
    careerReadinessFormula: string;
    githubFormula: string;
  };
}

export const calculateClientScores = (input: ClientScoreInput): ClientScoreOutput => {
  // 1. Resume Score (0-100)
  // Formula: Resume Score = (Role Match * 0.40) + ((Skills / 20) * 25) + ((Projects / 20) * 20) + ((Experience / 15) * 15)
  let roleMatch = 0;
  let skills = 0;
  let resumeProjects = 0;
  let experience = 0;

  if (input.resumeBreakdown) {
    roleMatch = input.resumeBreakdown.roleMatch || 0;
    skills = input.resumeBreakdown.skills || 0;
    resumeProjects = input.resumeBreakdown.projects || 0;
    experience = input.resumeBreakdown.experience || 0;
  } else if (input.resumeUrl) {
    roleMatch = 75;
    skills = 14;
    resumeProjects = 15;
    experience = 10;
  }

  const calculatedResumeScore = 
    (roleMatch * 0.40) + 
    ((skills / 20) * 25) + 
    ((resumeProjects / 20) * 20) + 
    ((experience / 15) * 15);
  
  const resumeScore = Math.min(100, Math.max(0, calculatedResumeScore));

  const resumeFormula = `(${roleMatch} × 0.40) + (${skills}/20 × 25) + (${resumeProjects}/20 × 20) + (${experience}/15 × 15) = ${Math.round(resumeScore)}`;

  // 2. Projects Score (0-100)
  let projectsScore = 0;
  let top3Scores: number[] = [];
  if (input.projects && input.projects.length > 0) {
    const sortedProjects = [...input.projects].sort((a, b) => {
      const scoreA = a.projectScore !== undefined ? a.projectScore : (a.complexityScore || 0) + (a.technologyScore || 0) + (a.roleRelevanceScore || 0) + (a.uniquenessScore || 0);
      const scoreB = b.projectScore !== undefined ? b.projectScore : (b.complexityScore || 0) + (b.technologyScore || 0) + (b.roleRelevanceScore || 0) + (b.uniquenessScore || 0);
      return scoreB - scoreA;
    });
    const topProjects = sortedProjects.slice(0, 3);
    top3Scores = topProjects.map(p => p.projectScore !== undefined ? p.projectScore : (p.complexityScore || 0) + (p.technologyScore || 0) + (p.roleRelevanceScore || 0) + (p.uniquenessScore || 0));
    const sum = top3Scores.reduce((acc, score) => acc + score, 0);
    projectsScore = topProjects.length > 0 ? sum / topProjects.length : 0;
  }
  projectsScore = Math.min(100, Math.max(0, projectsScore));

  const projectsFormula = top3Scores.length > 0 
    ? `Average of top ${top3Scores.length} projects (${top3Scores.join(' + ')}) / ${top3Scores.length} = ${Math.round(projectsScore)}`
    : `No projects found = 0`;

  // 3. Certificates/Experience Score (0-100)
  const certCount = input.certificates ? input.certificates.length : 0;
  const experienceScore = Math.min(100, certCount * 25);

  // 4. Online Presence Score (0-100)
  const onlinePresenceScore = (input.linkedinUrl && input.linkedinUrl.trim().length > 0) ? 100 : 0;

  // 5. GitHub Score (0-100)
  let githubScore = 0;
  let gImpact = 0, gQuality = 0, gComplexity = 0, gConsistency = 0, gTechDiversity = 0, gCommunity = 0;
  if (input.githubBreakdown) {
    const gb = input.githubBreakdown as any;
    gImpact = Math.min(20, gb.impact !== undefined ? gb.impact : (gb.activity || 0));
    gQuality = Math.min(20, gb.quality !== undefined ? gb.quality : 0);
    gComplexity = Math.min(20, gb.complexity !== undefined ? gb.complexity : 0);
    gConsistency = Math.min(15, gb.consistency !== undefined ? gb.consistency : Math.round(Math.min(15, (gb.activity || 0) * 0.75)));
    gTechDiversity = Math.min(15, gb.techDiversity !== undefined ? gb.techDiversity : 0);
    gCommunity = Math.min(10, gb.community !== undefined ? gb.community : 0);
    githubScore = gImpact + gQuality + gComplexity + gConsistency + gTechDiversity + gCommunity;
  } else {
    githubScore = input.githubScore || 0;
  }
  githubScore = Math.min(100, Math.max(0, githubScore));

  const githubFormula = input.githubBreakdown 
    ? `Impact (${gImpact}) + Quality (${gQuality}) + Complexity (${gComplexity}) + Consistency (${gConsistency}) + Tech Diversity (${gTechDiversity}) + Community (${gCommunity}) = ${githubScore}`
    : `Total Score = ${githubScore}`;

  // 6. Career Readiness weighted score
  const wResume = 0.40;
  const wGitHub = 0.30;
  const wProjects = 0.20;
  const wCertificates = 0.10;

  let overallScoreRaw = 0;
  let careerReadinessFormula = '';

  if (input.certificatesIncluded) {
    overallScoreRaw = 
      (resumeScore * wResume) +
      (githubScore * wGitHub) +
      (projectsScore * wProjects) +
      (experienceScore * wCertificates);
    careerReadinessFormula = `(Resume × 40%) + (GitHub × 30%) + (Projects × 20%) + (Certificates × 10%) = (${Math.round(resumeScore)} × 0.40) + (${githubScore} × 0.30) + (${Math.round(projectsScore)} × 0.20) + (${Math.round(experienceScore)} × 0.10) = ${Math.round(overallScoreRaw)}`;
  } else {
    const totalActiveWeight = wResume + wGitHub + wProjects; // 0.90
    const normResume = wResume / totalActiveWeight;
    const normGitHub = wGitHub / totalActiveWeight;
    const normProjects = wProjects / totalActiveWeight;

    overallScoreRaw = 
      (resumeScore * normResume) +
      (githubScore * normGitHub) +
      (projectsScore * normProjects);
    careerReadinessFormula = `Weights normalized (Resume = 44.44%, GitHub = 33.33%, Projects = 22.22%):\n(${Math.round(resumeScore)} × 44.44%) + (${githubScore} × 33.33%) + (${Math.round(projectsScore)} × 22.22%) = (${Math.round(resumeScore)} × 0.4444) + (${githubScore} × 0.3333) + (${Math.round(projectsScore)} × 0.2222) = ${Math.round(overallScoreRaw)}`;
  }

  const overallScore = Math.round(overallScoreRaw);

  return {
    overallScore: Math.min(100, Math.max(0, overallScore)),
    categoryScores: {
      resumeScore: Math.round(resumeScore),
      projectsScore: Math.round(projectsScore),
      experienceScore: Math.round(experienceScore),
      onlinePresenceScore,
      dsaScore: 0
    },
    breakdown: {
      github: Math.round(githubScore),
      resume: Math.round(resumeScore),
      projects: Math.round(projectsScore),
      certificates: input.certificatesIncluded ? Math.round(experienceScore) : 0,
      careerReadiness: Math.round(overallScore)
    },
    calculations: {
      resumeFormula,
      projectsFormula,
      careerReadinessFormula,
      githubFormula
    }
  };
};

export const validateAndAlignScores = (serverProfile: any, serverScores: any, serverOverallScore: number, projects: any[], certificates: any[]): { isValid: boolean, corrected: ClientScoreOutput } => {
  // Convert server properties to input format
  const clientInput: ClientScoreInput = {
    resumeUrl: serverProfile.resume_url || null,
    githubUrl: serverProfile.github_url || null,
    linkedinUrl: serverProfile.linkedin_url || null,
    certificatesIncluded: serverProfile.certificates_included !== undefined ? serverProfile.certificates_included : true,
    projects: projects || [],
    certificates: certificates || [],
    githubScore: serverProfile.github_score || 0,
    githubBreakdown: serverProfile.github_breakdown || null,
    resumeBreakdown: serverProfile.resume_role_match_score !== undefined ? {
      roleMatch: serverProfile.resume_role_match_score || 0,
      skills: serverProfile.resume_skills_score || 0,
      projects: serverProfile.resume_projects_score || 0,
      experience: serverProfile.resume_experience_score || 0,
    } : null
  };

  const computed = calculateClientScores(clientInput);
  
  // Assert displayed score === calculated score
  const isOverallValid = serverOverallScore === computed.overallScore;
  const isResumeValid = serverScores.resumeScore === computed.categoryScores.resumeScore;
  const isProjectsValid = serverScores.projectsScore === computed.categoryScores.projectsScore;
  
  const isValid = isOverallValid && isResumeValid && isProjectsValid;
  
  if (!isValid) {
    console.warn(`[SCORE ENGINE INTEGRITY WARNING] Mismatch detected between server-displayed scores and client-calculated scores.`, {
      overall: { displayed: serverOverallScore, calculated: computed.overallScore },
      resume: { displayed: serverScores.resumeScore, calculated: computed.categoryScores.resumeScore },
      projects: { displayed: serverScores.projectsScore, calculated: computed.categoryScores.projectsScore },
    });
  }
  
  return {
    isValid,
    corrected: computed
  };
};
