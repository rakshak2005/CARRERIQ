import dotenv from 'dotenv';
dotenv.config({ path: 'c:/PROJECTS/CareerIQ/backend/.env' });
import mongoose from 'mongoose';
import '../src/db';

async function clearGitHubStats() {
  console.log('Connecting to database...');
  await mongoose.connect(process.env.MONGO_URI || '');
  console.log('Connected.');

  // Find all student profiles and clear their github info
  const profiles = await mongoose.model('LocalStudentProfile').find({});
  console.log(`Found ${profiles.length} student profiles.`);

  for (const profile of profiles) {
    console.log(`Clearing GitHub stats for profile: "${profile.fullName}"`);
    profile.githubUsername = null;
    profile.githubRepos = 0;
    profile.githubFollowers = 0;
    profile.githubStars = 0;
    profile.githubScore = 0;
    profile.githubAgeYears = 1;
    profile.githubBreakdown = null;
    profile.githubRepositories = [];
    profile.githubTechStacks = [];
    profile.githubRecommendations = [];
    profile.githubImprovementReport = null;
    profile.githubFollowing = 0;
    profile.githubPublicRepos = 0;
    profile.githubAvatar = null;
    profile.githubLastActivity = null;
    profile.githubLastAnalyzed = null;
    profile.aiProjectComplexityScore = 0;
    
    await profile.save();
  }

  console.log('Cleanup completed successfully.');
  await mongoose.connection.close();
}

clearGitHubStats().catch(err => {
  console.error('Error during cleanup:', err);
  mongoose.connection.close();
});
