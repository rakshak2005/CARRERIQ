import { GoogleGenerativeAI } from '@google/generative-ai';
import { ScoreOutput } from './scoreEngine';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY || '';

export interface AIRecommendation {
  category: string;
  recommendation: string;
}

export interface AICandidateSummary {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  verdict: 'Strong Hire' | 'Interview' | 'Keep on File';
}

// Generate realistic simulated career insight roadmap when LLM is unavailable
const getSimulatedAIEvaluation = (username: string, techStack: string[]) => {
  const lowerStack = techStack.map(t => t.toLowerCase());
  const isFrontend = lowerStack.some(t => ['react', 'next.js', 'vue', 'angular', 'typescript'].includes(t));

  return {
    strengths: [
      isFrontend ? 'Strong focus on declarative frontend component architectures.' : 'Clean RESTful routing and backend module boundaries.',
      'Active developer profile showing core awareness of containerized configurations.'
    ],
    weaknesses: [
      'Minimal or no unit testing suites configured in public repositories.',
      'Project documentations are basic; could benefit from setup details and usage screenshots.'
    ],
    missingSkills: isFrontend ? ['TypeScript Interfaces', 'Jest Testing', 'Tailwind CSS'] : ['Redis Caching', 'Kubernetes Orchestration', 'Jest API Testing'],
    recommendedProjects: [
      {
        title: isFrontend ? 'State-Distributed Ecommerce Web Dashboard' : 'Distributed Pub/Sub Broker Queue System',
        description: isFrontend ? 'Create a Next.js interface caching API loads locally using React Query.' : 'Build a message broker supporting topic subscriptions and client routing.',
        milestones: [
          'Setup network connection protocols',
          'Integrate client caching wrappers',
          'Write automated tests for message transfers'
        ]
      }
    ],
    learningRoadmap: [
      {
        topic: isFrontend ? 'Next.js App Router & SSR Optimization' : 'Redis Cluster Caching Strategy',
        duration: '10 days',
        resource: 'Official Documentation & Guides'
      }
    ],
    interviewReadiness: {
      systemDesignScore: 72,
      dataStructuresScore: 68,
      behavioralScore: 80,
      overallReadiness: 'Medium'
    },
    nextRecommendedProject: {
      title: isFrontend ? 'Dynamic Responsive Portfolio Template' : 'Microservices Authentication Gateway',
      description: isFrontend ? 'Create a Tailwind CSS layout optimized for mobile screens.' : 'Secure endpoint interactions with JWT exchanges and token rotations.',
      milestones: [
        'Establish JWT payload distributions',
        'Verify request intercepts under simulated load',
        'Package into docker container configurations'
      ]
    }
  };
};

// Main entry point for worker queue to query LLM Career Evaluations
export const generateAIEvaluation = async (
  username: string,
  bio: string,
  techStack: string[],
  repositories: any[],
  consistencyScore: number
): Promise<any> => {
  if (!GEMINI_API_KEY) {
    console.log('[INFO] GEMINI_API_KEY not set. Using simulated evaluations.');
    return getSimulatedAIEvaluation(username, techStack);
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `
      You are a Technical Director and expert Recruiter. Evaluate this developer's GitHub presence:
      - Username: ${username}
      - Bio: ${bio}
      - Detected Tech Stack: ${techStack.join(', ')}
      - Repositories: ${JSON.stringify(repositories.map(r => ({
          name: r.name,
          description: r.description,
          languages: r.languages,
          techStack: r.techStack,
          complexityScore: r.complexityScore,
          documentationScore: r.documentationScore,
          productionReadinessScore: r.productionReadinessScore
        })))}
      - Commit Consistency Score: ${consistencyScore}/100

      Perform a career readiness evaluation. You MUST output a JSON object with this exact schema:
      {
        "strengths": ["string"],
        "weaknesses": ["string"],
        "missingSkills": ["string"],
        "recommendedProjects": [
          {
            "title": "string",
            "description": "string",
            "milestones": ["string"]
          }
        ],
        "learningRoadmap": [
          {
            "topic": "string",
            "duration": "string",
            "resource": "string"
          }
        ],
        "interviewReadiness": {
          "systemDesignScore": number (0-100),
          "dataStructuresScore": number (0-100),
          "behavioralScore": number (0-100),
          "overallReadiness": "High" | "Medium" | "Low"
        },
        "nextRecommendedProject": {
          "title": "string",
          "description": "string",
          "milestones": ["string"]
        }
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return JSON.parse(responseText);

  } catch (err: any) {
    console.warn('[WARNING] Gemini career evaluation query failed:', err.message);
    return getSimulatedAIEvaluation(username, techStack);
  }
};

// Keep existing heuristic helpers for PostgreSQL backward-compatibility
export const generateRecommendations = (
  profile: any,
  scores: ScoreOutput,
  projects: any[],
  certificates: any[]
): AIRecommendation[] => {
  const recommendations: AIRecommendation[] = [];
  const targetRole = profile.target_role || 'Software Engineer';

  if (!profile.resume_url) {
    recommendations.push({
      category: 'Resume',
      recommendation: `Upload your resume to calculate your actual Resume score and unlock target role alignment checks for "${targetRole}".`
    });
  } else if (scores.categoryScores.resumeScore < 85) {
    recommendations.push({
      category: 'Resume',
      recommendation: `Your resume score is at ${scores.categoryScores.resumeScore}%. Tailor key bullet points to align with the target role "${targetRole}".`
    });
  }

  if (projects.length === 0) {
    recommendations.push({
      category: 'Projects',
      recommendation: 'Add at least two repositories showing framework usage, CI/CD integrations, or Docker container configurations.'
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      category: 'Next Steps',
      recommendation: 'Link an active GitHub profile and continue learning system design paradigms.'
    });
  }

  return recommendations;
};

export const generateCandidateSummary = (
  profile: any,
  scores: ScoreOutput,
  projects: any[],
  certificates: any[]
): AICandidateSummary => {
  const name = profile.full_name;
  const role = profile.target_role || 'General Software Engineering';
  const overall = scores.overallScore;

  const strengths: string[] = ['Baseline profile configuration complete'];
  const weaknesses: string[] = [];
  let verdict: 'Strong Hire' | 'Interview' | 'Keep on File' = 'Interview';

  if (overall >= 80) verdict = 'Strong Hire';
  else if (overall >= 50) verdict = 'Interview';
  else verdict = 'Keep on File';

  return {
    summary: `${name} shows a readiness rating of ${overall}% for the role of ${role}.`,
    strengths,
    weaknesses,
    verdict
  };
};

export interface WowProjectRecommendation {
  difficulty: 'Easy' | 'Medium' | 'Advanced' | 'WOW';
  title: string;
  description: string;
  skillsLearned: string[];
  resumeImpact: string;
  hiringImpact: string;
}

export const generateWowProjects = async (targetRole: string, currentSkills: string[]): Promise<WowProjectRecommendation[]> => {
  if (!GEMINI_API_KEY) {
    return [
      {
        difficulty: 'WOW',
        title: 'Full Stack SaaS Dashboard',
        description: 'Build a multi-tenant B2B dashboard with authentication, subscriptions, and complex data visualization.',
        skillsLearned: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'Chart.js'],
        resumeImpact: 'Demonstrates ability to ship end-to-end products.',
        hiringImpact: 'High signal for product-minded engineering roles.'
      }
    ];
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `
      You are an elite career coach and technical recruiter. 
      Generate 4 highly specific project recommendations for a \${targetRole} developer.
      Their current skills: \${currentSkills.join(', ')}.

      The projects MUST be separated into these 4 difficulties: 'Easy', 'Medium', 'Advanced', 'WOW'.
      The 'WOW' project must be an exceptionally impressive, portfolio-defining project (like an AI tool, an analytics platform, a real-time collaborative tool, etc) that would blow a recruiter away.

      You must return a JSON array containing exactly 4 objects matching this schema:
      [
        {
          "difficulty": "Easy" | "Medium" | "Advanced" | "WOW",
          "title": "string",
          "description": "string",
          "skillsLearned": ["string"],
          "resumeImpact": "string",
          "hiringImpact": "string"
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (err: any) {
    console.warn('[WARNING] Gemini WOW project generation failed:', err.message);
    return [];
  }
};

export const generateGitHubImprovementReport = async (
  username: string,
  targetRole: string,
  techStack: string[],
  repos: any[],
  currentScore: number
): Promise<any> => {
  if (!GEMINI_API_KEY) {
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `
      You are an elite Senior Staff Engineer and Technical Recruiter.
      Evaluate the GitHub profile and repositories for candidate "\${username}" aiming for "\${targetRole}".
      
      Repositories Data:
      \${JSON.stringify(repos.map(r => ({ name: r.name, description: r.description, languages: r.languages, complexityScore: r.complexityScore, docScore: r.documentationScore, prodScore: r.productionReadinessScore, fileStructure: r.fileStructureAnalysis })), null, 2)}
      
      Detected Tech Stack: \${techStack.join(', ')}
      Current Employability Score: \${currentScore}/100

      Return a comprehensive GitHub Improvement Report strictly matching this JSON schema:
      {
        "drawbacksAndIssues": [
          {
            "issue": "string",
            "impactLevel": "Critical" | "Medium" | "Minor",
            "affectedRepositories": ["string"]
          }
        ],
        "recommendedImprovements": [
          {
            "description": "string",
            "difficulty": "string",
            "expectedScoreGain": number,
            "estimatedTime": "string"
          }
        ],
        "growthPotential": {
          "currentScore": number,
          "potentialScore": number,
          "improvementPercentage": number
        },
        "aiReview": {
          "strengths": ["string"],
          "weaknesses": ["string"],
          "hiringImpact": ["string"],
          "overallVerdict": "string"
        }
      }
    `;

    const result = await model.generateContent(prompt);
    let jsonStr = result.response.text().trim();
    const firstBrace = jsonStr.indexOf('{');
    const lastBrace = jsonStr.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
      jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
    }
    return JSON.parse(jsonStr);
  } catch (err: any) {
    console.warn('[WARNING] Gemini GitHub Improvement Report failed:', err.message);
    return null;
  }
};

export const generateDetailedCareerReview = async (
  username: string,
  targetRole: string,
  techStack: string[],
  repos: any[],
  currentScore: number
): Promise<any> => {
  const fallback = {
    strengths: ['Demonstrates consistent coding activity', 'Shows a good grasp of core concepts in detected languages'],
    weaknesses: ['Could benefit from more automated testing setups', 'Missing comprehensive CI/CD pipelines in major projects'],
    hiringImpact: 'Candidates with this profile usually pass initial technical screens but might struggle in deep architectural interviews.',
    recruiterPerspective: 'The portfolio shows promise and active engagement, but lacks standout production-ready projects.',
    portfolioMaturity: 'Intermediate. Good foundational projects, but needs more enterprise-level complexity.',
    interviewReadiness: 'Ready for junior to mid-level practical coding rounds. Needs preparation for system design.',
    overallVerdict: 'A solid portfolio showing good technical progression. Enhancing DevOps and testing will maximize employability.'
  };

  if (!GEMINI_API_KEY) {
    return fallback;
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `
      You are an elite Senior Staff Engineer and Technical Recruiter.
      Evaluate the GitHub profile and repositories for candidate "${username}" aiming for "${targetRole}".
      
      Repositories Data:
      ${JSON.stringify(repos.slice(0, 10).map(r => ({ name: r.name, description: r.description, languages: r.languages, complexity: r.complexityLevel })), null, 2)}
      
      Detected Tech Stack: ${techStack.join(', ')}
      Current Employability Score: ${currentScore}/100

      Return a comprehensive 7-dimension AI Career Review strictly matching this JSON schema:
      {
        "strengths": ["string"],
        "weaknesses": ["string"],
        "hiringImpact": "string",
        "recruiterPerspective": "string",
        "portfolioMaturity": "string",
        "interviewReadiness": "string",
        "overallVerdict": "string"
      }
    `;

    const result = await model.generateContent(prompt);
    let jsonStr = result.response.text().trim();
    const firstBrace = jsonStr.indexOf('{');
    const lastBrace = jsonStr.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
      jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
    }
    return JSON.parse(jsonStr);
  } catch (err: any) {
    console.warn('[WARNING] Gemini Detailed Career Review failed:', err.message);
    return fallback;
  }
};
