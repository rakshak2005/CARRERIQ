// @ts-nocheck
import React from 'react';

interface Drawback {
  issue: string;
  impactLevel: 'Critical' | 'Medium' | 'Minor';
  affectedRepositories: string[];
}

interface Recommendation {
  description: string;
  difficulty: string;
  expectedScoreGain: number;
  estimatedTime: string;
}

interface ReportData {
  drawbacksAndIssues: Drawback[];
  recommendedImprovements: Recommendation[];
  growthPotential: {
    currentScore: number;
    potentialScore: number;
    improvementPercentage: number;
  };
  aiReview: {
    strengths: string[];
    weaknesses: string[];
    hiringImpact: string[];
    overallVerdict: string;
  };
}

export const GitHubImprovementCenter = ({ report }: { report: ReportData }) => {
  if (!report || !report.drawbacksAndIssues) return null;

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'Medium': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'Minor': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const getImpactDot = (level: string) => {
    switch (level) {
      case 'Critical': return 'text-red-500';
      case 'Medium': return 'text-orange-500';
      case 'Minor': return 'text-yellow-500';
      default: return 'text-slate-500';
    }
  };

  const { growthPotential } = report;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-white mb-6">GitHub Improvement Center</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* CARD 1: DRAWBACKS & ISSUES */}
        <div className="glass-card rounded-2xl p-6 border border-slate-700 bg-slate-800/40 hover:bg-slate-800/60 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-md">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            ⚠️ Drawbacks Detected
          </h3>
          <p className="text-xs text-slate-400 mb-4">Weaknesses discovered across repositories</p>
          <div className="space-y-4">
            {report.drawbacksAndIssues.map((item, idx) => (
              <div key={idx} className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <span className="text-sm font-semibold text-slate-200">
                    <span className={getImpactDot(item.impactLevel)}>• </span>
                    {item.issue}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full border whitespace-nowrap ${getImpactColor(item.impactLevel)}`}>
                    {item.impactLevel}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-400">
                  <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">Affected Repositories</span>
                  {item.affectedRepositories.map((repo, rIdx) => (
                    <span key={rIdx} className="inline-block bg-slate-800 px-2 py-1 rounded border border-slate-700 mr-2 mb-2">
                      {repo}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CARD 2: RECOMMENDED CHANGES */}
        <div className="glass-card rounded-2xl p-6 border border-slate-700 bg-slate-800/40 hover:bg-slate-800/60 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-md">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            🚀 Recommended Improvements
          </h3>
          <p className="text-xs text-slate-400 mb-4">Prioritized actionable tasks</p>
          <div className="space-y-4">
            {report.recommendedImprovements.map((item, idx) => (
              <div key={idx} className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:bg-emerald-400 transition-colors"></div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Priority {idx + 1}</span>
                  <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700">{item.difficulty}</span>
                </div>
                <p className="text-sm text-slate-200 font-medium mb-3">{item.description}</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <span className="text-slate-500">⏱️</span> {item.estimatedTime}
                  </span>
                  <span className="text-emerald-400 font-bold bg-emerald-400/10 px-2 py-1 rounded-full">
                    +{item.expectedScoreGain} GitHub Score
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CARD 3: POTENTIAL SCORE IMPROVEMENT */}
        <div className="glass-card rounded-2xl p-6 border border-slate-700 bg-slate-800/40 hover:bg-slate-800/60 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-md flex flex-col">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            📈 Growth Potential
          </h3>
          <p className="text-xs text-slate-400 mb-6">Your expected score trajectory</p>
          
          <div className="flex flex-col gap-6 flex-grow justify-center">
            <div className="flex items-end gap-4 justify-center">
              <div className="text-center">
                <div className="text-4xl font-black text-white">{growthPotential.currentScore}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mt-1">Current Score</div>
              </div>
              <div className="text-slate-600 pb-2">→</div>
              <div className="text-center">
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">{growthPotential.potentialScore}</div>
                <div className="text-xs text-emerald-400/70 uppercase tracking-wider font-bold mt-1">Potential Score</div>
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
              <span className="text-lg font-bold text-emerald-400">+{growthPotential.potentialScore - growthPotential.currentScore} Points Possible</span>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-400 font-bold mb-2">
                <span>Current</span>
                <span>Goal</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-4 relative overflow-hidden border border-slate-700">
                <div className="absolute top-0 left-0 h-full bg-slate-600 rounded-full transition-all duration-1000" style={{ width: growthPotential.potentialScore + '%' }}></div>
                <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(52,211,153,0.5)]" style={{ width: growthPotential.currentScore + '%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULL WIDTH AI REVIEW CARD */}
      <div className="glass-card rounded-2xl p-8 border border-slate-700 bg-gradient-to-br from-slate-800/60 to-slate-900/60 shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -z-10"></div>
        
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          🎯 CareerIQ AI GitHub Review
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <h4 className="text-sm uppercase tracking-wider font-bold text-emerald-400 mb-4 flex items-center gap-2">
              <span className="bg-emerald-400/20 p-1.5 rounded-lg text-emerald-400">💪</span> Strengths
            </h4>
            <ul className="space-y-3">
              {report.aiReview.strengths.map((str, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-slate-300">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm uppercase tracking-wider font-bold text-rose-400 mb-4 flex items-center gap-2">
              <span className="bg-rose-400/20 p-1.5 rounded-lg text-rose-400">📉</span> Weaknesses
            </h4>
            <ul className="space-y-3">
              {report.aiReview.weaknesses.map((wk, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-slate-300">
                  <span className="text-rose-500 mt-0.5">✕</span>
                  <span>{wk}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-wider font-bold text-blue-400 mb-4 flex items-center gap-2">
              <span className="bg-blue-400/20 p-1.5 rounded-lg text-blue-400">💼</span> Hiring Impact
            </h4>
            <ul className="space-y-3">
              {report.aiReview.hiringImpact.map((hi, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-slate-300">
                  <span className="text-blue-500 mt-0.5">→</span>
                  <span>{hi}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <h4 className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-3">Overall Verdict</h4>
          <p className="text-lg text-slate-200 font-medium leading-relaxed italic">
            "{report.aiReview.overallVerdict}"
          </p>
        </div>
      </div>
    </div>
  );
};
