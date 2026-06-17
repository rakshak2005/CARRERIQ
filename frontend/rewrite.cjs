const fs = require('fs');

const filePath = 'c:/PROJECTS/CareerIQ/frontend/src/pages/StudentDashboard.tsx';
const content = fs.readFileSync(filePath, 'utf-8');

const match = content.match(/^\s*return\s*\(\s*<div className="container">\s*\{\/\* Banner Message/m);
if (!match) {
    console.error("Could not find the return statement");
    process.exit(1);
}

const topHalf = content.substring(0, match.index);

const newJsx = `  return (
    <div className="container" style={{ maxWidth: '1440px' }}>
      {/* Banner Message */}
      {message.text && (
        <div 
          className={\`badge badge-\${message.type}\`} 
          style={{ 
            position: 'fixed', 
            top: '80px', 
            right: '20px', 
            zIndex: 1000, 
            padding: '1rem',
            borderRadius: '8px', 
            textTransform: 'none',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
          }}
        >
          {message.text}
        </div>
      )}

      {/* HEADER: Profile Summary (Name & Target Role) */}
      <div className="glass-card" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
            {fullName ? fullName.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your Full Name"
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-main)', fontSize: '1.25rem', fontWeight: 700, outline: 'none', width: '200px' }}
              />
            </div>
            <input 
              type="text" 
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Target Role (e.g. Software Engineer)"
              style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.9rem', outline: 'none', width: '250px' }}
            />
          </div>
        </div>
        <button 
          className="btn btn-primary" 
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          onClick={handleProfileSubmit}
          disabled={profileSaving}
        >
          {profileSaving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {/* HERO SECTION: Readiness Score & Calculation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2rem' }} className="grid-responsive-2">
        {/* Core Score Card */}
        <div className="glass-card flex-center" style={{ flexDirection: 'column', padding: '2rem', background: 'linear-gradient(180deg, rgba(37,99,235,0.05) 0%, rgba(0,0,0,0) 100%)' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CareerIQ Readiness</h2>
          <ScoreMeter score={overallScore} size={220} />
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <span className={\`badge \${overallScore >= 80 ? 'badge-success' : overallScore >= 50 ? 'badge-primary' : 'badge-danger'}\`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              {overallScore >= 80 ? 'Interview Ready' : overallScore >= 50 ? 'Developing Profile' : 'Action Required'}
            </span>
          </div>
        </div>

        {/* Calculation Details Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📊 Score Derivation Model
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Your overall readiness score is a weighted composite of your specific assessment areas. Improve specific modules to increase your overall rating.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }} className="grid-responsive-2">
            {[
              { label: 'Resume Check', weight: dsaIncluded ? '30%' : '32%', score: categoryScores.resumeScore, color: 'var(--color-primary)' },
              { label: 'GitHub Analysis', weight: dsaIncluded ? '25%' : '27%', score: githubScore, color: '#10b981' },
              { label: 'Project Portfolio', weight: dsaIncluded ? '20%' : '21%', score: categoryScores.projectsScore, color: '#8b5cf6' },
              { label: 'LinkedIn Impact', weight: '10%', score: categoryScores.onlinePresenceScore, color: '#0ea5e9' },
              { label: 'Certifications', weight: '10%', score: categoryScores.experienceScore, color: '#f59e0b' },
              ...(dsaIncluded ? [{ label: 'DSA Evaluation', weight: '5%', score: categoryScores.dsaScore, color: '#ef4444' }] : []),
            ].map(item => (
              <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{item.label}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: item.color }}>{item.weight} Wgt</span>
                </div>
                <div className="flex-between" style={{ alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{item.score}</span>
                  <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: \`\${item.score}%\`, height: '100%', background: item.color, borderRadius: '2px' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODULES GRID */}
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', marginTop: '3rem' }}>Analysis Modules</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {/* 1. GITHUB ANALYSIS MODULE (Spans 2 columns if space allows) */}
        <div className="glass-card" style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, rgba(36, 41, 47, 0.4) 0%, rgba(20, 22, 25, 0.6) 100%)', borderColor: '#24292f' }}>
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fff' }}>
              <svg height="24" viewBox="0 0 16 16" width="24" style={{ fill: '#fff' }}>
                <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.35 3.12.9 0 .64.01 1.25.01 1.42 0 .21-.15.47-.55.38A8.006 8.006 0 0 1 0 8c0-4.42 3.58-8 8-8z" />
              </svg>
              GitHub Code Analysis
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className={\`badge \${githubScore > 0 ? 'badge-success' : 'badge-secondary'}\`}>
                {githubScore > 0 ? 'Completed' : 'Not Started'}
              </span>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '0.25rem 0.85rem', fontWeight: 700, color: '#fff' }}>
                {githubScore} / 100
              </div>
            </div>
          </div>

          {/* GitHub Input */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', maxWidth: '600px' }}>
            <input 
              type="url" 
              className="glass-input" 
              style={{ flex: 1 }}
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username"
            />
            <button 
              className="btn btn-primary" 
              onClick={handleAnalyzeGithub}
              disabled={analysisActive || !githubUrl}
            >
              {analysisActive ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>

          {/* GitHub Results */}
          {githubBreakdown && (
            <div className="animate-slide-up">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>{githubBreakdown.complexity}/25</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Complexity</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-secondary)' }}>{githubBreakdown.activity}/20</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Activity</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 700, color: '#00d2ff' }}>{githubBreakdown.quality}/25</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Quality</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 700, color: '#ffb900' }}>{githubBreakdown.techDiversity}/20</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Diversity</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 700, color: '#ff5e62' }}>{githubBreakdown.community}/10</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Community</span>
                </div>
              </div>

              {githubTechnologies.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {githubTechnologies.map(tech => (
                      <span key={tech} className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.1)' }}>{tech}</span>
                    ))}
                  </div>
                </div>
              )}

              {githubRepositories && githubRepositories.length > 0 && (
                <div style={{ overflowX: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '1rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                        <th style={{ padding: '0.5rem' }}>Repository</th>
                        <th style={{ padding: '0.5rem' }}>Score</th>
                        <th style={{ padding: '0.5rem' }}>Level</th>
                        <th style={{ padding: '0.5rem' }}>Tech Stack</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...githubRepositories].sort((a, b) => b.repositoryScore - a.repositoryScore).slice(0, 5).map(repo => (
                        <tr key={repo.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '0.5rem' }}><a href={repo.url} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>{repo.name}</a></td>
                          <td style={{ padding: '0.5rem', fontWeight: 600 }}>{repo.repositoryScore}</td>
                          <td style={{ padding: '0.5rem' }}>{repo.complexityLevel}</td>
                          <td style={{ padding: '0.5rem', color: 'var(--color-text-muted)' }}>{Array.isArray(repo.detectedTechnologies) ? repo.detectedTechnologies.join(', ') : (repo.detectedTechnologies || repo.primaryLanguage)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {githubRepositories.length > 5 && <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Showing top 5 repositories</div>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. RESUME MODULE */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>📄 ATS Resume Parse</h3>
            <span className={\`badge \${resumeUrl ? 'badge-success' : 'badge-secondary'}\`}>{resumeUrl ? 'Completed' : 'Not Started'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{categoryScores.resumeScore}</span>
            <span style={{ color: 'var(--color-text-muted)', marginBottom: '4px' }}>/ 100</span>
          </div>
          
          <div style={{ border: '1.5px dashed var(--border-input)', borderRadius: '8px', padding: '1.25rem', textAlign: 'center', background: 'var(--bg-subcard)', marginTop: 'auto' }}>
            <input type="file" id="resume-file-input" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleResumeUpload} />
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Upload PDF/Word to parse.</p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={() => document.getElementById('resume-file-input')?.click()} disabled={uploadingResume}>
                {uploadingResume ? 'Processing...' : 'Upload'}
              </button>
              {resumeUrl && <a href={\`http://localhost:5000/\${resumeUrl}\`} target="_blank" rel="noreferrer" className="btn btn-ghost-premium">View</a>}
            </div>
          </div>
        </div>

        {/* 3. LINKEDIN MODULE */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#0ea5e9' }}>in</span> LinkedIn Reach
            </h3>
            <span className={\`badge \${categoryScores.onlinePresenceScore > 0 ? 'badge-success' : 'badge-secondary'}\`}>{categoryScores.onlinePresenceScore > 0 ? 'Completed' : 'Not Started'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{categoryScores.onlinePresenceScore}</span>
            <span style={{ color: 'var(--color-text-muted)', marginBottom: '4px' }}>/ 100</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Analyze network impact and profile keywords.</p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
            <input type="url" className="glass-input" style={{ flex: 1, padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="LinkedIn URL" />
            <button className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={handleProfileSubmit}>Save</button>
          </div>
        </div>

        {/* 4. PROJECTS PORTFOLIO */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>🚀 Projects</h3>
            <span className={\`badge \${projects.length > 0 ? 'badge-success' : 'badge-secondary'}\`}>{projects.length} Added</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{categoryScores.projectsScore}</span>
            <span style={{ color: 'var(--color-text-muted)', marginBottom: '4px' }}>/ 100</span>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '100px', marginBottom: '1rem' }}>
            {projects.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>No manual projects added.</p>
            ) : (
              <ul style={{ paddingLeft: '1rem', fontSize: '0.8rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {projects.map(p => <li key={p.id}>{p.title} <span style={{ cursor: 'pointer', color: 'var(--color-error)' }} onClick={() => handleDeleteProject(p.id)}>×</span></li>)}
              </ul>
            )}
          </div>
          <button className="btn btn-secondary" style={{ width: '100%', padding: '0.4rem', fontSize: '0.85rem', marginTop: 'auto' }} onClick={() => setShowProjModal(true)}>+ Add Project</button>
        </div>

        {/* 5. CERTIFICATES */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>🎓 Certificates</h3>
            <span className={\`badge \${certificates.length > 0 ? 'badge-success' : 'badge-secondary'}\`}>{certificates.length} Added</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{categoryScores.experienceScore}</span>
            <span style={{ color: 'var(--color-text-muted)', marginBottom: '4px' }}>/ 100</span>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '100px', marginBottom: '1rem' }}>
            {certificates.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>No certificates added.</p>
            ) : (
              <ul style={{ paddingLeft: '1rem', fontSize: '0.8rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {certificates.map(c => <li key={c.id}>{c.name} <span style={{ cursor: 'pointer', color: 'var(--color-error)' }} onClick={() => handleDeleteCertificate(c.id)}>×</span></li>)}
              </ul>
            )}
          </div>
          <button className="btn btn-secondary" style={{ width: '100%', padding: '0.4rem', fontSize: '0.85rem', marginTop: 'auto' }} onClick={() => setShowCertModal(true)}>+ Add Certificate</button>
        </div>

        {/* 6. DSA EVALUATION */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>💻 DSA Evaluation</h3>
            <span className={\`badge \${dsaIncluded ? 'badge-primary' : 'badge-secondary'}\`}>{dsaIncluded ? 'Included' : 'Excluded'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '1.5rem', opacity: dsaIncluded ? 1 : 0.3 }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{categoryScores.dsaScore}</span>
            <span style={{ color: 'var(--color-text-muted)', marginBottom: '4px' }}>/ 100</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Include algorithms evaluation in the final score derivation.</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Enable DSA</span>
            <label className="toggle-container">
              <input type="checkbox" checked={dsaIncluded} onChange={(e) => { setDsaIncluded(e.target.checked); setTimeout(handleProfileSubmit, 100); }} />
              <div className="toggle-switch"></div>
            </label>
          </div>
        </div>
      </div>

      {/* AI RECOMMENDATIONS AND ROADMAP (Bottom Sections) */}
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', marginTop: '3rem' }}>Action Items & Insights</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
        
        {/* Recruiter Matches */}
        {recRoles.length > 0 && (
          <div className="glass-card animate-slide-up">
            <h3 style={{ marginBottom: '1.25rem' }}>Recruiter Fit Matching</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recRoles.map((roleObj, idx) => {
                const matchColor = roleObj.matchPercentage >= 80 ? 'var(--color-success)' : roleObj.matchPercentage >= 55 ? 'var(--color-warning)' : 'var(--color-text-muted)';
                return (
                  <div key={idx}>
                    <div className="flex-between" style={{ fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 600 }}>{roleObj.role}</span>
                      <span style={{ fontWeight: 700, color: matchColor }}>{roleObj.matchPercentage}% Match</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--border-subcard)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: \`\${roleObj.matchPercentage}%\`, background: matchColor, borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Improvement Plan */}
        <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.05) 0%, rgba(15, 23, 42, 0.4) 100%)', borderColor: 'var(--color-primary-glow)' }}>
          <h3 style={{ marginBottom: '1.25rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ✨ AI Improvement Roadmap
          </h3>
          {recommendations.length === 0 ? (
            <p style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>Complete module analysis to generate tailored AI tips.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recommendations.map((rec, i) => (
                <div key={i} style={{ borderLeft: '2px solid var(--color-primary)', paddingLeft: '0.85rem', fontSize: '0.875rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-text-title)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '0.15rem' }}>
                    {rec.category}
                  </span>
                  <p style={{ color: 'var(--color-text-main)', margin: 0 }}>{rec.recommendation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Project Add Modal */}
      {showProjModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-modal-overlay)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.25rem' }}>Add Project</h3>
            <form onSubmit={handleAddProject}>
              <div style={{ marginBottom: '1rem' }}>
                <label>Project Title *</label>
                <input type="text" className="glass-input" value={newProjTitle} onChange={(e) => setNewProjTitle(e.target.value)} required />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Description</label>
                <textarea className="glass-input" rows={3} value={newProjDesc} onChange={(e) => setNewProjDesc(e.target.value)} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Technologies (comma separated)</label>
                <input type="text" className="glass-input" value={newProjTech} onChange={(e) => setNewProjTech(e.target.value)} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label>Project URL</label>
                <input type="url" className="glass-input" value={newProjUrl} onChange={(e) => setNewProjUrl(e.target.value)} />
              </div>
              <div className="flex-between">
                <button type="button" className="btn btn-secondary" onClick={() => setShowProjModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Add Modal */}
      {showCertModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-modal-overlay)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.25rem' }}>Add Certificate</h3>
            <form onSubmit={handleAddCertificate}>
              <div style={{ marginBottom: '1rem' }}>
                <label>Certificate Name *</label>
                <input type="text" className="glass-input" value={newCertName} onChange={(e) => setNewCertName(e.target.value)} required />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Issuer *</label>
                <input type="text" className="glass-input" value={newCertIssuer} onChange={(e) => setNewCertIssuer(e.target.value)} required />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Issue Date (YYYY-MM)</label>
                <input type="text" className="glass-input" value={newCertDate} onChange={(e) => setNewCertDate(e.target.value)} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label>Credential URL</label>
                <input type="url" className="glass-input" value={newCertUrl} onChange={(e) => setNewCertUrl(e.target.value)} />
              </div>
              <div className="flex-between">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCertModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Certificate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
`;

fs.writeFileSync(filePath, topHalf + newJsx);
console.log("Rewrote StudentDashboard.tsx successfully.");
