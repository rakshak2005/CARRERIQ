import dotenv from 'dotenv';
dotenv.config({ path: 'c:/PROJECTS/CareerIQ/backend/.env' });
import mongoose from 'mongoose';
import { analysisDb } from './src/db/mongoService';

async function checkJobs() {
  await mongoose.connect(process.env.MONGO_URI || '');
  const jobs = await mongoose.connection.collection('analysis_jobs').find().toArray();
  console.log('Total jobs:', jobs.length);
  for (const job of jobs) {
    console.log('Job:', job._id, 'Url:', job.githubUrl, 'Status:', job.status, 'Error:', job.error);
  }
  mongoose.connection.close();
}
checkJobs();
