import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export const RecruiterDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'candidates' | 'profile'>('candidates');
  const navigate = useNavigate();

  // Candidates list state
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [minScore, setMinScore] = useState<number>(0);
  const [dsaRequired, setDsaRequired] = useState(false);

  // Recruiter Profile state
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  const [message, setMessage] = useState({ text: '', type: '' });

  const showBanner = (text: string, type: 'success' | 'danger') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // Load candidates
  const loadCandidates = async () => {
    setLoadingCandidates(true);
    try {
      const data = await api.recruiter.getCandidates({
        search: search || undefined,
        targetRole: targetRole || undefined,
        minScore: minScore > 0 ? minScore : undefined,
        dsaRequired: dsaRequired || undefined
      });
      setCandidates(data);
    } catch (err: any) {
      console.error(err);
      showBanner(err.message || 'Error loading candidates', 'danger');
    } finally {
      setLoadingCandidates(false);
    }
  };

  // Load recruiter profile
  const loadProfile = async () => {
    try {
      const profile = await api.recruiter.getProfile();
      if (profile) {
        setFullName(profile.full_name || '');
        setCompanyName(profile.company_name || '');
        setCompanyWebsite(profile.company_website || '');
        setIndustry(profile.industry || '');
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, [search, targetRole, minScore, dsaRequired]);

  useEffect(() => {
    loadProfile();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await api.recruiter.updateProfile({
        fullName,
        companyName,
        companyWebsite,
        industry
      });
      showBanner('Company profile updated successfully!', 'success');
    } catch (err: any) {
      showBanner(err.message || 'Error saving company details', 'danger');
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div className="container">
      {/* Toast Alert */}
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

      {/* Main Panel Header */}
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Recruiter Panel</h1>
          <p>
            {companyName ? `Managing recruitment for ${companyName}` : 'Find and evaluate job-ready candidates.'}
          </p>
        </div>
        
        {/* Navigation tabs */}
        <div className="tabs-header" style={{ margin: 0, borderBottom: 'none' }}>
          <button 
            className={`tab-btn ${activeTab === 'candidates' ? 'active' : ''}`}
            onClick={() => setActiveTab('candidates')}
          >
            Candidate Database
          </button>
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Company Profile
          </button>
        </div>
      </div>

      {activeTab === 'candidates' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Filters Bar */}
          <div className="glass-card recruiter-filters-responsive" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr 1fr', gap: '1.25rem' }}>
            {/* Search Name */}
            <div>
              <label htmlFor="candSearch">Candidate Name</label>
              <input 
                id="candSearch"
                type="text" 
                className="glass-input" 
                placeholder="Search candidates..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            {/* Filter Target Role */}
            <div>
              <label htmlFor="candRole">Target Role</label>
              <input 
                id="candRole"
                type="text" 
                className="glass-input" 
                placeholder="e.g. Frontend, Data..." 
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>

            {/* Min Overall Score */}
            <div>
              <label htmlFor="minScore">Min Readiness Score ({minScore})</label>
              <input 
                id="minScore"
                type="range" 
                min="0" 
                max="100"
                step="5"
                style={{ width: '100%', accentColor: 'var(--color-primary)', height: '38px' }}
                value={minScore}
                onChange={(e) => setMinScore(parseInt(e.target.value))}
              />
            </div>

            {/* DSA required toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', paddingTop: '1.5rem' }}>
              <label className="toggle-container">
                <input 
                  type="checkbox" 
                  checked={dsaRequired}
                  onChange={(e) => setDsaRequired(e.target.checked)}
                />
                <div className="toggle-switch"></div>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>DSA Required Only</span>
              </label>
            </div>
          </div>

          {/* Candidates Results */}
          {loadingCandidates ? (
            <div className="text-center" style={{ padding: '4rem 0' }}>
              <h2>Running matching algorithms...</h2>
            </div>
          ) : candidates.length === 0 ? (
            <div className="glass-card text-center" style={{ padding: '4rem 0' }}>
              <h3 style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>No Candidates Found</h3>
              <p>Try broadening your filter criteria or search queries.</p>
            </div>
          ) : (
            <div id="candidate-list-section" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Table/List View Header */}
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', 
                  padding: '0.5rem 1.5rem', 
                  color: 'var(--color-text-muted)',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
                className="table-header-responsive"
              >
                <span>Candidate Name</span>
                <span>Target Role</span>
                <span>DSA prep</span>
                <span>Online Profile</span>
                <span style={{ textAlign: 'right' }}>Overall Score</span>
              </div>

              {/* Candidates rows */}
              {candidates.map((cand) => {
                const scoreColor = cand.overall_score >= 80 ? 'var(--color-success)' : cand.overall_score >= 50 ? 'var(--color-warning)' : 'var(--color-error)';
                return (
                  <div 
                    key={cand.id} 
                    className="glass-card cand-row-responsive" 
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', 
                      alignItems: 'center', 
                      cursor: 'pointer',
                      padding: '1.25rem 1.5rem'
                    }}
                    onClick={() => navigate(`/candidates/${cand.id}`)}
                  >
                    {/* Name & details */}
                    <div>
                      <h4 style={{ color: 'var(--color-text-title)', fontSize: '1.1rem' }}>{cand.full_name}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Registered candidate</span>
                    </div>

                    {/* Target role */}
                    <div>
                      <span className="badge badge-primary">{cand.target_role || 'Not Specifed'}</span>
                    </div>

                    {/* DSA Prep Toggle */}
                    <div>
                      {cand.dsa_included ? (
                        <span className="badge badge-success">Enabled</span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Disabled</span>
                      )}
                    </div>

                    {/* Online Presences */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {cand.github_url && (
                        <span style={{ fontSize: '0.85rem' }}>
                          💻 GitHub {cand.github_score !== undefined && cand.github_score !== null ? `(${cand.github_score}/100)` : ''}
                        </span>
                      )}
                      {cand.linkedin_url && (
                        <span style={{ fontSize: '0.85rem' }}>👔 LinkedIn</span>
                      )}
                      {!cand.github_url && !cand.linkedin_url && (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>None linked</span>
                      )}
                    </div>

                    {/* Score Gauge */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.25rem', color: scoreColor }}>
                        {cand.overall_score}
                      </span>
                      <div 
                        style={{ 
                          width: '12px', 
                          height: '12px', 
                          borderRadius: '50%', 
                          background: scoreColor,
                          boxShadow: `0 0 8px ${scoreColor}`
                        }} 
                      />
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {activeTab === 'profile' && (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <section className="glass-card animate-slide-up">
            <h3 style={{ marginBottom: '1.5rem' }}>Company Information</h3>
            {profileLoading ? (
              <p>Loading company parameters...</p>
            ) : (
              <form onSubmit={handleProfileSubmit}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="recName">Your Full Name *</label>
                  <input 
                    id="recName"
                    type="text" 
                    className="glass-input" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Jane Recruiter"
                    required
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="companyName">Company Name *</label>
                  <input 
                    id="companyName"
                    type="text" 
                    className="glass-input" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Google"
                    required
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="compWebsite">Company Website</label>
                  <input 
                    id="compWebsite"
                    type="url" 
                    className="glass-input" 
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    placeholder="https://company.com"
                  />
                </div>

                <div style={{ marginBottom: '1.75rem' }}>
                  <label htmlFor="industry">Industry / Sector</label>
                  <input 
                    id="industry"
                    type="text" 
                    className="glass-input" 
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Software, Finance..."
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  disabled={profileSaving}
                >
                  {profileSaving ? 'Saving parameters...' : 'Update Company Settings'}
                </button>
              </form>
            )}
          </section>
        </div>
      )}

    </div>
  );
};
