const fs = require('fs');
const FormData = require('form-data');

// Create a dummy pdf
fs.writeFileSync('dummy.pdf', '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Hello World) Tj\nET\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000220 00000 n \n0000000315 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n403\n%%EOF');

async function testUpload() {
  try {
    const formData = new FormData();
    formData.append('resume', fs.createReadStream('dummy.pdf'));
    
    // To test the endpoint, we need an auth token or we can just mock it.
    // Wait, the auth token is needed, let's login first or just get the current token from db if possible, or bypass.
    // I can generate a token using JWT_SECRET
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 1, role: 'student', username: 'testuser' }, 'supersecret_careeriq_jwt_key_12345', { expiresIn: '1h' });
    
    const fetch = (await import('node-fetch')).default;
    const res = await fetch('http://localhost:5000/api/resume/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', data);
  } catch (err) {
    console.error(err);
  }
}

testUpload();
