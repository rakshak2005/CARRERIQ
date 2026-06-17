export interface IProjectUnified {
  title: string;
  description: string;
  technologies: string[];
  source: 'resume' | 'manual' | 'github';
  githubUrl?: string;
  liveUrl?: string;

  // Analysis results
  projectType?: string;
  complexityScore?: number;
  technologyScore?: number;
  roleRelevanceScore?: number;
  professionalismScore?: number;
  projectScore?: number;
  recommendedOrder?: number;
}

export interface IPortfolioInsights {
  strongestProject?: IProjectUnified;
  weakestProject?: IProjectUnified;
  mostRelevantProject?: IProjectUnified;
  mostComplexProject?: IProjectUnified;
  technologyCoverage: Record<string, number>;
  projectTypeCoverage: Record<string, number>;
  missingConcepts: string[];
  missingTechnologies: string[];
  bestResumeProjectOrder: string[];
}

const COMPLEXITY_KEYWORDS = [
  { keywords: ['auth', 'login', 'jwt', 'oauth', 'passport', 'clerk', 'firebase auth'], points: 10, concept: 'Authentication' },
  { keywords: ['database', 'mongo', 'postgres', 'sql', 'mysql', 'supabase', 'prisma', 'orm'], points: 10, concept: 'Database' },
  { keywords: ['api', 'rest', 'graphql', 'stripe', 'twilio', 'sendgrid', 'payment'], points: 10, concept: 'API Integrations' },
  { keywords: ['upload', 'aws s3', 'cloudinary', 'multer', 'file handling'], points: 5, concept: 'File Uploads' },
  { keywords: ['realtime', 'socket.io', 'websocket', 'pusher', 'webrtc'], points: 10, concept: 'Realtime Systems' },
  { keywords: ['ai', 'ml', 'openai', 'gemini', 'gpt', 'machine learning', 'tensor', 'nlp'], points: 15, concept: 'AI Features' },
  { keywords: ['stripe', 'paypal', 'checkout', 'payment'], points: 10, concept: 'Payments' },
  { keywords: ['docker', 'container', 'kubernetes', 'k8s'], points: 10, concept: 'Docker' },
  { keywords: ['ci/cd', 'github actions', 'jenkins', 'pipeline', 'deployment'], points: 10, concept: 'CI/CD' },
  { keywords: ['test', 'jest', 'cypress', 'playwright', 'mocha'], points: 5, concept: 'Testing' },
];

const MODERN_TECH = [
  'react', 'next.js', 'node.js', 'express', 'mongodb', 'postgresql', 'typescript',
  'docker', 'aws', 'firebase', 'tailwind', 'graphql', 'redis', 'kafka', 'kubernetes'
];

const ROLE_KEYWORDS: Record<string, string[]> = {
  'frontend': ['react', 'vue', 'angular', 'next', 'tailwind', 'css', 'html', 'javascript', 'typescript', 'redux', 'framer'],
  'backend': ['node', 'express', 'django', 'flask', 'spring', 'java', 'python', 'sql', 'mongodb', 'postgres', 'redis', 'api'],
  'fullstack': ['react', 'node', 'express', 'mongodb', 'postgres', 'next', 'typescript'],
  'data': ['python', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'sql', 'spark', 'hadoop'],
  'devops': ['docker', 'kubernetes', 'aws', 'gcp', 'azure', 'jenkins', 'ci/cd', 'terraform', 'ansible']
};

export const evaluateProject = (project: any, targetRole: string = 'Software Engineer'): IProjectUnified => {
  const unified: IProjectUnified = {
    title: project.title || 'Untitled Project',
    description: project.description || '',
    technologies: Array.isArray(project.technologies) 
      ? project.technologies 
      : (typeof project.technologies === 'string' ? project.technologies.split(',').map((t: string) => t.trim()) : []),
    source: project.source || 'manual',
    githubUrl: project.githubUrl || project.projectUrl || '',
    liveUrl: project.liveUrl || '',
  };

  const textToAnalyze = `${unified.title} ${unified.description} ${unified.technologies.join(' ')}`.toLowerCase();

  // 1. Complexity Score (0-40)
  let complexity = 20; // Base score for CRUD
  let detectedConcepts: string[] = [];
  for (const item of COMPLEXITY_KEYWORDS) {
    if (item.keywords.some(k => textToAnalyze.includes(k.toLowerCase()))) {
      complexity += item.points;
      detectedConcepts.push(item.concept);
    }
  }
  unified.complexityScore = Math.min(40, complexity);

  // 2. Technology Score (0-20)
  let techScore = 0;
  for (const tech of unified.technologies) {
    if (MODERN_TECH.includes(tech.toLowerCase())) {
      techScore += 3;
    } else {
      techScore += 1;
    }
  }
  unified.technologyScore = Math.min(20, techScore);

  // 3. Role Relevance Score (0-25)
  let relevance = 5;
  const roleKey = Object.keys(ROLE_KEYWORDS).find(k => targetRole.toLowerCase().includes(k)) || 'fullstack';
  const targetKeywords = ROLE_KEYWORDS[roleKey] || ROLE_KEYWORDS['fullstack'];
  
  for (const tech of unified.technologies) {
    if (targetKeywords.includes(tech.toLowerCase())) {
      relevance += 4;
    }
  }
  // Check description for keywords
  for (const word of targetKeywords) {
    if (unified.description.toLowerCase().includes(word)) relevance += 2;
  }
  unified.roleRelevanceScore = Math.min(25, relevance);

  // 4. Professionalism Score (0-15)
  let professionalism = 0;
  if (unified.githubUrl) professionalism += 5;
  if (unified.liveUrl) professionalism += 5;
  if (unified.description && unified.description.length > 50) professionalism += 5;
  unified.professionalismScore = Math.min(15, professionalism);

  // 5. Total Project Score
  unified.projectScore = 
    (unified.complexityScore || 0) + 
    (unified.technologyScore || 0) + 
    (unified.roleRelevanceScore || 0) + 
    (unified.professionalismScore || 0);

  // 6. Project Type Classification
  let typeScores: Record<string, number> = {};
  for (const type of Object.keys(ROLE_KEYWORDS)) {
    typeScores[type] = 0;
    for (const kw of ROLE_KEYWORDS[type]) {
      if (textToAnalyze.includes(kw)) typeScores[type]++;
    }
  }
  let bestType = 'fullstack';
  let maxScore = -1;
  for (const [type, score] of Object.entries(typeScores)) {
    if (score > maxScore) {
      maxScore = score;
      bestType = type;
    }
  }
  const typeMap: Record<string, string> = {
    'frontend': 'Frontend',
    'backend': 'Backend',
    'fullstack': 'Full Stack',
    'data': 'Data Science/AI',
    'devops': 'DevOps'
  };
  unified.projectType = typeMap[bestType] || 'Full Stack';

  return unified;
};

export const generatePortfolioInsights = (projects: IProjectUnified[], targetRole: string): IPortfolioInsights => {
  const sorted = [...projects].sort((a, b) => (b.projectScore || 0) - (a.projectScore || 0));
  
  // Rank projects
  sorted.forEach((p, idx) => p.recommendedOrder = idx + 1);

  const strongestProject = sorted[0];
  const weakestProject = sorted[sorted.length - 1];
  
  const mostComplexProject = [...projects].sort((a, b) => (b.complexityScore || 0) - (a.complexityScore || 0))[0];
  const mostRelevantProject = [...projects].sort((a, b) => (b.roleRelevanceScore || 0) - (a.roleRelevanceScore || 0))[0];

  const techCoverage: Record<string, number> = {};
  const typeCoverage: Record<string, number> = {};
  
  let allText = '';
  projects.forEach(p => {
    p.technologies.forEach(t => {
      const tl = t.toLowerCase();
      techCoverage[tl] = (techCoverage[tl] || 0) + 1;
    });
    if (p.projectType) {
      typeCoverage[p.projectType] = (typeCoverage[p.projectType] || 0) + 1;
    }
    allText += `${p.title} ${p.description} ${p.technologies.join(' ')} `.toLowerCase();
  });

  // Gap Analysis
  const missingConcepts = [];
  for (const item of COMPLEXITY_KEYWORDS) {
    if (!item.keywords.some(k => allText.includes(k.toLowerCase()))) {
      missingConcepts.push(item.concept);
    }
  }

  const roleKey = Object.keys(ROLE_KEYWORDS).find(k => targetRole.toLowerCase().includes(k)) || 'fullstack';
  const targetKeywords = ROLE_KEYWORDS[roleKey] || ROLE_KEYWORDS['fullstack'];
  const missingTechnologies = targetKeywords.filter(k => !allText.includes(k.toLowerCase())).slice(0, 5);

  const bestResumeProjectOrder = sorted.slice(0, 3).map(p => p.title);

  return {
    strongestProject,
    weakestProject,
    mostRelevantProject,
    mostComplexProject,
    technologyCoverage: techCoverage,
    projectTypeCoverage: typeCoverage,
    missingConcepts,
    missingTechnologies,
    bestResumeProjectOrder
  };
};

export const calculatePortfolioScore = (projects: IProjectUnified[]): number => {
  if (!projects || projects.length === 0) return 0;
  // Calculate average of top 5 highest-ranked projects
  const sorted = [...projects].sort((a, b) => (b.projectScore || 0) - (a.projectScore || 0));
  const topProjects = sorted.slice(0, 5);
  const sum = topProjects.reduce((acc, p) => acc + (p.projectScore || 0), 0);
  return Math.round(sum / topProjects.length);
};
