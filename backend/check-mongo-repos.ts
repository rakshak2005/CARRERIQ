import dotenv from 'dotenv';
dotenv.config({ path: 'c:/PROJECTS/CareerIQ/backend/.env' });
import mongoose from 'mongoose';
import { db } from './src/db';

async function checkRepos() {
  await mongoose.connect(process.env.MONGO_URI || '');
  console.log('MongoDB Connected!');

  // Wait 3 seconds for checkDbState to flip useMockDb to false!
  await new Promise(resolve => setTimeout(resolve, 3000));

  for (const userId of [1, 2, 3]) {
    const p = await db.getStudentProfileByUserId(userId);
    if (p) {
      console.log(`- ID: ${p.id}, UserID: ${p.user_id}, Name: ${p.full_name}, Username: ${p.github_username}, Onboard: ${p.onboarding_completed}`);
      console.log(`  githubRepositories length: ${p.github_repositories ? p.github_repositories.length : 0}`);
      console.log(`  portfolioProjects length: ${p.portfolio_projects ? p.portfolio_projects.length : 0}`);
      console.log(`  portfolioRecommendations length: ${p.portfolio_recommendations ? p.portfolio_recommendations.length : 0}`);
    } else {
      console.log(`- UserID: ${userId} not found`);
    }
  }

  await mongoose.disconnect();
}
checkRepos().catch(console.error);
