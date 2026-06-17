const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AQ.Ab8RN6JO_A6RVILImkm7LDVosczNzU_hNbDt79KS3YxdD53WzQ');
async function test() {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-robotics-er-1.6-preview',
      generationConfig: { responseMimeType: 'application/json' }
    });
    const result = await model.generateContent('Return { "hello": "world" } in json');
    console.log('Success:', result.response.text());
  } catch (e) {
    console.error('Error:', e.message);
  }
}
test();
