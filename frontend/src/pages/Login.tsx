import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginWithEmail, registerWithEmail, getCurrentUserToken } from '../services/firebase';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      try {
        await loginWithEmail(email, password);
      } catch (err: any) {
        // If sign-in fails, check if this is one of our sample users with the correct demo password
        const isSampleUser = (email === 'alex.coder@example.com' || email === 'hr@google.com' || email === 'rakshakpatel2005@gmail.com') && password === 'password123';
        const isNotFoundError = err.code === 'auth/user-not-found' || 
                              err.code === 'auth/invalid-credential' || 
                              err.message?.includes('not-found') || 
                              err.message?.includes('credential') ||
                              err.message?.includes('invalid-credential');

        if (isSampleUser && isNotFoundError) {
          console.log('[Firebase] Pre-creating sample user in Firebase Auth...');
          // Register the sample user in Firebase
          await registerWithEmail(email, password);
          
          const fbToken = await getCurrentUserToken();
          if (fbToken) {
            const role = (email === 'alex.coder@example.com' || email === 'rakshakpatel2005@gmail.com') ? 'student' : 'recruiter';
            const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const regResponse = await fetch(`${backendUrl}/api/auth/register`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${fbToken}`
              },
              body: JSON.stringify({ role })
            });
            
            if (!regResponse.ok) {
              const regErr = await regResponse.json();
              // Ignore "already exists" error in database, because the mock data is pre-seeded in PostgreSQL.
              if (regErr.error && !regErr.error.includes('already exists')) {
                throw new Error(regErr.error || 'Failed to sync sample user on the fly.');
              }
            }
          }
        } else {
          throw err;
        }
      }
      
      const fbToken = await getCurrentUserToken();
      if (!fbToken) throw new Error('Failed to retrieve authentication token');

      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/auth/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${fbToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to synchronize with server.');
      }

      const syncResult = await response.json();
      login(fbToken, syncResult.user);

      if (syncResult.user.role === 'recruiter') {
        navigate('/recruiter-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="container flex-center" 
      style={{ minHeight: 'calc(100vh - 100px)', flexDirection: 'column' }}
    >
      <div 
        className="glass-card animate-slide-up" 
        style={{ width: '100%', maxWidth: '680px', padding: '2.5rem' }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontWeight: 800 }}>Welcome Back</h2>
        
        {error && (
          <div 
            className="badge badge-danger" 
            style={{ width: '100%', display: 'block', textAlign: 'center', padding: '0.75rem', marginBottom: '1rem', textTransform: 'none' }}
          >
            {error}
          </div>
        )}

        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '1.2fr 1fr', 
            gap: '2rem', 
            alignItems: 'start' 
          }}
          className="grid-responsive-2"
        >
          {/* Left Column: Sign In Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="email">Email Address</label>
              <input 
                id="email"
                type="email" 
                className="glass-input" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <label htmlFor="password">Password</label>
              <input 
                id="password"
                type="password" 
                className="glass-input" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.85rem', marginBottom: '1rem' }}
              disabled={submitting}
            >
              {submitting ? 'Authenticating...' : 'Sign In'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.9rem', margin: 0 }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ fontWeight: 600 }}>Create account</Link>
            </p>
          </form>

          {/* Right Column: Demo Accounts Quick Sign In */}
          <div 
            style={{ 
              borderLeft: '1px solid var(--border-subcard)', 
              paddingLeft: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              height: '100%',
              justifyContent: 'center'
            }}
            className="login-sidebar-responsive"
          >
            <span style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
              ⚡ Quick Demo Sign In
            </span>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
              Click any profile below to instantly log in with pre-seeded sandbox accounts.
            </p>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setEmail('alex.coder@example.com');
                setPassword('password123');
                setTimeout(() => {
                  const form = document.querySelector('form');
                  if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }, 100);
              }}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'flex-start',
                padding: '0.85rem',
                borderRadius: '8px',
                textAlign: 'left',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subcard)',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary)' }}>Alex Rivera (Student)</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>alex.coder@example.com</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setEmail('rakshakpatel2005@gmail.com');
                setPassword('password123');
                setTimeout(() => {
                  const form = document.querySelector('form');
                  if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }, 100);
              }}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'flex-start',
                padding: '0.85rem',
                borderRadius: '8px',
                textAlign: 'left',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subcard)',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary)' }}>Rakshak Patel (User 1)</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>rakshakpatel2005@gmail.com</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setEmail('hr@google.com');
                setPassword('password123');
                setTimeout(() => {
                  const form = document.querySelector('form');
                  if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }, 100);
              }}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'flex-start',
                padding: '0.85rem',
                borderRadius: '8px',
                textAlign: 'left',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subcard)',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-secondary)' }}>Jane Recruiter (HR / Google)</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>hr@google.com</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
