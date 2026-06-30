import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Trophy, Search, Award, Star, ArrowLeft, ArrowUpRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CandidateProfile {
  id: string;
  fullName: string;
  targetRole: string;
  overallScore: number;
  githubScore: number;
  resumeScore: number;
  techStacks: string[];
  githubUsername: string;
}

export const Leaderboard: React.FC = () => {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await api.auth.getLeaderboard();
        setCandidates(data);
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const filteredCandidates = candidates.filter(cand => {
    const nameMatch = cand.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      cand.targetRole.toLowerCase().includes(searchQuery.toLowerCase());
    const roleMatch = !roleFilter || cand.targetRole === roleFilter;
    return nameMatch && roleMatch;
  });

  // Unique roles for filter dropdown
  const roles = Array.from(new Set(candidates.map(c => c.targetRole))).filter(Boolean);

  // Top 3 Toppers
  const topThree = filteredCandidates.slice(0, 3);

  // Podium order: Silver (2nd), Gold (1st), Bronze (3rd)
  const podiumOrder = [
    { rank: 2, cand: topThree[1], color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', shadow: 'rgba(148, 163, 184, 0.2)' },
    { rank: 1, cand: topThree[0], color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', shadow: 'rgba(245, 158, 11, 0.3)' },
    { rank: 3, cand: topThree[2], color: '#b45309', bg: 'rgba(180, 83, 9, 0.1)', shadow: 'rgba(180, 83, 9, 0.2)' },
  ].filter(p => p.cand !== undefined);

  return (
    <div className="leaderboard-root" style={{ padding: '4.2rem 1.5rem 1rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <style>{`
        /* Mobile responsive styles */
        .leaderboard-root {
          box-sizing: border-box;
        }
        @media (max-width: 768px) {
          .leaderboard-root {
            padding: 4.5rem 1rem 1rem !important;
          }
          .leaderboard-title {
            font-size: 1.8rem !important;
          }
          .leaderboard-subtitle {
            font-size: 0.85rem !important;
          }
          .podium-container {
            justify-content: center !important;
            padding: 0.5rem 0 !important;
            flex-wrap: nowrap !important;
            width: 100% !important;
            gap: 0 !important;
            margin-bottom: 1.5rem !important;
            overflow: hidden !important;
          }
          .podium-card-rank-2, .podium-card-rank-3 {
            display: none !important;
          }
          .podium-card {
            width: 270px !important;
            min-height: 280px !important;
          }
          .leaderboard-header-row {
            display: none !important;
          }
          .leaderboard-row {
            grid-template-columns: 45px 1fr 60px !important;
            padding: 1rem !important;
            gap: 0.5rem !important;
          }
          .leaderboard-desktop-col {
            display: none !important;
          }
          .leaderboard-mobile-info {
            display: block !important;
          }
        }
        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }
      `}</style>

      <button
        onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '0.5rem', padding: 0 }}
      >
        <ArrowLeft size={14} /> Back to Dashboard
      </button>

      {/* Header and Title */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem', position: 'relative' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.35rem 0.85rem', borderRadius: '30px', color: '#fbbf24', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          <Sparkles size={12} /> Live Leaderboard
        </div>
        <h1 className="leaderboard-title" style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0 0 0.25rem', background: 'linear-gradient(135deg, #fff 30%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          CareerIQ Topper Lists
        </h1>
        <p className="leaderboard-subtitle" style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '600px', margin: '0.25rem auto 0', lineHeight: 1.4 }}>
          Top verified engineering profiles ranked objectively by their combined portfolio, resume, and repository evaluation metrics.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.05)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>Gathering candidate metrics...</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium layout */}
          {podiumOrder.length > 0 && searchQuery === '' && (
            <div className="podium-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '2.5rem', padding: '0.5rem 0' }}>
              {podiumOrder.map(({ rank, cand, color, bg, shadow }) => (
                <div
                  key={cand.id}
                  className={`glass-card podium-card podium-card-rank-${rank} animate-slide-up`}
                  style={{
                    width: rank === 1 ? '270px' : '245px',
                    minHeight: rank === 1 ? '280px' : '250px',
                    borderColor: rank === 1 ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255,255,255,0.05)',
                    background: `linear-gradient(145deg, ${bg} 0%, rgba(10, 14, 26, 0.8) 100%)`,
                    boxShadow: `0 15px 30px rgba(0, 0, 0, 0.8), 0 0 20px ${shadow}`,
                    padding: '1.25rem 1rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: rank === 1 ? '60px' : '52px', height: rank === 1 ? '60px' : '52px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: rank === 1 ? '1.5rem' : '1.2rem', fontWeight: 800 }}>
                        {cand.fullName.substring(0, 2).toUpperCase()}
                      </div>
                      <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '24px', height: '24px', borderRadius: '50%', background: color, border: '2px solid #0d0f14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.75rem' }}>
                        #{rank}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 style={{ fontSize: rank === 1 ? '1.3rem' : '1.15rem', fontWeight: 800, color: '#fff', margin: '0 0 0.25rem' }}>{cand.fullName}</h2>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{cand.targetRole}</span>
                  </div>

                  <div style={{ margin: '0.75rem 0' }}>
                    <div style={{ fontSize: rank === 1 ? '2.25rem' : '1.75rem', fontWeight: 800, color: rank === 1 ? '#fbbf24' : '#fff' }}>
                      {cand.overallScore}
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>/100</span>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Readiness Index</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{cand.githubScore}</div>
                      <div>Git Score</div>
                    </div>
                    <div style={{ width: '1px', background: 'rgba(255,255,255,0.05)' }} />
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{cand.resumeScore}</div>
                      <div>Resume</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Scroll Down Indicator */}
          {podiumOrder.length > 0 && searchQuery === '' && (
            <div
              onClick={() => document.getElementById('search-filter-section')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', color: '#64748b', cursor: 'pointer', margin: '-1rem auto 1.5rem', width: 'fit-content', transition: 'color 0.2s', zIndex: 10, position: 'relative' }}
              onMouseEnter={e => e.currentTarget.style.color = '#38bdf8'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Scroll down to view all candidates</span>
              <div style={{ fontSize: '1rem', animation: 'bounce-arrow 1.5s infinite ease-in-out' }}>↓</div>
              <style>{`
                @keyframes bounce-arrow {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(4px); }
                }
              `}</style>
            </div>
          )}

          {/* Search and Filters */}
          <div id="search-filter-section" className="glass-card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', padding: '1.25rem', marginBottom: '2rem' }}>
            <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Search candidates by name or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem' }}
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ padding: '0.75rem 1.25rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem', cursor: 'pointer', minWidth: '180px' }}
            >
              <option value="">All Tech Roles</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* List display */}
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="leaderboard-header-row" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: '80px 1.5fr 1fr 1fr 1fr 100px', gap: '1rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
              <span>Rank</span>
              <span>Candidate Name</span>
              <span>Target Role</span>
              <span style={{ textAlign: 'center' }}>GitHub Score</span>
              <span style={{ textAlign: 'center' }}>Resume Score</span>
              <span style={{ textAlign: 'right' }}>Overall Index</span>
            </div>

            {filteredCandidates.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
                No candidate matches found matching your filters.
              </div>
            ) : (
              filteredCandidates.map((cand, index) => {
                const isTop3 = index < 3 && searchQuery === '';
                const rankColor = index === 0 ? '#f59e0b' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : '#64748b';

                return (
                  <div
                    key={cand.id}
                    className="leaderboard-row"
                    style={{
                      padding: '1.25rem 1.5rem',
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                      display: 'grid',
                      gridTemplateColumns: '80px 1.5fr 1fr 1fr 1fr 100px',
                      gap: '1rem',
                      alignItems: 'center',
                      background: isTop3 ? 'rgba(255,255,255,0.01)' : 'transparent',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = isTop3 ? 'rgba(255,255,255,0.01)' : 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: isTop3 ? rankColor : 'rgba(255,255,255,0.02)',
                        border: isTop3 ? 'none' : '1px solid rgba(255,255,255,0.05)',
                        color: isTop3 ? '#fff' : '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem',
                        fontWeight: 700
                      }}>
                        {index + 1}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>{cand.fullName}</div>
                        
                        {/* Mobile Details block - hidden on desktop, visible on mobile */}
                        <div className="leaderboard-mobile-info" style={{ display: 'none', color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.25rem', lineHeight: 1.3 }}>
                          <span style={{ display: 'block', marginBottom: '0.15rem', color: '#38bdf8', fontWeight: 500 }}>{cand.targetRole}</span>
                          Git Score: <strong style={{ color: '#e2e8f0' }}>{cand.githubScore}</strong> • Resume: <strong style={{ color: '#e2e8f0' }}>{cand.resumeScore}</strong>
                        </div>

                        <div className="leaderboard-desktop-col" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                          {cand.techStacks?.slice(0, 4).map((tech, i) => (
                            <span key={i} style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.03)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.05)' }}>{tech}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="leaderboard-desktop-col" style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>{cand.targetRole}</div>

                    <div className="leaderboard-desktop-col" style={{ textAlign: 'center', color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>{cand.githubScore}/100</div>
                    <div className="leaderboard-desktop-col" style={{ textAlign: 'center', color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>{cand.resumeScore}/100</div>

                    <div style={{ textAlign: 'right', fontWeight: 800, color: '#38bdf8', fontSize: '1.1rem' }}>
                      {cand.overallScore}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};
