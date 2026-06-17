import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');

let useMockQueue = false;
let loggedRedisError = false;

export const getUseMockQueue = () => useMockQueue;

export const redisConnection = new IORedis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  maxRetriesPerRequest: null, // Required by BullMQ
});

// Suppress unhandled error log spam when Redis is offline
redisConnection.on('error', (err: any) => {
  if (!useMockQueue) {
    useMockQueue = true;
  }
  if (!loggedRedisError) {
    console.warn('[WARNING] Failed to connect to Redis. Queue worker will run in simulated/mock mode.');
    console.warn('[REASON]', err.message || err);
    loggedRedisError = true;
  }
});

export const analysisQueue = new Queue('github-analysis', {
  connection: redisConnection as any,
});

// Catch connection errors on the Queue instance to prevent unhandled process crashes
analysisQueue.on('error', (err: any) => {
  if (!useMockQueue) {
    useMockQueue = true;
  }
});

let jobProcessor: ((jobId: string, githubUrl: string) => Promise<void>) | null = null;

export const registerJobProcessor = (processor: (jobId: string, githubUrl: string) => Promise<void>) => {
  jobProcessor = processor;
};

export const triggerGitHubAnalysis = async (userId: number, githubUrl: string, jobId: string): Promise<string> => {
  if (useMockQueue) {
    console.log(`[Queue Mock] Enqueued simulated analysis job ${jobId} for URL: ${githubUrl}`);
    
    // Simulate background worker execution after a small delay
    setTimeout(async () => {
      if (jobProcessor) {
        try {
          await jobProcessor(jobId, githubUrl);
        } catch (err: any) {
          console.error(`[Queue Mock ERROR] Simulated worker failed for job ${jobId}:`, err.message);
        }
      } else {
        console.error(`[Queue Mock ERROR] No job processor registered!`);
      }
    }, 2000);
    
    return jobId;
  }

  const job = await analysisQueue.add(
    'analyze-profile',
    { userId, githubUrl },
    {
      jobId,
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    }
  );
  return job.id || '';
};
