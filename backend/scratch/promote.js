const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('Error: MONGO_URI is not defined in your environment variables.');
  process.exit(1);
}

// Define Schema (matches db.ts definitions)
const UserSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student', 'recruiter', 'admin'], required: true },
}, { _id: false, timestamps: true });

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const UserModel = mongoose.models.LocalUser || mongoose.model('LocalUser', UserSchema);
const CounterModel = mongoose.models.Counter || mongoose.model('Counter', CounterSchema);

const getNextSequenceValue = async (sequenceName) => {
  const sequenceDocument = await CounterModel.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return sequenceDocument.seq;
};

const emails = ['rakshalpatel2005@gmail.com', 'rakshakpatel2005@gmail.com'];
const targetPassword = 'firebase_managed';

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully!');

    // Update rakshakpatel2005@gmail.com to student
    console.log('Setting rakshakpatel2005@gmail.com back to student...');
    let studentUser = await UserModel.findOne({ email: 'rakshakpatel2005@gmail.com' });
    if (studentUser) {
      studentUser.role = 'student';
      await studentUser.save();
      console.log('rakshakpatel2005@gmail.com set to student successfully.');
    } else {
      console.log('rakshakpatel2005@gmail.com not found.');
    }

    // Update rakshalpatel2005@gmail.com to admin
    console.log('Setting rakshalpatel2005@gmail.com to admin...');
    let adminUser = await UserModel.findOne({ email: 'rakshalpatel2005@gmail.com' });
    if (adminUser) {
      adminUser.role = 'admin';
      await adminUser.save();
      console.log('rakshalpatel2005@gmail.com set to admin successfully.');
    } else {
      console.log('rakshalpatel2005@gmail.com not found.');
    }

  } catch (error) {
    console.error('An error occurred during seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

run();
