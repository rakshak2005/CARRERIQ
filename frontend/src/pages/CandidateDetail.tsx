import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ScoreMeter } from '../components/ScoreMeter';

export const CandidateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState<any | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        const data = await api.recruiter.getCandidateDetail(parseInt(id));
        setCandidate(data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="container flex-center" style={{ minHeight: '80vh' }}>
        <h2>Loading candidate credentials...</h2>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="container text-center" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h2>Candidate Not Found</h2>
        <button onClick={() => navigate('/recruiter-dashboard')} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const profile = candidate.profile;
  const projects = candidate.projects || [];
  const certificates = candidate.certificates || [];
  const scores = candidate.categoryScores || {
    resume_score: 0,
    projects_score: 0,
    experience_score: 0,
    online_presence_score: 0,
    dsa_score: 0,
  };
  const ai = candidate.aiSummary || {
    summary: 'Analysis pending.',
    strengths: ['Evaluation incomplete.'],
    weaknesses: ['Evaluation incomplete.'],
    verdict: 'Interview'
  };

  const verdictColor = ai.verdict === 'Strong Hire' 
    ? 'var(--color-success)' 
    : ai.verdict === 'Interview' 
    ? 'var(--color-warning)' 
    : 'var(--color-error)';

  return (
    <div className="container">
      {/* Back button */}
      <button 
        onClick={() => navigate('/recruiter-dashboard')} 
        className="btn btn-secondary" 
        style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
      >
        ← Database
      </button>

      {/* Main Candidate details layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem' }} className="student-grid-responsive">
        
        {/* Left Column: Profile details, Projects, Certificates */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Profile overview Card */}
          <section className="glass-card">
            <div className="flex-between" style={{ alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2>{profile.full_name}</h2>
                <span className="badge badge-primary">{profile.target_role || 'Not Specifed'}</span>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {profile.resume_url && (
                  <a 
                    href={`http://localhost:5000/${profile.resume_url}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn btn-primary"
                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                  >
                    📄 View CV
                  </a>
                )}
                {profile.github_url && (
                  <a 
                    href={profile.github_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                  >
                    💻 GitHub
                  </a>
                )}
                {profile.linkedin_url && (
                  <a 
                    href={profile.linkedin_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                  >
                    👔 LinkedIn
                  </a>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Email Address</span>
                <span style={{ color: 'var(--color-text-main)', fontWeight: 500 }}>{profile.email || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>DSA Evaluation status</span>
                <span style={{ color: profile.dsa_included ? 'var(--color-success)' : 'var(--color-text-muted)', fontWeight: 600 }}>
                  {profile.dsa_included ? '✓ Included in score' : 'Excluded'}
                </span>
              </div>
            </div>
          </section>

          {/* GitHub Account Analyzer */}
          {profile.github_username && (
            <section className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(36, 41, 47, 0.4) 0%, rgba(20, 22, 25, 0.6) 100%)', borderColor: '#24292f' }}>
              <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fff' }}>
                  <svg height="24" viewBox="0 0 16 16" width="24" style={{ fill: '#fff' }}>
                    <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.35 3.12.9 0 .64.01 1.25.01 1.42 0 .21-.15.47-.55.38A8.006 8.006 0 0 1 0 8c0-4.42 3.58-8 8-8z" />
                  </svg>
                  GitHub Profile Analytics
                </h3>
                <div style={{
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                  borderRadius: '20px',
                  padding: '0.25rem 0.85rem',
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: '#fff',
                  boxShadow: '0 0 15px rgba(110, 68, 255, 0.4)'
                }}>
                  {profile.github_score} / 100
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' }} className="grid-responsive-2">
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>{profile.github_repos}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Repos</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-secondary)' }}>{profile.github_stars}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stars</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 700, color: '#00d2ff' }}>{profile.github_followers}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Followers</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 700, color: '#ffb900' }}>{profile.github_age_years}y</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Age</span>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', background: 'rgba(0,0,0,0.2)', padding: '0.75rem 1rem', borderRadius: '6px', borderLeft: '3.5px solid #24292f' }}>
                <strong>Linked Account:</strong> <a href={`https://github.com/${profile.github_username}`} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>@{profile.github_username}</a>. 
                Metrics are verified and fetched in real-time from the candidate's public activity.
              </div>
            </section>
          )}

          {/* Projects Portfolio */}
          <section className="glass-card">
            <h3 style={{ marginBottom: '1.25rem' }}>Project Portfolio</h3>
            {projects.length === 0 ? (
              <p style={{ fontStyle: 'italic' }}>No projects submitted by this candidate.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {projects.map((proj: any) => (
                  <div 
                    key={proj.id} 
                    style={{ 
                      paddingBottom: '1.25rem', 
                      borderBottom: '1px solid var(--border-subcard)' 
                    }}
                    className="cand-project-row"
                  >
                    <div className="flex-between" style={{ marginBottom: '0.25rem' }}>
                      <h4 style={{ color: 'var(--color-text-title)' }}>{proj.title}</h4>
                      {proj.project_url && (
                        <a href={proj.project_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem' }}>
                          View Repository ↗
                        </a>
                      )}
                    </div>
                    <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>{proj.description}</p>
                    {proj.technologies && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {proj.technologies.split(',').map((tech: string, idx: number) => (
                          <span key={idx} className="badge badge-secondary" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Certificates Section */}
          <section className="glass-card">
            <h3 style={{ marginBottom: '1.25rem' }}>Certifications & Credentials</h3>
            {certificates.length === 0 ? (
              <p style={{ fontStyle: 'italic' }}>No certifications listed.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-responsive-2">
                {certificates.map((cert: any) => (
                  <div 
                    key={cert.id} 
                    style={{ 
                      background: 'var(--bg-subcard)', 
                      border: '1px solid var(--border-subcard)', 
                      padding: '1rem', 
                      borderRadius: '8px'
                    }}
                  >
                    <h4 style={{ color: 'var(--color-text-title)', fontSize: '0.95rem', marginBottom: '0.15rem' }}>{cert.name}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                      Issued by {cert.issuer} ({cert.issue_date || 'N/A'})
                    </p>
                    {cert.credential_url && (
                      <a href={cert.credential_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        Verify Credential ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* Right Column: Score dial and Premium AI Evaluation summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Circular overall meter */}
          <div className="glass-card flex-center" style={{ flexDirection: 'column', padding: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Readiness Rating</h3>
            <ScoreMeter score={profile.overall_score} size={190} />
          </div>

          {/* AI Candidate summary */}
          <div 
            className="glass-card pulse-primary" 
            style={{ 
              background: 'linear-gradient(135deg, var(--color-secondary-glow) 0%, var(--bg-card) 100%)', 
              borderColor: 'var(--color-secondary-glow)' 
            }}
          >
            <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, color: 'var(--color-secondary)' }}>✨ AI Summary</h3>
              <span 
                className="badge" 
                style={{ 
                  background: verdictColor, 
                  color: '#ffffff',
                  boxShadow: `0 0 10px ${verdictColor}`
                }}
              >
                {ai.verdict}
              </span>
            </div>

            <p style={{ color: 'var(--color-text-main)', fontSize: '0.92rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              {ai.summary}
            </p>

            {/* Strengths */}
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-success)', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                Key Strengths
              </span>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', color: 'var(--color-text-main)' }}>
                {ai.strengths.map((str: string, i: number) => (
                  <li key={i}>{str}</li>
                ))}
              </ul>
            </div>

            {/* Improvement areas */}
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-error)', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                Areas for Growth
              </span>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', color: 'var(--color-text-main)' }}>
                {ai.weaknesses.map((weak: string, i: number) => (
                  <li key={i}>{weak}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Scores Breakdown Panel */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '1.25rem' }}>Category Scores</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Resume */}
              <div>
                <div className="flex-between" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span>Resume Checklist</span>
                  <span style={{ fontWeight: 600 }}>{scores.resume_score}%</span>
                </div>
                <div style={{ height: '6px', background: 'var(--border-subcard)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${scores.resume_score}%`, background: 'var(--grad-secondary)', borderRadius: '3px' }} />
                </div>
              </div>

              {/* Projects */}
              <div>
                <div className="flex-between" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span>Projects Quality</span>
                  <span style={{ fontWeight: 600 }}>{scores.projects_score}%</span>
                </div>
                <div style={{ height: '6px', background: 'var(--border-subcard)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${scores.projects_score}%`, background: 'var(--grad-secondary)', borderRadius: '3px' }} />
                </div>
              </div>

              {/* Experience */}
              <div>
                <div className="flex-between" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span>Credentials Completeness</span>
                  <span style={{ fontWeight: 600 }}>{scores.experience_score}%</span>
                </div>
                <div style={{ height: '6px', background: 'var(--border-subcard)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${scores.experience_score}%`, background: 'var(--grad-secondary)', borderRadius: '3px' }} />
                </div>
              </div>

              {/* Online Presence */}
              <div>
                <div className="flex-between" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span>Professional Footprint</span>
                  <span style={{ fontWeight: 600 }}>{scores.online_presence_score}%</span>
                </div>
                <div style={{ height: '6px', background: 'var(--border-subcard)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${scores.online_presence_score}%`, background: 'var(--grad-secondary)', borderRadius: '3px' }} />
                </div>
              </div>

              {/* DSA */}
              {profile.dsa_included && (
                <div>
                  <div className="flex-between" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <span>Algorithmic Preparation</span>
                    <span style={{ fontWeight: 600 }}>{scores.dsa_score}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--border-subcard)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${scores.dsa_score}%`, background: 'var(--grad-primary)', borderRadius: '3px' }} />
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
