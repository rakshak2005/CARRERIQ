import dotenv from 'dotenv';
dotenv.config({ path: 'c:/PROJECTS/CareerIQ/backend/.env' });
import mongoose from 'mongoose';
import { analysisDb } from './src/db/mongoService';

async function checkProfile() {
  await mongoose.connect(process.env.MONGO_URI || '');
  const profile = await analysisDb.findProfileByUsername('rakshak2005');
  if (!profile) {
    console.log('Profile not found for username.');
  } else {
    console.log('Profile found:', profile.githubUrl);
    console.log('Has githubImprovementReport:', !!profile.githubImprovementReport);
    if (profile.githubImprovementReport) {
      console.log('Report keys:', Object.keys(profile.githubImprovementReport));
    }
  }
  mongoose.connection.close();
}
checkProfile();
