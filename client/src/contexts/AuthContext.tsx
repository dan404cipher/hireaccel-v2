import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/services/api';

export type UserRole = 'candidate' | 'agent' | 'hr' | 'partner' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
  status: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  updateAuth: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          apiClient.setToken(token);
          const response = await apiClient.getCurrentUser();
          if (mounted) {
            setUser(response.data?.user || null);
          }
        }
      } catch (error) {
        // Token might be expired
        localStorage.removeItem('accessToken');
        apiClient.clearToken();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();
    
    // Cleanup function
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      const { user: userData, accessToken } = response.data!;
      
      apiClient.setToken(accessToken);
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      apiClient.clearToken();
      setUser(null);
    }
  };

  const updateAuth = (userData: User) => {
    setUser(userData);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    updateAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useRole() {
  const { user } = useAuth();
  return user?.role;
}

// Utility function for role checking - moved to utils to avoid Fast Refresh issues
export const hasRole = (allowedRoles: UserRole[], userRole?: UserRole) => {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
};
