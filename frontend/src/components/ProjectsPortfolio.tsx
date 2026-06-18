import React, { useState } from 'react';
import { api } from '../services/api';

interface ProjectsPortfolioProps {
  portfolioProjects: any[];
  portfolioScore: number;
  portfolioInsights: any;
  portfolioRecommendations: any[];
  onSyncComplete: (data: any) => void;
  onAddProject: () => void;
}

export const ProjectsPortfolio: React.FC<ProjectsPortfolioProps> = ({
  portfolioProjects,
  portfolioScore,
  portfolioInsights,
  portfolioRecommendations,
  onSyncComplete,
  onAddProject
}) => {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async (forceRegenerate: boolean = false) => {
    setSyncing(true);
    try {
      const res = await api.student.syncPortfolio(forceRegenerate);
      onSyncComplete(res);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error syncing portfolio');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Sync */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.2) 0%, rgba(15, 23, 42, 0.4) 100%)', borderColor: 'rgba(59, 130, 246, 0.2)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'rgba(59, 130, 246, 0.1)', filter: 'blur(50px)', borderRadius: '50%', pointerEvents: 'none' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', zIndex: 1, position: 'relative' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>Project Intelligence Portfolio</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, maxWidth: '600px' }}>
              A unified view of your manual and resume-extracted projects. Ranked, evaluated, and scored for role relevance and complexity.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Portfolio Score</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#60a5fa', lineHeight: 1 }}>
                {portfolioScore || 0}
                <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>/100</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button onClick={onAddProject} className="btn-cta-premium" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                + Add Manual Project
              </button>
              <button onClick={() => handleSync(true)} disabled={syncing} className="btn-ghost-premium" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                {syncing ? 'Regenerating...' : 'Regenerate AI Ideas'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Insights & Gap Analysis */}
      {portfolioInsights && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div className="glass-card">
              <h3 style={{ fontSize: '0.9rem', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🏆</span> Best Project
              </h3>
              {portfolioInsights.strongestProject ? (
                <div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{portfolioInsights.strongestProject.title}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{portfolioInsights.strongestProject.description}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ padding: '0.25rem 0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', fontSize: '0.75rem', borderRadius: '6px' }}>Score: {portfolioInsights.strongestProject.projectScore}</span>
                    <span style={{ padding: '0.25rem 0.5rem', background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', fontSize: '0.75rem', borderRadius: '6px' }}>{portfolioInsights.strongestProject.projectType}</span>
                  </div>
                </div>
              ) : (
                <p style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>No projects evaluated yet.</p>
              )}
            </div>

            <div className="glass-card">
              <h3 style={{ fontSize: '0.9rem', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>📊</span> Resume Project Ordering
              </h3>
              {portfolioInsights.bestResumeProjectOrder && portfolioInsights.bestResumeProjectOrder.length > 0 ? (
                <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {portfolioInsights.bestResumeProjectOrder.map((title: string, i: number) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>{i + 1}</span>
                      <span style={{ color: '#e2e8f0', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>No projects evaluated yet.</p>
              )}
            </div>

            <div className="glass-card" style={{ borderColor: 'rgba(244, 63, 94, 0.2)', background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.05) 0%, rgba(15, 23, 42, 0.4) 100%)' }}>
              <h3 style={{ fontSize: '0.9rem', color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>⚠️</span> Gap Analysis
              </h3>
              {portfolioInsights.missingConcepts && portfolioInsights.missingConcepts.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>Missing Technical Concepts</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {portfolioInsights.missingConcepts.slice(0, 4).map((c: string, i: number) => (
                      <span key={i} style={{ padding: '0.25rem 0.5rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)', color: '#fb7185', fontSize: '0.75rem', borderRadius: '6px' }}>{c}</span>
                    ))}
                  </div>
                </div>
              )}
              {portfolioInsights.missingTechnologies && portfolioInsights.missingTechnologies.length > 0 ? (
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>Missing Target Role Keywords</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {portfolioInsights.missingTechnologies.map((t: string, i: number) => (
                      <span key={i} style={{ padding: '0.25rem 0.5rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontSize: '0.75rem', borderRadius: '6px' }}>{t}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>Portfolio looks well-rounded for the target role.</p>
              )}
            </div>
          </div>

          {/* Portfolio Coverage Visualization */}
          <div className="glass-card">
            <h3 style={{ fontSize: '0.9rem', color: '#e2e8f0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>📈</span> Portfolio Coverage
            </h3>
            {portfolioInsights.projectTypeCoverage && Object.keys(portfolioInsights.projectTypeCoverage).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', height: '12px', width: '100%', borderRadius: '6px', overflow: 'hidden', background: 'rgba(0,0,0,0.3)' }}>
                  {Object.entries(portfolioInsights.projectTypeCoverage).map(([type, count]: [string, any], idx: number) => {
                    const colors = ['#3b82f6', '#a855f7', '#10b981', '#ec4899', '#f97316'];
                    const total = Object.values(portfolioInsights.projectTypeCoverage).reduce((a: any, b: any) => a + b, 0) as number;
                    const width = `${(count / total) * 100}%`;
                    return <div key={idx} style={{ width, background: colors[idx % colors.length] }} title={`${type}: ${count}`} />
                  })}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', fontWeight: 500 }}>
                  {Object.entries(portfolioInsights.projectTypeCoverage).map(([type, count]: [string, any], idx: number) => {
                    const textColors = ['#60a5fa', '#c084fc', '#34d399', '#f472b6', '#fb923c'];
                    const bgColors = ['rgba(59, 130, 246, 0.1)', 'rgba(168, 85, 247, 0.1)', 'rgba(16, 185, 129, 0.1)', 'rgba(236, 72, 153, 0.1)', 'rgba(249, 115, 22, 0.1)'];
                    const colors = ['#3b82f6', '#a855f7', '#10b981', '#ec4899', '#f97316'];
                    const total = Object.values(portfolioInsights.projectTypeCoverage).reduce((a: any, b: any) => a + b, 0) as number;
                    return (
                      <div key={idx} style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', background: bgColors[idx % bgColors.length], border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors[idx % colors.length] }} />
                        <span style={{ color: textColors[idx % textColors.length] }}>{type}</span>
                        <span style={{ color: '#94a3b8', fontWeight: 700, marginLeft: '4px' }}>{Math.round((count / total) * 100)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>No coverage data available.</p>
            )}
          </div>
        </>
      )}

      {/* Ranked Projects List */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>Ranked Portfolio Projects</h3>
        </div>
        <div>
          {(!portfolioProjects || portfolioProjects.length === 0) ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontStyle: 'italic', fontSize: '0.9rem' }}>No projects found. Sync portfolio to evaluate existing projects.</div>
          ) : (
            [...portfolioProjects]
              .sort((a, b) => (b.projectScore || 0) - (a.projectScore || 0))
              .map((p, idx) => (
                <div key={idx} style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'background 0.2s', background: 'transparent' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1.5rem' }}>
                    <div style={{ flex: '1 1 300px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, border: '1px solid rgba(255,255,255,0.1)' }}>
                          #{idx + 1}
                        </span>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>{p.title}</h4>
                        {p.source === 'resume' && (
                          <span style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', color: '#818cf8', fontSize: '0.7rem', fontWeight: 600 }}>Extracted from Resume</span>
                        )}
                      </div>
                      <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {p.technologies?.slice(0, 8).map((tech: string, i: number) => (
                          <span key={i} style={{ padding: '0.25rem 0.6rem', background: 'rgba(0,0,0,0.3)', color: '#cbd5e1', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>{tech}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(80px, 1fr))', gap: '0.75rem', flex: '1 1 300px' }}>
                      <div style={{ background: 'rgba(0,0,0,0.15)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Complexity</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#60a5fa' }}>{p.complexityScore || 0}<span style={{ fontSize: '0.7rem', color: '#475569' }}>/40</span></div>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.15)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Tech Score</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399' }}>{p.technologyScore || 0}<span style={{ fontSize: '0.7rem', color: '#475569' }}>/20</span></div>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.15)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Role Match</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#c084fc' }}>{p.roleRelevanceScore || 0}<span style={{ fontSize: '0.7rem', color: '#475569' }}>/25</span></div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 600 }}>Total</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{p.projectScore || 0}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* AI WOW Project Recommendations */}
      {portfolioRecommendations && portfolioRecommendations.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: 0 }}>AI Recommended Next Projects</h3>
            <span style={{ padding: '0.25rem 0.75rem', background: 'linear-gradient(90deg, rgba(236, 72, 153, 0.2), rgba(168, 85, 247, 0.2))', color: '#f472b6', fontSize: '0.75rem', fontWeight: 700, borderRadius: '20px', border: '1px solid rgba(236, 72, 153, 0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Portfolio Builders
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
            {portfolioRecommendations.map((rec: any, idx: number) => {
              const isWow = rec.difficulty === 'WOW';
              return (
                <div key={idx} className="glass-card" style={{ position: 'relative', borderColor: isWow ? 'rgba(236, 72, 153, 0.5)' : 'rgba(255,255,255,0.05)', transform: 'translateY(0)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  {isWow && (
                    <div style={{ position: 'absolute', top: 0, right: 0, padding: '0.35rem 1rem', background: '#ec4899', color: '#fff', fontSize: '0.7rem', fontWeight: 800, borderBottomLeftRadius: '16px', borderTopRightRadius: '24px', textTransform: 'uppercase', letterSpacing: '0.1em', boxShadow: '0 0 15px rgba(236,72,153,0.5)' }}>
                      WOW Project
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <span style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', ...(isWow ? { background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6' } : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }) }}>
                      {rec.difficulty}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: isWow ? '#f472b6' : '#f8fafc' }}>
                    {rec.title}
                  </h4>

                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                    {rec.description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.5rem' }}>Skills Learned</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {rec.skillsLearned?.map((skill: string, i: number) => (
                          <span key={i} style={{ padding: '0.25rem 0.6rem', background: 'rgba(0,0,0,0.2)', color: '#cbd5e1', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>{skill}</span>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <span style={{ color: '#60a5fa', marginTop: '2px' }}>📄</span>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Resume Impact</div>
                          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.25rem' }}>{rec.resumeImpact}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <span style={{ color: '#34d399', marginTop: '2px' }}>💼</span>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Hiring Impact</div>
                          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.25rem' }}>{rec.hiringImpact}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
