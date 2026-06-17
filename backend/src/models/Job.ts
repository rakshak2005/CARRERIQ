import { Schema, model, Document } from 'mongoose';

export interface IJob extends Document {
  githubUrl: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  progress: number;
  progressMessage: string;
  error?: string;
  result?: any;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    githubUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'failed'],
      default: 'pending',
    },
    progress: { type: Number, default: 0 },
    progressMessage: { type: String, default: 'Queued' },
    error: { type: String },
    result: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Job = model<IJob>('Job', JobSchema);
