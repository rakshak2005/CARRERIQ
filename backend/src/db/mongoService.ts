import mongoose from 'mongoose';
import { Job } from '../models/Job';
import { Profile } from '../models/Profile';
import { Repository } from '../models/Repository';

let useMockMongo = false;

// In-memory mock storage
const mockMongo = {
  jobs: new Map<string, any>(),
  profiles: new Map<string, any>(),
  repositories: new Map<string, any[]>(),
  jobCounter: 1,
  profileCounter: 1,
};

export const setUseMockMongo = (val: boolean) => {
  useMockMongo = val;
  if (val) {
    console.log('[INFO] MongoDB service set to use mock in-memory storage.');
  }
};

export const getUseMockMongo = () => useMockMongo;

export const analysisDb = {
  findJobById: async (jobId: string) => {
    if (useMockMongo) {
      return mockMongo.jobs.get(jobId) || null;
    }
    return Job.findById(jobId);
  },

  createJob: async (githubUrl: string) => {
    if (useMockMongo) {
      const id = `mock_job_${mockMongo.jobCounter++}`;
      const newJob = {
        _id: id,
        githubUrl,
        status: 'pending',
        progress: 0,
        progressMessage: 'Analysis job queued...',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockMongo.jobs.set(id, newJob);
      return newJob;
    }
    const newJob = new Job({
      githubUrl,
      status: 'pending',
      progress: 0,
      progressMessage: 'Analysis job queued...'
    });
    await newJob.save();
    return newJob;
  },

  updateJob: async (jobId: string, fields: any) => {
    if (useMockMongo) {
      const job = mockMongo.jobs.get(jobId);
      if (job) {
        Object.assign(job, fields);
        job.updatedAt = new Date();
        mockMongo.jobs.set(jobId, job);
      }
      return job || null;
    }
    return Job.findOneAndUpdate({ _id: jobId }, fields, { new: true });
  },

  findProfileByUrl: async (githubUrl: string) => {
    if (useMockMongo) {
      const lowerUrl = githubUrl.toLowerCase();
      for (const p of mockMongo.profiles.values()) {
        if (p.githubUrl && p.githubUrl.toLowerCase() === lowerUrl) return p;
      }
      return null;
    }
    return Profile.findOne({ githubUrl: { $regex: new RegExp(`^${githubUrl}$`, 'i') } });
  },

  findProfileByUsername: async (username: string) => {
    if (useMockMongo) {
      const lowerUser = username.toLowerCase();
      for (const p of mockMongo.profiles.values()) {
        if (p.githubUsername && p.githubUsername.toLowerCase() === lowerUser) return p;
      }
      return null;
    }
    return Profile.findOne({ githubUsername: { $regex: new RegExp(`^${username}$`, 'i') } });
  },

  upsertProfile: async (githubUrl: string, fields: any) => {
    if (useMockMongo) {
      let foundProfile: any = null;
      for (const p of mockMongo.profiles.values()) {
        if (p.githubUrl === githubUrl) {
          foundProfile = p;
          break;
        }
      }

      if (foundProfile) {
        Object.assign(foundProfile, fields);
        foundProfile.updatedAt = new Date();
      } else {
        const id = `mock_profile_${mockMongo.profileCounter++}`;
        foundProfile = {
          _id: id,
          githubUrl,
          ...fields,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockMongo.profiles.set(id, foundProfile);
      }
      return foundProfile;
    }
    return Profile.findOneAndUpdate({ githubUrl }, fields, { upsert: true, new: true });
  },

  deleteRepositories: async (profileId: string) => {
    if (useMockMongo) {
      mockMongo.repositories.delete(profileId);
      return;
    }
    const idToUse = mongoose.Types.ObjectId.isValid(profileId) ? new mongoose.Types.ObjectId(profileId) : profileId;
    await Repository.deleteMany({ profileId: idToUse as any });
  },

  insertRepositories: async (repos: any[]) => {
    if (useMockMongo) {
      if (repos.length === 0) return [];
      const profileId = repos[0].profileId;
      const current = mockMongo.repositories.get(profileId) || [];
      const withIds = repos.map((r, i) => ({
        _id: `${profileId}_repo_${i}`,
        ...r,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      mockMongo.repositories.set(profileId, [...current, ...withIds]);
      return withIds;
    }
    return Repository.insertMany(repos);
  },

  findRepositories: async (profileId: string) => {
    if (useMockMongo) {
      return mockMongo.repositories.get(profileId) || [];
    }
    const idToUse = mongoose.Types.ObjectId.isValid(profileId) ? new mongoose.Types.ObjectId(profileId) : profileId;
    return Repository.find({ profileId: idToUse as any });
  }
};
