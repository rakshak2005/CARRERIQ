import dotenv from 'dotenv';
dotenv.config({ path: 'c:/PROJECTS/CareerIQ/backend/.env' });

async function main() {
  const token = 'simulated-token:rakshakpatel2005@gmail.com:simulated-uid-1';
  const response = await fetch('http://localhost:5000/api/student/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    console.error('API Error:', response.status, await response.text());
    return;
  }

  const data = await response.json() as any;
  console.log('Keys in returned details:', Object.keys(data));
  console.log('Keys in data.profile:', data.profile ? Object.keys(data.profile) : 'null');
  console.log('portfolio_recommendations in data.profile:', data.profile ? data.profile.portfolio_recommendations : 'undefined');
  console.log('portfolioRecommendations in data.profile:', data.profile ? data.profile.portfolioRecommendations : 'undefined');
  console.log('data.portfolioRecommendations:', data.portfolioRecommendations);
}

main().catch(console.error);
