// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { api, BACKEND_URL } from '../services/api';
import { ScoreMeter } from '../components/ScoreMeter';
import { ProjectsPortfolio } from '../components/ProjectsPortfolio';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import { FloatingCopilot } from '../components/dashboard/FloatingCopilot';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
      if (typeof repos1 === 'string') { try { repos1 = JSON.parse(repos1); } catch(e) { repos1 = []; } }
      let repos2 = data.profile ? (data.profile.github_repositories || data.profile.githubRepositories) : [];
      if (typeof repos2 === 'string') { 
        try { repos2 = JSON.parse(repos2); } catch(e) { repos2 = []; } 
      } else if (Array.isArray(repos2) && repos2.length === 1 && typeof repos2[0] === 'string' && repos2[0].startsWith('[')) {
        try { repos2 = JSON.parse(repos2[0]); } catch(e) { repos2 = []; }
      }
      
      const r1 = Array.isArray(repos1) ? repos1 : [];
      const r2 = Array.isArray(repos2) ? repos2 : [];
      setGithubRepositories(r1.length >= r2.length ? r1 : r2);
    }
    if (data.technologies || (data.profile && (data.profile.github_tech_stacks || data.profile.githubTechStacks))) {
      let techs = data.technologies || data.profile.github_tech_stacks || data.profile.githubTechStacks;
      if (typeof techs === 'string') { 
        try { techs = JSON.parse(techs); } catch(e) { techs = []; } 
      } else if (Array.isArray(techs) && techs.length === 1 && typeof techs[0] === 'string' && techs[0].startsWith('[')) {
        try { techs = JSON.parse(techs[0]); } catch(e) { techs = []; }
      }
      setGithubTechnologies(Array.isArray(techs) ? techs : []);
    }
    if (data.breakdown || (data.profile && (data.profile.github_breakdown || data.profile.githubBreakdown))) {
      let bkd = data.breakdown || data.profile.github_breakdown || data.profile.githubBreakdown;
      if (typeof bkd === 'string') { 
        try { bkd = JSON.parse(bkd); } catch(e) { bkd = null; } 
      } else if (Array.isArray(bkd) && bkd.length === 1 && typeof bkd[0] === 'string' && bkd[0].startsWith('{')) {
        try { bkd = JSON.parse(bkd[0]); } catch(e) { bkd = null; }
      }
      setGithubBreakdown(bkd);
    }
    if (data.profile && (data.profile.github_recommendations || data.profile.githubRecommendations)) {
      let recs = data.profile.github_recommendations || data.profile.githubRecommendations;
      if (typeof recs === 'string') { 
        try { recs = JSON.parse(recs); } catch(e) { recs = []; } 
      } else if (Array.isArray(recs) && recs.length === 1 && typeof recs[0] === 'string' && recs[0].startsWith('[')) {
        try { recs = JSON.parse(recs[0]); } catch(e) { recs = []; }
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
      const data = await api.student.getProfile();
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
    <div style={{ display: 'flex', width: '100%', maxWidth: '1440px', margin: '0 auto' }}>
      <Sidebar />
      <div className="container" style={{ flex: 1, paddingLeft: '2rem' }}>
      {/* Custom Styles */}
      <style>{`
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
      <section id="dashboard" style={{ marginBottom: '3rem', paddingTop: '1rem' }}>
        <div className="dashboard-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff' }}>
              Welcome back, {fullName || 'Student'}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className="badge badge-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>{targetRole || 'Target Role'}</span>
              <span style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Here is your career readiness overview</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-ghost-premium">View Roadmap</button>
            <button className="btn-ghost-premium">Export Report</button>
            <button className="btn-cta-premium" onClick={handleProfileSubmit} disabled={profileSaving}>{profileSaving ? 'Saving...' : 'Improve Score'}</button>
          </div>
        </div>

        <div className="dashboard-hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          
          {/* Main Score Card */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '150px', height: '150px', background: 'rgba(59, 130, 246, 0.2)', filter: 'blur(50px)', borderRadius: '50%' }}></div>
            <div style={{ position: 'absolute', bottom: '-50px', right: '-50px', width: '150px', height: '150px', background: 'rgba(139, 92, 246, 0.2)', filter: 'blur(50px)', borderRadius: '50%' }}></div>
            
            <h3 style={{ fontSize: '1.1rem', color: '#94a3b8', marginBottom: '1rem', zIndex: 1 }}>Career Readiness Score</h3>
            
            <div style={{ position: 'relative', width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
              <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="110" cy="110" r="100" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                <circle cx="110" cy="110" r="100" fill="none" stroke="url(#scoreGrad)" strokeWidth="12" strokeDasharray="628" strokeDashoffset={628 - (628 * overallScore) / 100} style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} strokeLinecap="round" />
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: '3.5rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{Math.round(overallScore)}</div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>Out of 100</div>
              </div>
            </div>

            <div style={{ width: '100%', marginTop: '2rem', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ color: '#94a3b8' }}>Next Milestone: {overallScore < 70 ? '70' : overallScore < 85 ? '85' : '100'}</span>
                <span style={{ color: '#3b82f6', fontWeight: 600 }}>{overallScore < 70 ? 70 - overallScore : overallScore < 85 ? 85 - overallScore : 0} pts away</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${(overallScore / (overallScore < 70 ? 70 : overallScore < 85 ? 85 : 100)) * 100}%`, height: '100%', background: '#3b82f6', borderRadius: '3px' }}></div>
              </div>
            </div>
          </div>

          {/* Radar Chart & Stats */}
          <div className="glass-card" id="readiness" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1rem' }}>Score Breakdown</h3>
            <div style={{ height: '250px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                  { subject: 'Resume', A: categoryScores.resumeScore, fullMark: 100 },
                  { subject: 'GitHub', A: githubScore, fullMark: 100 },
                  { subject: 'Projects', A: portfolioScore, fullMark: 100 },
                  { subject: 'Certs', A: categoryScores.experienceScore, fullMark: 100 },
                  { subject: 'DSA', A: categoryScores.dsaScore, fullMark: 100 },
                ]}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Biggest Improvement Opportunity</div>
              <div style={{ color: '#fff', fontWeight: 600 }}>GitHub Activity & Complexity</div>
              <div style={{ fontSize: '0.85rem', color: '#60a5fa', marginTop: '0.25rem', cursor: 'pointer' }}>View recommended actions →</div>
            </div>
          </div>

        </div>
      </section>

      {/* MODULES GRID */}
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', marginTop: '3rem' }}>Profile Management & Analysis</h2>
      <div className="dashboard-modules-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {/* NEW GITHUB ANALYTICS DASHBOARD */}
        <section id="github" style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, rgba(36, 41, 47, 0.4) 0%, rgba(20, 22, 25, 0.6) 100%)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <svg height="28" viewBox="0 0 16 16" width="28" style={{ fill: '#fff' }}>
                  <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.35 3.12.9 0 .64.01 1.25.01 1.42 0 .21-.15.47-.55.38A8.006 8.006 0 0 1 0 8c0-4.42 3.58-8 8-8z" />
                </svg>
                GitHub Analytics
              </h3>
              <p style={{ margin: '0.25rem 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>Real-time code quality and complexity analysis</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className={`badge ${githubScore > 0 ? 'badge-success' : 'badge-secondary'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                {githubScore > 0 ? 'Connected' : 'Disconnected'}
              </span>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '12px', padding: '0.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>GH Score</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{githubScore}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {editingGithubUrl ? (
              <div style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '600px' }}>
                <input type="url" className="glass-input" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/username" />
                <button className="btn btn-primary" onClick={handleUpdateGithubUrl} disabled={profileSaving}>{profileSaving ? 'Saving...' : 'Save'}</button>
                <button className="btn btn-secondary" onClick={() => setEditingGithubUrl(false)}>Cancel</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 1rem', borderRadius: '12px', width: '100%', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Linked Account:</span>
                <a href={githubUrl} target="_blank" rel="noreferrer" style={{ fontWeight: 600, color: '#60a5fa' }}>{githubUrl || 'None linked'}</a>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                  <button className="btn-ghost-premium" onClick={() => setEditingGithubUrl(true)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Change</button>
                  <button className="btn-ghost-premium" onClick={handleReanalyzeGithub} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Refresh Sync</button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats Grid */}
          <div className="github-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
            {[
              { label: 'Repositories', value: githubRepos, icon: '📦' },
              { label: 'Total Stars', value: githubStars, icon: '⭐' },
              { label: 'Followers', value: githubFollowers, icon: '👥' },
              { label: 'Languages', value: githubTechnologies.length, icon: '💻' },
              { label: 'Active Years', value: githubAgeYears, icon: '⏳' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                  <span>{stat.icon}</span> {stat.label}
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Breakdown & Technologies */}
          <div className="github-breakdown-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Tech Stack Distribution */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.5rem' }}>
              <h4 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.1rem' }}>Technology Distribution</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {githubTechnologies.length > 0 ? githubTechnologies.map((tech, idx) => (
                  <span key={tech} style={{ 
                    background: `hsla(${210 + idx * 25}, 80%, 60%, 0.1)`, 
                    color: `hsl(${210 + idx * 25}, 80%, 70%)`,
                    border: `1px solid hsla(${210 + idx * 25}, 80%, 60%, 0.2)`,
                    padding: '0.35rem 0.85rem', 
                    borderRadius: '20px', 
                    fontSize: '0.85rem', 
                    fontWeight: 500 
                  }}>
                    {tech}
                  </span>
                )) : <span style={{ color: '#94a3b8' }}>No technologies detected.</span>}
              </div>
            </div>

            {/* Quality Metrics */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.5rem' }}>
              <h4 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.1rem' }}>Quality Metrics</h4>
              {githubBreakdown ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="flex-between">
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Complexity</span>
                    <span style={{ color: '#3b82f6', fontWeight: 600 }}>{githubBreakdown.complexity}/25</span>
                  </div>
                  <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}><div style={{ width: `${(githubBreakdown.complexity/25)*100}%`, height: '100%', background: '#3b82f6', borderRadius: '2px' }} /></div>
                  
                  <div className="flex-between" style={{ marginTop: '0.25rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Quality</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>{githubBreakdown.quality}/25</span>
                  </div>
                  <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}><div style={{ width: `${(githubBreakdown.quality/25)*100}%`, height: '100%', background: '#10b981', borderRadius: '2px' }} /></div>
                </div>
              ) : (
                <span style={{ color: '#94a3b8' }}>Run analysis to see metrics.</span>
              )}
            </div>
          </div>

          {/* Repositories Table */}
          {githubRepositories && githubRepositories.length > 0 && (
            <div>
              <div className="flex-between" style={{ marginBottom: '1rem' }}>
                <h4 style={{ color: '#fff', fontSize: '1.1rem', margin: 0 }}>Top Repositories</h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" placeholder="Search repos..." style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', outline: 'none' }} />
                </div>
              </div>
              <div style={{ overflowX: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                   <thead>
                     <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'left', color: '#94a3b8' }}>
                       <th style={{ padding: '1rem 1.25rem', fontWeight: 500 }}>Repository Name</th>
                       <th style={{ padding: '1rem 1.25rem', fontWeight: 500 }}>Impact Score</th>
                       <th style={{ padding: '1rem 1.25rem', fontWeight: 500 }}>Complexity</th>
                       <th style={{ padding: '1rem 1.25rem', fontWeight: 500 }}>Tech Stack</th>
                     </tr>
                   </thead>
                   <tbody>
                     {[...githubRepositories].sort((a, b) => (b.repositoryScore || b.complexityScore || 0) - (a.repositoryScore || a.complexityScore || 0)).slice(0, 5).map(repo => {
                       const score = repo.repositoryScore || repo.complexityScore || 0;
                       const level = repo.complexityLevel || (score > 80 ? 'Advanced' : score > 50 ? 'Intermediate' : 'Basic');
                       return (
                         <tr key={repo.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                           <td style={{ padding: '1rem 1.25rem' }}>
                             <a href={repo.url || repo.html_url} target="_blank" rel="noreferrer" style={{ color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                               <svg viewBox="0 0 16 16" width="16" height="16" fill="#94a3b8"><path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"></path></svg>
                               {repo.name}
                             </a>
                           </td>
                           <td style={{ padding: '1rem 1.25rem' }}>
                             <span style={{ color: score > 80 ? '#10b981' : score > 50 ? '#3b82f6' : '#f59e0b', fontWeight: 700 }}>{score}</span>
                           </td>
                           <td style={{ padding: '1rem 1.25rem' }}>
                             <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', color: '#e2e8f0' }}>{level}</span>
                           </td>
                           <td style={{ padding: '1rem 1.25rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                             {Array.isArray(repo.detectedTechnologies) ? repo.detectedTechnologies.join(', ') : (repo.detectedTechnologies || repo.primaryLanguage)}
                           </td>
                         </tr>
                       );
                     })}
                   </tbody>
                </table>
              </div>
            </div>
          )}

          {githubScore > 0 && (
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
              <button className="btn-ghost-premium" onClick={() => navigate('/github-analysis/report')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Open Full GitHub Report <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
            </div>
          )}
        </section>

        {/* NEW RESUME MANAGEMENT CARD */}
        <section id="resume" className="glass-card" style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(30, 41, 59, 0.6) 100%)', borderColor: '#334155', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                📄 Resume AI Analysis
              </h3>
              <p style={{ margin: '0.25rem 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>Deep NLP parsing against industry standards</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className={`badge ${resumeUrl ? 'badge-success' : 'badge-secondary'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                {uploadingResume ? 'Processing...' : resumeUrl ? 'Uploaded' : 'No Resume'}
              </span>
              <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '12px', padding: '0.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ATS Score</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{resumeATSScore}<span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>/25</span></span>
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
                        <div style={{ width: `${(stat.score/stat.max)*100}%`, height: '100%', background: stat.color, borderRadius: '2px' }} />
                      </div>
                    </div>
                  ))}
                  
                  <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', border: '1px dashed rgba(59, 130, 246, 0.3)' }}>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Total Resume Score</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6', lineHeight: 1 }}>{categoryScores.resumeScore} <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 500 }}>/ 100</span></div>
                  </div>
                </div>

                {/* NLP Analysis Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
        
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff' }}>AI Roadmap</h3>
          </div>
          
          {recommendations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: '#94a3b8' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: '1rem', opacity: 0.5 }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <p style={{ fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>Complete module analysis to generate tailored AI tips.</p>
            </div>
          ) : (
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
    <FloatingCopilot />
    </div>
  );
};
