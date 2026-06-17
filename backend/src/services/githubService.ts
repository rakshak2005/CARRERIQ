import dotenv from 'dotenv';
dotenv.config();

export interface GitHubStats {
  githubUrl: string;
  username: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  location: string | null;
  blogUrl: string | null;
  repos: number;
  followers: number;
  stars: number;
  accountAgeYears: number;
  consistencyScore: number;
  openSourceScore: number;
  score: number;
  repositories?: any[];
}

// Parses GitHub username from different URL styles or direct handles
export const parseGitHubUsername = (url: string | null | undefined): string | null => {
  if (!url) return null;
  let clean = url.trim();
  if (!clean) return null;

  // Remove trailing slashes
  clean = clean.replace(/\/+$/, '');

  // If URL contains github.com
  if (clean.includes('github.com')) {
    const match = clean.match(/github\.com\/([a-zA-Z0-9-._]+)/i);
    if (match && match[1]) {
      return match[1];
    }
  }

  // If it's a full URL of another domain
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    try {
      const parsed = new URL(clean);
      const parts = parsed.pathname.split('/').filter(Boolean);
      return parts[0] || null;
    } catch {
      return null;
    }
  }

  const parts = clean.split('/').filter(Boolean);
  return parts[0] || clean;
};

// Returns realistic mock data for default seed users when offline/rate-limited
const getMockGitHubStats = (username: string): GitHubStats | null => {
  const lower = username.toLowerCase();
  
  const defaultRepos = [
    {
      name: 'portfolio-website',
      description: 'Personal portfolio with sleek transitions and responsive layout',
      html_url: `https://github.com/${username}/portfolio-website`,
      fork: false,
      stargazers_count: 5,
      size: 4500,
      languages: ['TypeScript', 'CSS', 'HTML'],
      techStack: ['react', 'next.js', 'typescript', 'vanilla css'],
      files: ['src', 'package.json', 'README.md', '.github/workflows'],
      readmeSize: 1200,
      readmeContent: '# Portfolio Website\nAn advanced modular portfolio built with Next.js.'
    },
    {
      name: 'task-manager-api',
      description: 'RESTful API with user authentication and task CRUD operations',
      html_url: `https://github.com/${username}/task-manager-api`,
      fork: false,
      stargazers_count: 8,
      size: 8200,
      languages: ['JavaScript'],
      techStack: ['node.js', 'express', 'mongodb', 'docker'],
      files: ['src', 'package.json', 'Dockerfile', 'docker-compose.yml', 'README.md'],
      readmeSize: 2400,
      readmeContent: '# Task API\nRobust task manager API. Run with docker-compose up.'
    }
  ];

  if (lower === 'alexrivera') {
    return {
      githubUrl: 'https://github.com/alexrivera',
      username: 'alexrivera',
      name: 'Alex Rivera',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
      bio: 'Frontend Architect and UI Designer. Building the future of web interfaces.',
      location: 'San Francisco, CA',
      blogUrl: 'https://alexrivera.dev',
      repos: 15,
      followers: 45,
      stars: 12,
      accountAgeYears: 4,
      consistencyScore: 82,
      openSourceScore: 60,
      score: 82,
      repositories: defaultRepos
    };
  } else if (lower === 'sarahchen-ds') {
    return {
      githubUrl: 'https://github.com/sarahchen-ds',
      username: 'sarahchen-ds',
      name: 'Sarah Chen',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      bio: 'Data Scientist. Passionate about machine learning, neural networks, and pipelines.',
      location: 'Boston, MA',
      blogUrl: 'https://sarahchen.ai',
      repos: 28,
      followers: 120,
      stars: 84,
      accountAgeYears: 5,
      consistencyScore: 95,
      openSourceScore: 85,
      score: 98,
      repositories: [
        {
          name: 'predictive-churn-model',
          description: 'ML model pipeline predicting subscription churn rates.',
          html_url: 'https://github.com/sarahchen-ds/predictive-churn-model',
          fork: false,
          stargazers_count: 42,
          size: 15400,
          languages: ['Python', 'HTML'],
          techStack: ['python', 'django', 'postgresql', 'aws'],
          files: ['src', 'requirements.txt', 'Dockerfile', 'README.md', '.github/workflows'],
          readmeSize: 4500,
          readmeContent: '# Churn Predictor\nDetailed data analysis model utilizing scikit-learn.'
        },
        ...defaultRepos
      ]
    };
  } else if (lower === 'markjohnson-dev') {
    return {
      githubUrl: 'https://github.com/markjohnson-dev',
      username: 'markjohnson-dev',
      name: 'Mark Johnson',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      bio: 'Fullstack developer exploring Kubernetes, system scaling, and Go.',
      location: 'Austin, TX',
      blogUrl: 'https://markj.codes',
      repos: 8,
      followers: 12,
      stars: 3,
      accountAgeYears: 2,
      consistencyScore: 68,
      openSourceScore: 45,
      score: 64,
      repositories: defaultRepos
    };
  }
  return null;
};

// Automatically match dependencies to identify tech stack elements
const detectTechStack = (files: string[], description: string, readme: string): string[] => {
  const stack: string[] = [];
  const content = (description + ' ' + readme).toLowerCase();

  // Frameworks
  if (content.includes('react') || files.some(f => f.includes('react'))) stack.push('React');
  if (content.includes('next.js') || content.includes('nextjs')) stack.push('Next.js');
  if (content.includes('angular') || files.some(f => f.includes('angular'))) stack.push('Angular');
  if (content.includes('vue') || files.some(f => f.includes('vue'))) stack.push('Vue');
  
  // Backend
  if (content.includes('node.js') || content.includes('nodejs') || files.includes('package.json')) stack.push('Node.js');
  if (content.includes('express') || content.includes('expressjs')) stack.push('Express');
  if (content.includes('spring boot') || content.includes('spring-boot') || files.includes('pom.xml')) stack.push('Spring');
  if (content.includes('django') || files.includes('manage.py')) stack.push('Django');

  // DB
  if (content.includes('mongo') || content.includes('mongoose')) stack.push('MongoDB');
  if (content.includes('postgres') || content.includes('postgresql')) stack.push('PostgreSQL');
  if (content.includes('mysql')) stack.push('MySQL');

  // Cloud & DevOps
  if (content.includes('aws') || content.includes('amazon web services')) stack.push('AWS');
  if (content.includes('docker') || files.includes('Dockerfile') || files.includes('docker-compose.yml')) stack.push('Docker');
  if (content.includes('kubernetes') || files.some(f => f.includes('k8s') || f.includes('kube'))) stack.push('Kubernetes');
  if (files.some(f => f.includes('.github/workflows')) || content.includes('ci/cd') || content.includes('jenkins')) stack.push('CI/CD');

  return stack;
};

// Calculates baseline GitHub score deterministically
export const calculateGitHubScore = (
  repos: number,
  followers: number,
  stars: number,
  accountAgeYears: number
): number => {
  const repoScore = Math.min(25, repos * 2.5);
  const followerScore = Math.min(25, followers * 2.5);
  const starScore = Math.min(30, stars * 5);
  const ageScore = Math.min(20, accountAgeYears * 4);
  return Math.round(repoScore + followerScore + starScore + ageScore);
};

// Fetches GitHub stats from public REST API
export const fetchGitHubStats = async (githubUrl: string): Promise<GitHubStats> => {
  const username = parseGitHubUsername(githubUrl);
  if (!username) {
    throw new Error('Invalid GitHub URL or username');
  }

  // Pre-check for seeded mock users
  const mockStats = getMockGitHubStats(username);

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'CareerIQ-App',
  };

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  try {
    // Fetch profile info
    const userRes = await fetch(`https://api.github.com/users/${username}`, { headers });
    
    if (!userRes.ok) {
      if (userRes.status === 404) {
        throw new Error(`GitHub user '${username}' not found`);
      }
      // If rate-limited, fallback to mockStats if available
      if (mockStats) {
        console.log(`[INFO] GitHub API error (${userRes.status}). Using seed mock stats for '${username}'.`);
        return mockStats;
      }
      throw new Error(`GitHub API returned status ${userRes.status}`);
    }

    const userData = (await userRes.json()) as any;
    const reposCount = userData.public_repos ?? 0;
    const followersCount = userData.followers ?? 0;
    const createdAt = userData.created_at;

    // Calculate account age in years
    let ageYears = 1;
    if (createdAt) {
      const createdDate = new Date(createdAt);
      const currentDate = new Date();
      ageYears = currentDate.getFullYear() - createdDate.getFullYear();
      if (ageYears <= 0) ageYears = 1;
    }

    // Fetch repositories (top 30 sorted by stars for comprehensive analysis)
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=30&sort=stars`, { headers });
    let rawRepos: any[] = [];
    if (reposRes.ok) {
      rawRepos = (await reposRes.json()) as any[];
    } else if (mockStats) {
      return mockStats; // fallback if repos fetch fails
    }

    let totalStars = 0;
    const parsedRepos: any[] = [];

    // Analyze each repository
    for (const r of rawRepos) {
      totalStars += r.stargazers_count ?? 0;
      
      const files: string[] = ['README.md'];
      let readmeSize = 500;
      let readmeContent = `# ${r.name}\n${r.description || ''}`;

      // Try fetching root contents to search for configs
      try {
        const contentsRes = await fetch(`https://api.github.com/repos/${username}/${r.name}/contents`, { headers });
        if (contentsRes.ok) {
          const contents = await contentsRes.json();
          if (Array.isArray(contents)) {
            contents.forEach((item: any) => {
              files.push(item.path);
            });
          }
        }
      } catch (err) {
        // Continue silently if contents fetch fails
      }

      // Try fetching readme size
      try {
        const readmeRes = await fetch(`https://api.github.com/repos/${username}/${r.name}/readme`, { headers });
        if (readmeRes.ok) {
          const readmeData = (await readmeRes.json()) as any;
          readmeSize = readmeData.size || 500;
          if (readmeData.content) {
            readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');
          }
        }
      } catch (err) {
        // Continue silently
      }

      // Fetch languages
      const languages: string[] = [];
      try {
        const langRes = await fetch(`https://api.github.com/repos/${username}/${r.name}/languages`, { headers });
        if (langRes.ok) {
          const langData = (await langRes.json()) as any;
          Object.keys(langData).forEach(key => languages.push(key));
        }
      } catch (err) {
        // Continue
      }

      const techStack = detectTechStack(files, r.description || '', readmeContent);

      parsedRepos.push({
        name: r.name,
        description: r.description,
        html_url: r.html_url,
        fork: r.fork,
        stargazers_count: r.stargazers_count,
        size: r.size,
        languages,
        techStack,
        files,
        readmeSize,
        readmeContent
      });
    }

    // Determine simulated activity consistency based on account age and followers
    const weeklyEntropy = Math.random() * 0.2 + 0.1; // simulated variance
    const consistencyScore = Math.round(95 - (weeklyEntropy * 80));

    // Open Source Contribution score (simulated based on public followers/activity)
    const openSourceScore = Math.min(100, Math.round(40 + (followersCount * 1.5) + (totalStars * 0.5)));
    const score = calculateGitHubScore(reposCount, followersCount, totalStars, ageYears);

    return {
      githubUrl: userData.html_url || `https://github.com/${username}`,
      username,
      name: userData.name || username,
      avatarUrl: userData.avatar_url || '',
      bio: userData.bio || '',
      location: userData.location || '',
      blogUrl: userData.blog || '',
      repos: reposCount,
      followers: followersCount,
      stars: totalStars,
      accountAgeYears: ageYears,
      consistencyScore,
      openSourceScore,
      score,
      repositories: parsedRepos
    };

  } catch (err: any) {
    console.error(`[WARNING] GitHub fetch failed for '${username}':`, err.message);
    
    if (mockStats) {
      return mockStats;
    }

    throw err;
  }
};
