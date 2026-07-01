const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || '';

const StudentProfileSchema = new mongoose.Schema({}, { strict: false });
const StudentProfile = mongoose.models.LocalStudentProfile || mongoose.model('LocalStudentProfile', StudentProfileSchema, 'localstudentprofiles');

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const profiles = await StudentProfile.find();
  console.log(`Found ${profiles.length} student profiles. Recalculating overall scores...`);

  for (const p of profiles) {
    const doc = p.toObject();
    const githubScore = doc.githubScore || 0;
    const resumeScore = doc.resumeScore || doc.resume_score || 0;
    const portfolioScore = doc.portfolioScore || doc.portfolio_score || 0;

    // New weights: GitHub 45%, Resume 35%, Projects 20%
    const newOverallScore = Math.round(
      (resumeScore * 0.35) +
      (githubScore * 0.45) +
      (portfolioScore * 0.20)
    );

    console.log(`Updating "${doc.fullName || doc.username}": GitHub=${githubScore}, Resume=${resumeScore}, Projects=${portfolioScore} -> OldOverall=${doc.overallScore}, NewOverall=${newOverallScore}`);
    
    await StudentProfile.updateOne({ _id: doc._id }, { $set: { overallScore: newOverallScore } });
  }

  console.log('All profiles updated successfully!');
  await mongoose.disconnect();
}

main().catch(err => console.error(err));
