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

  return (
    <div 
      className="container flex-center" 
      style={{ minHeight: 'calc(100vh - 100px)', flexDirection: 'column' }}
    >
      <div 
        className="glass-card animate-slide-up" 
        style={{ 
          width: '100%', 
          maxWidth: '440px', 
          padding: '3rem 2.5rem', 
          borderRadius: '24px', 
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(22, 23, 27, 0.85)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#fff', fontFamily: 'Outfit' }}>Welcome Back</h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>Sign in to access your CareerIQ workspace</p>
        </div>
        
        {error && (
          <div 
            className="badge badge-danger" 
            style={{ width: '100%', display: 'block', textAlign: 'center', padding: '0.75rem', marginBottom: '1.5rem', textTransform: 'none', borderRadius: '10px' }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label htmlFor="email" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
            <input 
              id="email"
              type="email" 
              className="glass-input" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '0.9rem',
                borderRadius: '12px',
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#fff',
                outline: 'none',
                transition: 'all 0.3s'
              }}
              required
            />
          </div>

          <div>
            <label htmlFor="password" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
            <input 
              id="password"
              type="password" 
              className="glass-input" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '0.9rem',
                borderRadius: '12px',
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#fff',
                outline: 'none',
                transition: 'all 0.3s'
              }}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ 
              width: '100%', 
              padding: '0.85rem', 
              borderRadius: '12px', 
              fontSize: '0.9rem', 
              fontWeight: 700, 
              background: '#4b61eb', 
              border: 'none', 
              color: '#fff', 
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(75, 97, 235, 0.25)',
              transition: 'all 0.3s',
              marginTop: '0.5rem'
            }}
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8', margin: '0.5rem 0 0 0' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 600, color: '#4b61eb', textDecoration: 'none' }}>Create account</Link>
          </p>
        </form>
      </div>
    </div>
  );
};
