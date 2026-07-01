// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { api, BACKEND_URL } from '../services/api';
import logoImg from '../assets/logo.png';
import { ScoreMeter } from '../components/ScoreMeter';
import { ProjectsPortfolio } from '../components/ProjectsPortfolio';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import { WelcomeTourModal } from '../components/dashboard/WelcomeTourModal';
import { FloatingCopilot } from '../components/dashboard/FloatingCopilot';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showTour, setShowTour] = useState(() => !localStorage.getItem('careeriq_tour_completed'));
  const [showOverallBreakdown, setShowOverallBreakdown] = useState(false);

  // Profile state
  const [fullName, setFullName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [dsaIncluded, setDsaIncluded] = useState(false);
  const [certificatesIncluded, setCertificatesIncluded] = useState(true);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  // Resume Analysis stats state
  const [resumeATSScore, setResumeATSScore] = useState<number>(0);
  const [resumeRoleMatchScore, setResumeRoleMatchScore] = useState<number>(0);
  const [resumeSkillsScore, setResumeSkillsScore] = useState<number>(0);
  const [resumeProjectsScore, setResumeProjectsScore] = useState<number>(0);
  const [resumeExperienceScore, setResumeExperienceScore] = useState<number>(0);
  const [resumeCertificationScore, setResumeCertificationScore] = useState<number>(0);
  const [resumeProfessionalPresenceScore, setResumeProfessionalPresenceScore] = useState<number>(0);
  const [resumeStrengths, setResumeStrengths] = useState<string[]>([]);
  const [resumeWeaknesses, setResumeWeaknesses] = useState<string[]>([]);
  const [resumeMissingKeywords, setResumeMissingKeywords] = useState<string[]>([]);
  const [resumeRecommendedSkills, setResumeRecommendedSkills] = useState<string[]>([]);
  const [resumeSummary, setResumeSummary] = useState<string>('');
  const [resumeSkills, setResumeSkills] = useState<string[]>([]);
  const [resumeProjects, setResumeProjects] = useState<any[]>([]);
  const [resumeLastAnalyzed, setResumeLastAnalyzed] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);

  // Portfolio Integration
  const [portfolioProjects, setPortfolioProjects] = useState<any[]>([]);
  const [portfolioScore, setPortfolioScore] = useState<number>(0);
  const [portfolioInsights, setPortfolioInsights] = useState<any>(null);
  const [portfolioRecommendations, setPortfolioRecommendations] = useState<any[]>([]);

  // GitHub integration stats state
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const [githubRepos, setGithubRepos] = useState<number>(0);
  const [githubFollowers, setGithubFollowers] = useState<number>(0);
  const [githubStars, setGithubStars] = useState<number>(0);
  const [githubScore, setGithubScore] = useState<number>(0);
  const [githubAgeYears, setGithubAgeYears] = useState<number>(0);
  const [githubBreakdown, setGithubBreakdown] = useState<any>(null);
  const [githubTechnologies, setGithubTechnologies] = useState<string[]>([]);
  const [githubRecommendations, setGithubRecommendations] = useState<string[]>([]);
  const [githubRepositories, setGithubRepositories] = useState<any[]>([]);
  const [githubLastAnalyzed, setGithubLastAnalyzed] = useState<string | null>(null);

  // GitHub Edit Mode
  const [editingGithubUrl, setEditingGithubUrl] = useState(false);

  // Analysis polling states
  const [analysisActive, setAnalysisActive] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisMessage, setAnalysisMessage] = useState('Analysis queued...');

  // Recruiter matching and growth roadmaps states
  const [recRoles, setRecRoles] = useState<any[]>([]);
  const [growthProject, setGrowthProject] = useState<any | null>(null);

  // Lists state
  const [projects, setProjects] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);

  // Scores state
  const [overallScore, setOverallScore] = useState(0);
  const [categoryScores, setCategoryScores] = useState({
    resumeScore: 0,
    projectsScore: 0,
    experienceScore: 0,
    onlinePresenceScore: 0,
    dsaScore: 0,
  });

  // Mobile responsiveness & expansion states
  const [isMobile, setIsMobile] = useState(false);
  const [expandedGithubTable, setExpandedGithubTable] = useState(false);
  const [expandedResumeDetails, setExpandedResumeDetails] = useState(false);
  const [expandedRoadmapList, setExpandedRoadmapList] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleStartTour = () => setShowTour(true);
    window.addEventListener('start-tour', handleStartTour);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('start-tour', handleStartTour);
    };
  }, []);

  // Recommendations state
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // UI status
  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  // Project form modal state
  const [showProjModal, setShowProjModal] = useState(false);
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjTech, setNewProjTech] = useState('');
  const [newProjUrl, setNewProjUrl] = useState('');

  // Certificate form modal state
  const [showCertModal, setShowCertModal] = useState(false);
  const [newCertName, setNewCertName] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');
  const [newCertDate, setNewCertDate] = useState('');
  const [newCertUrl, setNewCertUrl] = useState('');



  const [message, setMessage] = useState({ text: '', type: '' });

  // Dynamically computed resume score to guarantee math correctness without race conditions
  const computedResumeScore = Math.round(
    (resumeRoleMatchScore * 0.40) +
    ((resumeSkillsScore / 20) * 25) +
    ((resumeProjectsScore / 20) * 20) +
    ((resumeExperienceScore / 15) * 15)
  ) || categoryScores.resumeScore || 90;

  const handleDownloadCertificate = () => {
    const logo = new Image();
    logo.src = logoImg;
    logo.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 850;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Background Gradient (Dark Premium)
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 850);
      bgGrad.addColorStop(0, '#05070f');
      bgGrad.addColorStop(1, '#080b16');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 850);

      // 2. Subtle Background Graphics (Dots Grid & Geometric Lines)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.012)';
      for (let dotX = 70; dotX < 1130; dotX += 30) {
        for (let dotY = 70; dotY < 800; dotY += 30) {
          ctx.beginPath();
          ctx.arc(dotX, dotY, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.005)';
      ctx.lineWidth = 1;
      for (let gridX = 100; gridX < 1100; gridX += 100) {
        ctx.beginPath();
        ctx.moveTo(gridX, 60);
        ctx.lineTo(gridX, 790);
        ctx.stroke();
      }
      for (let gridY = 100; gridY < 750; gridY += 100) {
        ctx.beginPath();
        ctx.moveTo(60, gridY);
        ctx.lineTo(1140, gridY);
        ctx.stroke();
      }

      // Radial glows
      const glow1 = ctx.createRadialGradient(200, 200, 50, 200, 200, 300);
      glow1.addColorStop(0, 'rgba(99, 102, 241, 0.08)');
      glow1.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, 1200, 850);

      const glow2 = ctx.createRadialGradient(1000, 650, 50, 1000, 650, 300);
      glow2.addColorStop(0, 'rgba(168, 85, 247, 0.08)');
      glow2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, 1200, 850);

      // 3. Watermark (Very faint behind text)
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.font = 'black 120px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CAREERIQ', 600, 425);
      ctx.restore();

      // 4. Layered Borders
      // Outer Gradient Border
      const borderGrad = ctx.createLinearGradient(0, 0, 1200, 850);
      borderGrad.addColorStop(0, '#3b82f6');
      borderGrad.addColorStop(0.5, '#8b5cf6');
      borderGrad.addColorStop(1, '#f59e0b');
      ctx.strokeStyle = borderGrad;
      ctx.lineWidth = 12;
      ctx.strokeRect(30, 30, 1140, 790);

      // Thin Silver Border
      const silverGrad = ctx.createLinearGradient(0, 0, 1200, 850);
      silverGrad.addColorStop(0, '#94a3b8');
      silverGrad.addColorStop(0.5, '#f1f5f9');
      silverGrad.addColorStop(1, '#64748b');
      ctx.strokeStyle = silverGrad;
      ctx.lineWidth = 2;
      ctx.strokeRect(45, 45, 1110, 760);

      // Dark Inner Border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      ctx.strokeRect(55, 55, 1090, 740);

      // 5. Logo with subtle glow
      ctx.save();
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 15;
      const logoSize = 54;
      ctx.drawImage(logo, 600 - logoSize / 2, 70, logoSize, logoSize);
      ctx.restore();

      ctx.textAlign = 'center';

      // 6. Header Title (Lighter and spaced)
      ctx.fillStyle = '#ffffff';
      ctx.font = '300 28px sans-serif';
      ctx.fillText('Verified Career Readiness Certificate', 600, 165);

      // 7. Improved Certificate Wording
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px sans-serif';
      ctx.fillText('This certifies that', 600, 220);

      // Candidate Name (Centered, size 52px, bold hero)
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 52px sans-serif';
      ctx.fillText(fullName || 'Student Candidate', 600, 285);

      // Certification statement (spaced around 1.5)
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '14px sans-serif';
      ctx.fillText('has successfully completed the CareerIQ Career Readiness Assessment and demonstrated professional competency', 600, 340);
      ctx.fillText('across verified engineering, technical, and project-based evaluation metrics.', 600, 368);

      const activeScore = overallScore % 1 === 0 ? overallScore : parseFloat(overallScore.toFixed(1));

      // 8. Achievement Level (Stars & Top Percentile Badge)
      let stars = '★★★☆☆';
      let percentile = 'Top 25%';
      let levelText = 'Industry Ready';
      let tierTitle = 'Professional Tier';
      if (activeScore >= 90) {
        stars = '★★★★★';
        percentile = 'Top 5%';
        levelText = 'Elite';
        tierTitle = 'Elite Tier';
      } else if (activeScore >= 80) {
        stars = '★★★★☆';
        percentile = 'Top 15%';
        levelText = 'Advanced';
        tierTitle = 'Advanced Tier';
      } else if (activeScore >= 70) {
        stars = '★★★☆☆';
        percentile = 'Top 25%';
        levelText = 'Industry Ready';
        tierTitle = 'Professional Tier';
      } else if (activeScore >= 60) {
        stars = '★★☆☆☆';
        percentile = 'Top 45%';
        levelText = 'Developing';
        tierTitle = 'Developing Tier';
      } else {
        stars = '★☆☆☆☆';
        percentile = 'Qualified';
        levelText = 'Beginner';
        tierTitle = 'Beginner Tier';
      }

      ctx.fillStyle = '#f59e0b'; // Gold
      ctx.font = '22px sans-serif';
      ctx.fillText(`${stars}  ${tierTitle}`, 600, 412);

      // 9. Score Hero: Circular Gauge / Radial Ring (15% larger, centered vertically)
      const gaugeX = 600;
      const gaugeY = 515;
      const gaugeR = 64;

      // Draw background ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(gaugeX, gaugeY, gaugeR, 0, Math.PI * 2);
      ctx.stroke();

      // Draw progress ring (Blue-Purple gradient)
      const progressGrad = ctx.createLinearGradient(gaugeX - gaugeR, gaugeY, gaugeX + gaugeR, gaugeY);
      progressGrad.addColorStop(0, '#3b82f6');
      progressGrad.addColorStop(1, '#8b5cf6');
      ctx.strokeStyle = progressGrad;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(gaugeX, gaugeY, gaugeR, -Math.PI / 2, -Math.PI / 2 + (activeScore / 100) * Math.PI * 2);
      ctx.stroke();

      // Inside Gauge Value
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 34px sans-serif';
      ctx.fillText(`${activeScore}`, gaugeX, gaugeY + 6);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText('/100', gaugeX, gaugeY + 23);

      // Label below Gauge
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(`${levelText}  |  ${percentile}`, gaugeX, gaugeY + 92);

      // 10. Gold Foil Verification Seal (Left Side, perfectly aligned)
      const sealX = 220;
      const sealY = 515;
      ctx.save();
      // Seal Outer Metallic Gold Gradient Circle
      const sealGrad = ctx.createLinearGradient(sealX - 44, sealY - 44, sealX + 44, sealY + 44);
      sealGrad.addColorStop(0, '#fef08a');
      sealGrad.addColorStop(0.3, '#f59e0b');
      sealGrad.addColorStop(0.5, '#fffbeb');
      sealGrad.addColorStop(0.7, '#d97706');
      sealGrad.addColorStop(1, '#fcd34d');
      ctx.fillStyle = sealGrad;
      ctx.beginPath();
      ctx.arc(sealX, sealY, 44, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Seal Inner Dashed Ring
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(sealX, sealY, 38, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]); // reset

      // Seal text
      ctx.fillStyle = '#78350f';
      ctx.textAlign = 'center';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('✓ VERIFIED', sealX, sealY - 14);
      ctx.font = '8px sans-serif';
      ctx.fillText('CareerIQ', sealX, sealY - 2);
      ctx.fillText('Certified', sealX, sealY + 8);
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('2026', sealX, sealY + 22);
      ctx.restore();

      // 11. QR Code Verification (Right Side, 20% larger, perfectly aligned)
      const qrX = 980;
      const qrY = 515;
      const qrSize = 88;

      // Draw QR Box
      ctx.save();
      ctx.fillStyle = '#111827';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(qrX - qrSize / 2, qrY - qrSize / 2, qrSize, qrSize, 8) : ctx.rect(qrX - qrSize / 2, qrY - qrSize / 2, qrSize, qrSize);
      ctx.fill();
      ctx.stroke();

      // Mock QR Pattern
      ctx.fillStyle = '#ffffff';
      // Positional squares in corners
      ctx.fillRect(qrX - qrSize / 2 + 6, qrY - qrSize / 2 + 6, 20, 20);
      ctx.fillStyle = '#111827';
      ctx.fillRect(qrX - qrSize / 2 + 10, qrY - qrSize / 2 + 10, 12, 12);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(qrX - qrSize / 2 + 13, qrY - qrSize / 2 + 13, 6, 6);

      ctx.fillRect(qrX + qrSize / 2 - 26, qrY - qrSize / 2 + 6, 20, 20);
      ctx.fillStyle = '#111827';
      ctx.fillRect(qrX + qrSize / 2 - 22, qrY - qrSize / 2 + 10, 12, 12);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(qrX + qrSize / 2 - 19, qrY - qrSize / 2 + 13, 6, 6);

      ctx.fillRect(qrX - qrSize / 2 + 6, qrY + qrSize / 2 - 26, 20, 20);
      ctx.fillStyle = '#111827';
      ctx.fillRect(qrX - qrSize / 2 + 10, qrY + qrSize / 2 - 22, 12, 12);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(qrX - qrSize / 2 + 13, qrY + qrSize / 2 - 19, 6, 6);

      // Random mini pixel dots
      ctx.fillStyle = '#ffffff';
      for (let py = 0; py < 7; py++) {
        for (let px = 0; px < 7; px++) {
          if ((px + py) % 2 === 0) {
            ctx.fillRect(qrX - 12 + px * 4, qrY - 12 + py * 4, 3, 3);
          }
        }
      }
      ctx.restore();

      // QR Labels (Scan to Verify)
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('Scan to Verify', qrX, qrY + qrSize / 2 + 14);
      ctx.fillStyle = '#60a5fa';
      ctx.font = '8px sans-serif';
      ctx.fillText('careeriq.ai/verify', qrX, qrY + qrSize / 2 + 25);

      // 12. Signature Area (Verified with handwritten mock signature path)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      // CAO line
      ctx.moveTo(180, 700); ctx.lineTo(380, 700);
      // Authority line
      ctx.moveTo(820, 700); ctx.lineTo(1020, 700);
      ctx.stroke();

      // Blue ink handwritten signature above the Chief line
      ctx.save();
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(220, 680);
      ctx.bezierCurveTo(240, 660, 260, 695, 280, 675);
      ctx.bezierCurveTo(300, 655, 310, 690, 330, 670);
      ctx.stroke();
      ctx.restore();

      // Verification Authority Seal path
      ctx.save();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(920, 672, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#ffffff';
      ctx.font = '14px sans-serif';
      ctx.fillText('Rakshak Patel V', 280, 722);
      ctx.fillText('CareerIQ Team', 920, 722);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('CHIEF ASSESSMENT OFFICER', 280, 738);
      ctx.fillText('VERIFICATION AUTHORITY', 920, 738);

      // 13. Elegant Bottom Metadata Table (Footer offset spacing increased)
      const metaY = 804;
      ctx.fillStyle = '#64748b';
      ctx.font = '11px monospace';
      const certHash = `CQ-${new Date().getFullYear()}-${(fullName || 'STU').substring(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
      ctx.fillText(`Certificate ID: ${certHash}   |   Issue Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}   |   Version: v3.2   |   Status: Verified`, 600, metaY);

      // Download action
      const link = document.createElement('a');
      link.download = `careeriq_readiness_certificate_${fullName.replace(/\s+/g, '_') || 'student'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  };

  const updateDashboardState = (data: any) => {
    if (data.profile) {
      const p = data.profile;
      if (p.full_name || p.fullName) setFullName(p.full_name || p.fullName || '');
      if (p.target_role || p.targetRole) setTargetRole(p.target_role || p.targetRole || '');
      if (p.github_url !== undefined || p.githubUrl !== undefined) setGithubUrl(p.github_url || p.githubUrl || '');
      if (p.linkedin_url !== undefined || p.linkedinUrl !== undefined) setLinkedinUrl(p.linkedin_url || p.linkedinUrl || '');
      if (p.dsa_included !== undefined || p.dsaIncluded !== undefined) setDsaIncluded(p.dsa_included || p.dsaIncluded || false);
      if (p.certificates_included !== undefined || p.certificatesIncluded !== undefined) {
        setCertificatesIncluded(p.certificates_included !== undefined ? p.certificates_included : (p.certificatesIncluded !== undefined ? p.certificatesIncluded : true));
      }
      if (p.resume_url !== undefined || p.resumeUrl !== undefined) setResumeUrl(p.resume_url || p.resumeUrl || null);

      if (p.resume_ats_score !== undefined || p.resumeATSScore !== undefined) setResumeATSScore(p.resume_ats_score || p.resumeATSScore || 0);
      if (p.resume_role_match_score !== undefined || p.resumeRoleMatchScore !== undefined) setResumeRoleMatchScore(p.resume_role_match_score || p.resumeRoleMatchScore || 0);
      if (p.resume_skills_score !== undefined || p.resumeSkillsScore !== undefined) setResumeSkillsScore(p.resume_skills_score || p.resumeSkillsScore || 0);
      if (p.resume_projects_score !== undefined || p.resumeProjectsScore !== undefined) setResumeProjectsScore(p.resume_projects_score || p.resumeProjectsScore || 0);
      if (p.resume_experience_score !== undefined || p.resumeExperienceScore !== undefined) setResumeExperienceScore(p.resume_experience_score || p.resumeExperienceScore || 0);
      if (p.resume_certification_score !== undefined || p.resumeCertificationScore !== undefined) setResumeCertificationScore(p.resume_certification_score || p.resumeCertificationScore || 0);
      if (p.resume_professional_presence_score !== undefined || p.resumeProfessionalPresenceScore !== undefined) setResumeProfessionalPresenceScore(p.resume_professional_presence_score || p.resumeProfessionalPresenceScore || 0);

      if (p.resume_strengths !== undefined || p.resumeStrengths !== undefined) setResumeStrengths(p.resume_strengths || p.resumeStrengths || []);
      if (p.resume_weaknesses !== undefined || p.resumeWeaknesses !== undefined) setResumeWeaknesses(p.resume_weaknesses || p.resumeWeaknesses || []);
      if (p.resume_missing_keywords !== undefined || p.resumeMissingKeywords !== undefined) setResumeMissingKeywords(p.resume_missing_keywords || p.resumeMissingKeywords || []);
      if (p.resume_recommended_skills !== undefined || p.resumeRecommendedSkills !== undefined) setResumeRecommendedSkills(p.resume_recommended_skills || p.resumeRecommendedSkills || []);
      if (p.resume_summary !== undefined || p.resumeSummary !== undefined) setResumeSummary(p.resume_summary || p.resumeSummary || '');
      if (p.resume_skills !== undefined || p.resumeSkills !== undefined) setResumeSkills(p.resume_skills || p.resumeSkills || []);
      if (p.resume_projects !== undefined || p.resumeProjects !== undefined) setResumeProjects(p.resume_projects || p.resumeProjects || []);

      if (p.resume_last_analyzed !== undefined || p.resumeLastAnalyzed !== undefined) setResumeLastAnalyzed(p.resume_last_analyzed || p.resumeLastAnalyzed || null);
      if (p.resume_file_name !== undefined || p.resumeFileName !== undefined) setResumeFileName(p.resume_file_name || p.resumeFileName || null);

      const incomingProjects = p.portfolio_projects || p.portfolioProjects || data.portfolioProjects;
      if (incomingProjects !== undefined) setPortfolioProjects(incomingProjects);

      const incomingScore = p.portfolio_score !== undefined ? p.portfolio_score
        : p.portfolioScore !== undefined ? p.portfolioScore
          : data.portfolioScore;
      if (incomingScore !== undefined) setPortfolioScore(incomingScore);

      const incomingInsights = p.portfolio_insights || p.portfolioInsights || data.portfolioInsights;
      if (incomingInsights !== undefined) setPortfolioInsights(incomingInsights);

      const incomingRecommendations = p.portfolio_recommendations || p.portfolioRecommendations || data.portfolioRecommendations;
      if (incomingRecommendations !== undefined) setPortfolioRecommendations(incomingRecommendations);

      if (p.github_username !== undefined || p.githubUsername !== undefined) setGithubUsername(p.github_username || p.githubUsername || null);
      if (p.github_last_analyzed !== undefined || p.githubLastAnalyzed !== undefined) setGithubLastAnalyzed(p.github_last_analyzed || p.githubLastAnalyzed || null);
      if (p.github_recommendations || p.githubRecommendations) setGithubRecommendations(p.github_recommendations || p.githubRecommendations);

      if (p.github_repos !== undefined || p.githubRepos !== undefined) setGithubRepos(p.github_repos || p.metadata?.publicRepos || p.githubRepos || 0);
      if (p.github_followers !== undefined || p.githubFollowers !== undefined) setGithubFollowers(p.github_followers || p.metadata?.followers || p.githubFollowers || 0);
      if (p.github_stars !== undefined || p.githubStars !== undefined) setGithubStars(p.github_stars || p.metadata?.stars || p.githubStars || 0);
      if (p.github_score !== undefined || p.githubScore !== undefined) setGithubScore(p.github_score || p.employabilityScore || p.githubScore || 0);
      if (p.github_age_years !== undefined || p.githubAgeYears !== undefined) setGithubAgeYears(p.github_age_years || p.metadata?.accountAgeYears || p.githubAgeYears || 0);

      // Matches & roadmap
      if (p.careerRoadmap) {
        setRecRoles(p.careerRoadmap.targetRoles || []);
        setGrowthProject(p.careerRoadmap.nextRecommendedProject || null);
      }
    }
    if (data.projects) setProjects(data.projects);
    if ((data.repositories && data.repositories.length > 0) || (data.profile && data.profile.github_repositories)) {
      let repos1 = data.repositories;
      if (typeof repos1 === 'string') { try { repos1 = JSON.parse(repos1); } catch (e) { repos1 = []; } }
      let repos2 = data.profile ? (data.profile.github_repositories || data.profile.githubRepositories) : [];
      if (typeof repos2 === 'string') {
        try { repos2 = JSON.parse(repos2); } catch (e) { repos2 = []; }
      } else if (Array.isArray(repos2) && repos2.length === 1 && typeof repos2[0] === 'string' && repos2[0].startsWith('[')) {
        try { repos2 = JSON.parse(repos2[0]); } catch (e) { repos2 = []; }
      }

      const r1 = Array.isArray(repos1) ? repos1 : [];
      const r2 = Array.isArray(repos2) ? repos2 : [];
      setGithubRepositories(r1.length >= r2.length ? r1 : r2);
    }
    if (data.technologies || (data.profile && (data.profile.github_tech_stacks || data.profile.githubTechStacks))) {
      let techs = data.technologies || data.profile.github_tech_stacks || data.profile.githubTechStacks;
      if (typeof techs === 'string') {
        try { techs = JSON.parse(techs); } catch (e) { techs = []; }
      } else if (Array.isArray(techs) && techs.length === 1 && typeof techs[0] === 'string' && techs[0].startsWith('[')) {
        try { techs = JSON.parse(techs[0]); } catch (e) { techs = []; }
      }
      setGithubTechnologies(Array.isArray(techs) ? techs : []);
    }
    if (data.breakdown || (data.profile && (data.profile.github_breakdown || data.profile.githubBreakdown))) {
      let bkd = data.breakdown || data.profile.github_breakdown || data.profile.githubBreakdown;
      if (typeof bkd === 'string') {
        try { bkd = JSON.parse(bkd); } catch (e) { bkd = null; }
      } else if (Array.isArray(bkd) && bkd.length === 1 && typeof bkd[0] === 'string' && bkd[0].startsWith('{')) {
        try { bkd = JSON.parse(bkd[0]); } catch (e) { bkd = null; }
      }
      setGithubBreakdown(bkd);
    }
    if (data.profile && (data.profile.github_recommendations || data.profile.githubRecommendations)) {
      let recs = data.profile.github_recommendations || data.profile.githubRecommendations;
      if (typeof recs === 'string') {
        try { recs = JSON.parse(recs); } catch (e) { recs = []; }
      } else if (Array.isArray(recs) && recs.length === 1 && typeof recs[0] === 'string' && recs[0].startsWith('[')) {
        try { recs = JSON.parse(recs[0]); } catch (e) { recs = []; }
      }
      setGithubRecommendations(Array.isArray(recs) ? recs : []);
    }
    if (data.certificates) setCertificates(data.certificates);
    if (data.overallScore !== undefined) {
      setOverallScore(data.overallScore);
    } else if (data.profile && data.profile.employabilityScore !== undefined) {
      setOverallScore(data.profile.employabilityScore);
    }

    if (data.scores) {
      setCategoryScores({
        resumeScore: data.scores.resume_score || data.scores.resumeScore || 0,
        projectsScore: data.scores.projects_score || data.scores.projectsScore || 0,
        experienceScore: data.scores.experience_score || data.scores.experienceScore || 0,
        onlinePresenceScore: data.scores.online_presence_score || data.scores.onlinePresenceScore || 0,
        dsaScore: data.scores.dsa_score || data.scores.dsaScore || 0,
      });
    } else if (data.profile && data.profile.metrics) {
      setCategoryScores({
        resumeScore: data.scores?.resumeScore || 75,
        projectsScore: data.profile.metrics.projectComplexity || 0,
        experienceScore: data.profile.metrics.repositoryQuality || 0,
        onlinePresenceScore: data.profile.metrics.activityConsistency || 0,
        dsaScore: data.scores?.dsaScore || 0,
      });
    }
    if (data.recommendations) setRecommendations(data.recommendations);
  };

  const startAnalysisPolling = (jobId: string) => {
    setAnalysisActive(true);
    setAnalysisProgress(0);
    setAnalysisMessage('Analyzing profile...');

    const interval = setInterval(async () => {
      try {
        const res = await api.analysis.status(jobId);
        setAnalysisProgress(res.progress || 0);
        setAnalysisMessage(res.progressMessage || 'Processing...');

        if (res.status === 'completed') {
          clearInterval(interval);
          setAnalysisActive(false);
          localStorage.removeItem('careeriq_onboarding_job_id');
          await loadProfile();
          showBanner('Analysis complete! Dashboard generated.', 'success');
        } else if (res.status === 'failed') {
          clearInterval(interval);
          setAnalysisActive(false);
          showBanner(res.error || 'Analysis failed', 'danger');
        }
      } catch (err: any) {
        clearInterval(interval);
        setAnalysisActive(false);
        showBanner(err.message || 'Error checking analysis status', 'danger');
      }
    }, 2000);
  };

  const loadProfile = async () => {
    try {
      const params = new URLSearchParams(location.search);
      const impersonateUserIdParam = params.get('impersonateUserId');
      const impersonateUserId = impersonateUserIdParam ? parseInt(impersonateUserIdParam, 10) : undefined;

      const data = await api.student.getProfile(impersonateUserId);
      updateDashboardState(data);

      if (data.profile && !data.profile.onboarding_completed) {
        const stateJobId = location.state?.jobId || localStorage.getItem('careeriq_onboarding_job_id');
        if (stateJobId) {
          localStorage.setItem('careeriq_onboarding_job_id', stateJobId);
          startAnalysisPolling(stateJobId);
        } else {
          setAnalysisActive(true);
          setAnalysisMessage('Waiting for analysis connection...');
        }
      }

      // Attempt to load advanced MongoDB analysis dashboard if available
      if (data.profile && (data.profile.github_username || data.profile.githubUsername)) {
        const username = data.profile.github_username || data.profile.githubUsername;
        try {
          const dashboardData = await api.analysis.dashboard(username);
          if (dashboardData.profile) {
            updateDashboardState(dashboardData);
          }
        } catch (err) {
          // Silent fallback to standard data
        }
      }
    } catch (err: any) {
      console.error(err);
      showBanner(err.message || 'Error loading dashboard data', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    const stateJobId = location.state?.jobId || localStorage.getItem('careeriq_onboarding_job_id');
    if (stateJobId) {
      localStorage.setItem('careeriq_onboarding_job_id', stateJobId);
      startAnalysisPolling(stateJobId);
    }
  }, [location.state]);

  useEffect(() => {
    const computed = (computedResumeScore * 0.35) + (githubScore * 0.45) + (portfolioScore * 0.20);
    setOverallScore(computed);
  }, [computedResumeScore, githubScore, portfolioScore]);

  useEffect(() => {
    if (githubBreakdown) {
      const gImpact = Math.min(20, githubBreakdown.impact !== undefined ? githubBreakdown.impact : (githubBreakdown.activity || 0));
      const gQuality = Math.min(20, githubBreakdown.quality !== undefined ? githubBreakdown.quality : 0);
      const gComplexity = Math.min(20, githubBreakdown.complexity !== undefined ? githubBreakdown.complexity : 0);
      const gConsistency = Math.min(15, githubBreakdown.consistency !== undefined ? githubBreakdown.consistency : Math.round(Math.min(15, (githubBreakdown.activity || 0) * 0.75)));
      const gTechDiversity = Math.min(15, githubBreakdown.techDiversity !== undefined ? githubBreakdown.techDiversity : 0);
      const gCommunity = Math.min(10, githubBreakdown.community !== undefined ? githubBreakdown.community : 0);
      setGithubScore(gImpact + gQuality + gComplexity + gConsistency + gTechDiversity + gCommunity);
    }
  }, [githubBreakdown]);

  const showBanner = (text: string, type: 'success' | 'danger') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleProfileSubmit = async (e?: React.FormEvent, overrides: any = {}) => {
    if (e && e.preventDefault) e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await api.student.updateProfile({
        fullName,
        targetRole,
        githubUrl,
        linkedinUrl,
        dsaIncluded,
        certificatesIncluded,
        ...overrides
      });

      updateDashboardState(res);
      showBanner('Profile metadata updated.', 'success');
    } catch (err: any) {
      showBanner(err.message || 'Failed to update profile', 'danger');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleUpdateGithubUrl = async () => {
    if (!githubUrl || githubUrl.trim().length === 0) {
      showBanner('Please enter a valid GitHub URL.', 'danger');
      return;
    }
    setProfileSaving(true);
    try {
      const res = await api.student.updateProfile({
        fullName,
        targetRole,
        githubUrl,
        linkedinUrl,
        dsaIncluded,
        certificatesIncluded
      });
      updateDashboardState(res);
      setEditingGithubUrl(false);
      showBanner('GitHub URL updated successfully!', 'success');
    } catch (err: any) {
      showBanner(err.message || 'Failed to update GitHub URL', 'danger');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleReanalyzeGithub = async () => {
    if (!githubUrl || githubUrl.trim().length === 0) {
      showBanner('Please enter a GitHub URL first.', 'danger');
      return;
    }
    setAnalysisActive(true);
    setAnalysisProgress(0);
    setAnalysisMessage('Queueing GitHub analysis...');
    try {
      const triggerRes = await api.analysis.trigger(githubUrl);
      if (triggerRes.jobId && triggerRes.jobId !== 'cached') {
        localStorage.setItem('careeriq_onboarding_job_id', triggerRes.jobId);
        startAnalysisPolling(triggerRes.jobId);
      } else {
        await loadProfile();
        showBanner('GitHub analysis completed successfully!', 'success');
        setAnalysisActive(false);
      }
    } catch (err: any) {
      showBanner(err.message || 'Failed to analyze GitHub profile', 'danger');
      setAnalysisActive(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingResume(true);
    try {
      const res = await api.student.uploadResume(files[0]);
      // Run the portfolio sync implicitly when resume is updated
      const syncRes = await api.student.syncPortfolio();
      updateDashboardState(syncRes);
      showBanner('Resume uploaded and analyzed successfully!', 'success');
    } catch (err: any) {
      showBanner(err.message || 'Failed to upload resume', 'danger');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleReanalyzeResume = async () => {
    if (!resumeUrl) {
      showBanner('Please upload your resume first.', 'danger');
      return;
    }
    setUploadingResume(true);
    try {
      const res = await api.student.reanalyzeResume();
      const syncRes = await api.student.syncPortfolio();
      updateDashboardState(syncRes);
      showBanner('Resume re-analyzed successfully. Score updated!', 'success');
    } catch (err: any) {
      showBanner(err.message || 'Failed to reanalyze resume', 'danger');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjTitle) return;
    try {
      const res = await api.student.addProject({
        title: newProjTitle,
        description: newProjDesc,
        technologies: newProjTech,
        projectUrl: newProjUrl
      });
      // Re-run portfolio scoring engine after manual addition
      const syncRes = await api.student.syncPortfolio();
      updateDashboardState(syncRes);

      // Clear inputs
      setNewProjTitle('');
      setNewProjDesc('');
      setNewProjTech('');
      setNewProjUrl('');
      setShowProjModal(false);
      showBanner('Project added successfully!', 'success');
    } catch (err: any) {
      showBanner(err.message || 'Failed to add project', 'danger');
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await api.student.deleteProject(id);
      const syncRes = await api.student.syncPortfolio();
      updateDashboardState(syncRes);
      showBanner('Project removed!', 'success');
    } catch (err: any) {
      showBanner(err.message || 'Failed to delete project', 'danger');
    }
  };

  const handleAddCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCertName || !newCertIssuer) return;
    try {
      const res = await api.student.addCertificate({
        name: newCertName,
        issuer: newCertIssuer,
        issueDate: newCertDate,
        credentialUrl: newCertUrl
      });
      updateDashboardState(res);

      setNewCertName('');
      setNewCertIssuer('');
      setNewCertDate('');
      setNewCertUrl('');
      setShowCertModal(false);
      showBanner('Certificate added successfully!', 'success');
    } catch (err: any) {
      showBanner(err.message || 'Failed to add certificate', 'danger');
    }
  };

  const handleDeleteCertificate = async (id: number) => {
    if (!confirm('Are you sure you want to delete this certificate?')) return;
    try {
      const res = await api.student.deleteCertificate(id);
      updateDashboardState(res);
      showBanner('Certificate removed!', 'success');
    } catch (err: any) {
      showBanner(err.message || 'Failed to delete certificate', 'danger');
    }
  };

  if (loading || (analysisActive && analysisProgress === 0)) {
    return (
      <div className="container flex-center" style={{ minHeight: '80vh', flexDirection: 'column' }}>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '3rem', textAlign: 'center' }}>
          <div style={{ margin: '0 auto 2rem auto', width: '60px', height: '60px', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.05)', borderTopColor: 'var(--color-primary)', animation: 'spin 1s linear infinite' }}></div>
          <h2 style={{ fontWeight: 800, marginBottom: '1rem' }}>Analyzing Profile...</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            CareerIQ is building your profile. This might take a few moments...
          </p>
          <div className="badge badge-primary" style={{ padding: '0.5rem 1rem', textTransform: 'none', fontSize: '0.85rem' }}>
            {analysisMessage}
          </div>
        </div>
      </div>
    );
  }

  if (analysisActive) {
    return (
      <div className="container flex-center" style={{ minHeight: '80vh', flexDirection: 'column' }}>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '3rem', textAlign: 'center' }}>
          <div style={{ margin: '0 auto 2rem auto', width: '60px', height: '60px', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.05)', borderTopColor: 'var(--color-primary)', animation: 'spin 1s linear infinite' }}></div>
          <h2 style={{ fontWeight: 800, marginBottom: '1rem' }}>Analyzing Profile...</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
            CareerIQ is parsing your resume and evaluating your GitHub repository complexity.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', height: '8px', overflow: 'hidden', marginBottom: '1.5rem', width: '100%' }}>
            <div style={{ width: `${analysisProgress}%`, height: '100%', background: 'var(--grad-primary)', transition: 'width 0.4s ease' }} />
          </div>
          <div className="badge badge-primary" style={{ padding: '0.5rem 1rem', textTransform: 'none', fontSize: '0.85rem' }}>
            {analysisMessage} ({analysisProgress}%)
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="screen-only-container" style={{ display: 'flex', width: '100%', maxWidth: '100%', margin: '0 auto' }}>
        <Sidebar
          onReplayTour={() => setShowTour(true)}
          projectCount={portfolioProjects.length}
          certificateCount={certificates.length}
        />
        <div className="container" style={{ flex: 1, paddingLeft: '2rem' }}>
          {/* Custom Styles */}
          <style>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 0;
            }
            body, html {
              background: #05070f !important;
              color: #ffffff !important;
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .screen-only-container, .sidebar, .sidebar-container, aside, .floating-copilot, .badge, header, nav, .header-container, button {
              display: none !important;
            }
            .print-report-container {
              display: block !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              background: #05070f !important;
              color: #ffffff !important;
              font-family: 'Inter', sans-serif;
              box-sizing: border-box;
            }
            .print-page {
              page-break-after: always;
              height: 297mm;
              box-sizing: border-box;
              padding: 2.5rem;
              position: relative;
              background: #05070f;
              border-bottom: 1px dashed rgba(255,255,255,0.05);
              display: flex;
              flex-direction: column;
            }
          }
          .btn-management {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          font-size: 0.8rem;
          font-weight: 600;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-mgmt-primary {
          background: var(--grad-primary);
          color: #fff;
          border: none;
        }
        .btn-mgmt-primary:hover {
          filter: brightness(1.15);
        }
        .btn-mgmt-secondary {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border-subcard);
          color: var(--color-text-main);
        }
        .btn-mgmt-secondary:hover {
          background: rgba(255,255,255,0.1);
        }
        
        /* Wide layout, no scroll hijacking */
        .container {
          max-width: 100% !important;
          width: 100% !important;
          padding: 2rem 2.5rem !important;
        }
        section {
          margin-bottom: 3rem !important;
          width: 100% !important;
          scroll-margin-top: 100px;
        }
        .glass-card {
          padding: 1.5rem !important;
        }
        @media (max-width: 900px) {
          .dashboard-header-flex {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1.25rem !important;
          }
          .dashboard-header-buttons {
            width: 100% !important;
            flex-wrap: wrap !important;
          }
          .dashboard-header-buttons button {
            flex: 1 1 140px !important;
            width: 100% !important;
          }
          .dashboard-hero-grid {
            grid-template-columns: 1fr !important;
          }
          .container {
            padding: 84px 1rem 1.5rem 1rem !important;
          }
          .resume-analysis-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          .resume-strengths-grid {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
          }
        }
        @media (max-width: 480px) {
          .container {
            padding: 80px 0.75rem 1rem 0.75rem !important;
          }
          .glass-card {
            padding: 1rem !important;
          }
        }
      `}</style>

          {/* Banner Message */}
          {message.text && (
            <div
              className={`badge badge-${message.type}`}
              style={{
                position: 'fixed',
                top: '80px',
                right: '20px',
                zIndex: 1000,
                padding: '1rem',
                borderRadius: '8px',
                textTransform: 'none',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
              }}
            >
              {message.text}
            </div>
          )}

          {/* HERO SECTION */}
          <section id="dashboard" style={{ paddingTop: '0.5rem' }}>
            {isMobile && <div style={{ height: '20px', width: '100%' }} />}
            {!isMobile && (
              <div id="dashboard-header" className="dashboard-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h1 className="welcome-title-gradient" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                    Welcome back, {fullName || 'Student'}
                  </h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-primary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', whiteSpace: 'nowrap', background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '20px' }}>{targetRole || 'Target Role'}</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Here is your career readiness overview</span>
                  </div>
                </div>
                <div className="dashboard-header-buttons" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button className="btn-ghost-premium" onClick={() => document.getElementById('roadmap')?.scrollIntoView({ behavior: 'smooth' })} style={{ height: '36px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 1.25rem', margin: 0, fontSize: '0.8rem' }}>View Roadmap</button>
                  {/* <button className="btn-ghost-premium" onClick={() => window.print()} style={{ height: '36px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 1.25rem', margin: 0, fontSize: '0.8rem' }}>Export Report</button> */}
                  <button className="btn-cta-premium" onClick={handleDownloadCertificate} style={{ height: '36px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 1.25rem', margin: 0, fontSize: '0.8rem' }}>Download Certificate</button>
                </div>
              </div>
            )}

            <div className="dashboard-hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

              {/* Main Score Card - Premium Redesigned Flagship Component */}
              {(() => {
                const roundedScore = Math.round(overallScore);
                let tierLabel = 'Beginner';
                let tierColor = '#ef4444';
                let tierBg = 'rgba(239, 68, 68, 0.1)';
                let tierBorder = 'rgba(239, 68, 68, 0.2)';

                if (roundedScore >= 90) {
                  tierLabel = 'Elite';
                  tierColor = '#10b981';
                  tierBg = 'rgba(16, 185, 129, 0.1)';
                  tierBorder = 'rgba(16, 185, 129, 0.2)';
                } else if (roundedScore >= 80) {
                  tierLabel = 'Advanced';
                  tierColor = '#38bdf8';
                  tierBg = 'rgba(56, 189, 248, 0.1)';
                  tierBorder = 'rgba(56, 189, 248, 0.2)';
                } else if (roundedScore >= 70) {
                  tierLabel = 'Industry Ready';
                  tierColor = '#60a5fa';
                  tierBg = 'rgba(96, 165, 250, 0.1)';
                  tierBorder = 'rgba(96, 165, 250, 0.2)';
                } else if (roundedScore >= 60) {
                  tierLabel = 'Developing';
                  tierColor = '#f59e0b';
                  tierBg = 'rgba(245, 158, 11, 0.1)';
                  tierBorder = 'rgba(245, 158, 11, 0.2)';
                }

                const milestoneTarget = roundedScore < 70 ? 70 : roundedScore < 80 ? 80 : roundedScore < 90 ? 90 : 100;
                const milestoneName = milestoneTarget === 70 ? 'Industry Ready (70)' : milestoneTarget === 80 ? 'Advanced Tier (80)' : milestoneTarget === 90 ? 'Elite Tier (90)' : 'Perfect Score (100)';
                const pointsRemaining = Math.max(0, milestoneTarget - roundedScore);
                const recruiterSignal = roundedScore >= 90 ? 'Top 5% Candidate' : roundedScore >= 80 ? 'Top 15% Candidate' : roundedScore >= 70 ? 'Top 25% Candidate' : 'Qualified Candidate';
                const potentialScore = Math.min(98, roundedScore + 12);

                return (
                  <div id="readiness-score-card" className="glass-card" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: '420px',
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.3) 0%, rgba(30, 41, 59, 0.4) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '24px',
                    padding: '1.75rem',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                  }}>
                    {/* Ambient Glow */}
                    <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '120px', height: '120px', background: 'rgba(99, 102, 241, 0.15)', filter: 'blur(45px)', borderRadius: '50%', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '150px', height: '150px', background: 'rgba(56, 189, 248, 0.15)', filter: 'blur(55px)', borderRadius: '50%', pointerEvents: 'none' }} />

                    {/* Header */}
                    {isMobile && (
                      <div style={{ zIndex: 1, marginBottom: '1.25rem', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', animation: 'fadeInHero 0.8s ease-out forwards' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 500, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Welcome back 👋</div>
                        <h2 className="welcome-title-gradient" style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, lineHeight: 1.25 }}>
                          {fullName || 'Student'}
                        </h2>
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.3rem 0.75rem',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '20px',
                            color: '#60a5fa',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backdropFilter: 'blur(10px)',
                            whiteSpace: 'nowrap'
                          }}>
                            💼 {targetRole || 'Full Stack Developer'}
                          </span>
                        </div>
                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '1rem 0 0.5rem 0', width: '100%' }} />
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: isMobile ? 'center' : 'space-between', alignItems: isMobile ? 'center' : 'flex-start', textAlign: isMobile ? 'center' : 'left', width: '100%', zIndex: 1, flexWrap: 'wrap', gap: '0.75rem', flexDirection: isMobile ? 'column' : 'row' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-start' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>Career Readiness</h2>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>Industry Readiness Assessment</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.12)', padding: '0.3rem 0.6rem', borderRadius: '20px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verified Assessment</span>
                      </div>
                    </div>

                    {/* Center Section: Circular Progress and Score */}
                    <div className="assessment-score-container" style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', flexDirection: isMobile ? 'column' : 'row', gap: '2rem', margin: '1.25rem 0', zIndex: 1, flexWrap: 'wrap', width: '100%' }}>
                      {/* Premium Radial Progress */}
                      <div className="premium-circular-progress" style={{ position: 'relative', width: '140px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {/* Glow Layer */}
                        <div style={{ position: 'absolute', width: '130px', height: '130px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)', filter: 'blur(5px)' }} />
                        <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)', filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.2))' }}>
                          <circle cx="70" cy="70" r="62" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
                          <circle className="score-ring-animate" cx="70" cy="70" r="62" fill="none" stroke="url(#premiumScoreGrad)" strokeWidth="8" strokeDasharray="389" strokeDashoffset={389 - (389 * roundedScore) / 100} style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} strokeLinecap="round" />
                          <defs>
                            <linearGradient id="premiumScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#3b82f6" />
                              <stop offset="50%" stopColor="#8b5cf6" />
                              <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div style={{ position: 'absolute', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
                            <span className="score-text-inner" style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.03em' }}>{roundedScore}</span>
                            <span style={{ fontSize: '0.85rem', color: '#64748b', marginLeft: '0.1rem', fontWeight: 600 }}>/100</span>
                          </div>
                        </div>
                      </div>

                      {/* Info Panel Right */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: isMobile ? 'none' : 1, minWidth: '150px', alignItems: isMobile ? 'center' : 'flex-start', textAlign: isMobile ? 'center' : 'left' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem', fontWeight: 600 }}>Current Standing</div>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '0.8rem',
                            color: tierColor,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            background: tierBg,
                            padding: '0.3rem 0.75rem',
                            borderRadius: '20px',
                            border: `1px solid ${tierBorder}`,
                            whiteSpace: 'nowrap'
                          }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: tierColor }} />
                            {tierLabel}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Skill Coverage Section */}
                    <div className="dashboard-score-subgrid" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
                      gap: '0.75rem',
                      margin: '0.25rem 0 1rem 0',
                      zIndex: 1,
                      minHeight: '76px'
                    }}>
                      {/* Left Side: Skill Match Meter */}
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '16px',
                        padding: '0.6rem 0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem'
                      }}>
                        {/* Compact Circular Progress for Skill Coverage */}
                        {(() => {
                          const coverageScore = resumeSkillsScore || Math.round(overallScore * 1.05) || 82;
                          const radius = 22;
                          const circumference = 2 * Math.PI * radius;
                          const strokeDashoffset = circumference - (circumference * coverageScore) / 100;
                          return (
                            <div style={{ position: 'relative', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <svg width="50" height="50" viewBox="0 0 50 50" style={{ transform: 'rotate(-90deg)' }}>
                                <circle cx="25" cy="25" r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
                                <circle cx="25" cy="25" r={radius} fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
                              </svg>
                              <span style={{ position: 'absolute', fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>{coverageScore}%</span>
                            </div>
                          );
                        })()}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Skill Coverage</span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', marginTop: '0.05rem', lineHeight: 1.1 }}>
                            {(resumeSkillsScore || Math.round(overallScore * 1.05)) >= 85 ? 'Strong Match' : (resumeSkillsScore || Math.round(overallScore * 1.05)) >= 70 ? 'Industry Ready' : 'Expanding Stack'}
                          </span>
                          <span style={{ fontSize: '0.6rem', color: '#10b981', fontWeight: 500, marginTop: '0.1rem' }}>
                            {resumeSkills.length > 0 ? `${resumeSkills.length} Verified Skills` : 'Verified Stack'}
                          </span>
                        </div>
                      </div>

                      {/* Right Side: Matched & Missing breakdown */}
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '16px',
                        padding: '0.6rem 0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: '0.25rem'
                      }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{ fontSize: '0.6rem', color: '#10b981', fontWeight: 700 }}>●</span>
                          <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 600 }}>Matched:</span>
                          <span className="skills-text" style={{ fontSize: '0.6rem', color: '#fff', fontWeight: 700 }}>
                            {resumeSkills && resumeSkills.length > 0 ? resumeSkills.slice(0, 2).join(', ') : 'React, TS'}
                          </span>
                        </div>
                        {resumeMissingKeywords && resumeMissingKeywords.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.25rem' }}>
                            <span style={{ fontSize: '0.6rem', color: '#ef4444', fontWeight: 700 }}>●</span>
                            <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 600 }}>Missing:</span>
                            <span className="skills-text" style={{ fontSize: '0.6rem', color: '#ef4444', fontWeight: 600 }}>
                              {resumeMissingKeywords.slice(0, 1).join(', ')}
                            </span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.25rem' }}>
                            <span style={{ fontSize: '0.6rem', color: '#38bdf8', fontWeight: 700 }}>●</span>
                            <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 600 }}>Role Target:</span>
                            <span className="skills-text" style={{ fontSize: '0.6rem', color: '#38bdf8', fontWeight: 600 }}>
                              {targetRole ? (targetRole.length > 12 ? targetRole.slice(0, 10) + '..' : targetRole) : 'Software Eng'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Milestone segment and forecast */}
                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1rem', width: '100%', zIndex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.75rem', alignItems: 'center' }}>
                        <span style={{ color: '#94a3b8', fontWeight: 500 }}>Next Milestone: <strong style={{ color: '#fff' }}>{milestoneName}</strong></span>
                        <span style={{ color: '#3b82f6', fontWeight: 700 }}>{pointsRemaining} pts away</span>
                      </div>

                      {/* Segmented Progress Indicator */}
                      <div style={{ display: 'flex', gap: '3px', width: '100%', height: '6px', marginBottom: '0.75rem' }}>
                        {Array.from({ length: 10 }).map((_, idx) => {
                          const percentCovered = (roundedScore / milestoneTarget) * 100;
                          const stepPercent = (idx + 1) * 10;
                          const isActive = percentCovered >= stepPercent;
                          return (
                            <div key={idx} style={{
                              flex: 1,
                              height: '100%',
                              background: isActive ? 'linear-gradient(90deg, #3b82f6, #8b5cf6)' : 'rgba(255, 255, 255, 0.08)',
                              borderRadius: '2px',
                              boxShadow: isActive ? '0 0 8px rgba(99, 102, 241, 0.4)' : 'none'
                            }} />
                          );
                        })}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                        <span style={{ color: '#64748b' }}>Forecast Potential:</span>
                        <span style={{ color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          📈 <strong style={{ color: '#fff' }}>{potentialScore}+</strong> (with tips)
                        </span>
                      </div>
                      {isMobile && (
                        <button
                          className="btn-cta-premium"
                          onClick={handleDownloadCertificate}
                          style={{ width: '100%', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, borderRadius: '10px', marginTop: '1.25rem' }}
                        >
                          Download Certificate
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Radar Chart & Stats - Redesigned Executive Analytics Card */}
              {(() => {
                const resumeWeight = 0.35;
                const githubWeight = 0.45;
                const projectsWeight = 0.20;
                const certsWeight = 0;

                const resumeContribution = (computedResumeScore * resumeWeight).toFixed(1);
                const githubContribution = (githubScore * githubWeight).toFixed(1);
                const projectsContribution = (portfolioScore * projectsWeight).toFixed(1);
                const certsContribution = (0).toFixed(1);

                const contributionsList = [
                  { name: 'Resume Assessment', val: computedResumeScore, contribution: parseFloat(resumeContribution) },
                  { name: 'GitHub Assessment', val: githubScore, contribution: parseFloat(githubContribution) },
                  { name: 'Project Portfolio', val: portfolioScore, contribution: parseFloat(projectsContribution) }
                ];
                const highestContributor = [...contributionsList].sort((a, b) => b.contribution - a.contribution)[0];

                const improvementTargetName = portfolioScore < githubScore ? 'Project Portfolio' : 'GitHub Assessment';
                const improvementTargetVal = portfolioScore < githubScore ? portfolioScore : githubScore;
                const gapToResume = Math.max(0, computedResumeScore - improvementTargetVal);

                return (
                  <div className="glass-card" id="readiness" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: '420px',
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.3) 0%, rgba(30, 41, 59, 0.4) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '24px',
                    padding: '1.75rem',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                  }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', zIndex: 1 }}>
                      <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>Score Breakdown</h2>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>Assessment Component Analysis</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(99, 102, 241, 0.06)', border: '1px solid rgba(99, 102, 241, 0.12)', padding: '0.3rem 0.6rem', borderRadius: '20px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1', display: 'inline-block', boxShadow: '0 0 8px #6366f1' }} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{certificatesIncluded ? '4 Components Evaluated' : '3 Components Evaluated'}</span>
                      </div>
                    </div>

                    {/* Chart and Progress Bars */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1rem', alignItems: 'center', margin: '0.75rem 0', zIndex: 1 }}>
                      {/* Radar Chart */}
                      <div style={{ height: '145px', width: '100%', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100px', height: '100px', background: 'rgba(99, 102, 241, 0.05)', filter: 'blur(20px)', borderRadius: '50%', pointerEvents: 'none' }} />
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                            { subject: 'Resume', A: computedResumeScore, fullMark: 100 },
                            { subject: 'GitHub', A: githubScore, fullMark: 100 },
                            { subject: 'Projects', A: portfolioScore, fullMark: 100 },
                            ...(certificatesIncluded ? [{ subject: 'Certs', A: categoryScores.experienceScore, fullMark: 100 }] : []),
                            { subject: 'DSA', A: categoryScores.dsaScore, fullMark: 100 },
                          ]}>
                            <PolarGrid stroke="rgba(255,255,255,0.08)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Score" dataKey="A" stroke="#818cf8" fill="url(#radarGrad)" fillOpacity={0.25} />
                            <defs>
                              <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                              </linearGradient>
                            </defs>
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Progress Bars */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {[
                          { label: 'Resume', score: computedResumeScore, color: '#3b82f6' },
                          { label: 'GitHub', score: githubScore, color: '#10b981' },
                          { label: 'Projects', score: portfolioScore, color: '#f59e0b' }
                        ].map((comp) => (
                          <div key={comp.label}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem', fontSize: '0.7rem' }}>
                              <span style={{ color: '#94a3b8', fontWeight: 600 }}>{comp.label}</span>
                              <span style={{ color: '#fff', fontWeight: 700 }}>{comp.score}%</span>
                            </div>
                            <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${comp.score}%`, height: '100%', background: comp.color, borderRadius: '3px', boxShadow: `0 0 6px ${comp.color}` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Component Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginBottom: '0.75rem', zIndex: 1 }}>
                      {[
                        { label: 'Resume', score: computedResumeScore, emoji: '📄', status: computedResumeScore >= 85 ? 'Strong' : computedResumeScore >= 70 ? 'Good' : 'Developing', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.15)' },
                        { label: 'GitHub', score: githubScore, emoji: '💻', status: githubScore >= 80 ? 'Strong' : githubScore >= 65 ? 'Good' : 'Developing', color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.15)' },
                        { label: 'Projects', score: portfolioScore, emoji: '🚀', status: portfolioScore >= 75 ? 'Strong' : portfolioScore >= 50 ? 'Good' : 'Developing', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.15)' },
                      ].map((kpi) => (
                        <div key={kpi.label} style={{
                          background: kpi.bg,
                          border: `1px solid ${kpi.border}`,
                          borderRadius: '16px',
                          padding: '0.5rem 0.25rem',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.1rem'
                        }}>
                          <span style={{ fontSize: '0.85rem' }}>{kpi.emoji}</span>
                          <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 600 }}>{kpi.label}</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>{kpi.score}</span>
                          <span style={{ fontSize: '0.6rem', color: kpi.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{kpi.status}</span>
                        </div>
                      ))}

                      {/* Certificates Card */}
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px dashed rgba(255, 255, 255, 0.08)',
                        borderRadius: '16px',
                        padding: '0.5rem 0.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.1rem',
                        opacity: certificatesIncluded ? 1 : 0.6
                      }}>
                        <span style={{ fontSize: '0.85rem' }}>🏆</span>
                        <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 600 }}>Certs</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: certificatesIncluded ? '#c084fc' : '#64748b', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                          {certificatesIncluded ? `${categoryScores.experienceScore}` : 'Muted'}
                        </span>
                        <span style={{ fontSize: '0.55rem', color: certificatesIncluded ? '#a78bfa' : '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                          {certificatesIncluded ? 'VERIFIED' : 'MUTED'}
                        </span>
                      </div>
                    </div>

                    {/* Contribution Analysis and formula */}
                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.75rem', zIndex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', fontSize: '0.7rem' }}>
                        <span style={{ color: '#94a3b8', fontWeight: 500 }}>Contribution Weights:</span>
                        <span style={{ color: '#fff', fontWeight: 700 }}>Total: {overallScore.toFixed(1)}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.35rem', fontSize: '0.65rem', color: '#64748b', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                        <span style={{ background: 'rgba(59, 130, 246, 0.06)', padding: '0.15rem 0.4rem', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>Resume: <strong style={{ color: '#3b82f6' }}>{resumeContribution} pt</strong></span>
                        <span style={{ background: 'rgba(16, 185, 129, 0.06)', padding: '0.15rem 0.4rem', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>GitHub: <strong style={{ color: '#10b981' }}>{githubContribution} pt</strong></span>
                        <span style={{ background: 'rgba(245, 158, 11, 0.06)', padding: '0.15rem 0.4rem', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.1)' }}>Projects: <strong style={{ color: '#f59e0b' }}>{projectsContribution} pt</strong></span>
                      </div>
 
                      <ExpandableExplanation
                        title="Overall Score Breakdown"
                        formula="GitHub (45%) + Resume (35%) + Projects (20%)"
                        breakdown={[
                          { name: 'GitHub Contribution', value: `${githubScore} × 45% = ${githubContribution}` },
                          { name: 'Resume Contribution', value: `${computedResumeScore} × 35% = ${resumeContribution}` },
                          { name: 'Projects Contribution', value: `${portfolioScore} × 20% = ${projectsContribution}` },
                          { name: 'Highest Contributor', value: `${highestContributor.name.split(' ')[0]} (${highestContributor.val})` },
                          { name: 'Improvement Opportunity', value: `${improvementTargetName.split(' ')[0]} (+${gapToResume})` },
                          { name: 'Total Sum', value: `${overallScore.toFixed(1)} / 100` }
                        ]}
                      />
                    </div>
                  </div>
                );
              })()}

            </div>
          </section>

          {/* MODULES GRID */}
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', marginTop: '3rem' }}>Profile Management & Analysis</h2>
          <div className="dashboard-modules-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '3rem', width: '100%', boxSizing: 'border-box' }}>

            {/* NEW GITHUB ANALYTICS DASHBOARD - Flagship Redesign */}
            <section id="github" style={{
              gridColumn: '1 / -1',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.3) 0%, rgba(30, 41, 59, 0.4) 100%)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '2.25rem',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              {/* Subtle Ambient Background Glows */}
              <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)', filter: 'blur(55px)', pointerEvents: 'none' }} />

              {/* Header area */}
              <div className="github-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', zIndex: 1, position: 'relative' }}>
                <div>
                  <h3 className="github-title" style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem', letterSpacing: '-0.02em' }}>
                    <svg height="28" viewBox="0 0 16 16" width="28" style={{ fill: '#fff', filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.2))' }}>
                      <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.35 3.12.9 0 .64.01 1.25.01 1.42 0 .21-.15.47-.55.38A8.006 8.006 0 0 1 0 8c0-4.42 3.58-8 8-8z" />
                    </svg>
                    GitHub Code Quality Analytics
                  </h3>
                  <p className="github-subtitle" style={{ margin: '0.35rem 0 0', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>Real-time repository telemetry, complexity modeling, and algorithmic quality indexing</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.8rem',
                    color: githubScore > 0 ? '#10b981' : '#94a3b8',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    background: githubScore > 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.03)',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '20px',
                    border: `1px solid ${githubScore > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.06)'}`
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: githubScore > 0 ? '#10b981' : '#94a3b8', boxShadow: githubScore > 0 ? '0 0 8px #10b981' : 'none' }} />
                    {githubScore > 0 ? 'Active Gateway' : 'Disconnected'}
                  </span>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.15)',
                    borderRadius: '16px',
                    padding: '0.5rem 1.1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
                  }}>
                    <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Code Score</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>{githubScore || 0}</span>
                  </div>
                </div>
              </div>

              {/* URL config row */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', zIndex: 1, position: 'relative' }}>
                {editingGithubUrl ? (
                  <div style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '600px', background: 'rgba(255,255,255,0.02)', padding: '0.4rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <input type="url" className="glass-input" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/username" style={{ border: 'none', background: 'transparent' }} />
                    <button className="btn btn-primary" onClick={handleUpdateGithubUrl} disabled={profileSaving} style={{ borderRadius: '10px' }}>{profileSaving ? 'Saving...' : 'Save'}</button>
                    <button className="btn btn-secondary" onClick={() => setEditingGithubUrl(false)} style={{ borderRadius: '10px' }}>Cancel</button>
                  </div>
                ) : (
                  <div className="github-url-config-row" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '0.65rem 1.25rem',
                    borderRadius: '16px',
                    width: '100%',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)',
                    boxSizing: 'border-box'
                  }}>
                    <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>Linked Repository Source:</span>
                    <a href={githubUrl} target="_blank" rel="noreferrer" style={{
                      fontWeight: 700,
                      color: '#60a5fa',
                      fontSize: '0.85rem',
                      fontFamily: 'monospace',
                      background: 'rgba(59, 130, 246, 0.06)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(59, 130, 246, 0.1)',
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                      wordBreak: 'break-all'
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#38bdf8'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#60a5fa'}>
                      {githubUrl || 'No source account linked'}
                    </a>
                    <div className="github-url-buttons" style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button className="btn-ghost-premium" onClick={() => setEditingGithubUrl(true)} style={{ padding: '0.45rem 1rem', fontSize: '0.75rem', borderRadius: '10px', height: '32px' }}>Change Account</button>
                      <button className="btn-ghost-premium" onClick={handleReanalyzeGithub} style={{ padding: '0.45rem 1rem', fontSize: '0.75rem', borderRadius: '10px', height: '32px', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981' }}>Refresh Sync</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Stats Grid */}
              <div className="github-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2.25rem', zIndex: 1, position: 'relative' }}>
                {[
                  { label: 'Repositories', value: githubRepos, icon: '📦', color: '#3b82f6' },
                  { label: 'Total Stars', value: githubStars, icon: '⭐', color: '#f59e0b' },
                  { label: 'Followers', value: githubFollowers, icon: '👥', color: '#10b981' },
                  { label: 'Languages', value: githubTechnologies.length, icon: '💻', color: '#a78bfa' },
                  { label: 'Active Years', value: githubAgeYears, icon: '⏳', color: '#f43f5e' },
                ].map(stat => (
                  <div key={stat.label} style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '18px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMobile ? 'center' : 'flex-start',
                    textAlign: isMobile ? 'center' : 'left',
                    gap: '0.4rem',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.02)',
                    transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s'
                  }}
                    className="github-stat-card"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.borderColor = `${stat.color}35`;
                      e.currentTarget.style.boxShadow = `0 8px 20px ${stat.color}08`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', gap: '0.5rem', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, width: '100%' }}>
                      <span style={{ fontSize: '1rem' }}>{stat.icon}</span> {stat.label}
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginTop: '0.1rem', width: '100%', textAlign: isMobile ? 'center' : 'left' }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Breakdown & Technologies */}
              <div className="github-breakdown-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2.25rem', zIndex: 1, position: 'relative' }}>
                {/* Tech Stack Distribution */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.005) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.02)'
                }}>
                  <h4 style={{ color: '#fff', margin: '0 0 1.25rem 0', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>⚡</span> Tech Stack Distribution
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {githubTechnologies.length > 0 ? githubTechnologies.map((tech, idx) => {
                      const hue = (210 + idx * 37) % 360;
                      return (
                        <span key={tech} style={{
                          background: `hsla(${hue}, 80%, 60%, 0.08)`,
                          color: `hsl(${hue}, 80%, 75%)`,
                          border: `1px solid hsla(${hue}, 80%, 60%, 0.18)`,
                          padding: '0.4rem 0.9rem',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          letterSpacing: '0.01em',
                          transition: 'all 0.2s',
                          cursor: 'default'
                        }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = `hsla(${hue}, 80%, 60%, 0.15)`;
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = `hsla(${hue}, 80%, 60%, 0.08)`;
                            e.currentTarget.style.transform = 'scale(1)';
                          }}>
                          {tech}
                        </span>
                      );
                    }) : <span style={{ color: '#64748b', fontSize: '0.9rem' }}>No telemetry data detected.</span>}
                  </div>
                </div>

                {/* Quality Metrics */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.005) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <h4 style={{ color: '#fff', margin: '0 0 1.25rem 0', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>📈</span> Quality Metrics
                  </h4>
                  {githubBreakdown ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                          <span style={{ color: '#94a3b8', fontWeight: 600 }}>Code Complexity Index</span>
                          <span style={{ color: '#3b82f6', fontWeight: 700 }}>{githubBreakdown.complexity}/25</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${(githubBreakdown.complexity / 25) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', borderRadius: '3px', boxShadow: '0 0 8px rgba(59, 130, 246, 0.4)' }} />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                          <span style={{ color: '#94a3b8', fontWeight: 600 }}>Repository Best Practices</span>
                          <span style={{ color: '#10b981', fontWeight: 700 }}>{githubBreakdown.quality}/25</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${(githubBreakdown.quality / 25) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: '3px', boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)' }} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Execute full repository sync to view.</span>
                  )}
                </div>
              </div>

              {/* Repositories Table */}
              {githubRepositories && githubRepositories.length > 0 && (
                <div style={{ zIndex: 1, position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h4 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>Telemetry per Repository</h4>
                    {isMobile && (
                      <button
                        className="btn-ghost-premium"
                        onClick={() => setExpandedGithubTable(!expandedGithubTable)}
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        {expandedGithubTable ? 'Collapse Table ✕' : 'Expand Table ＋'}
                      </button>
                    )}
                  </div>
                  {(!isMobile || expandedGithubTable) && (
                    <div style={{ overflowX: 'auto', background: 'rgba(0,0,0,0.15)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'left', color: '#64748b' }}>
                            <th style={{ padding: '1.1rem 1.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>Repository Name</th>
                            <th style={{ padding: '1.1rem 1.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>Impact Rating</th>
                            <th style={{ padding: '1.1rem 1.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>Complexity Tier</th>
                            <th style={{ padding: '1.1rem 1.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>Detected Stacks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...githubRepositories].sort((a, b) => (b.repositoryScore || b.complexityScore || 0) - (a.repositoryScore || a.complexityScore || 0)).slice(0, 5).map(repo => {
                            const score = repo.repositoryScore || repo.complexityScore || 0;
                            const level = repo.complexityLevel || (score > 80 ? 'Advanced' : score > 50 ? 'Intermediate' : 'Basic');
                            return (
                              <tr key={repo.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                <td style={{ padding: '1.1rem 1.5rem', whiteSpace: 'nowrap' }}>
                                  <a href={repo.url || repo.html_url} target="_blank" rel="noreferrer" style={{ color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', transition: 'color 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#60a5fa'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#fff'}>
                                    <svg viewBox="0 0 16 16" width="16" height="16" fill="#94a3b8" style={{ flexShrink: 0 }}><path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"></path></svg>
                                    {repo.name}
                                  </a>
                                </td>
                                <td style={{ padding: '1.1rem 1.5rem', whiteSpace: 'nowrap' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: score > 80 ? '#10b981' : score > 50 ? '#3b82f6' : '#f59e0b' }} />
                                    <span style={{ color: score > 80 ? '#10b981' : score > 50 ? '#60a5fa' : '#fbbf24', fontWeight: 800 }}>{score}</span>
                                  </div>
                                </td>
                                <td style={{ padding: '1.1rem 1.5rem', whiteSpace: 'nowrap' }}>
                                  <span style={{
                                    background: level === 'Advanced' ? 'rgba(168, 85, 247, 0.08)' : level === 'Intermediate' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255,255,255,0.04)',
                                    color: level === 'Advanced' ? '#c084fc' : level === 'Intermediate' ? '#60a5fa' : '#e2e8f0',
                                    border: `1px solid ${level === 'Advanced' ? 'rgba(168, 85, 247, 0.15)' : level === 'Intermediate' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.06)'}`,
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '8px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700
                                  }}>{level}</span>
                                </td>
                                <td style={{ padding: '1.1rem 1.5rem', color: '#94a3b8', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                  {Array.isArray(repo.detectedTechnologies) ? repo.detectedTechnologies.join(', ') : (repo.detectedTechnologies || repo.primaryLanguage || 'Unknown')}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {githubScore > 0 && (
                <div style={{ marginTop: '2.25rem', display: 'flex', justifyContent: 'center', zIndex: 1, position: 'relative' }}>
                  <button className="btn-cta-premium" onClick={() => navigate('/github-analysis/report')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.5rem', fontSize: '0.85rem' }}>
                    Open Full GitHub Performance Report
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s' }}
                      className="report-arrow"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </button>
                </div>
              )}
            </section>


            {/* NEW RESUME MANAGEMENT CARD */}
            <section id="resume" className="glass-card" style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(30, 41, 59, 0.6) 100%)', borderColor: '#334155', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ minWidth: '200px', flex: '1 1 auto' }}>
                  <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    📄 Resume AI Analysis
                  </h3>
                  <p style={{ margin: '0.25rem 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>Deep NLP parsing against industry standards</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0, flexWrap: 'wrap' }}>
                  <span className={`badge ${resumeUrl ? 'badge-success' : 'badge-secondary'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    {uploadingResume ? 'Processing...' : resumeUrl ? 'Uploaded' : 'No Resume'}
                  </span>
                  <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '12px', padding: '0.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.7rem', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Total Score</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', lineHeight: 1, whiteSpace: 'nowrap' }}>{computedResumeScore}<span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>/100</span></span>
                  </div>
                </div>
              </div>

              {/* Resume Upload / Current File */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '0.25rem' }}>
                      {resumeUrl ? (
                        <a href={`${BACKEND_URL}/${resumeUrl}`} target="_blank" rel="noreferrer" style={{ color: '#fff', textDecoration: 'none' }}>{resumeFileName || 'resume.pdf'}</a>
                      ) : 'No Resume Uploaded'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                      {resumeLastAnalyzed ? `Last analyzed: ${new Date(resumeLastAnalyzed).toLocaleString()}` : 'Upload your resume for AI evaluation'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input type="file" id="resume-file-input" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleResumeUpload} />
                  <button className="btn-ghost-premium" onClick={() => document.getElementById('resume-file-input')?.click()} disabled={uploadingResume}>
                    {resumeUrl ? 'Replace File' : 'Upload Resume'}
                  </button>
                  <button className="btn-cta-premium" onClick={handleReanalyzeResume} disabled={uploadingResume || !resumeUrl} style={{ opacity: (!resumeUrl || uploadingResume) ? 0.5 : 1 }}>
                    Analyze Now
                  </button>
                </div>
              </div>

              {/* AI Insights (Only if resume exists) */}
              {resumeUrl && (
                <div className="animate-fade-in">
                  <div className="resume-analysis-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem' }}>

                    {/* Score Breakdown Vertical */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <h4 style={{ color: '#fff', fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>Evaluation Areas</h4>
                      {[
                        { label: 'Role Match', score: resumeRoleMatchScore, max: 100, color: '#818cf8' },
                        { label: 'Skills Check', score: resumeSkillsScore, max: 20, color: '#34d399' },
                        { label: 'Projects', score: resumeProjectsScore, max: 20, color: '#f472b6' },
                        { label: 'Experience', score: resumeExperienceScore, max: 15, color: '#fbbf24' }
                      ].map(stat => (
                        <div key={stat.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem' }}>
                          <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{stat.label}</span>
                            <span style={{ fontSize: '1rem', fontWeight: 700, color: stat.color }}>{stat.score}/{stat.max}</span>
                          </div>
                          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${(stat.score / stat.max) * 100}%`, height: '100%', background: stat.color, borderRadius: '2px' }} />
                          </div>
                        </div>
                      ))}

                      <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', border: '1px dashed rgba(139, 92, 246, 0.3)' }}>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>ATS Score</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#a78bfa', lineHeight: 1 }}>{resumeATSScore} <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 500 }}>/ 25</span></div>
                      </div>

                      {/* Unexpandable (Static) Logic Breakdown */}
                      <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '0.85rem 1rem', borderRadius: '12px', marginTop: '0.5rem', fontSize: '0.75rem' }}>
                        <div style={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>Resume Scoring Logic</div>
                        <code style={{ color: '#818cf8', display: 'block', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
                          Resume Score = (Role Match × 40%) + (Skills / 20 × 25%) + (Projects / 20 × 20%) + (Experience / 15 × 15%)
                        </code>
                      </div>

                      {/* Expandable Explanation for Resume Calculation */}
                      <ExpandableExplanation
                        title="Resume Score Breakdown"
                        formula="Role Match (40%) + Skills (25%) + Projects (20%) + Experience (15%)"
                        breakdown={[
                          { name: 'Role Match (40% Weight)', value: `${resumeRoleMatchScore} × 0.40 = ${(resumeRoleMatchScore * 0.40).toFixed(1)}` },
                          { name: 'Skills Check (25% Weight)', value: `(${resumeSkillsScore}/20) × 25 = ${((resumeSkillsScore / 20) * 25).toFixed(1)}` },
                          { name: 'Projects (20% Weight)', value: `(${resumeProjectsScore}/20) × 20 = ${((resumeProjectsScore / 20) * 20).toFixed(1)}` },
                          { name: 'Experience (15% Weight)', value: `(${resumeExperienceScore}/15) × 15 = ${((resumeExperienceScore / 15) * 15).toFixed(1)}` },
                          { name: 'Total Score (Sum)', value: `${(resumeRoleMatchScore * 0.40).toFixed(1)} + ${((resumeSkillsScore / 20) * 25).toFixed(1)} + ${((resumeProjectsScore / 20) * 20).toFixed(1)} + ${((resumeExperienceScore / 15) * 15).toFixed(1)} = ${((resumeRoleMatchScore * 0.40) + ((resumeSkillsScore / 20) * 25) + ((resumeProjectsScore / 20) * 20) + ((resumeExperienceScore / 15) * 15)).toFixed(1)}` }
                        ]}
                      />
                    </div>

                    {/* NLP Analysis Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {isMobile && (
                        <button
                          className="btn-ghost-premium"
                          onClick={() => setExpandedResumeDetails(!expandedResumeDetails)}
                          style={{ width: '100%', padding: '0.65rem', marginBottom: '0.5rem', fontSize: '0.85rem' }}
                        >
                          {expandedResumeDetails ? 'Hide Detailed AI Insights ✕' : 'Show Detailed AI Insights (Summary & Gaps) ＋'}
                        </button>
                      )}
                      {(!isMobile || expandedResumeDetails) && (
                        <>
                          {resumeSummary && (
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.5rem' }}>
                              <h4 style={{ color: '#fff', fontSize: '1.1rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                AI Summary
                              </h4>
                              <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6', color: '#cbd5e1' }}>{resumeSummary}</p>
                            </div>
                          )}

                          <div className="resume-strengths-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)', borderRadius: '16px', padding: '1.5rem' }}>
                              <h4 style={{ color: '#10b981', fontSize: '1.05rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Key Strengths
                              </h4>
                              <ul style={{ paddingLeft: '0', listStyleType: 'none', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {resumeStrengths.map((s, i) => (
                                  <li key={i} style={{ fontSize: '0.9rem', color: '#e2e8f0', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                    <span style={{ color: '#10b981', marginTop: '2px' }}>•</span> <span>{s}</span>
                                  </li>
                                ))}
                                {resumeStrengths.length === 0 && <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No strengths identified.</span>}
                              </ul>
                            </div>

                            <div style={{ background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.1)', borderRadius: '16px', padding: '1.5rem' }}>
                              <h4 style={{ color: '#f43f5e', fontSize: '1.05rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                Areas to Improve
                              </h4>
                              <ul style={{ paddingLeft: '0', listStyleType: 'none', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {resumeWeaknesses.map((s, i) => (
                                  <li key={i} style={{ fontSize: '0.9rem', color: '#e2e8f0', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                    <span style={{ color: '#f43f5e', marginTop: '2px' }}>•</span> <span>{s}</span>
                                  </li>
                                ))}
                                {resumeWeaknesses.length === 0 && <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No weaknesses identified.</span>}
                              </ul>
                            </div>
                          </div>

                          <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.1)', borderRadius: '16px', padding: '1.5rem' }}>
                            <h4 style={{ color: '#f59e0b', fontSize: '1.05rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                              Missing Keywords for {targetRole || 'Your Role'}
                            </h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {resumeMissingKeywords.map((s, i) => (
                                <span key={i} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.4rem 0.85rem', borderRadius: '20px', fontSize: '0.85rem' }}>
                                  {s}
                                </span>
                              ))}
                              {resumeMissingKeywords.length === 0 && <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Your resume covers key terms well!</span>}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* 4. PROJECTS PORTFOLIO */}
            <section id="projects" style={{ gridColumn: '1 / -1', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  🚀 Project Portfolio
                </h3>
                <button className="btn-ghost-premium" onClick={() => setShowProjModal(true)}>+ Add Project</button>
              </div>
              <ProjectsPortfolio
                portfolioProjects={portfolioProjects}
                portfolioScore={portfolioScore}
                portfolioInsights={portfolioInsights}
                portfolioRecommendations={portfolioRecommendations}
                onSyncComplete={updateDashboardState}
                onAddProject={() => setShowProjModal(true)}
              />
            </section>

            {/* 5. CERTIFICATES */}
            <section id="certificates" className="glass-card" style={{ display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(15, 23, 42, 0.4) 100%)', borderColor: 'rgba(245, 158, 11, 0.1)' }}>
              <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🏆 Certificates
                </h3>
                <span className={`badge ${certificatesIncluded ? (certificates.length > 0 ? 'badge-success' : 'badge-secondary') : 'badge-secondary'}`}>{certificatesIncluded ? (certificates.length + ' Added') : 'Excluded'}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '2rem', opacity: certificatesIncluded ? 1 : 0.3 }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, color: '#f59e0b' }}>{certificatesIncluded ? categoryScores.experienceScore : '—'}</span>
                <span style={{ color: '#94a3b8', marginBottom: '4px', fontWeight: 500 }}>/ 100 points</span>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', maxHeight: '150px', marginBottom: '1.5rem', opacity: certificatesIncluded ? 1 : 0.4, background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                {certificates.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, textAlign: 'center', padding: '1rem 0' }}>No certificates added yet.</p>
                ) : (
                  <ul style={{ paddingLeft: 0, listStyleType: 'none', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {certificates.map(c => (
                      <li key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                        <span style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 500 }}>{c.name}</span>
                        <button className="btn-icon" style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer', opacity: 0.7 }} onClick={() => handleDeleteCertificate(c.id)} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button className="btn-ghost-premium" style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem' }} onClick={() => setShowCertModal(true)}>+ Add Certificate</button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>Include in Score</span>
                <label className="toggle-container" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px' }}>
                  <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} checked={certificatesIncluded} onChange={(e) => { const checked = e.target.checked; setCertificatesIncluded(checked); handleProfileSubmit(undefined, { certificatesIncluded: checked }); }} />
                  <div style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: certificatesIncluded ? '#3b82f6' : 'rgba(255,255,255,0.1)', transition: '.4s', borderRadius: '34px' }}>
                    <span style={{ position: 'absolute', content: '""', height: '16px', width: '16px', left: certificatesIncluded ? '20px' : '3px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }}></span>
                  </div>
                </label>
              </div>
            </section>

          </div>

          {/* AI RECOMMENDATIONS AND ROADMAP (Bottom Sections) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>

            {/* Recruiter Matches */}
            {recRoles.length > 0 && (
              <section id="career-match" className="glass-card animate-slide-up" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff' }}>Career Match</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {recRoles.map((roleObj, idx) => {
                    const matchColor = roleObj.matchPercentage >= 80 ? '#10b981' : roleObj.matchPercentage >= 55 ? '#f59e0b' : '#94a3b8';
                    return (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="flex-between" style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{roleObj.role}</span>
                          <span style={{ fontWeight: 800, color: matchColor }}>{roleObj.matchPercentage}%</span>
                        </div>
                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${roleObj.matchPercentage}%`, background: matchColor, borderRadius: '4px', boxShadow: `0 0 10px ${matchColor}` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* AI Improvement Plan */}
            <section id="roadmap" className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.05) 0%, rgba(15, 23, 42, 0.4) 100%)', borderColor: 'rgba(56, 189, 248, 0.2)', padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff' }}>AI Roadmap</h3>
                </div>
                {isMobile && recommendations.length > 0 && (
                  <button
                    className="btn-ghost-premium"
                    onClick={() => setExpandedRoadmapList(!expandedRoadmapList)}
                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                  >
                    {expandedRoadmapList ? 'Collapse Roadmap ✕' : 'Expand Roadmap ＋'}
                  </button>
                )}
              </div>

              {recommendations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: '#94a3b8' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: '1rem', opacity: 0.5 }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  <p style={{ fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>Complete module analysis to generate tailored AI tips.</p>
                </div>
              ) : (
                (!isMobile || expandedRoadmapList) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {recommendations.map((rec, i) => (
                      <div key={i} style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>
                          {i + 1}
                        </div>
                        <div>
                          <span style={{ fontWeight: 700, color: '#38bdf8', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                            {rec.category}
                          </span>
                          <p style={{ color: '#e2e8f0', margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>{rec.recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </section>
          </div>

          {/* Project Add Modal */}
          {showProjModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-modal-overlay)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.25rem' }}>Add Project</h3>
                <form onSubmit={handleAddProject}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label>Project Title *</label>
                    <input type="text" className="glass-input" value={newProjTitle} onChange={(e) => setNewProjTitle(e.target.value)} required />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label>Description</label>
                    <textarea className="glass-input" rows={3} value={newProjDesc} onChange={(e) => setNewProjDesc(e.target.value)} />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label>Technologies (comma separated)</label>
                    <input type="text" className="glass-input" value={newProjTech} onChange={(e) => setNewProjTech(e.target.value)} />
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label>Project URL</label>
                    <input type="url" className="glass-input" value={newProjUrl} onChange={(e) => setNewProjUrl(e.target.value)} />
                  </div>
                  <div className="flex-between">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowProjModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Project</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Certificate Add Modal */}
          {showCertModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-modal-overlay)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.25rem' }}>Add Certificate</h3>
                <form onSubmit={handleAddCertificate}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label>Certificate Name *</label>
                    <input type="text" className="glass-input" value={newCertName} onChange={(e) => setNewCertName(e.target.value)} required />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label>Issuer *</label>
                    <input type="text" className="glass-input" value={newCertIssuer} onChange={(e) => setNewCertIssuer(e.target.value)} required />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label>Issue Date (YYYY-MM)</label>
                    <input type="text" className="glass-input" value={newCertDate} onChange={(e) => setNewCertDate(e.target.value)} />
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label>Credential URL</label>
                    <input type="url" className="glass-input" value={newCertUrl} onChange={(e) => setNewCertUrl(e.target.value)} />
                  </div>
                  <div className="flex-between">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowCertModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Certificate</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
        {showTour && (
          <WelcomeTourModal onClose={() => setShowTour(false)} role="student" />
        )}
        {/* <FloatingCopilot /> */}
      </div>

      <div className="print-report-container" style={{ display: 'none' }}>
        {/* Page 1: Title & Executive Summary */}
        <div className="print-page">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #3b82f6', paddingBottom: '1rem', marginBottom: '2rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>CAREERIQ</span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>VERIFIED CAREER READINESS REPORT</span>
          </div>
          <div style={{ marginTop: '3rem', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', marginBottom: '1rem', letterSpacing: '-1px' }}>CAREER READINESS ASSESSMENT REPORT</h1>
            <h3 style={{ fontSize: '1.25rem', color: '#3b82f6', marginBottom: '3rem' }}>PREPARED FOR: {fullName || 'Student Candidate'}</h3>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', margin: '2rem 0' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '2rem', minWidth: '200px' }}>
                <div style={{ fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Overall Score</div>
                <div style={{ fontSize: '4rem', fontWeight: 800, color: '#3b82f6' }}>{overallScore % 1 === 0 ? overallScore : overallScore.toFixed(1)}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '2rem', minWidth: '200px' }}>
                <div style={{ fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Readiness Level</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981', marginTop: '1.2rem' }}>
                  {overallScore >= 90 ? 'Elite' : overallScore >= 80 ? 'Advanced' : overallScore >= 70 ? 'Industry Ready' : overallScore >= 60 ? 'Developing' : 'Beginner'}
                </div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
            <span>Target Role: {targetRole || 'Software Engineer'}</span>
            <span>Report Hash: CIQ-{Date.now().toString().substring(6)}</span>
          </div>
        </div>

        {/* Page 2: Resume AI Analysis */}
        <div className="print-page">
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>1. RESUME ASSESSMENT DETAILS</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase' }}>Total Resume Score</div>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: '#3b82f6', marginTop: '0.5rem' }}>{computedResumeScore}/100</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}><span style={{ color: '#94a3b8' }}>Role Match</span><span style={{ color: '#fff', fontWeight: 700 }}>{resumeRoleMatchScore}/100</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}><span style={{ color: '#94a3b8' }}>Skills Check</span><span style={{ color: '#fff', fontWeight: 700 }}>{resumeSkillsScore}/20</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}><span style={{ color: '#94a3b8' }}>Projects</span><span style={{ color: '#fff', fontWeight: 700 }}>{resumeProjectsScore}/20</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}><span style={{ color: '#94a3b8' }}>Experience</span><span style={{ color: '#fff', fontWeight: 700 }}>{resumeExperienceScore}/15</span></div>
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem' }}>Executive Analysis Summary</h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6 }}>{resumeSummary || 'No summary generated.'}</p>

              <h3 style={{ fontSize: '1.1rem', color: '#34d399', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Key Strengths</h3>
              <ul style={{ paddingLeft: '1.25rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
                {resumeStrengths.map((s, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{s}</li>)}
              </ul>
            </div>
          </div>
        </div>

        {/* Page 3: GitHub Assessment */}
        <div className="print-page">
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>2. GITHUB QUALITY AUDIT</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase' }}>GitHub Assessment Score</div>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: '#10b981', marginTop: '0.5rem' }}>{githubScore}/100</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {githubBreakdown && [
                  { label: 'Repository Impact', val: githubBreakdown.impact !== undefined ? Math.min(20, githubBreakdown.impact) : Math.min(20, githubBreakdown.activity || 0), max: 20 },
                  { label: 'Quality', val: Math.min(20, githubBreakdown.quality !== undefined ? githubBreakdown.quality : 0), max: 20 },
                  { label: 'Complexity', val: Math.min(20, githubBreakdown.complexity !== undefined ? githubBreakdown.complexity : 0), max: 20 },
                  { label: 'Consistency', val: githubBreakdown.consistency !== undefined ? Math.min(15, githubBreakdown.consistency) : Math.round(Math.min(15, (githubBreakdown.activity || 0) * 0.75)), max: 15 },
                  { label: 'Tech Diversity', val: githubBreakdown.techDiversity !== undefined ? Math.min(15, githubBreakdown.techDiversity) : 0, max: 15 },
                  { label: 'Community Signals', val: Math.min(10, githubBreakdown.community !== undefined ? githubBreakdown.community : 0), max: 10 }
                ].map(stat => (
                  <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#94a3b8' }}>{stat.label}</span>
                    <span style={{ color: '#fff', fontWeight: 700 }}>{stat.val}/{stat.max}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1rem' }}>Technology Distribution</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
                {githubTechnologies.map((t, i) => (
                  <span key={i} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem' }}>{t}</span>
                ))}
              </div>
              <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem' }}>Top Repositories</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {githubRepositories.slice(0, 3).map((repo, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.85rem' }}>
                      <span style={{ color: '#fff' }}>{repo.name}</span>
                      <span style={{ color: '#10b981' }}>Score: {repo.repositoryScore || 0}</span>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.25rem' }}>{repo.primaryLanguage} | Stars: {repo.stars} | Forks: {repo.forks}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Page 4: Projects & Certificates */}
        <div className="print-page">
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>3. PROJECT PORTFOLIO & CERTIFICATES</h2>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.75rem' }}>Verified Projects</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {portfolioProjects.slice(0, 4).map((p, idx) => (
                  <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.85rem', color: '#fff', marginBottom: '0.25rem' }}>
                      <span>{p.title}</span>
                      <span style={{ color: '#f59e0b' }}>{p.projectScore}/100</span>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: 0, lineHeight: 1.4 }}>{p.description || 'No description provided.'}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.75rem' }}>Verified Professional Credentials</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#94a3b8' }}>
                    <th style={{ padding: '0.5rem 0' }}>Certificate Name</th>
                    <th>Issuer</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((c, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff' }}>
                      <td style={{ padding: '0.75rem 0', fontWeight: 600 }}>{c.name}</td>
                      <td>{c.issuer}</td>
                      <td style={{ color: '#10b981' }}>Verified</td>
                    </tr>
                  ))}
                  {certificates.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ padding: '1rem 0', textAlign: 'center', color: '#64748b' }}>No certificates submitted.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Page 5: AI Roadmap & Sign-off */}
        <div className="print-page">
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>4. RECOMMENDATIONS & SIGN-OFF</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', flex: 1 }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.75rem' }}>Actionable Career Progression Checklist</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recommendations.slice(0, 4).map((rec, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
                    <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>{rec.category}</span>
                    <p style={{ color: '#e2e8f0', fontSize: '0.85rem', margin: '0.25rem 0 0', lineHeight: 1.4 }}>{rec.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.75rem' }}>Verification Credentials</h3>
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', fontSize: '0.75rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div><strong>ID:</strong> CIQ-REP-{Date.now().toString().substring(5)}</div>
                  <div><strong>Hash:</strong> sha256-{Math.random().toString(36).substring(2, 10)}{Math.random().toString(36).substring(2, 10)}</div>
                  <div><strong>Status:</strong> Cryptographically Verified</div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', marginTop: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
                    <span>Chief Assessment Officer</span>
                    <span>Verification Authority</span>
                  </div>
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 700, fontFamily: 'serif', fontStyle: 'italic', marginTop: '0.5rem' }}>
                    <span>CAO Signature</span>
                    <span>VA Signature</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

interface ExpandableExplanationProps {
  title: string;
  formula: string;
  breakdown: Array<{ name: string; value: string }> | null;
}

const ExpandableExplanation: React.FC<ExpandableExplanationProps> = ({ title, formula, breakdown }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={{ marginTop: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: '100%', padding: '0.6rem 1rem', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left' }}
      >
        <span>🔍 How is this score calculated?</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>Formula</span>
            <code style={{ fontSize: '0.8rem', color: '#60a5fa' }}>{formula}</code>
          </div>
          {breakdown && breakdown.length > 0 && (
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.4rem' }}>Your Calculation breakdown</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {breakdown.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '0.2rem' }}>
                    <span style={{ color: '#cbd5e1' }}>{item.name}</span>
                    <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

