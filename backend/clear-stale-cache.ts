import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Profile } from './src/models/Profile';
import { Repository } from './src/models/Repository';
import { Job } from './src/models/Job';

async function clearStaleCache() {
  const mongoUri = process.env.MONGO_URI || '';
  if (!mongoUri) {
    console.error('MONGO_URI not set!');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  // Find and delete profile for rakshak2005
  const profile = await Profile.findOne({ githubUrl: { $regex: /rakshak2005/i } });
  if (profile) {
    const profileId = (profile._id as any).toString();
    console.log(`Found profile: ${profileId} - ${(profile as any).githubUrl}`);
    
    // Delete all repos for this profile
    const repoResult = await Repository.deleteMany({ profileId: profile._id as any });
    console.log(`Deleted ${repoResult.deletedCount} repositories`);
    
    // Delete the profile
    await Profile.deleteOne({ _id: profile._id });
    console.log('Deleted profile');
  } else {
    console.log('No profile found for rakshak2005');
  }

  // Also clear all completed/failed jobs for rakshak2005
  const jobResult = await Job.deleteMany({ githubUrl: { $regex: /rakshak2005/i } });
  console.log(`Deleted ${jobResult.deletedCount} analysis jobs`);

  // Show remaining profiles
  const remaining = await Profile.find({});
  console.log(`\nRemaining profiles in DB: ${remaining.length}`);
  remaining.forEach(p => console.log(` - ${(p as any).githubUrl}`));

  await mongoose.disconnect();
  console.log('\nDone! Cache cleared. The next analysis will fetch fresh data from GitHub.');
}

clearStaleCache().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
