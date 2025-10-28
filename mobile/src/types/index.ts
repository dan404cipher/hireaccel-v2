/**
 * Core TypeScript types and interfaces
 */

export type UserRole = 'candidate' | 'agent' | 'hr' | 'partner' | 'admin';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface User {
  id: string;
  customId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneNumber?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  expiresIn: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    page?: {
      current: number;
      total: number;
      hasMore: boolean;
    };
    total?: number;
    limit?: number;
  };
}

export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  issues?: Array<{ field: string; message: string; code: string }>;
}

export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
export type JobStatus = 'open' | 'assigned' | 'interview' | 'closed' | 'cancelled';
export type JobUrgency = 'low' | 'medium' | 'high' | 'urgent';

export interface Job {
  id: string;
  jobId?: string;
  title: string;
  description: string;
  company: string;
  companyId: string;
  location: string;
  type: JobType;
  salary: string;
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  status: JobStatus;
  urgency: JobUrgency;
  applicants: number;
  posted: string;
  agent?: string;
  assignedAgentId?: string;
  requirements?: {
    skills: string[];
    experience: string;
    education: string[];
  };
  benefits?: string[];
  isRemote?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  companyId?: string;
  name: string;
  description: string;
  industry: string;
  size: string;
  location: string;
  website?: string;
  partnership: 'basic' | 'standard' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  rating: number;
  totalJobs: number;
  totalHires: number;
  contacts: Array<{
    name: string;
    email: string;
    phone: string;
    position: string;
  }>;
}

export interface Application {
  id: string;
  candidateId: string;
  jobId: string;
  status: string;
  stage: string;
  appliedAt: string;
  candidate?: any;
  job?: any;
}

export type InterviewType = 'video' | 'phone' | 'in-person';
export type InterviewRound = 'initial' | 'technical' | 'behavioral' | 'final' | 'cultural';
export type InterviewStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';

export interface Interview {
  _id: string;
  applicationId: {
    _id: string;
    candidateId: {
      _id: string;
      userId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
      };
    };
    jobId: {
      _id: string;
      title: string;
      companyId: {
        _id: string;
        name: string;
      };
    };
  };
  type: InterviewType;
  round: InterviewRound;
  scheduledAt: string;
  duration: number;
  location?: string;
  interviewers: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  status: InterviewStatus;
  feedback?: string;
  rating?: number;
  notes: Array<{
    content: string;
    createdBy: string;
    createdAt: string;
    isPrivate: boolean;
  }>;
  meetingLink?: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface CandidateProfile {
  userId: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  experience?: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    description: string;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
  }>;
  resume?: {
    fileId: string;
    fileName: string;
    uploadedAt: string;
  };
}

export interface DashboardStats {
  totalJobs?: number;
  activeApplications?: number;
  scheduledInterviews?: number;
  totalCandidates?: number;
  totalCompanies?: number;
  totalUsers?: number;
}

