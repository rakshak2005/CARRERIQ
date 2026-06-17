import dotenv from 'dotenv';
dotenv.config({ path: 'c:/PROJECTS/CareerIQ/backend/.env' });
import mongoose from 'mongoose';
import { analysisDb } from './src/db/mongoService';

async function run() {
  await mongoose.connect(process.env.MONGO_URI || '');
  console.log('Connected to DB');

  const githubImprovementReport = {
    problemsDetected: ["Problem 1", "Problem 2"],
    careerRecommendations: {
      missingEngineeringPractices: ["Practice 1", "Practice 2"],
      missingTechnologies: ["Tech 1", "Tech 2"]
    }
  };

  const profile = await analysisDb.upsertProfile('https://github.com/test12345', {
    githubUsername: 'test12345',
    overallScore: 100,
    githubImprovementReport
  });

  console.log('Saved profile:', profile);
  
  const found = await analysisDb.findProfileByUrl('https://github.com/test12345');
  console.log('Found profile improvement report:', found?.githubImprovementReport);

  mongoose.connection.close();
}

run();
