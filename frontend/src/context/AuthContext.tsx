import React, { createContext, useContext, useState, useEffect } from 'react';
import { subscribeToAuthChanges, getCurrentUserToken, logoutUser } from '../services/firebase';

export interface User {
  id: number;
  email: string;
  role: 'student' | 'recruiter';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to sync user session from backend
  const syncSession = async (firebaseToken: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firebaseToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(firebaseToken);
        localStorage.setItem('careeriq_token', firebaseToken);
        localStorage.setItem('careeriq_user', JSON.stringify(data.user));
      } else {
        // User might not be synced in our DB yet (e.g. during registration)
        console.warn('[Auth] Sync failed, user might not be in DB yet.');
      }
    } catch (err) {
      console.error('[Auth] Error syncing session:', err);
    }
  };

  useEffect(() => {
    // Subscribe to Firebase Auth changes
    const unsubscribe = subscribeToAuthChanges(async (fbUser) => {
      if (fbUser) {
        const fbToken = await getCurrentUserToken();
        if (fbToken) {
          await syncSession(fbToken);
        }
      } else {
        // Clear session
        setUser(null);
        setToken(null);
        localStorage.removeItem('careeriq_token');
        localStorage.removeItem('careeriq_user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('careeriq_token', newToken);
    localStorage.setItem('careeriq_user', JSON.stringify(newUser));
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Error logging out from Firebase:', err);
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('careeriq_token');
    localStorage.removeItem('careeriq_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
