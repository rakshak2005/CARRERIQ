import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerWithEmail, getCurrentUserToken } from '../services/firebase';
import { BACKEND_URL } from '../services/api';

// Hardcoded dark styles applied directly — prevents white-input bug on Vercel
// where CSS variables resolve to light-mode values before React hydrates.
const INPUT_STYLE: React.CSSProperties = {
  background: 'rgba(15, 23, 42, 0.6)',
  color: '#ffffff',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  WebkitTextFillColor: '#ffffff',
};
const SELECT_STYLE: React.CSSProperties = {
  background: 'rgba(15, 23, 42, 0.8)',
  color: '#ffffff',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  WebkitTextFillColor: '#ffffff',
};

export const Register: React.FC = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Student fields
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [targetRole, setTargetRole] = useState('');
  
  // Recruiter fields
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Technology');
  
  const [role, setRole] = useState<'student' | 'recruiter'>('student');
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

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (role === 'student') {
        if (!resumeFile) {
          throw new Error('Please upload your resume to complete signup.');
        }
        if (!githubUrl) {
          throw new Error('Please provide your GitHub profile URL.');
        }
      } else {
        if (!fullName) {
          throw new Error('Please enter your full name.');
        }
      }

      // 1. Firebase Auth Registration
      await registerWithEmail(email, password);
      
      const fbToken = await getCurrentUserToken();
      if (!fbToken) throw new Error('Failed to retrieve authentication token.');

      if (role === 'student') {
        // 2. Student Signup: Submit details and Resume file to signup API
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('githubUrl', githubUrl);
        formData.append('targetRole', targetRole);
        formData.append('resume', resumeFile!);

        const response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${fbToken}`
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Server registration onboarding failed.');
        }

        const result = await response.json();
        
        // Login local auth context
        login(fbToken, result.user);
        
        // Redirect to dashboard with active job ID in state
        navigate('/student-dashboard', { state: { jobId: result.jobId } });

      } else {
        // 3. Recruiter Registration
        const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${fbToken}`
          },
          body: JSON.stringify({
            role: 'recruiter',
            fullName,
            companyName,
            industry
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Server registration failed.');
        }

        // Sync session
        const syncResponse = await fetch(`${BACKEND_URL}/api/auth/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${fbToken}`
          }
        });

        if (!syncResponse.ok) {
          throw new Error('Failed to sync session.');
        }

        const syncResult = await syncResponse.json();
        login(fbToken, syncResult.user);
        navigate('/recruiter-dashboard');
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
        style={{ width: '100%', maxWidth: '600px', padding: '2.5rem' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontWeight: 800, margin: '0 0 0.5rem 0' }}>Create Account</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: 0 }}>
            {role === 'student' ? 'Intelligent onboarding setup for candidates' : 'Setup your recruiter dashboard'}
          </p>
        </div>

        {error && (
          <div 
            className="badge badge-danger" 
            style={{ width: '100%', display: 'block', textAlign: 'center', padding: '0.75rem', marginBottom: '1.5rem', textTransform: 'none' }}
          >
            {error}
          </div>
        )}

        {/* Step indicator (only for student) */}
        {role === 'student' && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                display: 'inline-flex',
                width: '24px',
                height: '24px',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                background: step === 1 ? 'var(--grad-primary)' : 'var(--bg-subcard)',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>1</span>
              <span style={{ fontSize: '0.85rem', fontWeight: step === 1 ? 700 : 400 }}>Account Info</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                display: 'inline-flex',
                width: '24px',
                height: '24px',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                background: step === 2 ? 'var(--grad-primary)' : 'var(--bg-subcard)',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>2</span>
              <span style={{ fontSize: '0.85rem', fontWeight: step === 2 ? 700 : 400 }}>Career Profile</span>
            </div>
          </div>
        )}

        {/* Role Selection Tabs */}
        {step === 1 && (
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
        )}

        {step === 1 ? (
          /* STEP 1 FORM */
          <form onSubmit={handleNextStep}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="email">Email Address</label>
              <input 
                id="email"
                type="email" 
                className="glass-input" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={INPUT_STYLE}
                required
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="password">Password</label>
              <input 
                id="password"
                type="password" 
                className="glass-input" 
                placeholder="Min 6 characters" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={INPUT_STYLE}
                required
              />
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input 
                id="confirmPassword"
                type="password" 
                className="glass-input" 
                placeholder="Re-enter password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={INPUT_STYLE}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.85rem', marginBottom: '1rem' }}
            >
              {role === 'student' ? 'Next: Setup Career Profile' : 'Next: Setup Recruiter Profile'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.9rem', margin: 0 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
            </p>
          </form>
        ) : (
          /* STEP 2 FORM */
          <form onSubmit={handleSubmit}>
            {role === 'student' ? (
              /* Student Step 2 */
              <>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="resume">Upload Resume (PDF, DOCX)</label>
                  <input 
                    id="resume"
                    type="file" 
                    className="glass-input"
                    accept=".pdf,.docx"
                    onChange={(e) => setResumeFile(e.target.files ? e.target.files[0] : null)}
                    required
                  />
                  <small style={{ display: 'block', marginTop: '0.25rem', color: 'var(--color-text-muted)' }}>
                    CareerIQ will automatically parse your name, skills, and projects from the resume.
                  </small>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="githubUrl">GitHub Profile URL</label>
                  <input 
                    id="githubUrl"
                    type="url" 
                    className="glass-input" 
                    placeholder="https://github.com/username"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    style={INPUT_STYLE}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1.75rem' }}>
                  <label htmlFor="targetRole">Target Role</label>
                  <input
                    id="targetRole"
                    type="text"
                    className="glass-input"
                    placeholder="e.g. Full Stack Developer, ML Engineer..."
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    style={INPUT_STYLE}
                    required
                  />
                </div>
              </>
            ) : (
              /* Recruiter Step 2 */
              <>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="fullName">Full Name</label>
                  <input 
                    id="fullName"
                    type="text" 
                    className="glass-input" 
                    placeholder="Jane Doe" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={INPUT_STYLE}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="companyName">Company Name</label>
                  <input 
                    id="companyName"
                    type="text" 
                    className="glass-input" 
                    placeholder="Google" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    style={INPUT_STYLE}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1.75rem' }}>
                  <label htmlFor="industry">Industry</label>
                  <select
                    id="industry"
                    className="glass-input"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    style={SELECT_STYLE}
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

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setStep(1)}
                style={{ flex: 1, padding: '0.85rem' }}
                disabled={submitting}
              >
                Back
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ flex: 2, padding: '0.85rem' }}
                disabled={submitting}
              >
                {submitting ? 'Creating Profile...' : 'Complete Registration'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
