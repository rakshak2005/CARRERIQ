import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ path: 'c:/PROJECTS/CareerIQ/backend/.env' });

const apiKey = process.env.GEMINI_API_KEY || '';

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-robotics-er-1.6-preview', generationConfig: { responseMimeType: "application/json" } });
    const result = await model.generateContent('{"test": "hello"}');
    console.log('Success:', result.response.text());
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

test();
