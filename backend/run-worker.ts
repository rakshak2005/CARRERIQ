import dotenv from 'dotenv';
dotenv.config({ path: 'c:/PROJECTS/CareerIQ/backend/.env' });
import { processAnalysisJob } from './src/services/worker';
import mongoose from 'mongoose';

async function run() {
  await mongoose.connect(process.env.MONGO_URI || '');
  console.log('Running worker manually for rakshak2005...');
  try {
    const validId = new mongoose.Types.ObjectId().toString();
    await processAnalysisJob(validId, 'https://github.com/rakshak2005');
    console.log('Worker finished.');
  } catch (err) {
    console.error('Worker failed:', err);
  }
  mongoose.connection.close();
}
run();
