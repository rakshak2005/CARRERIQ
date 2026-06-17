import dotenv from 'dotenv';
dotenv.config({ path: 'c:/PROJECTS/CareerIQ/backend/.env' });
import { db } from './src/db';

async function checkRepos() {
  const profile = await db.getStudentProfileByUserId(1); // or whatever user ID
  if (profile) {
    console.log('githubRepositories:', profile.github_repositories);
  }
}
checkRepos().catch(console.error).finally(() => process.exit(0));
