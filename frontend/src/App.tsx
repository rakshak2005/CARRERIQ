import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { BackgroundBlobs } from './components/BackgroundBlobs';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { StudentDashboard } from './pages/StudentDashboard';
import { RecruiterDashboard } from './pages/RecruiterDashboard';
import { CandidateDetail } from './pages/CandidateDetail';
import { GitHubReport } from './pages/GitHubReport';
import { GitHubAnalysisReport } from './pages/GitHubAnalysisReport';
import { AdminDashboard } from './pages/AdminDashboard';

// Route Guard for Authenticated Users with Specific Role
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRole: 'student' | 'recruiter' | 'admin' }> = ({ children, allowedRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container flex-center" style={{ minHeight: '80vh' }}>
        <h2>Authenticating session...</h2>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    // Redirect unauthorized users to their proper dashboard
    if (user.role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    }
    return <Navigate to={user.role === 'recruiter' ? '/recruiter-dashboard' : '/student-dashboard'} replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen relative bg-[#faf8f5] dark:bg-[#0d0f14] text-slate-800 dark:text-slate-100 transition-colors duration-500 font-sans flex flex-col">
            <BackgroundBlobs />
            <Header />
            <main style={{ flex: 1, position: 'relative', zIndex: 10 }}>
              <Routes>
                {/* Home Page */}
                <Route path="/" element={<Home />} />

                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Student Routes */}
                <Route
                  path="/student-dashboard"
                  element={
                    <ProtectedRoute allowedRole="student">
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/github-analysis/report"
                  element={
                    <ProtectedRoute allowedRole="student">
                      <GitHubAnalysisReport />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/github-analysis/report"
                  element={
                    <ProtectedRoute allowedRole="student">
                      <GitHubReport />
                    </ProtectedRoute>
                  }
                />

                {/* Recruiter Routes */}
                <Route
                  path="/recruiter-dashboard"
                  element={
                    <ProtectedRoute allowedRole="recruiter">
                      <RecruiterDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/candidates/:id"
                  element={
                    <ProtectedRoute allowedRole="recruiter">
                      <CandidateDetail />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin-dashboard"
                  element={
                    <ProtectedRoute allowedRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Redirect any other paths to Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
