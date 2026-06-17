const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'StudentDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add state variables for Resume
const stateHookPos = content.indexOf('const [resumeUrl, setResumeUrl] = useState<string | null>(null);');
if (stateHookPos !== -1) {
  const insertState = `
  // Resume Analysis stats state
  const [resumeATSScore, setResumeATSScore] = useState<number>(0);
  const [resumeRoleMatchScore, setResumeRoleMatchScore] = useState<number>(0);
  const [resumeSkillsScore, setResumeSkillsScore] = useState<number>(0);
  const [resumeProjectsScore, setResumeProjectsScore] = useState<number>(0);
  const [resumeExperienceScore, setResumeExperienceScore] = useState<number>(0);
  const [resumeCertificationScore, setResumeCertificationScore] = useState<number>(0);
  const [resumeProfessionalPresenceScore, setResumeProfessionalPresenceScore] = useState<number>(0);
  const [resumeStrengths, setResumeStrengths] = useState<string[]>([]);
  const [resumeWeaknesses, setResumeWeaknesses] = useState<string[]>([]);
  const [resumeMissingKeywords, setResumeMissingKeywords] = useState<string[]>([]);
  const [resumeRecommendedSkills, setResumeRecommendedSkills] = useState<string[]>([]);
  const [resumeSummary, setResumeSummary] = useState<string>('');
  const [resumeSkills, setResumeSkills] = useState<string[]>([]);
  const [resumeProjects, setResumeProjects] = useState<any[]>([]);
  const [resumeLastAnalyzed, setResumeLastAnalyzed] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
`;
  content = content.slice(0, stateHookPos + 64) + insertState + content.slice(stateHookPos + 64);
}

// 2. Update updateDashboardState to load Resume fields
const updateStatePos = content.indexOf('setResumeUrl(data.profile.resume_url || data.profile.resumeUrl || null);');
if (updateStatePos !== -1) {
  const insertUpdateState = `
      setResumeATSScore(data.profile.resume_ats_score || 0);
      setResumeRoleMatchScore(data.profile.resume_role_match_score || 0);
      setResumeSkillsScore(data.profile.resume_skills_score || 0);
      setResumeProjectsScore(data.profile.resume_projects_score || 0);
      setResumeExperienceScore(data.profile.resume_experience_score || 0);
      setResumeCertificationScore(data.profile.resume_certification_score || 0);
      setResumeProfessionalPresenceScore(data.profile.resume_professional_presence_score || 0);
      setResumeStrengths(data.profile.resume_strengths || []);
      setResumeWeaknesses(data.profile.resume_weaknesses || []);
      setResumeMissingKeywords(data.profile.resume_missing_keywords || []);
      setResumeRecommendedSkills(data.profile.resume_recommended_skills || []);
      setResumeSummary(data.profile.resume_summary || '');
      setResumeSkills(data.profile.resume_skills || []);
      setResumeProjects(data.profile.resume_projects || []);
      setResumeLastAnalyzed(data.profile.resume_last_analyzed || null);
      setResumeFileName(data.profile.resume_file_name || null);
`;
  content = content.slice(0, updateStatePos + 74) + insertUpdateState + content.slice(updateStatePos + 74);
}

// 3. Replace the Resume Module UI
const resumeModuleRegex = /\{\/\*\s*2\.\s*RESUME MODULE\s*\*\/\}([\s\S]*?)<div\s+className="glass-card"\s+style=\{\{\s*display:\s*'flex',\s*flexDirection:\s*'column'\s*\}\}>([\s\S]*?)(?=\{\/\*\s*4\.\s*PROJECTS PORTFOLIO\s*\*\/\}|\{\/\*\s*3\.\s*LINKEDIN MODULE\s*\*\/\}|\{\/\*\s*5\.\s*CERTIFICATES\s*\*\/\}|\{\/\*\s*4\.\s*PROJECTS PORTFOLIO\s*\*\/\}|<!-- 4. PROJECTS PORTFOLIO -->)/i;

const newResumeModule = `
        {/* 2. RESUME MODULE */}
        <div className="glass-card" style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(30, 41, 59, 0.6) 100%)', borderColor: '#334155' }}>
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fff' }}>
              📄 AI Resume Intelligence
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className={\`badge \${resumeUrl ? 'badge-success' : 'badge-secondary'}\`}>
                {uploadingResume ? 'Processing...' : resumeUrl ? 'Completed' : 'Not Started'}
              </span>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '0.25rem 0.85rem', fontWeight: 700, color: '#fff' }}>
                {categoryScores.resumeScore} / 100
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, minWidth: '300px', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input type="file" id="resume-file-input" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleResumeUpload} />
              <button 
                className="btn btn-secondary" 
                onClick={() => document.getElementById('resume-file-input')?.click()} 
                disabled={uploadingResume}
              >
                {uploadingResume ? 'Analyzing Resume...' : resumeUrl ? 'Re-upload Resume' : 'Upload PDF/DOCX'}
              </button>
              {resumeUrl && <a href={\`http://localhost:5000/\${resumeUrl}\`} target="_blank" rel="noreferrer" className="btn btn-ghost-premium">View File</a>}
              {resumeFileName && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{resumeFileName}</span>}
              {resumeLastAnalyzed && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>Analyzed: {new Date(resumeLastAnalyzed).toLocaleString()}</span>}
            </div>
          </div>

          {resumeUrl && (
            <div className="animate-slide-up">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>{resumeATSScore}/25</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>ATS Match</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 800, color: '#818cf8' }}>{resumeRoleMatchScore}/100</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Role Match</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>{resumeSkillsScore}/20</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Skills Check</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 800, color: '#f472b6' }}>{resumeProjectsScore}/20</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Projects</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24' }}>{resumeExperienceScore}/15</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Experience</span>
                </div>
              </div>

              {resumeSummary && (
                <div style={{ background: 'rgba(56, 189, 248, 0.1)', borderLeft: '4px solid #38bdf8', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#38bdf8' }}>AI Summary</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>{resumeSummary}</p>
                </div>
              )}

              {/* Insights Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                  <h4 style={{ color: '#34d399', marginBottom: '0.75rem' }}>👍 Strengths</h4>
                  <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem' }}>
                    {resumeStrengths.map((s, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{s}</li>)}
                    {resumeStrengths.length === 0 && <span style={{ color: 'var(--color-text-muted)' }}>None found</span>}
                  </ul>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                  <h4 style={{ color: '#f43f5e', marginBottom: '0.75rem' }}>👎 Weaknesses</h4>
                  <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem' }}>
                    {resumeWeaknesses.map((s, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{s}</li>)}
                    {resumeWeaknesses.length === 0 && <span style={{ color: 'var(--color-text-muted)' }}>None found</span>}
                  </ul>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                  <h4 style={{ color: '#fbbf24', marginBottom: '0.75rem' }}>⚠️ Missing Keywords ({targetRole || 'General'})</h4>
                  <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem' }}>
                    {resumeMissingKeywords.map((s, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{s}</li>)}
                    {resumeMissingKeywords.length === 0 && <span style={{ color: 'var(--color-text-muted)' }}>None found</span>}
                  </ul>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                  <h4 style={{ color: '#818cf8', marginBottom: '0.75rem' }}>💡 Recommended Skills</h4>
                  <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem' }}>
                    {resumeRecommendedSkills.map((s, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{s}</li>)}
                    {resumeRecommendedSkills.length === 0 && <span style={{ color: 'var(--color-text-muted)' }}>None found</span>}
                  </ul>
                </div>
              </div>

              {resumeSkills && resumeSkills.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Extracted Skills</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {resumeSkills.map((skill, i) => (
                      <span key={i} className="badge" style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem', background: 'rgba(56, 189, 248, 0.15)', color: '#e0f2fe', border: '1px solid rgba(56, 189, 248, 0.3)' }}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {resumeProjects && resumeProjects.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Extracted Projects</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                    {resumeProjects.map((proj, i) => (
                      <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h5 style={{ margin: '0 0 0.25rem 0', color: '#fff' }}>{proj.name || 'Untitled Project'}</h5>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#94a3b8' }}>{proj.technologies}</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', lineHeight: '1.4', color: 'var(--color-text-muted)' }}>{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

`;

content = content.replace(resumeModuleRegex, newResumeModule);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('StudentDashboard.tsx rewritten successfully!');
