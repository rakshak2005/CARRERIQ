import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export const GitHubAnalysisReport: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [username, setUsername] = useState<string>('');
  const [reanalyzing, setReanalyzing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isReposExpanded, setIsReposExpanded] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.student.getProfile();
      if (res.profile) {
        const githubUsername = res.profile.github_username || res.profile.githubUsername;
        setUsername(githubUsername);
        
        if (githubUsername) {
          try {
            const dashRes = await api.analysis.dashboard(githubUsername);
            setData({ profile: { ...dashRes.profile, ...res.profile }, repositories: dashRes.repositories || [] });
          } catch (e) {
            setData({ profile: res.profile, repositories: res.repositories || [] });
          }
        } else {
          setData({ profile: res.profile, repositories: [] });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReanalyze = async () => {
    if (!username) return;
    setReanalyzing(true);
    try {
      // For a real app, this might trigger a new job and poll, but we'll simulate by triggering the API
      const profileRes = await api.student.getProfile();
      const gitUrl = profileRes?.profile?.github_url || profileRes?.profile?.githubUrl;
      if (gitUrl) {
        await api.github.analyze(gitUrl);
        await fetchReport();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReanalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-[80vh]">
        <h2 className="text-xl text-white">Loading Detailed Report...</h2>
      </div>
    );
  }

  if (!data || !data.profile) {
    return (
      <div className="container text-center mt-10">
        <h2 className="text-white text-xl">No profile data found.</h2>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mt-4" onClick={() => navigate('/student-dashboard')}>Back to Dashboard</button>
      </div>
    );
  }

  const { profile, repositories } = data;
  
  const getRepoScore = (repo: any) => Math.round(((repo.complexityScore || 0) + (repo.documentationScore || 0) + (repo.productionReadinessScore || 0)) / 3);
  const sortedRepositories = [...(repositories || [])].sort((a, b) => getRepoScore(b) - getRepoScore(a));
  const displayedRepositories = isReposExpanded ? sortedRepositories : sortedRepositories.slice(0, 5);
  
  const score = profile.github_score || profile.employabilityScore || profile.githubScore || 0;
  const followers = profile.github_followers || profile.metadata?.followers || 0;
  const following = profile.github_following || profile.metadata?.following || 0;
  const stars = profile.github_stars || profile.metadata?.stars || 0;
  const reposCount = profile.github_repos || profile.metadata?.publicRepos || 0;
  const lastActivity = profile.github_last_activity || profile.metadata?.lastActivity || 'Recent';
  const healthMetrics = profile.github_health_metrics || profile.githubHealthMetrics || {};
  const detailedIssues = profile.github_detailed_issues || profile.githubDetailedIssues || {};
  const detailedRecs = profile.github_detailed_recs || profile.githubDetailedRecs || [];
  const growthPlan = profile.github_growth_plan || profile.githubGrowthPlan || {};
  const aiReview = profile.github_career_review || profile.githubCareerReview || profile.careerRoadmap || {};
  const portfolioGaps = profile.github_portfolio_gaps || profile.githubPortfolioGaps || {};
  const wowProjects = profile.github_wow_projects || profile.githubWowProjects || [];
  
  return (
    <div className="container mx-auto p-4 max-w-7xl pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 mt-4 gap-4">
        <div>
          <button className="text-slate-400 hover:text-white mb-4 flex items-center gap-2 transition-colors" onClick={() => navigate('/student-dashboard')}>
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
            GitHub Intelligence Report
          </h1>
          <p className="text-slate-400">Deep technical analysis of your engineering footprint</p>
        </div>
        <button 
          onClick={handleReanalyze}
          disabled={reanalyzing}
          className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(52,211,153,0.15)] hover:shadow-[0_0_20px_rgba(52,211,153,0.3)] flex items-center justify-center gap-2"
        >
          {reanalyzing ? 'Analyzing...' : 'Reanalyze Profile'}
        </button>
      </div>

      {/* SECTION 1: Profile Summary */}
      <div className="glass-card rounded-2xl p-8 mb-8 border border-slate-700 bg-slate-800/40 backdrop-blur-md">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="bg-blue-500/20 text-blue-400 p-2 rounded-lg">1</span> 
          GitHub Profile Summary
        </h2>
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="flex flex-col items-center">
            {profile.github_avatar || profile.avatarUrl ? (
              <img src={profile.github_avatar || profile.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-slate-700 mb-3 shadow-lg" />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-slate-700 mb-3 flex items-center justify-center bg-slate-800 text-3xl">👤</div>
            )}
            <p className="text-lg font-bold text-white">{username || 'N/A'}</p>
            <p className="text-xs text-slate-400">Status: <span className="text-emerald-400">Analyzed</span></p>
          </div>
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Followers</p>
              <p className="text-xl font-bold text-white">{followers}</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Following</p>
              <p className="text-xl font-bold text-white">{following}</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Public Repos</p>
              <p className="text-xl font-bold text-white">{reposCount}</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Stars</p>
              <p className="text-xl font-bold text-yellow-400">{stars}</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Last Activity</p>
              <p className="text-sm font-bold text-slate-300">{new Date(lastActivity).toLocaleDateString() || 'Recent'}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 p-4 rounded-xl border border-emerald-500/30">
              <p className="text-xs text-emerald-400 uppercase tracking-wider mb-1">GitHub Score</p>
              <p className="text-2xl font-black text-emerald-400">{score}/100</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Repository Analysis */}
      <div className="glass-card rounded-2xl p-8 mb-8 border border-slate-700 bg-slate-800/40 backdrop-blur-md">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="bg-blue-500/20 text-blue-400 p-2 rounded-lg">2</span> 
          Repository Analysis
        </h2>
        <div className="overflow-x-auto">
          {sortedRepositories && sortedRepositories.length > 0 ? (
            isMobile ? (
              <div className="flex flex-col gap-3">
                {displayedRepositories.map((repo: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-900/20 border border-slate-700/50 p-4 rounded-xl">
                    <span className="font-semibold text-blue-400 truncate mr-2" style={{ maxWidth: '75%' }}>
                      <a href={repo.url} target="_blank" rel="noreferrer" className="hover:underline">{repo.name}</a>
                    </span>
                    <span className="bg-emerald-400/10 text-emerald-400 px-2.5 py-1.5 rounded font-bold text-sm flex-shrink-0">
                      {Math.round(((repo.complexityScore || 0) + (repo.documentationScore || 0) + (repo.productionReadinessScore || 0)) / 3)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 text-sm whitespace-nowrap">
                    <th className="py-4 px-4 font-semibold uppercase tracking-wider text-xs">Repository</th>
                    <th className="py-4 px-4 font-semibold uppercase tracking-wider text-xs">Score</th>
                    <th className="py-4 px-4 font-semibold uppercase tracking-wider text-xs">Complexity</th>
                    <th className="py-4 px-4 font-semibold uppercase tracking-wider text-xs">Quality</th>
                    <th className="py-4 px-4 font-semibold uppercase tracking-wider text-xs">Stars</th>
                    <th className="py-4 px-4 font-semibold uppercase tracking-wider text-xs">Language</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedRepositories.map((repo: any, idx: number) => (
                    <tr key={idx} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors whitespace-nowrap">
                      <td className="py-4 px-4 font-medium text-blue-400"><a href={repo.url} target="_blank" rel="noreferrer" className="hover:underline">{repo.name}</a></td>
                      <td className="py-4 px-4"><span className="bg-emerald-400/10 text-emerald-400 px-2 py-1 rounded font-bold text-sm">{Math.round(((repo.complexityScore || 0) + (repo.documentationScore || 0) + (repo.productionReadinessScore || 0)) / 3)}</span></td>
                      <td className="py-4 px-4 text-slate-300">{repo.complexityScore || 0}/100</td>
                      <td className="py-4 px-4 text-slate-300">{repo.productionReadinessScore || 0}/100</td>
                      <td className="py-4 px-4 text-yellow-400/80">⭐ {repo.stars || repo.stargazersCount || 0}</td>
                      <td className="py-4 px-4 text-slate-400 text-sm">{repo.language || repo.primaryLanguage || 'Mixed'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            <div className="text-center py-8 text-slate-400 bg-slate-900/30 rounded-xl border border-slate-700/30">
              No detailed repository data available.
            </div>
          )}
        </div>
        {sortedRepositories && sortedRepositories.length > 5 && (
          <div className="flex justify-center mt-6">
            <button 
              onClick={() => setIsReposExpanded(!isReposExpanded)}
              className="bg-slate-900/80 hover:bg-slate-800 text-blue-400 hover:text-white border border-slate-700/80 font-bold px-5 py-2.5 rounded-xl transition-all text-xs flex items-center justify-center gap-2"
            >
              {isReposExpanded ? 'Show Less' : `Show More (${sortedRepositories.length - 5} hidden)`}
            </button>
          </div>
        )}
      </div>

      {/* SECTION 3: Health Score */}
      <div className="glass-card rounded-2xl p-8 mb-8 border border-slate-700 bg-slate-800/40 backdrop-blur-md">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="bg-blue-500/20 text-blue-400 p-2 rounded-lg">3</span> 
          GitHub Health Score
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {Object.entries({
            Documentation: healthMetrics.documentation || 4,
            Testing: healthMetrics.testing || 2,
            Deployment: healthMetrics.deployment || 3,
            'CI/CD': healthMetrics.cicd || 0,
            Architecture: healthMetrics.architecture || 7,
            'Code Quality': healthMetrics.codeQuality || 8,
            'Open Source': healthMetrics.openSource || 1
          }).map(([key, val]: [string, any], idx) => {
            const getColor = (v: number) => v >= 8 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' : v >= 5 ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5' : 'text-rose-400 border-rose-500/30 bg-rose-500/5';
            return (
              <div key={idx} className={`p-4 rounded-xl border ${getColor(val)} text-center transition-all hover:scale-105`}>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 font-bold">{key}</p>
                <div className={`text-3xl font-black ${getColor(val).split(' ')[0]}`}>{val}<span className="text-sm text-slate-500 font-normal">/10</span></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: Drawbacks & Issues */}
      <div className="glass-card rounded-2xl p-8 mb-8 border border-slate-700 bg-slate-800/40 backdrop-blur-md">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="bg-rose-500/20 text-rose-400 p-2 rounded-lg">4</span> 
          Drawbacks & Issues
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Documentation Issues', data: detailedIssues.documentation || [] },
            { title: 'Engineering Issues', data: detailedIssues.engineering || [] },
            { title: 'Portfolio Issues', data: detailedIssues.portfolio || [] }
          ].map((group, idx) => (
            <div key={idx} className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50 h-full">
              <h3 className="font-bold text-slate-200 mb-4 pb-3 border-b border-slate-700/50 text-sm uppercase tracking-wider">{group.title}</h3>
              <div className="space-y-4">
                {group.data && group.data.length > 0 ? group.data.map((issue: any, i: number) => (
                  <div key={i} className="text-sm group">
                    <div className="flex items-start gap-2">
                      <span className="text-rose-400 mt-0.5">•</span>
                      <div>
                        <div className="font-semibold text-slate-300 group-hover:text-rose-300 transition-colors">{issue.issue || issue.title || issue}</div>
                        {issue.severity && <div className="text-[10px] inline-block mt-1 px-2 py-0.5 rounded border border-slate-700 text-slate-400 bg-slate-800 uppercase">{issue.severity}</div>}
                        {issue.affectedRepositories && issue.affectedRepositories.length > 0 && (
                          <div className="text-xs text-slate-500 mt-2">
                            <span className="text-[10px] uppercase text-slate-600 block mb-1">Affected Repos:</span>
                            {issue.affectedRepositories.map((r:string, ri:number) => <span key={ri} className="inline-block bg-slate-800/80 px-1.5 py-0.5 rounded text-[10px] mr-1 mb-1 border border-slate-700/50">{r}</span>)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-4">
                    <span className="text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full text-xs font-bold">No issues found</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5: Recommended Improvements */}
      <div className="glass-card rounded-2xl p-8 mb-8 border border-slate-700 bg-slate-800/40 backdrop-blur-md">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="bg-blue-500/20 text-blue-400 p-2 rounded-lg">5</span> 
          Recommended Improvements
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {detailedRecs.length > 0 ? detailedRecs.map((rec: any, idx: number) => {
            const isCritical = rec.priority === 'Critical' || idx === 0;
            return (
              <div key={idx} className={`bg-slate-900/50 rounded-xl p-5 border ${isCritical ? 'border-blue-500/30' : 'border-slate-700/50'} relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4`}>
                {isCritical && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${isCritical ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                      {rec.priorityLevel || rec.priority || (idx === 0 ? 'Critical' : 'Medium')}
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">Diff: {rec.difficulty || 'Medium'}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1">⏱️ {rec.estimatedTime || '1 Hour'}</span>
                  </div>
                  <h3 className="font-bold text-slate-200 text-base">{rec.action || rec.description || rec.title}</h3>
                </div>
                <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-400 px-5 py-3 rounded-xl font-black text-sm text-center border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)] flex flex-col justify-center min-w-[120px]">
                  <span className="text-[10px] uppercase text-emerald-500/70 mb-0.5">Expected Gain</span>
                  <span>+{rec.expectedScoreGain || rec.gain || 5} Score</span>
                </div>
              </div>
            );
          }) : <p className="text-slate-400 text-center py-4 bg-slate-900/30 rounded-xl">No specific recommendations at this time.</p>}
        </div>
      </div>

      {/* SECTION 6: Growth Potential */}
      <div className="glass-card rounded-2xl p-8 mb-8 border border-slate-700 bg-slate-800/40 backdrop-blur-md">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="bg-emerald-500/20 text-emerald-400 p-2 rounded-lg">6</span> 
          Growth Potential
        </h2>
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50 flex-1 flex flex-col items-center justify-center relative overflow-hidden">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2">Current Score</p>
            <p className="text-5xl font-black text-slate-200">{growthPlan.currentScore || score}</p>
          </div>
          <div className="flex items-center justify-center text-slate-600 hidden md:flex">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-6 rounded-2xl border border-emerald-500/30 flex-1 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-[40px]"></div>
            <p className="text-xs text-emerald-500 uppercase tracking-widest font-bold mb-2">Potential Score</p>
            <p className="text-5xl font-black text-emerald-400">{growthPlan.potentialScore || score + 20}</p>
            <div className="mt-3 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              +{(growthPlan.potentialScore || score + 20) - (growthPlan.currentScore || score)} Points Expected Gain
            </div>
          </div>
        </div>
        
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50">
          <h3 className="font-bold text-slate-200 mb-5 text-sm uppercase tracking-wider">Improvement Roadmap</h3>
          <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
            {(growthPlan.phases || [
              { name: 'Documentation Fixes', projectedScore: score + 5 },
              { name: 'Testing & CI/CD', projectedScore: score + 12 },
              { name: 'Architecture Refactoring', projectedScore: score + 20 }
            ]).map((phase: any, idx: number) => (
              <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-6 last:mb-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-900 bg-slate-800 text-slate-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-bold text-sm">
                  {idx + 1}
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-800/80 p-4 rounded-xl border border-slate-700/50 shadow-lg flex justify-between items-center transition-transform hover:-translate-y-1">
                  <div className="font-medium text-slate-200">{phase.name || `Phase ${idx+1}`}</div>
                  <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg text-xs font-bold border border-emerald-500/20">
                    Score: {phase.projectedScore}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 7: AI Review */}
      <div className="glass-card rounded-2xl p-8 mb-8 border border-slate-700 bg-gradient-to-br from-slate-800/80 to-slate-900/90 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -z-10"></div>
        
        <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
          <span className="bg-purple-500/20 text-purple-400 p-2 rounded-lg">7</span> 
          CareerIQ AI Review
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-700/30">
            <h4 className="text-xs uppercase tracking-wider font-bold text-emerald-400 mb-4 flex items-center gap-2">
              <span className="bg-emerald-400/20 p-1 rounded">💪</span> Strengths
            </h4>
            <ul className="space-y-3">
              {(aiReview.strengths || ['Good coding patterns', 'Consistent commits']).map((str: string, idx: number) => (
                <li key={idx} className="flex gap-3 text-sm text-slate-300 leading-relaxed">
                  <span className="text-emerald-500 shrink-0">✓</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-700/30">
            <h4 className="text-xs uppercase tracking-wider font-bold text-rose-400 mb-4 flex items-center gap-2">
              <span className="bg-rose-400/20 p-1 rounded">📉</span> Weaknesses
            </h4>
            <ul className="space-y-3">
              {(aiReview.weaknesses || ['Lack of tests', 'Missing documentation']).map((wk: string, idx: number) => (
                <li key={idx} className="flex gap-3 text-sm text-slate-300 leading-relaxed">
                  <span className="text-rose-500 shrink-0">✕</span>
                  <span>{wk}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-700/30">
            <h4 className="text-xs uppercase tracking-wider font-bold text-blue-400 mb-4 flex items-center gap-2">
              <span className="bg-blue-400/20 p-1 rounded">💼</span> Hiring Impact
            </h4>
            <ul className="space-y-3">
              {(aiReview.hiringImpact || ['Shows potential for junior roles']).map((hi: string, idx: number) => (
                <li key={idx} className="flex gap-3 text-sm text-slate-300 leading-relaxed">
                  <span className="text-blue-500 shrink-0">→</span>
                  <span>{hi}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-400 uppercase">Recruiter Perspective</span>
            <span className="text-sm font-medium text-slate-200 bg-slate-900 px-3 py-1 rounded-lg border border-slate-700">{aiReview.recruiterPerspective || 'Needs more structured projects'}</span>
          </div>
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-400 uppercase">Interview Readiness</span>
            <span className="text-sm font-medium text-slate-200 bg-slate-900 px-3 py-1 rounded-lg border border-slate-700">{aiReview.interviewReadiness?.overallReadiness || aiReview.interviewReadiness || 'Medium'}</span>
          </div>
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 flex items-center justify-between md:col-span-2">
            <span className="text-sm font-bold text-slate-400 uppercase">Portfolio Maturity</span>
            <span className="text-sm font-medium text-slate-200 bg-slate-900 px-3 py-1 rounded-lg border border-slate-700">{aiReview.portfolioMaturity || 'Growing Phase'}</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-6 rounded-xl border border-purple-500/20 text-center">
          <h4 className="text-[10px] uppercase tracking-widest font-bold text-purple-400 mb-3">Overall Verdict</h4>
          <p className="text-lg text-slate-200 font-medium leading-relaxed italic">
            "{aiReview.overallVerdict || 'This profile demonstrates good foundational skills but lacks production-grade engineering practices. Implementing CI/CD and comprehensive testing will significantly boost hireability.'}"
          </p>
        </div>
      </div>

      {/* SECTION 8: Portfolio Gaps */}
      <div className="glass-card rounded-2xl p-8 mb-8 border border-slate-700 bg-slate-800/40 backdrop-blur-md">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="bg-orange-500/20 text-orange-400 p-2 rounded-lg">8</span> 
          Portfolio Gaps
        </h2>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50 flex flex-col items-center justify-center shrink-0 w-full md:w-64">
            <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-slate-800 mb-4">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="46%" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-800"></circle>
                <circle cx="50%" cy="50%" r="46%" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray="289" strokeDashoffset={289 - (289 * (portfolioGaps.coveragePercentage || 40)) / 100} className="text-orange-500 transition-all duration-1000"></circle>
              </svg>
              <div className="text-3xl font-black text-white">{portfolioGaps.coveragePercentage || 40}%</div>
            </div>
            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Current Coverage</p>
          </div>
          
          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50 flex-1">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 pb-3 border-b border-slate-700/50">Missing Engineering Concepts</h3>
            <div className="flex flex-wrap gap-3">
              {(portfolioGaps.missingConcepts || ['Docker', 'CI/CD', 'Testing', 'Redis', 'Microservices', 'AWS']).map((gap: string, i: number) => (
                <div key={i} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium border border-slate-600 flex items-center gap-2 hover:bg-slate-700 hover:border-orange-500/50 transition-colors">
                  <span className="text-orange-400">⚡</span> {gap}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 9: Recommended Next Projects */}
      <div className="glass-card rounded-2xl p-8 mb-8 border border-slate-700 bg-slate-800/40 backdrop-blur-md">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="bg-cyan-500/20 text-cyan-400 p-2 rounded-lg">9</span> 
          Recommended Next Projects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {wowProjects.length > 0 ? wowProjects.map((proj: any, idx: number) => {
            const getDiffColor = (diff: string) => {
              if (diff === 'Advanced' || diff === 'WOW') return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
              if (diff === 'Medium') return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
              return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            };
            return (
              <div key={idx} className="bg-slate-900/60 p-6 rounded-xl border border-slate-700/50 relative overflow-hidden group hover:-translate-y-1 transition-all hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:border-cyan-500/30 flex flex-col h-full">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-50`}></div>
                
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-white text-lg pr-4">{proj.projectName || proj.title}</h3>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border shrink-0 ${getDiffColor(proj.difficulty)}`}>
                    {proj.difficulty || 'Medium'}
                  </span>
                </div>
                
                <p className="text-sm text-slate-400 mb-6 flex-1">{proj.description || 'A full-stack application integrating modern technologies to showcase advanced engineering skills.'}</p>
                
                <div className="mt-auto">
                  <div className="mb-4">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">Skills Learned</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(proj.skillsLearned || proj.technologies || ['React', 'Node.js', 'PostgreSQL']).map((skill: string, i: number) => (
                        <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-700/50">
                    <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-slate-700">
                      <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Build Time</p>
                      <p className="text-xs font-semibold text-slate-300">{proj.estimatedBuildTime || '2-3 Weeks'}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-slate-700">
                      <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Hiring Impact</p>
                      <p className="text-xs font-semibold text-cyan-400">{proj.hiringImpact || 'Very High'}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-2 text-center py-10 bg-slate-900/30 rounded-xl border border-slate-700/30">
              <p className="text-slate-400">No project recommendations generated yet. Reanalyze your profile.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
