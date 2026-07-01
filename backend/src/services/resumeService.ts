import fs from 'fs';
import path from 'path';
const pdfParse = require('pdf-parse');
import * as mammoth from 'mammoth';
import dotenv from 'dotenv';
import { cleanAndParseJSON } from './aiService';

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

export interface ResumeAnalysisResult {
  fullName?: string;
  text: string;
  score: number;
  atsScore: number;
  skillsScore: number;
  projectsScore: number;
  experienceScore: number;
  certificationScore: number;
  professionalPresenceScore: number;
  roleMatchScore: number;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  recommendedSkills: string[];
  summary: string;
  extractedSkills: string[];
  extractedProjects: any[];
}

export const extractTextFromFile = async (filePath: string, mimeType: string): Promise<string> => {
  const fullPath = path.resolve(__dirname, '../../', filePath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  let text = '';
  if (mimeType === 'application/pdf' || filePath.toLowerCase().endsWith('.pdf')) {
    const dataBuffer = fs.readFileSync(fullPath);
    const data = await pdfParse(dataBuffer);
    text = data.text;
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    filePath.toLowerCase().endsWith('.docx')
  ) {
    const result = await mammoth.extractRawText({ path: fullPath });
    text = result.value;
  } else {
    throw new Error('Unsupported file format. Please upload PDF or DOCX.');
  }

  return normalizeResumeText(text);
};

export const normalizeResumeText = (text: string): string => {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[^\x00-\x7F]/g, ' ') // Remove non-ascii
    .trim();
};

export const analyzeResumeRuleBased = (text: string, targetRole: string): Partial<ResumeAnalysisResult> => {
  const lowerText = text.toLowerCase();

  // Section checks
  const hasName = text.split('\n').slice(0, 5).some(line => line.trim().split(' ').length >= 2);
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone = /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(text);
  const hasSkills = /skills|technologies|tools/i.test(lowerText);
  const hasProjects = /projects|portfolio/i.test(lowerText);
  const hasEducation = /education|university|college|degree/i.test(lowerText);
  const hasExperience = /experience|employment|work history/i.test(lowerText);

  let atsScore = 0;
  if (hasName) atsScore += 3;
  if (hasEmail) atsScore += 3;
  if (hasPhone) atsScore += 3;
  if (hasSkills) atsScore += 4;
  if (hasProjects) atsScore += 4;
  if (hasEducation) atsScore += 4;
  if (hasExperience) atsScore += 4;

  // Length & format check (0-4 max total for format)
  const wordCount = text.split(/\s+/).length;
  if (wordCount > 300 && wordCount < 1500) atsScore += 2; // good length
  const bulletCount = (text.match(/•|- /g) || []).length;
  if (bulletCount > 5) atsScore += 2; // good use of bullets

  atsScore = Math.min(25, atsScore);

  // Professional Presence (max 10)
  let professionalPresenceScore = 0;
  if (/github\.com/i.test(lowerText)) professionalPresenceScore += 4;
  if (/linkedin\.com/i.test(lowerText)) professionalPresenceScore += 4;
  if (/(https?:\/\/|www\.)[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+/i.test(lowerText) && !/github\.com|linkedin\.com/i.test(lowerText)) professionalPresenceScore += 2;

  // Extracted skills (Regex matching common skills for match scoring)
  const commonSkills = [
    'react', 'javascript', 'typescript', 'node.js', 'html', 'css', 'git', 'docker', 'aws', 'python', 'java', 'sql', 'mongodb', 'express', 'linux', 'c++', 'c#', 'angular', 'vue'
  ];
  const extractedSkills = commonSkills.filter(skill => {
    const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-zA-Z0-9_])${escapedSkill}([^a-zA-Z0-9_]|$)`, 'i');
    return regex.test(lowerText);
  });

  // Calculate generic role match based on exact overlap
  let roleMatchScore = 0;
  let skillsScore = 0;

  if (targetRole) {
    const roleTokens = targetRole.toLowerCase().split(' ').filter(t => t.length > 2);
    let matchCount = 0;
    roleTokens.forEach(t => {
      if (lowerText.includes(t)) matchCount++;
    });
    // Give base points for role mention, plus points for overall skills density
    roleMatchScore = Math.min(100, (matchCount > 0 ? 40 : 0) + (extractedSkills.length * 5));
    skillsScore = Math.min(20, extractedSkills.length * 2);
  } else {
    roleMatchScore = Math.min(100, 50 + (extractedSkills.length * 2));
    skillsScore = Math.min(20, extractedSkills.length * 2);
  }

  // Count projects proxy (search for "Project" or "App" or similar tokens near dates/links)
  const projectMatches = lowerText.match(/project|app|platform|dashboard/gi) || [];
  let projectsScore = 0;
  if (projectMatches.length === 0) projectsScore = 0;
  else if (projectMatches.length <= 2) projectsScore = 5;
  else if (projectMatches.length <= 4) projectsScore = 10;
  else if (projectMatches.length <= 6) projectsScore = 15;
  else projectsScore = 20;

  // Experience proxy
  let experienceScore = 0;
  const experienceMatches = lowerText.match(/intern|developer|engineer|freelance/gi) || [];
  if (experienceMatches.length === 0) experienceScore = 0;
  else if (experienceMatches.length <= 2) experienceScore = 8;
  else if (experienceMatches.length <= 4) experienceScore = 12;
  else experienceScore = 15;

  // Certifications proxy
  let certificationScore = 0;
  const certMatches = lowerText.match(/certificate|certification|certified|course/gi) || [];
  if (certMatches.length > 0) certificationScore = 5;
  if (certMatches.length > 2) certificationScore = 10;

  // Calculate Total Score (100)
  // ATS(25) + Skills(20) + Projects(20) + Experience(15) + Certifications(10) + Presence(10) = 100
  const score = atsScore + skillsScore + projectsScore + experienceScore + certificationScore + professionalPresenceScore;

  return {
    score,
    atsScore,
    skillsScore,
    projectsScore,
    experienceScore,
    certificationScore,
    professionalPresenceScore,
    roleMatchScore,
    extractedSkills
  };
};

export const analyzeResumeWithAI = async (text: string, targetRole: string, ruleBasedFallback: Partial<ResumeAnalysisResult>): Promise<ResumeAnalysisResult> => {
  const finalResult: ResumeAnalysisResult = {
    fullName: '',
    text,
    score: ruleBasedFallback.score || 0,
    atsScore: ruleBasedFallback.atsScore || 0,
    skillsScore: ruleBasedFallback.skillsScore || 0,
    projectsScore: ruleBasedFallback.projectsScore || 0,
    experienceScore: ruleBasedFallback.experienceScore || 0,
    certificationScore: ruleBasedFallback.certificationScore || 0,
    professionalPresenceScore: ruleBasedFallback.professionalPresenceScore || 0,
    roleMatchScore: ruleBasedFallback.roleMatchScore || 0,
    strengths: ['Formatting is clean', 'Includes basic required sections'], // Default fallbacks
    weaknesses: ['Could not generate AI insights'],
    missingKeywords: ['Target role keywords not evaluated due to AI failure'],
    recommendedSkills: ['Add more skills relevant to ' + (targetRole || 'your target role')],
    summary: 'AI analysis unavailable. Generated score based purely on rule-based ATS checks.',
    extractedSkills: ruleBasedFallback.extractedSkills || [],
    extractedProjects: []
  };

  // Heuristic fallback name parsing
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let fallbackName = '';
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (/^[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+$/.test(line) && line.split(' ').length <= 4) {
      fallbackName = line;
      break;
    }
  }
  finalResult.fullName = fallbackName || 'Candidate';

  if (!GROQ_API_KEY && !OPENROUTER_API_KEY) {
    console.warn("No GROQ_API_KEY or OPENROUTER_API_KEY, falling back to rule-based ATS analysis");
    return finalResult;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const prompt = `You are an extremely strict, elite technical recruiter and senior ATS systems reviewer.
Target Role: ${targetRole || 'Software Engineer'}

Analyze the candidate's resume with high scrutiny. Be very critical and realistic.
Evaluation Guidelines:
- Do not award high scores easily. A score above 80 should only be given to candidates with strong, proven professional experience.
- Heavily penalize the lack of formal professional work experience (e.g., only having internships or training institutes), missing automated testing (Jest, Cypress, Mocha), lack of CI/CD pipelines, and lack of cloud/DevOps experience (AWS, GCP, Docker, Kubernetes).
- Provide a highly realistic 'atsScore' (typically 30-70 for junior/mid candidates).
- Identify at least 7 to 10 highly specific, concrete weaknesses and key areas for improvement (e.g., testing frameworks, cloud infrastructure, architectural design, database optimization) to give the candidate clear, actionable points for growth.
- The "resumeSummary" must be a long, detailed, and comprehensive summary (at least 5 to 7 sentences) analyzing the candidate's current capabilities, project scope, experience gaps, and career trajectory.
- Evaluate project and experience quality realistically (e.g., standard training/tutorial projects should be scored strictly between 20-50).

Return JSON EXACTLY matching this structure, with no markdown, just the raw JSON object:
{
  "fullName": "string",
  "atsScore": 0,
  "strengths": ["string"],
  "weaknesses": ["string"],
  "missingKeywords": ["string"],
  "recommendedSkills": ["string"],
  "resumeSummary": "string",
  "projectQuality": 0,
  "experienceQuality": 0,
  "interviewReadiness": 0,
  "extractedProjects": [
    {
      "name": "string",
      "technologies": "string",
      "description": "string",
      "githubLink": "string",
      "deploymentLink": "string",
      "projectScore": 0
    }
  ],
  "extractedSkills": ["string"]
}

Resume Text:
"""
${text.substring(0, 8000)}
"""`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY || OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
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

    const aiData = cleanAndParseJSON(responseText);

    // Merge AI insights with the guaranteed ATS scores
    if (aiData.fullName) finalResult.fullName = aiData.fullName;
    finalResult.strengths = aiData.strengths || finalResult.strengths;
    finalResult.weaknesses = aiData.weaknesses || finalResult.weaknesses;
    finalResult.missingKeywords = aiData.missingKeywords || finalResult.missingKeywords;
    finalResult.recommendedSkills = aiData.recommendedSkills || finalResult.recommendedSkills;
    finalResult.summary = aiData.resumeSummary || 'AI analyzed successfully.';
    finalResult.extractedProjects = aiData.extractedProjects || [];

    if (aiData.extractedSkills && Array.isArray(aiData.extractedSkills)) {
      // Merge unique skills
      const allSkills = new Set([...finalResult.extractedSkills, ...aiData.extractedSkills]);
      finalResult.extractedSkills = Array.from(allSkills);
    }

    // AI can influence the final role match score up to +20 points
    if (aiData.interviewReadiness) {
      finalResult.roleMatchScore = Math.min(100, Math.max(0, finalResult.roleMatchScore * 0.5 + aiData.interviewReadiness * 0.5));
    }

    return finalResult;
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error('Error analyzing resume with OpenRouter, falling back to rule-based logic:', error);
    finalResult.summary = 'AI analysis unavailable due to an error: ' + (error.message || 'Unknown Error') + '. Generated score based purely on rule-based ATS checks.';
    finalResult.weaknesses = ['Could not generate AI insights: ' + (error.message || 'Unknown Error')];
    return finalResult;
  }
};
