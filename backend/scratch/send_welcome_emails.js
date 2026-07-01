const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_APP_PASS = process.env.EMAIL_APP_PASS; // Gmail App Password

if (!MONGO_URI) {
  console.error('Error: MONGO_URI is not defined in backend/.env');
  process.exit(1);
}

// Define User Schema to match database
const UserSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['student', 'recruiter', 'admin'], required: true },
}, { _id: false, timestamps: true });

const UserModel = mongoose.models.LocalUser || mongoose.model('LocalUser', UserSchema);

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully!');

    // Fetch all registered users
    const users = await UserModel.find({});
    console.log(`Found ${users.length} registered members in the system database.`);

    if (users.length === 0) {
      console.log('No members to send emails to.');
      return;
    }

    const isRealEmailConfigured = !!(EMAIL_USER && EMAIL_APP_PASS);

    let transporter;
    if (isRealEmailConfigured) {
      console.log(`Real email configuration detected for: ${EMAIL_USER}`);
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_APP_PASS
        }
      });
    } else {
      console.log('\n[DRY RUN MODE] No email credentials found in backend/.env.');
      console.log('To send real emails, add these variables to your backend/.env file:');
      console.log('EMAIL_USER=your.gmail@gmail.com');
      console.log('EMAIL_APP_PASS=your_gmail_app_password\n');
    }

    for (const user of users) {
      if (user.role === 'admin') {
        console.log(`Skipping Admin user: ${user.email}`);
        continue;
      }

      const emailSubject = 'Thank You for Registering on CareerIQ! 🚀';
      const emailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #faf8f5; border: 1px solid #e2e8f0; border-radius: 16px; color: #1e293b;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #4b61eb; margin: 0; font-size: 28px; font-weight: 800;">CareerIQ</h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 4px; font-weight: 600;">AI-Powered Job Readiness Platform</p>
          </div>
          
          <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0;">Welcome aboard! 👋</h2>
          
          <p style="font-size: 15px; line-height: 1.6; color: #334155;">
            Thank you for registering on <strong>CareerIQ</strong>! We are thrilled to have you join our community.
          </p>
          
          <p style="font-size: 15px; line-height: 1.6; color: #334155;">
            Our platform evaluates your real-world readiness by scoring your technical portfolios, DSA accomplishments, and resumes using autonomous AI.
          </p>
          
          <div style="background-color: #ffffff; border: 1px dashed #4b61eb; border-radius: 12px; padding: 16px; margin: 24px 0; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #64748b; font-weight: 600;">Registered Email Address</p>
            <p style="margin: 4px 0 0 0; font-size: 18px; color: #4b61eb; font-weight: 800;">${user.email}</p>
          </div>
          
          <p style="font-size: 15px; line-height: 1.6; color: #334155;">
            Log in now to upload your resume, sync your GitHub repository, and check your Career Readiness score:
          </p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="https://careeriq.vercel.app/login" style="background-color: #4b61eb; color: #ffffff; text-decoration: none; padding: 12px 28px; font-weight: 700; border-radius: 10px; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(75, 97, 235, 0.2);">
              Get Started →
            </a>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 28px 0;" />
          
          <p style="font-size: 12px; text-align: center; color: #94a3b8; margin: 0;">
            Designed & Built by the CareerIQ Team.<br />
            © 2026 CareerIQ. All rights reserved.
          </p>
        </div>
      `;

      if (isRealEmailConfigured && transporter) {
        console.log(`Sending email to ${user.email}...`);
        try {
          await transporter.sendMail({
            from: `"CareerIQ Team" <${EMAIL_USER}>`,
            to: user.email,
            subject: emailSubject,
            html: emailHtml
          });
          console.log(`Email successfully sent to: ${user.email}`);
        } catch (mailError) {
          console.error(`Failed to send email to ${user.email}:`, mailError.message);
        }
      } else {
        console.log(`\n--- Simulated Email to: ${user.email} ---`);
        console.log(`Subject: ${emailSubject}`);
        console.log(`[HTML Body Generated: Welcome email for ${user.email}]`);
        console.log('-----------------------------------------');
      }
    }

  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
  }
}

run();
