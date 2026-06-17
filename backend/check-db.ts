import mongoose from 'mongoose';
import { analysisDb } from './src/db/mongoService';
import dotenv from 'dotenv';
dotenv.config();

async function checkProfile() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careeriq');
  const profile = await analysisDb.findProfileByUrl('https://github.com/rakshak2005');
  if (!profile) {
    console.log('Profile not found.');
  } else {
    console.log('Profile found.');
    console.log('Has githubImprovementReport:', !!profile.githubImprovementReport);
    if (profile.githubImprovementReport) {
      console.log('problemsDetected:', profile.githubImprovementReport.problemsDetected);
    }
  }
  mongoose.connection.close();
}
checkProfile();
