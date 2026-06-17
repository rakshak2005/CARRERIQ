import { analyzeResumeWithAI } from './src/services/resumeService';
import dotenv from 'dotenv';
dotenv.config({ path: 'c:/PROJECTS/CareerIQ/backend/.env' });

async function test() {
  try {
    const text = "Rakshak Patel Software Engineer\nReact, Node.js\nProjects: Built a CareerIQ app.";
    const result = await analyzeResumeWithAI(text, 'Software Engineer', { score: 50 });
    console.log(result);
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

test();
