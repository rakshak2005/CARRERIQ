/**
 * Full end-to-end test of the GitHub analysis pipeline.
 * This script simulates what happens when user clicks "Analyze" in the frontend.
 */
import dotenv from 'dotenv';
dotenv.config();

import { fetchGitHubStats } from './src/services/githubService';
import { generateAIEvaluation, generateGitHubImprovementReport } from './src/services/aiService';

const GITHUB_URL = 'https://github.com/rakshak2005';

async function testFullPipeline() {
  console.log('='.repeat(60));
  console.log('CAREERIQ GITHUB ANALYSIS - END TO END TEST');
  console.log('='.repeat(60));
  
  // Step 1: Check token
  const token = process.env.GITHUB_TOKEN;
  console.log(`\n[1] GitHub Token: ${token ? '✅ Present (' + token.substring(0, 10) + '...)' : '❌ MISSING!'}`);
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY;
  console.log(`[2] Gemini Key: ${geminiKey ? '✅ Present' : '❌ MISSING!'}`);
  
  // Step 2: Fetch GitHub Stats
  console.log(`\n[3] Fetching GitHub stats for: ${GITHUB_URL}`);
  try {
    const stats = await fetchGitHubStats(GITHUB_URL);
    console.log(`    ✅ Fetched profile: ${stats.name} (@${stats.username})`);
    console.log(`    📊 Repos: ${stats.repos}, Followers: ${stats.followers}, Stars: ${stats.stars}`);
    console.log(`    🏆 Score: ${stats.score}/100`);
    console.log(`    📁 Repositories fetched: ${stats.repositories?.length || 0}`);
    if (stats.repositories && stats.repositories.length > 0) {
      console.log(`    📌 Top repos:`);
      stats.repositories.slice(0, 5).forEach((r: any) => {
        console.log(`       - ${r.name} (${r.languages?.join(', ') || 'no languages detected'})`);
      });
    }
    
    // Step 3: Test AI evaluation
    if (geminiKey) {
      console.log(`\n[4] Testing AI evaluation with gemini-1.5-flash...`);
      try {
        const aiEval = await generateAIEvaluation(
          stats.username,
          stats.bio || '',
          ['Node.js', 'React'],
          stats.repositories?.slice(0, 3) || [],
          stats.consistencyScore
        );
        console.log(`    ✅ AI Evaluation succeeded!`);
        console.log(`    💪 Strengths: ${aiEval.strengths?.length || 0}`);
        console.log(`    ⚠️ Weaknesses: ${aiEval.weaknesses?.length || 0}`);
      } catch (e: any) {
        console.warn(`    ⚠️ AI Evaluation failed (will use simulated): ${e.message}`);
      }
      
      console.log(`\n[5] Testing improvement report...`);
      try {
        const report = await generateGitHubImprovementReport(
          stats.username,
          'Software Engineer',
          ['Node.js', 'React'],
          stats.repositories?.slice(0, 3) || [],
          stats.score
        );
        if (report) {
          console.log(`    ✅ Improvement report generated!`);
          console.log(`    📋 Issues found: ${report.drawbacksAndIssues?.length || 0}`);
          console.log(`    💡 Recommendations: ${report.recommendedImprovements?.length || 0}`);
        } else {
          console.warn(`    ⚠️ Report returned null (Gemini may be rate limited)`);
        }
      } catch (e: any) {
        console.warn(`    ⚠️ Improvement report failed: ${e.message}`);
      }
    } else {
      console.log(`\n[4] Skipping AI tests (no Gemini key configured)`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ PIPELINE TEST PASSED! Real repos fetched successfully.');
    console.log('='.repeat(60));
  } catch (e: any) {
    console.error(`\n❌ PIPELINE FAILED: ${e.message}`);
    process.exit(1);
  }
}

testFullPipeline().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
