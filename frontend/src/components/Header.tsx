import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logoImg from '../assets/logo.png';

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Hide the global dashboard header on the landing page
  if (location.pathname === '/') {
    return null;
  }


  return (
    <header 
      className="sticky top-0 z-50 nav-transition nav-glass nav-gradient-border border-b h-12 flex items-center"
      style={{
        padding: '0 2rem',
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        {/* Branding Logo */}
        <div 
          className="flex items-center gap-4 cursor-pointer transition-transform duration-300 hover:scale-[1.02] active:scale-95"
          onClick={() => navigate('/')}
        >
          <img 
            src={logoImg} 
            alt="CareerIQ Logo" 
            className="w-[32px] h-[32px] object-contain rounded-lg logo-glow"
          />
        </div>

        {/* Right side container */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          
          {/* Theme Switcher Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-sm flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-300"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>

          {/* Auth details & Actions */}
          {isAuthenticated && user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  fontSize: '0.85rem'
                }}
              >
                <span style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>{user.email}</span>
                <span 
                  className={`badge ${user.role === 'recruiter' ? 'badge-secondary' : 'badge-primary'}`}
                  style={{ fontSize: '0.65rem', marginTop: '2px', fontWeight: 700 }}
                >
                  {user.role}
                </span>
              </div>
              
              <button 
                className="btn-ghost-premium active:scale-95" 
                onClick={logout}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
export default Header;

