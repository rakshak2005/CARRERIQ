import nodemailer from 'nodemailer';

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_APP_PASS = process.env.EMAIL_APP_PASS;

let transporter: any = null;

if (EMAIL_USER && EMAIL_APP_PASS) {
  try {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_APP_PASS
      }
    });
    console.log('[EmailService] Transporter initialized for:', EMAIL_USER);
  } catch (err: any) {
    console.error('[EmailService] Failed to initialize email transporter:', err.message);
  }
} else {
  console.log('[EmailService] EMAIL_USER and EMAIL_APP_PASS are not configured. Welcome emails will run in dry-run/simulation.');
}

export const sendWelcomeEmail = async (email: string, role: string): Promise<boolean> => {
  if (role === 'admin') {
    console.log(`[EmailService] Skipping welcome email for admin role: ${email}`);
    return false;
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
        <p style="margin: 4px 0 0 0; font-size: 18px; color: #4b61eb; font-weight: 800;">${email}</p>
      </div>
      
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">
        Log in now to upload your resume, sync your GitHub repository, and check your Career Readiness score:
      </p>
      
      <div style="text-align: center; margin: 28px 0;">
        <a href="https://careeriq.vercel.app/login" style="background-color: #4b61eb; color: #ffffff; text-decoration: none; padding: 12px 28px; font-weight: 700; border-radius: 10px; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(75, 97, 235, 0.25);">
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

  if (!transporter) {
    console.log(`[EmailService Sim] Welcome email simulation for: ${email}`);
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"CareerIQ Team" <${EMAIL_USER}>`,
      to: email,
      subject: emailSubject,
      html: emailHtml
    });
    console.log(`[EmailService] Welcome email sent to: ${email}`);
    return true;
  } catch (error: any) {
    console.error(`[EmailService] Failed to send welcome email to ${email}:`, error.message);
    return false;
  }
};
