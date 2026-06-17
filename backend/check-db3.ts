import dotenv from 'dotenv';
dotenv.config({ path: 'c:/PROJECTS/CareerIQ/backend/.env' });
import mongoose from 'mongoose';
import '../src/db';

async function checkLocalProfile() {
  await mongoose.connect(process.env.MONGO_URI || '');
  console.log('Connected to DB');
  
  const LocalStudentProfile = mongoose.model('LocalStudentProfile');
  const profile = await LocalStudentProfile.findOne({ githubUsername: 'rakshak2005' });
  
  if (!profile) {
    console.log('Profile not found for rakshak2005');
  } else {
    console.log('Profile found:', profile.fullName);
    console.log('githubUsername:', profile.githubUsername);
    console.log('githubTechStacks:', profile.githubTechStacks);
    console.log('githubRepositories count:', profile.githubRepositories ? profile.githubRepositories.length : 0);
    console.log('githubRepositories:', JSON.stringify(profile.githubRepositories, null, 2));
  }
  
  await mongoose.connection.close();
}
checkLocalProfile();

