export const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE_URL = `${BACKEND_URL}/api`;

// Helper to get token
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('careeriq_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Generic request wrapper
async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
  };

  if (options.headers) {
    const extraHeaders = options.headers as Record<string, string>;
    Object.keys(extraHeaders).forEach(key => {
      headers[key] = extraHeaders[key];
    });
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Something went wrong');
  }

  return data;
}

export const api = {
  // Auth
  auth: {
    register: (body: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    getStats: () => request('/auth/stats'),
    getFeatured: () => request('/auth/featured'),
    getReviews: () => request('/auth/reviews'),
    submitReview: (body: any) => request('/auth/reviews', { method: 'POST', body: JSON.stringify(body) }),
  },

  // Student Profile
  student: {
    getProfile: () => request('/student/profile'),
    updateProfile: (body: any) => request('/student/profile', { method: 'POST', body: JSON.stringify(body) }),
    uploadResume: (file: File) => {
      const formData = new FormData();
      formData.append('resume', file);
      
      const token = localStorage.getItem('careeriq_token');
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      return fetch(`${API_BASE_URL}/resume/upload`, {
        method: 'POST',
        headers,
        body: formData,
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to upload resume');
        return data;
      });
    },
    reanalyzeResume: () => request('/resume/reanalyze', { method: 'POST' }),
    addProject: (body: any) => request('/student/projects', { method: 'POST', body: JSON.stringify(body) }),
    deleteProject: (id: number) => request(`/student/projects/${id}`, { method: 'DELETE' }),
    addCertificate: (body: any) => request('/student/certificates', { method: 'POST', body: JSON.stringify(body) }),
    deleteCertificate: (id: number) => request(`/student/certificates/${id}`, { method: 'DELETE' }),
    syncPortfolio: (forceRegenerate?: boolean) => request('/student/portfolio/sync', { method: 'POST', body: JSON.stringify({ forceRegenerate }) }),
  },

  // Analysis Service (Mocked Queue)
  analysis: {
    trigger: (githubUrl: string) => request('/analysis/trigger', { method: 'POST', body: JSON.stringify({ githubUrl }) }),
    status: (jobId: string) => request(`/analysis/status/${jobId}`),
    dashboard: (username: string) => request(`/analysis/dashboard/${username}`),
  },

  // Real GitHub Analysis Service
  github: {
    analyze: (githubUrl: string) => request('/github/analyze', { method: 'POST', body: JSON.stringify({ githubUrl }) }),
    getReport: () => request('/github/report'),
    regenerateReport: () => request('/github/report/regenerate', { method: 'POST' }),
  },

  // Recruiter Dashboard
  recruiter: {
    getCandidates: (params?: { search?: string; targetRole?: string; minScore?: number; dsaRequired?: boolean }) => {
      let query = '';
      if (params) {
        const qParts: string[] = [];
        if (params.search) qParts.push(`search=${encodeURIComponent(params.search)}`);
        if (params.targetRole) qParts.push(`targetRole=${encodeURIComponent(params.targetRole)}`);
        if (params.minScore !== undefined && !isNaN(params.minScore)) qParts.push(`minScore=${params.minScore}`);
        if (params.dsaRequired) qParts.push(`dsaRequired=true`);
        if (qParts.length > 0) query = '?' + qParts.join('&');
      }
      return request(`/recruiter/candidates${query}`);
    },
    getCandidateDetail: (id: number) => request(`/recruiter/candidates/${id}`),
    updateProfile: (body: any) => request('/recruiter/profile', { method: 'POST', body: JSON.stringify(body) }),
    getProfile: () => request('/recruiter/profile'),
  },

  // Admin Actions
  admin: {
    getUsers: () => request('/admin/users'),
    createUser: (body: any) => request('/admin/users', { method: 'POST', body: JSON.stringify(body) }),
    deleteUser: (id: number) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  },
};
