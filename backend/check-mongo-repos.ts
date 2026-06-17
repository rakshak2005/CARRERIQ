import dotenv from 'dotenv';
dotenv.config({ path: 'c:/PROJECTS/CareerIQ/backend/.env' });
import mongoose from 'mongoose';
import { db } from './src/db';

async function checkRepos() {
  await mongoose.connect(process.env.MONGO_URI || '');
  console.log('MongoDB Connected!');

  // Wait 3 seconds for checkDbState to flip useMockDb to false!
  await new Promise(resolve => setTimeout(resolve, 3000));

  const profile = await db.getStudentProfileByUserId(1); // the mock user id used in JWT is 1
  if (profile) {
    console.log('githubRepositories length:', profile.github_repositories ? JSON.parse(profile.github_repositories).length : 0);
    console.log('githubRepositories:', profile.github_repositories);
  } else {
    console.log('Profile not found for ID 1');
  }

  await mongoose.disconnect();
}
checkRepos().catch(console.error);
