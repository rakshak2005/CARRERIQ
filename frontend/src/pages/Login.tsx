import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loginWithEmail, registerWithEmail, getCurrentUserToken, loginWithGoogle, resetPassword } from '../services/firebase';

// Hardcoded dark styles — prevents white-input flash on Vercel production
const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  fontSize: '0.9rem',
  borderRadius: '12px',
  background: 'rgba(15, 23, 42, 0.6)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  color: '#ffffff',
  WebkitTextFillColor: '#ffffff',
  outline: 'none',
  transition: 'all 0.3s',
};

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
        const isSampleUser = (email === 'alex.coder@example.com' || email === 'hr@google.com' || email === 'rakshakpatel2005@gmail.com' || email === 'admin@careeriq.com') && password === 'password123';
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
            let role = 'student';
            if (email === 'hr@google.com') role = 'recruiter';
            else if (email === 'admin@careeriq.com') role = 'admin';

            const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const regResponse = await fetch(`${backendUrl}/api/auth/register`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${fbToken}`
              },
              body: JSON.stringify({ role, fullName: email === 'admin@careeriq.com' ? 'System Admin' : undefined })
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
      let response = await fetch(`${backendUrl}/api/auth/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${fbToken}`
        }
      });

      if (response.status === 404 && (email === 'alex.coder@example.com' || email === 'hr@google.com' || email === 'rakshakpatel2005@gmail.com' || email === 'admin@careeriq.com')) {
        console.log('[Firebase] Auto-syncing sample user database record...');
        let role = 'student';
        if (email === 'hr@google.com') role = 'recruiter';
        else if (email === 'admin@careeriq.com') role = 'admin';

        const regResponse = await fetch(`${backendUrl}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${fbToken}`
          },
          body: JSON.stringify({
            role,
            fullName: email === 'admin@careeriq.com' ? 'System Admin' : email === 'rakshakpatel2005@gmail.com' ? 'Rakshak Patel' : 'Alex Rivera'
          })
        });

        if (regResponse.ok) {
          response = await fetch(`${backendUrl}/api/auth/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${fbToken}`
            }
          });
        }
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to synchronize with server.');
      }

      const syncResult = await response.json();
      login(fbToken, syncResult.user);

      if (syncResult.user.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (syncResult.user.role === 'recruiter') {
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

  const handleGoogleLogin = async () => {
    setError('');
    setSubmitting(true);
    try {
      await loginWithGoogle();
      const fbToken = await getCurrentUserToken();
      if (!fbToken) throw new Error('Failed to retrieve authentication token');

      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      // Attempt syncing. If new Google user, database creates them as a student profile by default.
      let response = await fetch(`${backendUrl}/api/auth/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${fbToken}`
        }
      });

      if (response.status === 404) {
        throw new Error('This Gmail account is not registered. Please sign up first using the Create account link.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to synchronize Google login with server.');
      }

      const syncResult = await response.json();
      login(fbToken, syncResult.user);

      if (syncResult.user.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (syncResult.user.role === 'recruiter') {
        navigate('/recruiter-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first to reset your password.');
      return;
    }
    setError('');
    try {
      await resetPassword(email);
      alert('Password reset link sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
    }
  }; return (
    <div
      className="container flex-center"
      style={{ minHeight: '100vh', flexDirection: 'column', overflow: 'hidden', padding: '1rem', background: '#050816', position: 'relative' }}
    >
      {/* Back to Home Button */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '2rem',
          left: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'transparent',
          border: 'none',
          color: '#94a3b8',
          fontSize: '0.85rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.3s',
          zIndex: 100
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
      >
        <ArrowLeft size={16} />
        Back to Home
      </button>

      <div
        className="glass-card animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '1.5rem 2rem',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(22, 23, 27, 0.85)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <img src={logoImg} alt="CareerIQ Logo" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0 0 0.15rem 0', color: '#fff', fontFamily: 'Outfit' }}>Welcome Back</h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Sign in to access your CareerIQ workspace</p>
        </div>

        {error && (
          <div
            className="badge badge-danger"
            style={{ width: '100%', display: 'block', textAlign: 'center', padding: '0.5rem', marginBottom: '1rem', textTransform: 'none', borderRadius: '6px', fontSize: '0.8rem' }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <label htmlFor="email" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
            <input
              id="email"
              type="email"
              className="glass-input"
              placeholder="your.personal@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ ...INPUT_STYLE, borderRadius: '8px', padding: '0.65rem 0.85rem' }}
              required
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label htmlFor="password" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
              <button
                type="button"
                onClick={handleForgotPassword}
                style={{ background: 'none', border: 'none', color: '#4b61eb', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                Forgot Password?
              </button>
            </div>
            <input
              id="password"
              type="password"
              className="glass-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ ...INPUT_STYLE, borderRadius: '8px', padding: '0.65rem 0.85rem' }}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.7rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              background: '#4b61eb',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(75, 97, 235, 0.2)',
              transition: 'all 0.3s',
              marginTop: '0.25rem'
            }}
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }}></div>
            <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }}></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="btn"
            style={{
              width: '100%',
              padding: '0.7rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s'
            }}
            disabled={submitting}
          >
            <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.89 3.02C6.22 7.73 8.89 5.04 12 5.04z" />
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2.01 3.7-4.99 3.7-8.62z" />
              <path fill="#FBBC05" d="M5.28 14.78c-.23-.69-.36-1.43-.36-2.2s.13-1.51.36-2.2L1.39 7.36C.5 9.15 0 11.02 0 13s.5 3.85 1.39 5.64l3.89-2.86z" />
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.89c-1.04.7-2.37 1.12-4.23 1.12-3.11 0-5.78-2.69-6.72-5.54l-3.89 3.02C3.37 20.33 7.35 23 12 23z" />
            </svg>
            Continue with Google
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 600, color: '#4b61eb', textDecoration: 'none' }}>Create account</Link>
          </p>
        </form>
      </div>
    </div>
  );
};
