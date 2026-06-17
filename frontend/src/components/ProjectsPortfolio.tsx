import React, { useState } from 'react';
import { api } from '../services/api';

interface ProjectsPortfolioProps {
  portfolioProjects: any[];
  portfolioScore: number;
  portfolioInsights: any;
  portfolioRecommendations: any[];
  onSyncComplete: (data: any) => void;
  onAddProject: () => void;
}

export const ProjectsPortfolio: React.FC<ProjectsPortfolioProps> = ({
  portfolioProjects,
  portfolioScore,
  portfolioInsights,
  portfolioRecommendations,
  onSyncComplete,
  onAddProject
}) => {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async (forceRegenerate: boolean = false) => {
    setSyncing(true);
    try {
      const res = await api.student.syncPortfolio(forceRegenerate);
      onSyncComplete(res);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error syncing portfolio');
    } finally {
      setSyncing(false);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'bg-green-500/20 text-green-400';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'Advanced': return 'bg-orange-500/20 text-orange-400';
      case 'WOW': return 'bg-pink-500/20 text-pink-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Sync */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Project Intelligence Portfolio</h2>
          <p className="text-gray-400 text-sm max-w-xl">
            A unified view of your manual and resume-extracted projects. Ranked, evaluated, and scored for role relevance and complexity.
          </p>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="text-center bg-[#1f2937] px-6 py-3 rounded-xl border border-gray-700">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Portfolio Score</div>
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              {portfolioScore || 0}
              <span className="text-lg text-gray-500 font-medium">/100</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={onAddProject}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
            >
              <span>+</span> Add Manual Project
            </button>
            <button
              onClick={() => handleSync(true)}
              disabled={syncing}
              className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 border border-gray-700 px-4 py-2 rounded-lg font-medium transition-colors text-xs"
            >
              Regenerate AI Ideas
            </button>
          </div>
        </div>
      </div>

      {/* Insights & Gap Analysis */}
      {portfolioInsights && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-md hover:border-gray-700 transition-colors">
              <h3 className="text-indigo-400 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="text-lg">🏆</span> Best Project
              </h3>
              {portfolioInsights.strongestProject ? (
                <div>
                  <div className="text-white font-semibold text-lg">{portfolioInsights.strongestProject.title}</div>
                  <div className="text-gray-400 text-sm mt-1 mb-3 line-clamp-2">{portfolioInsights.strongestProject.description}</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-md">Score: {portfolioInsights.strongestProject.projectScore}</span>
                    <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-md">{portfolioInsights.strongestProject.projectType}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">No projects evaluated yet.</p>
              )}
            </div>

            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-md hover:border-gray-700 transition-colors">
              <h3 className="text-emerald-400 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="text-lg">📊</span> Resume Project Ordering
              </h3>
              {portfolioInsights.bestResumeProjectOrder && portfolioInsights.bestResumeProjectOrder.length > 0 ? (
                <ul className="space-y-3">
                  {portfolioInsights.bestResumeProjectOrder.map((title: string, i: number) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      <span className="text-gray-200 text-sm truncate">{title}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm italic">No projects evaluated yet.</p>
              )}
            </div>

            <div className="bg-[#111827] border border-red-900/30 rounded-2xl p-6 shadow-md hover:border-red-800/50 transition-colors">
              <h3 className="text-red-400 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="text-lg">⚠️</span> Gap Analysis
              </h3>
              {portfolioInsights.missingConcepts && portfolioInsights.missingConcepts.length > 0 ? (
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-2 uppercase font-semibold">Missing Technical Concepts</div>
                  <div className="flex flex-wrap gap-2">
                    {portfolioInsights.missingConcepts.slice(0, 4).map((c: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-md">{c}</span>
                    ))}
                  </div>
                </div>
              ) : null}
              {portfolioInsights.missingTechnologies && portfolioInsights.missingTechnologies.length > 0 ? (
                <div>
                  <div className="text-xs text-gray-500 mb-2 uppercase font-semibold">Missing Target Role Keywords</div>
                  <div className="flex flex-wrap gap-2">
                    {portfolioInsights.missingTechnologies.map((t: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs rounded-md">{t}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Portfolio looks well-rounded for the target role.</p>
              )}
            </div>
          </div>

          {/* Portfolio Coverage Visualization */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-md mt-6">
            <h3 className="text-gray-300 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="text-lg">📈</span> Portfolio Coverage
            </h3>
            {portfolioInsights.projectTypeCoverage && Object.keys(portfolioInsights.projectTypeCoverage).length > 0 ? (
              <div className="space-y-4">
                <div className="flex h-3 w-full rounded-full overflow-hidden bg-gray-800">
                  {Object.entries(portfolioInsights.projectTypeCoverage).map(([type, count]: [string, any], idx: number) => {
                    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-pink-500', 'bg-orange-500'];
                    const total = Object.values(portfolioInsights.projectTypeCoverage).reduce((a: any, b: any) => a + b, 0) as number;
                    const width = `${(count / total) * 100}%`;
                    return <div key={idx} style={{ width }} className={`${colors[idx % colors.length]}`} title={`${type}: ${count}`} />
                  })}
                </div>
                <div className="flex flex-wrap gap-4 text-xs font-medium">
                  {Object.entries(portfolioInsights.projectTypeCoverage).map(([type, count]: [string, any], idx: number) => {
                    const textColors = ['text-blue-400', 'text-purple-400', 'text-emerald-400', 'text-pink-400', 'text-orange-400'];
                    const bgColors = ['bg-blue-500/10', 'bg-purple-500/10', 'bg-emerald-500/10', 'bg-pink-500/10', 'bg-orange-500/10'];
                    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-pink-500', 'bg-orange-500'];
                    const total = Object.values(portfolioInsights.projectTypeCoverage).reduce((a: any, b: any) => a + b, 0) as number;
                    return (
                      <div key={idx} className={`px-3 py-1.5 rounded-md ${bgColors[idx % bgColors.length]} flex items-center gap-2 border border-gray-700/50`}>
                        <span className={`w-2 h-2 rounded-full ${colors[idx % colors.length]}`} />
                        <span className={textColors[idx % textColors.length]}>{type}</span>
                        <span className="text-gray-400 font-bold ml-1">{Math.round((count / total) * 100)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">No coverage data available.</p>
            )}
          </div>
        </>
      )}

      {/* Ranked Projects List */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-6 py-5 border-b border-gray-800 bg-[#1f2937]/50">
          <h3 className="text-lg font-bold text-white">Ranked Portfolio Projects</h3>
        </div>
        <div className="divide-y divide-gray-800/50">
          {(!portfolioProjects || portfolioProjects.length === 0) ? (
            <div className="p-8 text-center text-gray-500 italic">No projects found. Sync portfolio to evaluate existing projects.</div>
          ) : (
            [...portfolioProjects]
              .sort((a, b) => (b.projectScore || 0) - (a.projectScore || 0))
              .map((p, idx) => (
                <div key={idx} className="p-6 hover:bg-[#1f2937]/30 transition-colors">
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-8 h-8 rounded-full bg-gray-800 text-gray-300 flex items-center justify-center font-bold text-sm border border-gray-700">
                          #{idx + 1}
                        </span>
                        <h4 className="text-xl font-bold text-gray-100">{p.title}</h4>
                        {p.source === 'resume' && (
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">Extracted from Resume</span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-2">{p.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {p.technologies?.slice(0, 8).map((tech: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-md border border-gray-700">{tech}</span>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:w-1/2">
                      <div className="bg-[#111827] p-3 rounded-xl border border-gray-800 flex flex-col items-center justify-center text-center">
                        <div className="text-xs text-gray-500 mb-1">Complexity</div>
                        <div className="text-lg font-bold text-blue-400">{p.complexityScore || 0}<span className="text-xs text-gray-600">/40</span></div>
                      </div>
                      <div className="bg-[#111827] p-3 rounded-xl border border-gray-800 flex flex-col items-center justify-center text-center">
                        <div className="text-xs text-gray-500 mb-1">Tech Score</div>
                        <div className="text-lg font-bold text-emerald-400">{p.technologyScore || 0}<span className="text-xs text-gray-600">/20</span></div>
                      </div>
                      <div className="bg-[#111827] p-3 rounded-xl border border-gray-800 flex flex-col items-center justify-center text-center">
                        <div className="text-xs text-gray-500 mb-1">Role Match</div>
                        <div className="text-lg font-bold text-purple-400">{p.roleRelevanceScore || 0}<span className="text-xs text-gray-600">/25</span></div>
                      </div>
                      <div className="bg-[#1f2937] p-3 rounded-xl border border-gray-700 flex flex-col items-center justify-center text-center shadow-inner">
                        <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">Total Score</div>
                        <div className="text-2xl font-black text-white">{p.projectScore || 0}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* AI WOW Project Recommendations */}
      {portfolioRecommendations && portfolioRecommendations.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-xl font-bold text-white">AI Recommended Next Projects</h3>
            <span className="px-3 py-1 bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 text-xs font-bold rounded-full border border-pink-500/30 uppercase tracking-wide">
              Portfolio Builders
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {portfolioRecommendations.map((rec: any, idx: number) => (
              <div key={idx} className={`relative bg-[#111827] border rounded-2xl p-6 shadow-xl transition-transform hover:-translate-y-1 ${rec.difficulty === 'WOW' ? 'border-pink-500/50' : 'border-gray-800 hover:border-gray-700'}`}>
                {rec.difficulty === 'WOW' && (
                  <div className="absolute top-0 right-0 px-4 py-1.5 bg-pink-500 text-white text-xs font-black rounded-bl-2xl rounded-tr-xl uppercase tracking-wider shadow-[0_0_15px_rgba(236,72,153,0.5)]">
                    WOW Project
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getDifficultyColor(rec.difficulty)}`}>
                    {rec.difficulty}
                  </span>
                </div>

                <h4 className={`text-xl font-bold mb-3 ${rec.difficulty === 'WOW' ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400' : 'text-gray-100'}`}>
                  {rec.title}
                </h4>

                <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                  {rec.description}
                </p>

                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-semibold mb-2">Skills Learned</div>
                    <div className="flex flex-wrap gap-2">
                      {rec.skillsLearned?.map((skill: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-[#1f2937] text-gray-300 text-xs rounded-md border border-gray-700">{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#1a2234] rounded-xl p-4 border border-gray-800/50 space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-blue-400 mt-0.5">📄</span>
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">Resume Impact</div>
                        <div className="text-sm text-gray-300 mt-1">{rec.resumeImpact}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-emerald-400 mt-0.5">💼</span>
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">Hiring Impact</div>
                        <div className="text-sm text-gray-300 mt-1">{rec.hiringImpact}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
