import mongoose from 'mongoose';
import dotenv from 'dotenv';


dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/careeriq';

export const connectMongoDB = async (): Promise<void> => {
  try {
    // Disable strictQuery warning
    mongoose.set('strictQuery', false);
    // Timeout in 5 seconds instead of hanging
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[SUCCESS] Successfully connected to MongoDB Database.');
  } catch (err: any) {
    console.error('[ERROR] Failed to connect to MongoDB. Exiting...');
    console.error('[REASON]', err.message);
    process.exit(1);
  }
};
