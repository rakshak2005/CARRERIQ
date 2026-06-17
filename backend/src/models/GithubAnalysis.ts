import { Schema, model, Document } from 'mongoose';

export interface IGithubAnalysis extends Document {
  githubUrl: string;
  username: string;
  githubScore: number;
  breakdown: {
    activity: number;
    projects: number;
    quality: number;
    techStack: number;
    community: number;
  };
  recommendations: string[];
  repositories: Array<{
    name: string;
    description: string;
    url: string;
    language: string;
    stars: number;
    forks: number;
    updatedAt: Date;
    topics: string[];
    hasReadme: boolean;
  }>;
  technologies: string[];
  lastActivity: Date;
  analyzedAt: Date;
}

const GithubAnalysisSchema = new Schema<IGithubAnalysis>(
  {
    githubUrl: { type: String, required: true },
    username: { type: String, required: true, index: true },
    githubScore: { type: Number, required: true },
    breakdown: {
      activity: { type: Number, default: 0 },
      projects: { type: Number, default: 0 },
      quality: { type: Number, default: 0 },
      techStack: { type: Number, default: 0 },
      community: { type: Number, default: 0 },
    },
    recommendations: [{ type: String }],
    repositories: [
      {
        name: String,
        description: String,
        url: String,
        language: String,
        stars: Number,
        forks: Number,
        updatedAt: Date,
        topics: [String],
        hasReadme: Boolean,
      },
    ],
    technologies: [{ type: String }],
    lastActivity: { type: Date },
    analyzedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const GithubAnalysis = model<IGithubAnalysis>('GithubAnalysis', GithubAnalysisSchema);
