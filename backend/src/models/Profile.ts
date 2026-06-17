import { Schema, model, Document } from 'mongoose';

export interface IProfile extends Document {
  githubUrl: string;
  githubUsername: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  blogUrl?: string;
  employabilityScore: number;
  metrics: {
    repositoryQuality: number;
    projectComplexity: number;
    activityConsistency: number;
    techStackDemand: number;
    documentation: number;
    openSource: number;
  };
  metadata: {
    publicRepos: number;
    followers: number;
    stars: number;
    accountAgeYears: number;
    lastAnalyzed: Date;
  };
  careerRoadmap?: {
    strengths: string[];
    weaknesses: string[];
    missingSkills: string[];
    recommendedProjects: Array<{
      title: string;
      description: string;
      milestones: string[];
    }>;
    learningRoadmap: Array<{
      topic: string;
      duration: string;
      resource: string;
    }>;
    targetRoles: Array<{
      role: string;
      matchPercentage: number;
    }>;
    interviewReadiness: {
      systemDesignScore: number;
      dataStructuresScore: number;
      behavioralScore: number;
      overallReadiness: 'High' | 'Medium' | 'Low';
    };
    nextRecommendedProject: {
      title: string;
      description: string;
      milestones: string[];
    };
  };
  githubImprovementReport?: {
    drawbacksAndIssues: Array<{
      issue: string;
      impactLevel: 'Critical' | 'Medium' | 'Minor';
      affectedRepositories: string[];
    }>;
    recommendedImprovements: Array<{
      description: string;
      difficulty: string;
      expectedScoreGain: number;
      estimatedTime: string;
    }>;
    growthPotential: {
      currentScore: number;
      potentialScore: number;
      improvementPercentage: number;
    };
    aiReview: {
      strengths: string[];
      weaknesses: string[];
      hiringImpact: string[];
      overallVerdict: string;
    };
  };
}

const ProfileSchema = new Schema<IProfile>(
  {
    githubUrl: { type: String, required: true, unique: true },
    githubUsername: { type: String, required: true, index: true },
    fullName: { type: String, required: true },
    avatarUrl: { type: String },
    bio: { type: String },
    location: { type: String },
    blogUrl: { type: String },
    employabilityScore: { type: Number, default: 0 },
    metrics: {
      repositoryQuality: { type: Number, default: 0 },
      projectComplexity: { type: Number, default: 0 },
      activityConsistency: { type: Number, default: 0 },
      techStackDemand: { type: Number, default: 0 },
      documentation: { type: Number, default: 0 },
      openSource: { type: Number, default: 0 },
    },
    metadata: {
      publicRepos: { type: Number, default: 0 },
      followers: { type: Number, default: 0 },
      stars: { type: Number, default: 0 },
      accountAgeYears: { type: Number, default: 0 },
      lastAnalyzed: { type: Date, default: Date.now },
    },
    careerRoadmap: {
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      missingSkills: [{ type: String }],
      recommendedProjects: [
        {
          title: String,
          description: String,
          milestones: [String],
        },
      ],
      learningRoadmap: [
        {
          topic: String,
          duration: String,
          resource: String,
        },
      ],
      targetRoles: [
        {
          role: String,
          matchPercentage: Number,
        },
      ],
      interviewReadiness: {
        systemDesignScore: { type: Number, default: 50 },
        dataStructuresScore: { type: Number, default: 50 },
        behavioralScore: { type: Number, default: 50 },
        overallReadiness: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
      },
      nextRecommendedProject: {
        title: String,
        description: String,
        milestones: [String],
      },
    },
    githubImprovementReport: {
      drawbacksAndIssues: [
        {
          issue: { type: String },
          impactLevel: { type: String, enum: ['Critical', 'Medium', 'Minor'] },
          affectedRepositories: [{ type: String }]
        }
      ],
      recommendedImprovements: [
        {
          description: { type: String },
          difficulty: { type: String },
          expectedScoreGain: { type: Number },
          estimatedTime: { type: String }
        }
      ],
      growthPotential: {
        currentScore: { type: Number },
        potentialScore: { type: Number },
        improvementPercentage: { type: Number }
      },
      aiReview: {
        strengths: [{ type: String }],
        weaknesses: [{ type: String }],
        hiringImpact: [{ type: String }],
        overallVerdict: { type: String }
      }
    },
  },
  { timestamps: true }
);

export const Profile = model<IProfile>('Profile', ProfileSchema);
