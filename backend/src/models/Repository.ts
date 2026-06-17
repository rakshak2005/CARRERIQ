import { Schema, model, Document } from 'mongoose';

export interface IRepository extends Document {
  profileId: Schema.Types.ObjectId;
  name: string;
  description?: string;
  url: string;
  isFork: boolean;
  stars: number;
  languages: string[];
  techStack: string[];
  complexityScore: number;
  documentationScore: number;
  productionReadinessScore: number;
  architecturePattern: string;
  fileStructureAnalysis: {
    hasTests: boolean;
    hasDocker: boolean;
    hasCICD: boolean;
    folderDepth: number;
    moduleCount: number;
  };
  strengths: string[];
  improvements: string[];
}

const RepositorySchema = new Schema<IRepository>(
  {
    profileId: { type: Schema.Types.ObjectId, ref: 'Profile', required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    url: { type: String, required: true },
    isFork: { type: Boolean, default: false },
    stars: { type: Number, default: 0 },
    languages: [{ type: String }],
    techStack: [{ type: String }],
    complexityScore: { type: Number, default: 0 },
    documentationScore: { type: Number, default: 0 },
    productionReadinessScore: { type: Number, default: 0 },
    architecturePattern: { type: String, default: 'Standard' },
    fileStructureAnalysis: {
      hasTests: { type: Boolean, default: false },
      hasDocker: { type: Boolean, default: false },
      hasCICD: { type: Boolean, default: false },
      folderDepth: { type: Number, default: 0 },
      moduleCount: { type: Number, default: 0 },
    },
    strengths: [{ type: String }],
    improvements: [{ type: String }],
  },
  { timestamps: true }
);

export const Repository = model<IRepository>('Repository', RepositorySchema);
