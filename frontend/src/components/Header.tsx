import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Search, Bell } from 'lucide-react';
import logoImg from '../assets/logo.png';
import { motion, AnimatePresence } from 'framer-motion';

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDashboard = location.pathname === '/student-dashboard';

  // Hide the global dashboard header on the landing page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <header
      className="sticky top-0 z-50"
      style={isMobile ? {
        position: 'fixed',
        top: '10px',
        left: '10px',
        right: '10px',
        width: 'calc(100% - 20px)',
        height: '48px',
        zIndex: 1000,
        background: 'rgba(10, 15, 30, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      } : {
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'rgba(5, 8, 22, 0.8)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <div className="header-container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Left: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src={logoImg} alt="CareerIQ Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          <span className="header-title" style={{ fontWeight: 700, fontSize: '1.2rem', background: 'linear-gradient(90deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CareerIQ</span>
        </div>

        {/* Center: Universal Search & Mobile Navigation */}
        {isAuthenticated && user && user.role !== 'recruiter' && (
          <>
            <div className="header-search" style={{ flex: 1, maxWidth: '500px', margin: '0 2rem' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} size={18} />
                <input
                  type="text"
                  placeholder="Search projects, skills, recommendations..."
                  style={{
                    width: '100%',
                    padding: '0.5rem 1rem 0.5rem 2.5rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.borderColor = '#3b82f6'; }}
                  onBlur={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.05)'; e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}
                />
                <div style={{ position: 'absolute', right: '12px', display: 'flex', gap: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>Ctrl</span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>K</span>
                </div>
              </div>
            </div>

            {isDashboard && (
              <div className="mobile-section-nav" style={{ display: 'none', margin: '0 0.5rem' }}>
                <select
                  onChange={(e) => {
                    const targetId = e.target.value;
                    if (targetId) {
                      const element = document.getElementById(targetId);
                      if (element) {
                        // Offset for sticky header (typically 90px)
                        const offset = 90;
                        const bodyRect = document.body.getBoundingClientRect().top;
                        const elementRect = element.getBoundingClientRect().top;
                        const elementPosition = elementRect - bodyRect;
                        const offsetPosition = elementPosition - offset;

                        window.scrollTo({
                          top: offsetPosition,
                          behavior: 'smooth'
                        });
                      }
                    }
                  }}
                  style={{
                    background: 'rgba(59, 130, 246, 0.12)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    color: '#60a5fa',
                    fontSize: '0.8rem',
                    padding: '0.35rem 0.6rem',
                    outline: 'none',
                    cursor: 'pointer',
                    fontWeight: 700,
                    maxWidth: '130px'
                  }}
                >
                  <option value="" style={{ background: '#0f172a', color: '#94a3b8' }}>Jump to Section</option>
                  <option value="dashboard" style={{ background: '#0f172a', color: '#fff' }}>Dashboard</option>
                  <option value="readiness" style={{ background: '#0f172a', color: '#fff' }}>Readiness Score</option>
                  <option value="github" style={{ background: '#0f172a', color: '#fff' }}>GitHub Analysis</option>
                  <option value="resume" style={{ background: '#0f172a', color: '#fff' }}>Resume Analysis</option>
                  <option value="projects" style={{ background: '#0f172a', color: '#fff' }}>Portfolio Projects</option>
                  <option value="project-recommendations" style={{ background: '#0f172a', color: '#fff' }}>AI Project Ideas</option>
                  <option value="certificates" style={{ background: '#0f172a', color: '#fff' }}>Certificates</option>
                  <option value="career-match" style={{ background: '#0f172a', color: '#fff' }}>Career Match</option>
                  <option value="roadmap" style={{ background: '#0f172a', color: '#fff' }}>AI Roadmap</option>
                </select>
              </div>
            )}
          </>
        )}

        {/* Right: Actions */}
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

          {/* Notifications */}
          <button className="header-bell" style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%' }}>
            <Bell size={20} />
            <span style={{ position: 'absolute', top: '6px', right: '8px', width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%', border: '2px solid #050816' }}></span>
          </button>

          {isAuthenticated && user && (
            <>
              {/* Quick Actions Dropdown */}
              {/* Replay Guide Tour Button */}
              {!isMobile && (
                <button
                  className="btn btn-primary"
                  style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  onClick={() => window.dispatchEvent(new Event('start-tour'))}
                >
                  Replay Guide Tour 🎯
                </button>
              )}

              {/* User Avatar Dropdown */}
              <div style={{ position: 'relative' }}>
                <div
                  style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, cursor: 'pointer', border: '2px solid rgba(255,255,255,0.1)' }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: '200px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
                    >
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem', wordBreak: 'break-all' }}>{user.email}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'capitalize' }}>{user.role} Account</div>
                      </div>
                      <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem -1rem 0.5rem -1rem' }}></div>
                      <button
                        style={{ width: '100%', background: 'transparent', border: 'none', color: '#3b82f6', textAlign: 'left', padding: '0.5rem 0', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}
                        onClick={() => {
                          setShowUserMenu(false);
                          if (user.role === 'admin') navigate('/admin-dashboard');
                          else if (user.role === 'recruiter') navigate('/recruiter-dashboard');
                          else navigate('/student-dashboard');
                        }}
                      >
                        Go to Dashboard
                      </button>
                      <button
                        style={{ width: '100%', background: 'transparent', border: 'none', color: '#60a5fa', textAlign: 'left', padding: '0.5rem 0', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}
                        onClick={() => {
                          setShowUserMenu(false);
                          window.dispatchEvent(new Event('start-tour'));
                        }}
                      >
                        Replay Guide Tour 🎯
                      </button>
                      <button
                        style={{ width: '100%', background: 'transparent', border: 'none', color: '#ef4444', textAlign: 'left', padding: '0.5rem 0', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}
                        onClick={logout}
                      >
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </div>
      <style>{`
        .quick-action-item:hover {
          background: rgba(255,255,255,0.05);
        }
        @media (max-width: 900px) {
          .mobile-section-nav {
            display: block !important;
          }
          .header-search {
            display: none !important;
          }
          .header-container {
            padding: 0.25rem 0.75rem !important;
            height: 100% !important;
          }
          .header-title {
            font-size: 0.95rem !important;
          }
          .btn.btn-primary {
            padding: 0.25rem 0.65rem !important;
            font-size: 0.7rem !important;
          }
        }
      `}</style>
    </header>
  );
};
export default Header;

