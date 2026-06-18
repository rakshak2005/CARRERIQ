import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import studentRoutes from './routes/student';
import recruiterRoutes from './routes/recruiter';
import analysisRoutes from './routes/analysis';
import githubRoutes from './routes/github';
import githubReportRoutes from './routes/githubReport';
import resumeRoutes from './routes/resume';
import { connectMongoDB } from './db/mongo';
import { startWorker } from './services/worker';

dotenv.config();

if (process.env.GITHUB_TOKEN === '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') {
  console.log('[INFO] Bypassing pre-configured invalid GITHUB_TOKEN to allow public API requests.');
  delete process.env.GITHUB_TOKEN;
}

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*', // For local testing and development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());

// Serve static upload files
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/github/report', githubReportRoutes);
app.use('/api/resume', resumeRoutes);

// Root health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'CareerIQ API is up and running!',
    version: '1.0.0'
  });
});

// Start Server
app.listen(PORT, async () => {
  console.log(`========================================`);
  console.log(`🚀 CareerIQ Server started on port ${PORT}`);
  console.log(`📍 API Base: http://localhost:${PORT}`);
  console.log(`📁 Uploads served from: ${uploadsPath}`);
  console.log(`========================================`);
  
  // Establish MongoDB connection & spin up queue worker thread
  await connectMongoDB();
  try {
    startWorker();
    console.log(`⚙️  MongoDB & BullMQ Worker Pool Initialized.`);
  } catch (err: any) {
    console.error(`[WARNING] Failed to start BullMQ worker:`, err.message);
  }
  console.log(`========================================`);
});
//
