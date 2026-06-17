import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerWithEmail, loginWithEmail, getCurrentUserToken } from '../services/firebase';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'recruiter'>('student');
  const [fullName, setFullName] = useState('');
  const [targetRole, setTargetRole] = useState('Frontend Engineer');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Technology');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam === 'recruiter') {
      setRole('recruiter');
    } else if (roleParam === 'student') {
      setRole('student');
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      try {
        await registerWithEmail(email, password);
      } catch (err: any) {
        // Self-healing: if user already registered in Firebase but database sync failed,
        // attempt to log in to proceed with database sync.
        if (err.code === 'auth/email-already-in-use' || err.message?.includes('already-in-use')) {
          console.log('[Firebase Register] Email already in use. Retrying database synchronization...');
          await loginWithEmail(email, password);
        } else {
          throw err;
        }
      }
      
      const fbToken = await getCurrentUserToken();
      if (!fbToken) throw new Error('Failed to retrieve authentication token');

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${fbToken}`
        },
        body: JSON.stringify({ 
          role,
          fullName,
          targetRole: role === 'student' ? targetRole : undefined,
          companyName: role === 'recruiter' ? companyName : undefined,
          industry: role === 'recruiter' ? industry : undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Ignore "already exists" database error, since user is already present in Postgres.
        if (!errorData.error || !errorData.error.includes('already exists')) {
          throw new Error(errorData.error || 'Server registration sync failed.');
        }
      }

      const syncResponse = await fetch('http://localhost:5000/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${fbToken}`
        }
      });

      if (!syncResponse.ok) {
        const syncErrorData = await syncResponse.json();
        throw new Error(syncErrorData.error || 'Failed to sync user session.');
      }

      const syncResult = await syncResponse.json();
      login(fbToken, syncResult.user);
      
      if (syncResult.user.role === 'recruiter') {
        navigate('/recruiter-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Try a different email.');
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
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontWeight: 800 }}>Create Account</h2>
        
        {error && (
          <div 
            className="badge badge-danger" 
            style={{ width: '100%', display: 'block', textAlign: 'center', padding: '0.75rem', marginBottom: '1rem', textTransform: 'none' }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role selection tabs */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label>Select Account Type</label>
            <div 
              style={{
                display: 'flex',
                background: 'var(--bg-subcard)',
                border: '1px solid var(--border-subcard)',
                padding: '0.25rem',
                borderRadius: '8px',
                gap: '0.25rem'
              }}
            >
              <button
                type="button"
                className="btn"
                onClick={() => setRole('student')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  fontSize: '0.9rem',
                  borderRadius: '6px',
                  background: role === 'student' ? 'var(--grad-primary)' : 'transparent',
                  color: role === 'student' ? '#ffffff' : 'var(--color-text-main)',
                }}
              >
                Student / Candidate
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setRole('recruiter')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  fontSize: '0.9rem',
                  borderRadius: '6px',
                  background: role === 'recruiter' ? 'var(--grad-secondary)' : 'transparent',
                  color: role === 'recruiter' ? '#ffffff' : 'var(--color-text-main)',
                }}
              >
                HR / Recruiter
              </button>
            </div>
          </div>

          {/* Two-column responsive grid */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '1.5rem', 
              marginBottom: '1.5rem' 
            }}
            className="grid-responsive-2"
          >
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label htmlFor="fullName">Full Name</label>
                <input 
                  id="fullName"
                  type="text" 
                  className="glass-input" 
                  placeholder="e.g. Alex Rivera" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              {role === 'student' ? (
                <div>
                  <label htmlFor="targetRole">Target Role / Category</label>
                  <select
                    id="targetRole"
                    className="glass-input"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    style={{ background: 'var(--bg-subcard)', color: 'var(--color-text-main)' }}
                    required
                  >
                    <option value="Frontend Engineer">Frontend Engineer</option>
                    <option value="Backend Engineer">Backend Engineer</option>
                    <option value="Fullstack Developer">Fullstack Developer</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="Mobile Developer">Mobile Developer</option>
                    <option value="QA Engineer">QA Engineer</option>
                  </select>
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="companyName">Company Name</label>
                    <input 
                      id="companyName"
                      type="text" 
                      className="glass-input" 
                      placeholder="e.g. Google" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="industry">Industry / Category</label>
                    <select
                      id="industry"
                      className="glass-input"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      style={{ background: 'var(--bg-subcard)', color: 'var(--color-text-main)' }}
                      required
                    >
                      <option value="Technology">Technology</option>
                      <option value="Finance & Banking">Finance & Banking</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="E-commerce">E-commerce</option>
                      <option value="Education">Education</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
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

              <div>
                <label htmlFor="password">Password</label>
                <input 
                  id="password"
                  type="password" 
                  className="glass-input" 
                  placeholder="Min 6 characters" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.85rem' }}
            disabled={submitting}
          >
            {submitting ? 'Registering...' : 'Sign Up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};
