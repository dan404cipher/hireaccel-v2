/**
 * Application configuration
 */

import Constants from 'expo-constants';

export const API_URL = Constants.expoConfig?.extra?.apiUrl || 
  process.env.EXPO_PUBLIC_API_URL || 
  'http://localhost:3002';

export const APP_NAME = 'HireAccel';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@hire_accel_access_token',
  USER_DATA: '@hire_accel_user_data',
  THEME: '@hire_accel_theme',
  ONBOARDING_COMPLETE: '@hire_accel_onboarding',
} as const;

export const COLORS = {
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  secondary: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  background: '#ffffff',
  surface: '#f9fafb',
  text: '#111827',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  disabled: '#d1d5db',
} as const;

export const ROLES = {
  ADMIN: 'admin',
  HR: 'hr',
  AGENT: 'agent',
  CANDIDATE: 'candidate',
  PARTNER: 'partner',
} as const;

export const JOB_TYPES = [
  { label: 'Full-time', value: 'full-time' },
  { label: 'Part-time', value: 'part-time' },
  { label: 'Contract', value: 'contract' },
  { label: 'Internship', value: 'internship' },
  { label: 'Remote', value: 'remote' },
] as const;

export const JOB_URGENCY = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
] as const;

export const INTERVIEW_TYPES = [
  { label: 'Video', value: 'video' },
  { label: 'Phone', value: 'phone' },
  { label: 'In-Person', value: 'in-person' },
] as const;

export const INTERVIEW_ROUNDS = [
  { label: 'Initial', value: 'initial' },
  { label: 'Technical', value: 'technical' },
  { label: 'Behavioral', value: 'behavioral' },
  { label: 'Final', value: 'final' },
  { label: 'Cultural', value: 'cultural' },
] as const;

