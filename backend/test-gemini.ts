import dotenv from 'dotenv';
dotenv.config({ path: 'c:/PROJECTS/CareerIQ/backend/.env' });

const apiKey = process.env.OPENROUTER_API_KEY || '';

async function test() {
  console.log('Testing OpenRouter connection...');
  console.log('API Key:', apiKey ? 'Present (starts with ' + apiKey.substring(0, 10) + '...)' : 'MISSING');
  
  if (!apiKey) {
    console.error('No API Key configured!');
    return;
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash:free',
        messages: [
          {
            role: 'user',
            content: 'Reply with JSON {"test": "hello"}'
          }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${await response.text()}`);
    }

    const data = await response.json() as any;
    console.log('Success response structure:', JSON.stringify(data, null, 2));
    console.log('Content:', data.choices?.[0]?.message?.content);
  } catch (err: any) {
    console.error('Error during OpenRouter call:', err.message);
  }
}

test();
