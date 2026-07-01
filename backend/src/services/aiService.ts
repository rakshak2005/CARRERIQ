import { ScoreOutput } from './scoreEngine';
import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

export const cleanAndParseJSON = (text: string): any => {
  let cleanText = text.trim();
  if (cleanText.startsWith('```')) {
    const lines = cleanText.split('\n');
    if (lines[0].startsWith('```')) lines.shift();
    if (lines[lines.length - 1].startsWith('```')) lines.pop();
    cleanText = lines.join('\n').trim();
  }
  const firstBrace = cleanText.indexOf('{');
  const firstBracket = cleanText.indexOf('[');
  let startIdx = -1;
  let endIdx = -1;
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    endIdx = cleanText.lastIndexOf('}');
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    endIdx = cleanText.lastIndexOf(']');
  }
  if (startIdx !== -1 && endIdx !== -1 && endIdx >= startIdx) {
    cleanText = cleanText.substring(startIdx, endIdx + 1);
  }
  return JSON.parse(cleanText);
};

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
  if (!OPENROUTER_API_KEY) {
    console.log('[INFO] OPENROUTER_API_KEY not set. Using simulated evaluations.');
    return getSimulatedAIEvaluation(username, techStack);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
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

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b:free',
        max_tokens: 3000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    const responseData = await response.json() as any;
    const responseText = responseData.choices?.[0]?.message?.content || '';
    return cleanAndParseJSON(responseText);

  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn('[WARNING] OpenRouter career evaluation query failed:', err.message);
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
  const fallback: WowProjectRecommendation[] = [
    {
      difficulty: 'Easy',
      title: 'Responsive Developer Portfolio',
      description: 'Create a clean, responsive portfolio website showcasing your skills and projects.',
      skillsLearned: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
      resumeImpact: 'Establishes a professional web presence.',
      hiringImpact: 'Demonstrates front-end styling capabilities.'
    },
    {
      difficulty: 'Medium',
      title: 'Real-Time Chat Application',
      description: 'Build a real-time messaging application with private rooms and message history.',
      skillsLearned: ['React', 'Node.js', 'Express', 'Socket.io', 'MongoDB'],
      resumeImpact: 'Demonstrates websocket integration and real-time data handling.',
      hiringImpact: 'Signals competency in real-time communication patterns.'
    },
    {
      difficulty: 'Advanced',
      title: 'RESTful E-Commerce API',
      description: 'Design and implement a secure RESTful API for an e-commerce platform with stripe payment integration.',
      skillsLearned: ['Node.js', 'Express', 'PostgreSQL', 'Sequelize', 'Stripe API', 'Docker'],
      resumeImpact: 'Showcases database design, payment flows, and microservice containerization.',
      hiringImpact: 'Strong signal for backend API development and third-party integrations.'
    },
    {
      difficulty: 'WOW',
      title: 'Multi-Tenant SaaS Analytics Dashboard',
      description: 'Build a complex multi-tenant analytics platform with real-time tracking, customizable reporting, and subscription tier access.',
      skillsLearned: ['Next.js', 'TypeScript', 'Node.js', 'Redis', 'PostgreSQL', 'TailwindCSS', 'ClerkAuth'],
      resumeImpact: 'Shows enterprise-level SaaS architecture capability and high performance caching.',
      hiringImpact: 'Top-tier signal for senior frontend and fullstack developer positions.'
    }
  ];

  if (!OPENROUTER_API_KEY) {
    return fallback;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const prompt = `
      You are an elite career coach and technical recruiter. 
      Generate 4 highly specific project recommendations for a ${targetRole} developer.
      Their current skills: ${currentSkills.join(', ')}.

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

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b:free',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    const responseData = await response.json() as any;
    const responseText = responseData.choices?.[0]?.message?.content || '';
    return cleanAndParseJSON(responseText);
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn('[WARNING] OpenRouter WOW project generation failed:', err.message);
    return fallback;
  }
};

export const generateGitHubImprovementReport = async (
  username: string,
  targetRole: string,
  techStack: string[],
  repos: any[],
  currentScore: number
): Promise<any> => {
  if (!OPENROUTER_API_KEY) {
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const prompt = `
      You are an elite Senior Staff Engineer and Technical Recruiter.
      Evaluate the GitHub profile and repositories for candidate "${username}" aiming for "${targetRole}".
      
      Repositories Data:
      ${JSON.stringify(repos.map(r => ({ name: r.name, description: r.description, languages: r.languages, complexityScore: r.complexityScore, docScore: r.documentationScore, prodScore: r.productionReadinessScore, fileStructure: r.fileStructureAnalysis })), null, 2)}
      
      Detected Tech Stack: ${techStack.join(', ')}
      Current Employability Score: ${currentScore}/100

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

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b:free',
        max_tokens: 3000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    const responseData = await response.json() as any;
    const responseText = responseData.choices?.[0]?.message?.content || '';

    return cleanAndParseJSON(responseText);
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn('[WARNING] OpenRouter GitHub Improvement Report failed:', err.message);
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

  if (!OPENROUTER_API_KEY) {
    return fallback;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
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

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b:free',
        max_tokens: 3000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    const responseData = await response.json() as any;
    const responseText = responseData.choices?.[0]?.message?.content || '';

    return cleanAndParseJSON(responseText);
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn('[WARNING] OpenRouter Detailed Career Review failed:', err.message);
    return fallback;
  }
};
