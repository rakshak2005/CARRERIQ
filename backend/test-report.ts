import dotenv from 'dotenv';
dotenv.config();
import { generateGitHubImprovementReport } from './src/services/aiService';

async function run() {
  console.log('Testing generateGitHubImprovementReport...');
  const result = await generateGitHubImprovementReport(
    'rakshak2005',
    'Software Engineer',
    ['TypeScript', 'React'],
    [{name: 'repo1', description: 'desc', languages: ['ts'], complexityScore: 50, docScore: 50, prodScore: 50}],
    69
  );
  console.log('Result:', JSON.stringify(result, null, 2));
}

run();
