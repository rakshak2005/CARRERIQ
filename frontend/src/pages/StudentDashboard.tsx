// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { api, BACKEND_URL } from '../services/api';
import { ScoreMeter } from '../components/ScoreMeter';
import { ProjectsPortfolio } from '../components/ProjectsPortfolio';
import { useNavigate } from 'react-router-dom';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
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
// GitHub Improvement Report removed
  const [githubRepositories, setGithubRepositories] = useState<any[]>([]);

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
      setFullName(data.profile.full_name || data.profile.fullName || '');
      setTargetRole(data.profile.target_role || data.profile.targetRole || '');
      setGithubUrl(data.profile.github_url || data.profile.githubUrl || '');
      setLinkedinUrl(data.profile.linkedin_url || data.profile.linkedinUrl || '');
      setDsaIncluded(data.profile.dsa_included || data.profile.dsaIncluded || false);
      setCertificatesIncluded(data.profile.certificates_included !== undefined ? data.profile.certificates_included : true);
      setResumeUrl(data.profile.resume_url || data.profile.resumeUrl || null);


      setResumeATSScore(data.profile.resume_ats_score || 0);
      setResumeRoleMatchScore(data.profile.resume_role_match_score || 0);
      setResumeSkillsScore(data.profile.resume_skills_score || 0);
      setResumeProjectsScore(data.profile.resume_projects_score || 0);
      setResumeExperienceScore(data.profile.resume_experience_score || 0);
      setResumeCertificationScore(data.profile.resume_certification_score || 0);
      setResumeProfessionalPresenceScore(data.profile.resume_professional_presence_score || 0);
      setResumeStrengths(data.profile.resume_strengths || []);
      setResumeWeaknesses(data.profile.resume_weaknesses || []);
      setResumeMissingKeywords(data.profile.resume_missing_keywords || []);
      setResumeRecommendedSkills(data.profile.resume_recommended_skills || []);
      setResumeSummary(data.profile.resume_summary || '');
      setResumeSkills(data.profile.resume_skills || []);
      setResumeProjects(data.profile.resume_projects || []);
      setResumeLastAnalyzed(data.profile.resume_last_analyzed || null);
      setResumeFileName(data.profile.resume_file_name || null);
      setPortfolioProjects(data.profile.portfolio_projects || data.portfolioProjects || []);
      setPortfolioScore(data.profile.portfolio_score || data.portfolioScore || 0);
      setPortfolioInsights(data.profile.portfolio_insights || data.portfolioInsights || null);
      setPortfolioRecommendations(data.profile.portfolio_recommendations || data.portfolioRecommendations || []);
      setGithubUsername(data.profile.github_username || data.profile.githubUsername || null);
      if (data.profile.github_recommendations || data.profile.githubRecommendations) setGithubRecommendations(data.profile.github_recommendations || data.profile.githubRecommendations);
// GitHub Improvement Report removed
      setGithubRepos(data.profile.github_repos || data.profile.metadata?.publicRepos || data.profile.githubRepos || 0);
      setGithubFollowers(data.profile.github_followers || data.profile.metadata?.followers || data.profile.githubFollowers || 0);
      setGithubStars(data.profile.github_stars || data.profile.metadata?.stars || data.profile.githubStars || 0);
      setGithubScore(data.profile.github_score || data.profile.employabilityScore || data.profile.githubScore || 0);
      setGithubAgeYears(data.profile.github_age_years || data.profile.metadata?.accountAgeYears || data.profile.githubAgeYears || 0);

      // Matches & roadmap
      if (data.profile.careerRoadmap) {
        setRecRoles(data.profile.careerRoadmap.targetRoles || []);
        setGrowthProject(data.profile.careerRoadmap.nextRecommendedProject || null);
      }
    }
    if (data.projects) setProjects(data.projects);
    if ((data.repositories && data.repositories.length > 0) || (data.profile && data.profile.github_repositories)) {
      let repos1 = data.repositories;
      if (typeof repos1 === 'string') { try { repos1 = JSON.parse(repos1); } catch(e) { repos1 = []; } }
      let repos2 = data.profile ? data.profile.github_repositories : [];
      if (typeof repos2 === 'string') { 
        try { repos2 = JSON.parse(repos2); } catch(e) { repos2 = []; } 
      } else if (Array.isArray(repos2) && repos2.length === 1 && typeof repos2[0] === 'string' && repos2[0].startsWith('[')) {
        try { repos2 = JSON.parse(repos2[0]); } catch(e) { repos2 = []; }
      }
      
      const r1 = Array.isArray(repos1) ? repos1 : [];
      const r2 = Array.isArray(repos2) ? repos2 : [];
      
      // Use whichever array has more items
      setGithubRepositories(r1.length >= r2.length ? r1 : r2);
    }
    if (data.technologies || (data.profile && data.profile.github_tech_stacks)) {
      let techs = data.technologies || data.profile.github_tech_stacks;
      if (typeof techs === 'string') { 
        try { techs = JSON.parse(techs); } catch(e) { techs = []; } 
      } else if (Array.isArray(techs) && techs.length === 1 && typeof techs[0] === 'string' && techs[0].startsWith('[')) {
        try { techs = JSON.parse(techs[0]); } catch(e) { techs = []; }
      }
      setGithubTechnologies(Array.isArray(techs) ? techs : []);
    }
    if (data.breakdown || (data.profile && data.profile.github_breakdown)) {
      let bkd = data.breakdown || data.profile.github_breakdown;
      if (typeof bkd === 'string') { 
        try { bkd = JSON.parse(bkd); } catch(e) { bkd = null; } 
      } else if (Array.isArray(bkd) && bkd.length === 1 && typeof bkd[0] === 'string' && bkd[0].startsWith('{')) {
        try { bkd = JSON.parse(bkd[0]); } catch(e) { bkd = null; }
      }
      setGithubBreakdown(bkd);
    }
    if (data.profile && data.profile.github_recommendations) {
      let recs = data.profile.github_recommendations;
      if (typeof recs === 'string') { 
        try { recs = JSON.parse(recs); } catch(e) { recs = []; } 
      } else if (Array.isArray(recs) && recs.length === 1 && typeof recs[0] === 'string' && recs[0].startsWith('[')) {
        try { recs = JSON.parse(recs[0]); } catch(e) { recs = []; }
      }
      setGithubRecommendations(Array.isArray(recs) ? recs : []);
    }
    if (data.certificates) setCertificates(data.certificates);
    if (data.overallScore !== undefined) setOverallScore(data.overallScore);
    if (data.profile && data.profile.employabilityScore !== undefined) setOverallScore(data.profile.employabilityScore);
    
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
          updateDashboardState(res);
          showBanner('GitHub Account Analysis complete! Employability rating generated.', 'success');
        } else if (res.status === 'failed') {
          clearInterval(interval);
          setAnalysisActive(false);
          showBanner(res.error || 'GitHub Analysis failed', 'danger');
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
  }, []);

  const showBanner = (text: string, type: 'success' | 'danger') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleProfileSubmit = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
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
      showBanner('Profile metadata updated.', 'success');
    } catch (err: any) {
      showBanner(err.message || 'Failed to update profile', 'danger');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAnalyzeGithub = async () => {
    if (!githubUrl || githubUrl.trim().length === 0) {
      showBanner('Please enter a GitHub URL first.', 'danger');
      return;
    }
    setAnalysisActive(true);
    setAnalysisMessage('Analyzing GitHub Profile...');
    try {
      const analyzeRes = await api.github.analyze(githubUrl);
      if (analyzeRes.success && analyzeRes.data) {
        // Full recalculation triggered, so let's reload the whole profile to get the new dashboard state properly
        await loadProfile();
        showBanner('GitHub profile analyzed successfully!', 'success');
      } else {
        showBanner(analyzeRes.message || 'Failed to analyze GitHub profile', 'danger');
      }
    } catch (err: any) {
      showBanner(err.message || 'Failed to analyze GitHub profile', 'danger');
    } finally {
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
      showBanner('Resume uploaded successfully. Score recalculated!', 'success');
    } catch (err: any) {
      showBanner(err.message || 'Failed to upload resume', 'danger');
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

  if (loading) {
    return (
      <div className="container flex-center" style={{ minHeight: '80vh' }}>
        <h2>Analyzing readiness dashboard...</h2>
      </div>
    );
  }
  return (
    <div className="container" style={{ maxWidth: '1440px' }}>
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

      {/* HEADER: Profile Summary (Name & Target Role) */}
      <div className="glass-card" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
            {fullName ? fullName.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your Full Name"
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-main)', fontSize: '1.25rem', fontWeight: 700, outline: 'none', width: '200px' }}
              />
            </div>
            <input 
              type="text" 
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Target Role (e.g. Software Engineer)"
              style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.9rem', outline: 'none', width: '250px' }}
            />
          </div>
        </div>
        <button 
          className="btn btn-primary" 
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          onClick={handleProfileSubmit}
          disabled={profileSaving}
        >
          {profileSaving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {/* HERO SECTION: Readiness Score & Calculation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2rem' }} className="grid-responsive-2">
        {/* Core Score Card */}
        <div className="glass-card flex-center" style={{ flexDirection: 'column', padding: '2rem', background: 'linear-gradient(180deg, rgba(37,99,235,0.05) 0%, rgba(0,0,0,0) 100%)' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CareerIQ Readiness</h2>
          <ScoreMeter score={overallScore} size={220} />
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <span className={`badge ${overallScore >= 80 ? 'badge-success' : overallScore >= 50 ? 'badge-primary' : 'badge-danger'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              {overallScore >= 80 ? 'Interview Ready' : overallScore >= 50 ? 'Developing Profile' : 'Action Required'}
            </span>
          </div>
        </div>

        {/* Calculation Details Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📊 Score Derivation Model
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Your overall readiness score is a weighted composite of your specific assessment areas. Improve specific modules to increase your overall rating.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }} className="grid-responsive-2">
            {[
              { label: 'Resume Check', weight: certificatesIncluded ? '35%' : '39%', score: categoryScores.resumeScore, color: 'var(--color-primary)' },
              { label: 'GitHub Analysis', weight: certificatesIncluded ? '30%' : '33%', score: githubScore, color: '#10b981' },
              { label: 'Project Portfolio', weight: certificatesIncluded ? '25%' : '28%', score: portfolioScore, color: '#8b5cf6' },
              ...(certificatesIncluded ? [{ label: 'Certifications', weight: '10%', score: categoryScores.experienceScore, color: '#f59e0b' }] : []),
            ].map(item => (
              <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{item.label}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: item.color }}>{item.weight} Wgt</span>
                </div>
                <div className="flex-between" style={{ alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{item.score}</span>
                  <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${item.score}%`, height: '100%', background: item.color, borderRadius: '2px' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODULES GRID */}
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', marginTop: '3rem' }}>Analysis Modules</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {/* 1. GITHUB ANALYSIS MODULE (Spans 2 columns if space allows) */}
        <div className="glass-card" style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, rgba(36, 41, 47, 0.4) 0%, rgba(20, 22, 25, 0.6) 100%)', borderColor: '#24292f' }}>
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fff' }}>
              <svg height="24" viewBox="0 0 16 16" width="24" style={{ fill: '#fff' }}>
                <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.35 3.12.9 0 .64.01 1.25.01 1.42 0 .21-.15.47-.55.38A8.006 8.006 0 0 1 0 8c0-4.42 3.58-8 8-8z" />
              </svg>
              GitHub Code Analysis
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className={`badge ${githubScore > 0 ? 'badge-success' : 'badge-secondary'}`}>
                {githubScore > 0 ? 'Completed' : 'Not Started'}
              </span>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '0.25rem 0.85rem', fontWeight: 700, color: '#fff' }}>
                {githubScore} / 100
              </div>
            </div>
          </div>

          {/* GitHub Input */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', maxWidth: '600px' }}>
            <input 
              type="url" 
              className="glass-input" 
              style={{ flex: 1 }}
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username"
            />
            <button 
              className="btn btn-primary" 
              onClick={handleAnalyzeGithub}
              disabled={analysisActive || !githubUrl}
            >
              {analysisActive ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>

          {/* Validation Banner */}
          {githubUsername && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              maxWidth: '600px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.85rem'
            }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)', marginRight: '0.5rem' }}>Analyzing:</span>
                <strong style={{ color: '#fff' }}>{githubUsername}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', marginRight: '0.5rem' }}>Repositories Found:</span>
                <strong style={{ color: 'var(--color-primary)' }}>{githubRepositories ? githubRepositories.length : 0}</strong>
              </div>
            </div>
          )}

          {/* GitHub Results */}
          {githubBreakdown && (
            <div className="animate-slide-up">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>{githubBreakdown.complexity}/25</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Complexity</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-secondary)' }}>{githubBreakdown.activity}/20</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Activity</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 700, color: '#00d2ff' }}>{githubBreakdown.quality}/25</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Quality</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 700, color: '#ffb900' }}>{githubBreakdown.techDiversity}/20</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Diversity</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 700, color: '#ff5e62' }}>{githubBreakdown.community}/10</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Community</span>
                </div>
              </div>

              {githubTechnologies.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {githubTechnologies.map(tech => (
                      <span key={tech} className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.1)' }}>{tech}</span>
                    ))}
                  </div>
                </div>
              )}

              {githubRepositories && githubRepositories.length > 0 && (
                <div style={{ overflowX: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '1rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                        <th style={{ padding: '0.5rem' }}>Repository</th>
                        <th style={{ padding: '0.5rem' }}>Score</th>
                        <th style={{ padding: '0.5rem' }}>Level</th>
                        <th style={{ padding: '0.5rem' }}>Tech Stack</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...githubRepositories].sort((a, b) => (b.repositoryScore || b.complexityScore || 0) - (a.repositoryScore || a.complexityScore || 0)).slice(0, 5).map(repo => {
                        const level = repo.complexityLevel || (repo.complexityScore > 80 ? 'Advanced' : repo.complexityScore > 50 ? 'Intermediate' : 'Basic');
                        const stack = Array.isArray(repo.detectedTechnologies) ? repo.detectedTechnologies.join(', ') : (repo.detectedTechnologies || (Array.isArray(repo.techStack) ? repo.techStack.join(', ') : repo.primaryLanguage));
                        const score = repo.repositoryScore || repo.complexityScore || repo.productionReadinessScore || 0;
                        return (
                          <tr key={repo.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '0.5rem' }}><a href={repo.url || repo.html_url} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>{repo.name}</a></td>
                            <td style={{ padding: '0.5rem', fontWeight: 600 }}>{score}</td>
                            <td style={{ padding: '0.5rem' }}>{level}</td>
                            <td style={{ padding: '0.5rem', color: 'var(--color-text-muted)' }}>{stack}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {githubRepositories.length > 5 && <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Showing top 5 repositories</div>}
                </div>
              )}


            </div>
          )}
          
          {githubScore > 0 && (
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => navigate('/github-analysis/report')}
                style={{ padding: '0.75rem 2rem', fontWeight: 'bold' }}
              >
                View Full GitHub Report →
              </button>
            </div>
          )}
        </div>

        {/* 2. RESUME MODULE */}
        <div className="glass-card" style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(30, 41, 59, 0.6) 100%)', borderColor: '#334155' }}>
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fff' }}>
              📄 AI Resume Intelligence
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className={`badge ${resumeUrl ? 'badge-success' : 'badge-secondary'}`}>
                {uploadingResume ? 'Processing...' : resumeUrl ? 'Completed' : 'Not Started'}
              </span>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '0.25rem 0.85rem', fontWeight: 700, color: '#fff' }}>
                {categoryScores.resumeScore} / 100
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, minWidth: '300px', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input type="file" id="resume-file-input" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleResumeUpload} />
              <button 
                className="btn btn-secondary" 
                onClick={() => document.getElementById('resume-file-input')?.click()} 
                disabled={uploadingResume}
              >
                {uploadingResume ? 'Analyzing Resume...' : resumeUrl ? 'Re-upload Resume' : 'Upload PDF/DOCX'}
              </button>
              {resumeUrl && <a href={`${BACKEND_URL}/${resumeUrl}`} target="_blank" rel="noreferrer" className="btn btn-ghost-premium">View File</a>}
              {resumeFileName && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{resumeFileName}</span>}
              {resumeLastAnalyzed && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>Analyzed: {new Date(resumeLastAnalyzed).toLocaleString()}</span>}
            </div>
          </div>

          {resumeUrl && (
            <div className="animate-slide-up">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>{resumeATSScore}/25</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>ATS Match</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 800, color: '#818cf8' }}>{resumeRoleMatchScore}/100</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Role Match</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>{resumeSkillsScore}/20</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Skills Check</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 800, color: '#f472b6' }}>{resumeProjectsScore}/20</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Projects</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24' }}>{resumeExperienceScore}/15</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Experience</span>
                </div>
              </div>

              {resumeSummary && (
                <div style={{ background: 'rgba(56, 189, 248, 0.1)', borderLeft: '4px solid #38bdf8', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#38bdf8' }}>AI Summary</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>{resumeSummary}</p>
                </div>
              )}

              {/* Insights Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                  <h4 style={{ color: '#34d399', marginBottom: '0.75rem' }}>👍 Strengths</h4>
                  <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem' }}>
                    {resumeStrengths.map((s, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{s}</li>)}
                    {resumeStrengths.length === 0 && <span style={{ color: 'var(--color-text-muted)' }}>None found</span>}
                  </ul>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                  <h4 style={{ color: '#f43f5e', marginBottom: '0.75rem' }}>👎 Weaknesses</h4>
                  <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem' }}>
                    {resumeWeaknesses.map((s, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{s}</li>)}
                    {resumeWeaknesses.length === 0 && <span style={{ color: 'var(--color-text-muted)' }}>None found</span>}
                  </ul>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                  <h4 style={{ color: '#fbbf24', marginBottom: '0.75rem' }}>⚠️ Missing Keywords ({targetRole || 'General'})</h4>
                  <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem' }}>
                    {resumeMissingKeywords.map((s, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{s}</li>)}
                    {resumeMissingKeywords.length === 0 && <span style={{ color: 'var(--color-text-muted)' }}>None found</span>}
                  </ul>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                  <h4 style={{ color: '#818cf8', marginBottom: '0.75rem' }}>💡 Recommended Skills</h4>
                  <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem' }}>
                    {resumeRecommendedSkills.map((s, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{s}</li>)}
                    {resumeRecommendedSkills.length === 0 && <span style={{ color: 'var(--color-text-muted)' }}>None found</span>}
                  </ul>
                </div>
              </div>

              {resumeSkills && resumeSkills.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Extracted Skills</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {resumeSkills.map((skill, i) => (
                      <span key={i} className="badge" style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem', background: 'rgba(56, 189, 248, 0.15)', color: '#e0f2fe', border: '1px solid rgba(56, 189, 248, 0.3)' }}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. PROJECTS PORTFOLIO */}
        <div style={{ gridColumn: '1 / -1' }}>
          <ProjectsPortfolio
            portfolioProjects={portfolioProjects}
            portfolioScore={portfolioScore}
            portfolioInsights={portfolioInsights}
            portfolioRecommendations={portfolioRecommendations}
            onSyncComplete={updateDashboardState}
            onAddProject={() => setShowProjModal(true)}
          />
        </div>

        {/* 5. CERTIFICATES */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>🎓 Certificates</h3>
            <span className={`badge ${certificatesIncluded ? (certificates.length > 0 ? 'badge-success' : 'badge-secondary') : 'badge-secondary'}`}>{certificatesIncluded ? (certificates.length + ' Added') : 'Excluded'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '1.5rem', opacity: certificatesIncluded ? 1 : 0.3 }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{certificatesIncluded ? categoryScores.experienceScore : '—'}</span>
            <span style={{ color: 'var(--color-text-muted)', marginBottom: '4px' }}>/ 100</span>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '100px', marginBottom: '1rem', opacity: certificatesIncluded ? 1 : 0.4 }}>
            {certificates.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>No certificates added.</p>
            ) : (
              <ul style={{ paddingLeft: '1rem', fontSize: '0.8rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {certificates.map(c => <li key={c.id}>{c.name} <span style={{ cursor: 'pointer', color: 'var(--color-error)' }} onClick={() => handleDeleteCertificate(c.id)}>×</span></li>)}
              </ul>
            )}
          </div>
          <button className="btn btn-secondary" style={{ width: '100%', padding: '0.4rem', fontSize: '0.85rem', marginBottom: '0.75rem' }} onClick={() => setShowCertModal(true)}>+ Add Certificate</button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Include in Score</span>
            <label className="toggle-container">
              <input type="checkbox" checked={certificatesIncluded} onChange={(e) => { setCertificatesIncluded(e.target.checked); setTimeout(handleProfileSubmit, 100); }} />
              <div className="toggle-switch"></div>
            </label>
          </div>
        </div>

      </div>

      {/* AI RECOMMENDATIONS AND ROADMAP (Bottom Sections) */}
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', marginTop: '3rem' }}>Action Items & Insights</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
        
        {/* Recruiter Matches */}
        {recRoles.length > 0 && (
          <div className="glass-card animate-slide-up">
            <h3 style={{ marginBottom: '1.25rem' }}>Recruiter Fit Matching</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recRoles.map((roleObj, idx) => {
                const matchColor = roleObj.matchPercentage >= 80 ? 'var(--color-success)' : roleObj.matchPercentage >= 55 ? 'var(--color-warning)' : 'var(--color-text-muted)';
                return (
                  <div key={idx}>
                    <div className="flex-between" style={{ fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 600 }}>{roleObj.role}</span>
                      <span style={{ fontWeight: 700, color: matchColor }}>{roleObj.matchPercentage}% Match</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--border-subcard)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${roleObj.matchPercentage}%`, background: matchColor, borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Improvement Plan */}
        <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.05) 0%, rgba(15, 23, 42, 0.4) 100%)', borderColor: 'var(--color-primary-glow)' }}>
          <h3 style={{ marginBottom: '1.25rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ✨ AI Improvement Roadmap
          </h3>
          {recommendations.length === 0 ? (
            <p style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>Complete module analysis to generate tailored AI tips.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recommendations.map((rec, i) => (
                <div key={i} style={{ borderLeft: '2px solid var(--color-primary)', paddingLeft: '0.85rem', fontSize: '0.875rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-text-title)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '0.15rem' }}>
                    {rec.category}
                  </span>
                  <p style={{ color: 'var(--color-text-main)', margin: 0 }}>{rec.recommendation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
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
  );
};
