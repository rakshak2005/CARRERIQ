import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Search, Bell, ChevronDown, Upload, GitBranch, Plus, FileText } from 'lucide-react';
import logoImg from '../assets/logo.png';
import { motion, AnimatePresence } from 'framer-motion';

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Hide the global dashboard header on the landing page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <header className="sticky top-0 z-50" style={{ background: 'rgba(5, 8, 22, 0.8)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Left: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src={logoImg} alt="CareerIQ Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          <span style={{ fontWeight: 700, fontSize: '1.2rem', background: 'linear-gradient(90deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CareerIQ</span>
        </div>

        {/* Center: Universal Search */}
        {isAuthenticated && user && user.role !== 'recruiter' && (
          <div style={{ flex: 1, maxWidth: '500px', margin: '0 2rem' }}>
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
        )}

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          {/* Notifications */}
          <button style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%' }}>
            <Bell size={20} />
            <span style={{ position: 'absolute', top: '6px', right: '8px', width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%', border: '2px solid #050816' }}></span>
          </button>



          {isAuthenticated && user && (
            <>
              {/* Quick Actions Dropdown */}
              <div style={{ position: 'relative' }}>
                <button 
                  className="btn btn-primary"
                  style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', borderRadius: '8px' }}
                  onClick={() => setShowQuickActions(!showQuickActions)}
                >
                  Quick Actions <ChevronDown size={14} style={{ marginLeft: '4px' }} />
                </button>
                <AnimatePresence>
                  {showQuickActions && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: '220px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
                    >
                      <div className="quick-action-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', color: '#e2e8f0', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '6px' }}>
                        <Upload size={16} color="#3b82f6" /> Upload Resume
                      </div>
                      <div className="quick-action-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', color: '#e2e8f0', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '6px' }}>
                        <GitBranch size={16} color="#10b981" /> Reanalyze GitHub
                      </div>
                      <div className="quick-action-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', color: '#e2e8f0', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '6px' }}>
                        <Plus size={16} color="#f59e0b" /> Add Project
                      </div>
                      <div className="quick-action-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', color: '#e2e8f0', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '6px' }}>
                        <Plus size={16} color="#f59e0b" /> Add Certificate
                      </div>
                      <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }}></div>
                      <div className="quick-action-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', color: '#e2e8f0', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '6px' }}>
                        <FileText size={16} color="#8b5cf6" /> Export Report
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

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
      `}</style>
    </header>
  );
};
export default Header;

