import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export const GitHubReport: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Sorting/Filtering for Repos
  const [repoSort, setRepoSort] = useState<'score' | 'stars' | 'updated'>('score');
  const [repoFilter, setRepoFilter] = useState<string>('all');

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.github.getReport();
      if (res.success && res.data) {
        setReportData(res.data);
      } else {
        setError('Failed to load report data.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching the report.');
    } finally {
      setLoading(false);
    }
  };

  const handleReanalyze = async () => {
    if (!confirm('This will trigger a full re-analysis of your GitHub profile including AI reviews. This may take a minute. Continue?')) return;
    setReanalyzing(true);
    setError(null);
    try {
      const res = await api.github.regenerateReport();
      if (res.success && res.data) {
        setReportData(res.data);
      } else {
        setError('Failed to regenerate report data.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during re-analysis.');
    } finally {
      setReanalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Loading GitHub Intelligence Report...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !reportData || !reportData.github_url) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/student-dashboard')} style={{ marginBottom: '2rem' }}>← Back to Dashboard</button>
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ color: 'var(--color-error)' }}>Report Not Available</h2>
          <p>{error || "You haven't analyzed a GitHub profile yet. Please go to your dashboard and analyze your profile first."}</p>
          <button className="btn btn-primary" onClick={() => navigate('/student-dashboard')} style={{ marginTop: '1.5rem' }}>Go to Dashboard</button>
        </div>
      </div>
    );
  }

  const d = reportData;
  const metrics = d.github_health_metrics || { documentation: 0, testing: 0, deployment: 0, cicd: 0, architecture: 0, codeQuality: 0, openSource: 0 };
  const repos = d.github_repositories || [];
  const issues = d.github_detailed_issues || { documentation: [], engineering: [], portfolio: [] };
  const recs = d.github_detailed_recs || [];
  const growth = d.github_growth_plan || { currentScore: d.github_score, phases: [] };
  const aiReview = d.github_career_review || null;
  const gaps = d.github_portfolio_gaps || { present: [], missing: [], coveragePercent: 0 };
  const wowProjects = d.github_wow_projects || [];

  // Derived filtered/sorted repos
  let displayRepos = [...repos];
  if (repoFilter !== 'all') {
    displayRepos = displayRepos.filter(r => (r.detectedTechnologies || []).includes(repoFilter) || r.primaryLanguage === repoFilter);
  }
  if (repoSort === 'score') displayRepos.sort((a, b) => (b.repositoryScore || 0) - (a.repositoryScore || 0));
  if (repoSort === 'stars') displayRepos.sort((a, b) => (b.stars || 0) - (a.stars || 0));
  if (repoSort === 'updated') displayRepos.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const allLangs: string[] = Array.from(new Set(repos.map((r: any) => r.primaryLanguage).filter((l: any) => l && l !== 'Unknown')));

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1200px' }}>
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/student-dashboard')}>← Dashboard</button>
        <button className="btn btn-primary" onClick={handleReanalyze} disabled={reanalyzing}>
          {reanalyzing ? 'Re-analyzing...' : 'Reanalyze Profile'}
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(90deg, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          GitHub Intelligence Report
        </h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Comprehensive engineering analysis for {d.github_username}
        </p>
      </div>

      {/* SECTION 1: Profile Summary */}
      <section className="glass-card" style={{ marginBottom: '3rem', padding: '2rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: '1 1 300px' }}>
          {d.github_avatar ? (
            <img src={d.github_avatar} alt="Avatar" style={{ width: '100px', height: '100px', borderRadius: '50%', border: '3px solid var(--color-primary)' }} />
          ) : (
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--border-subcard)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>👤</div>
          )}
          <div>
            <h2 style={{ margin: '0 0 0.5rem 0' }}>{d.github_username}</h2>
            <div style={{ display: 'flex', gap: '1rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              <span>👥 {d.github_followers} Followers</span>
              <span>⭐ {d.github_stars} Stars</span>
              <span>📁 {d.github_public_repos} Public Repos</span>
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Last Active: {d.github_last_activity ? new Date(d.github_last_activity).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '2rem', flex: '1 1 300px', justifyContent: 'flex-end', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Employability Score</div>
            <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: '1' }}>{d.github_score}</div>
          </div>
          <div style={{ height: '80px', width: '80px', borderRadius: '50%', background: `conic-gradient(var(--color-primary) ${d.github_score}%, rgba(255,255,255,0.1) 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-card)' }}></div>
          </div>
        </div>
      </section>

      {/* SECTION 3: GitHub Health Score */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>❤️ Health Metrics</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Documentation', score: metrics.documentation, color: '#38bdf8' },
            { label: 'Testing', score: metrics.testing, color: '#f472b6' },
            { label: 'Deployment', score: metrics.deployment, color: '#34d399' },
            { label: 'CI/CD', score: metrics.cicd, color: '#fbbf24' },
            { label: 'Architecture', score: metrics.architecture, color: '#818cf8' },
            { label: 'Code Quality', score: metrics.codeQuality, color: '#a78bfa' },
            { label: 'Open Source', score: metrics.openSource, color: '#f87171' },
          ].map(m => (
            <div key={m.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: m.color, marginBottom: '0.5rem' }}>{m.score}/10</div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-muted)' }}>{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7: CareerIQ AI Review */}
      {aiReview && (
        <section className="glass-card" style={{ marginBottom: '4rem', background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)', borderColor: 'var(--color-primary-glow)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>✨ AI Career Review</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '12px' }}>
              <h4 style={{ color: '#34d399', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>👍 Core Strengths</h4>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
                {aiReview.strengths?.map((s: string, i: number) => <li key={i} style={{ marginBottom: '0.5rem' }}>{s}</li>)}
              </ul>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '12px' }}>
              <h4 style={{ color: '#f43f5e', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>👎 Primary Weaknesses</h4>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
                {aiReview.weaknesses?.map((w: string, i: number) => <li key={i} style={{ marginBottom: '0.5rem' }}>{w}</li>)}
              </ul>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { title: 'Hiring Impact', content: aiReview.hiringImpact, color: '#38bdf8' },
              { title: 'Recruiter Perspective', content: aiReview.recruiterPerspective, color: '#a78bfa' },
              { title: 'Portfolio Maturity', content: aiReview.portfolioMaturity, color: '#fbbf24' },
              { title: 'Interview Readiness', content: aiReview.interviewReadiness, color: '#34d399' },
            ].map(col => (
              <div key={col.title} style={{ borderLeft: `3px solid ${col.color}`, paddingLeft: '1rem' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: col.color, marginBottom: '0.5rem' }}>{col.title}</div>
                <p style={{ fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>{col.content}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Overall Verdict</div>
            <p style={{ fontSize: '1.1rem', margin: 0, fontWeight: 500, lineHeight: 1.6, color: '#fff' }}>"{aiReview.overallVerdict}"</p>
          </div>
        </section>
      )}

      {/* SECTION 8: Portfolio Gaps */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🧩 Portfolio Gaps</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Coverage of essential engineering concepts expected in modern tech roles.</p>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${gaps.coveragePercent}%`, background: 'var(--color-primary)', borderRadius: '4px' }}></div>
          </div>
          <span style={{ fontWeight: 700 }}>{gaps.coveragePercent}% Coverage</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {gaps.present?.map((g: any, i: number) => (
            <div key={i} style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>{g.icon}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#34d399' }}>{g.name}</span>
            </div>
          ))}
          {gaps.missing?.map((g: any, i: number) => (
            <div key={i} style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: 0.6 }}>
              <span style={{ fontSize: '1.5rem', filter: 'grayscale(1)' }}>{g.icon}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{g.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: Drawbacks & Issues */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>⚠️ Drawbacks & Issues</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
          
          {/* Documentation */}
          <div className="glass-card">
            <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>📄 Documentation</h3>
            {issues.documentation?.length > 0 ? issues.documentation.map((iss: any, i: number) => (
              <div key={i} style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className={`badge ${iss.severity === 'Critical' ? 'badge-danger' : iss.severity === 'High' ? 'badge-warning' : 'badge-secondary'}`}>{iss.severity}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{iss.issue}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0 0 0.5rem 0' }}>{iss.impact}</p>
                {iss.affectedRepos && iss.affectedRepos.length > 0 && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    <strong>Affected:</strong> {iss.affectedRepos.join(', ')}
                  </div>
                )}
              </div>
            )) : <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>No major documentation issues found.</p>}
          </div>

          {/* Engineering */}
          <div className="glass-card">
            <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>⚙️ Engineering</h3>
            {issues.engineering?.length > 0 ? issues.engineering.map((iss: any, i: number) => (
              <div key={i} style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className={`badge ${iss.severity === 'Critical' ? 'badge-danger' : iss.severity === 'High' ? 'badge-warning' : 'badge-secondary'}`}>{iss.severity}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{iss.issue}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0 0 0.5rem 0' }}>{iss.impact}</p>
                {iss.affectedRepos && iss.affectedRepos.length > 0 && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    <strong>Affected:</strong> {iss.affectedRepos.join(', ')}
                  </div>
                )}
              </div>
            )) : <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>No major engineering issues found.</p>}
          </div>

          {/* Portfolio */}
          <div className="glass-card">
            <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>📁 Portfolio</h3>
            {issues.portfolio?.length > 0 ? issues.portfolio.map((iss: any, i: number) => (
              <div key={i} style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className={`badge ${iss.severity === 'Critical' ? 'badge-danger' : iss.severity === 'High' ? 'badge-warning' : 'badge-secondary'}`}>{iss.severity}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{iss.issue}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0 0 0.5rem 0' }}>{iss.impact}</p>
                {iss.affectedRepos && iss.affectedRepos.length > 0 && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    <strong>Affected:</strong> {iss.affectedRepos.join(', ')}
                  </div>
                )}
              </div>
            )) : <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>No major portfolio structure issues found.</p>}
          </div>

        </div>
      </section>

      {/* SECTION 5 & 6: Recommended Improvements & Growth Potential */}
      <section style={{ marginBottom: '4rem', display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
        
        {/* Recommended Actions */}
        <div style={{ flex: '1 1 500px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>🎯 Action Plan</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recs.map((rec: any, i: number) => {
              const pColor = rec.priority === 'Critical' ? '#ef4444' : rec.priority === 'High' ? '#f59e0b' : rec.priority === 'Medium' ? '#3b82f6' : '#9ca3af';
              return (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.25rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <div style={{ width: '4px', height: '100%', background: pColor, borderRadius: '2px', alignSelf: 'stretch' }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: pColor }}>{rec.priority}</span>
                      <span style={{ fontWeight: 600, fontSize: '1rem' }}>{rec.action}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>{rec.rationale}</p>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '100px' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>+{rec.expectedScoreGain} pts</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{rec.estimatedTime} • {rec.difficulty}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Growth Potential */}
        <div style={{ flex: '1 1 400px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>📈 Growth Potential</h2>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800 }}>{growth.currentScore}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Current Score</div>
              </div>
              <div style={{ color: 'var(--color-text-muted)' }}>→</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399' }}>
                  {growth.phases?.length > 0 ? growth.phases[growth.phases.length - 1].projectedScore : growth.currentScore}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Potential Score</div>
              </div>
            </div>

            <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
              {growth.phases?.map((phase: any, i: number) => (
                <div key={i} style={{ marginBottom: i === growth.phases.length - 1 ? 0 : '2rem', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-1.5rem', top: 0, transform: 'translateX(-50%)', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-primary)', border: '2px solid var(--bg-card)' }}></div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Phase {phase.phase} • {phase.estimatedTime}</div>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>{phase.name} <span style={{ color: '#34d399', fontSize: '0.85rem' }}>(+{phase.scoreGain})</span></h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0 0 0.5rem 0' }}>{phase.description}</p>
                  <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.8rem', color: 'var(--color-text-main)' }}>
                    {phase.actions?.map((act: string, j: number) => <li key={j}>{act}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: Recommended Next Projects */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>🚀 Recommended Next Projects</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {wowProjects.length > 0 ? wowProjects.map((proj: any, i: number) => {
            const isWow = proj.difficulty === 'WOW';
            return (
              <div key={i} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', border: isWow ? '1px solid var(--color-primary)' : undefined, background: isWow ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(30, 27, 75, 0.4) 100%)' : undefined }}>
                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                  <span className={`badge ${isWow ? 'badge-primary' : proj.difficulty === 'Advanced' ? 'badge-danger' : proj.difficulty === 'Medium' ? 'badge-warning' : 'badge-success'}`}>{proj.difficulty}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{proj.hiringImpact} Impact</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', color: isWow ? '#a5b4fc' : '#fff' }}>{proj.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem', flex: 1 }}>{proj.description}</p>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Skills Learned</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {proj.skillsLearned?.map((s: string, j: number) => (
                      <span key={j} style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>{s}</span>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-main)', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem' }}>
                  <strong>Resume Impact:</strong> {proj.resumeImpact}
                </div>
              </div>
            );
          }) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
              <p style={{ color: 'var(--color-text-muted)' }}>No projects recommended yet. Reanalyze to generate AI projects.</p>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 2: Repository Analysis */}
      <section style={{ marginBottom: '4rem' }}>
        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>📁 Repository Analysis</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <select className="glass-input" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} value={repoFilter} onChange={e => setRepoFilter(e.target.value)}>
              <option value="all">All Languages</option>
              {allLangs.map((l: string) => <option key={l} value={l}>{l}</option>)}
            </select>
            <select className="glass-input" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} value={repoSort} onChange={e => setRepoSort(e.target.value as any)}>
              <option value="score">Sort by Score</option>
              <option value="stars">Sort by Stars</option>
              <option value="updated">Sort by Updated</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
              <tr>
                <th style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Repository</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Score</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Complexity</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Tech Stack</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Stars</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {displayRepos.map((repo: any) => {
                const score = repo.repositoryScore || repo.complexityScore || 0;
                const scoreColor = score >= 80 ? '#34d399' : score >= 50 ? '#fbbf24' : '#f87171';
                return (
                  <tr key={repo.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem' }}>
                      <a href={repo.url || repo.html_url} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>{repo.name}</a>
                      {repo.description && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{repo.description}</div>}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 800, color: scoreColor }}>{score}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${repo.complexityLevel === 'Advanced' ? 'badge-danger' : repo.complexityLevel === 'Intermediate' ? 'badge-warning' : 'badge-secondary'}`}>
                        {repo.complexityLevel || 'Unknown'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {(repo.detectedTechnologies || []).slice(0, 3).map((t: string, idx: number) => (
                          <span key={idx} style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>{t}</span>
                        ))}
                        {(repo.detectedTechnologies || []).length > 3 && <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>+{repo.detectedTechnologies.length - 3}</span>}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>⭐ {repo.stars || 0}</td>
                    <td style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>{new Date(repo.updatedAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
              {displayRepos.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No repositories match the current filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      
    </div>
  );
};
