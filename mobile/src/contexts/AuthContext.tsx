/**
 * Authentication Context
 * Manages user authentication state and operations
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/services/api';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants/config';
import type { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<{ requiresOTP?: boolean; email: string }>;
  signupSMS: (data: SMSSignupData) => Promise<{ requiresOTP?: boolean; phoneNumber: string }>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  verifySMSOTP: (phoneNumber: string, otp: string) => Promise<{ needsEmail?: boolean }>;
  addEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: User) => void;
  refreshUser: () => Promise<void>;
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: 'hr' | 'candidate';
  department?: string;
  currentLocation?: string;
  yearsOfExperience?: string;
  source?: string;
}

interface SMSSignupData {
  phoneNumber: string;
  firstName: string;
  role: 'hr' | 'candidate';
  source?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedUser = await storage.getItem<User>(STORAGE_KEYS.USER_DATA);
      if (storedUser) {
        setUser(storedUser);
        // Verify token is still valid
        const response = await apiClient.getCurrentUser();
        if (response.data?.user) {
          const updatedUser = response.data.user;
          setUser(updatedUser);
          await storage.setItem(STORAGE_KEYS.USER_DATA, updatedUser);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await apiClient.clearToken();
      await storage.removeItem(STORAGE_KEYS.USER_DATA);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      if (response.data) {
        const userData = response.data.user;
        setUser(userData);
        await storage.setItem(STORAGE_KEYS.USER_DATA, userData);
      }
    } catch (error) {
      throw error;
    }
  };

  const signup = async (data: SignupData) => {
    try {
      const response = await apiClient.signup(data);
      return response.data!;
    } catch (error) {
      throw error;
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      const response = await apiClient.verifyOTP(email, otp);
      if (response.data) {
        const userData = response.data.user;
        setUser(userData);
        await storage.setItem(STORAGE_KEYS.USER_DATA, userData);
      }
    } catch (error) {
      throw error;
    }
  };

  const signupSMS = async (data: SMSSignupData) => {
    try {
      const response = await apiClient.signupSMS(data);
      return { 
        requiresOTP: response.data?.requiresOTP, 
        phoneNumber: response.data?.phoneNumber || data.phoneNumber 
      };
    } catch (error) {
      throw error;
    }
  };

  const verifySMSOTP = async (phoneNumber: string, otp: string) => {
    try {
      const response = await apiClient.verifySMSOTP(phoneNumber, otp);
      if (response.data) {
        const userData = response.data.user;
        setUser(userData);
        await storage.setItem(STORAGE_KEYS.USER_DATA, userData);
        
        // Return whether email setup is needed
        return { needsEmail: (response.data as any).needsEmail };
      }
      return { needsEmail: false };
    } catch (error) {
      throw error;
    }
  };

  const addEmail = async (email: string, password: string) => {
    try {
      const response = await apiClient.addEmail({ email, password });
      if (response.data) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        await storage.setItem(STORAGE_KEYS.USER_DATA, updatedUser);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      await storage.removeItem(STORAGE_KEYS.USER_DATA);
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    storage.setItem(STORAGE_KEYS.USER_DATA, userData);
  };

  const refreshUser = async () => {
    try {
      const response = await apiClient.getCurrentUser();
      if (response.data?.user) {
        const userData = response.data.user;
        setUser(userData);
        await storage.setItem(STORAGE_KEYS.USER_DATA, userData);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    signup,
    signupSMS,
    verifyOTP,
    verifySMSOTP,
    addEmail,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useRole(): UserRole | undefined {
  const { user } = useAuth();
  return user?.role;
}

export function hasRole(allowedRoles: UserRole[], userRole?: UserRole): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

