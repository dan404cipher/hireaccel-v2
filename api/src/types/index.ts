import { Request } from 'express';
import { Types } from 'mongoose';

/**
 * Global type definitions for the Hiring Platform API
 * Centralizes all type definitions used across the application
 */

// ============================================================================
// Common Types
// ============================================================================

/**
 * Standard API response format following RFC7807
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: ResponseMeta;
}

/**
 * Error response format following RFC7807
 */
export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  issues?: ValidationIssue[];
}

/**
 * Validation error details
 */
export interface ValidationIssue {
  field: string;
  message: string;
  code: string;
}

/**
 * Response metadata for pagination
 */
export interface ResponseMeta {
  page?: {
    cursor?: string | null;
    hasMore: boolean;
    total?: number;
    limit?: number;
    offset?: number;
  };
  filters?: Record<string, any>;
  sort?: Record<string, 1 | -1>;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  limit?: number;
  offset?: number;
  cursor?: string;
  sort?: Record<string, 1 | -1>;
}

// ============================================================================
// User & Authentication Types
// ============================================================================

/**
 * User roles in the system
 */
export enum UserRole {
  CANDIDATE = 'candidate',
  AGENT = 'agent',
  HR = 'hr',
  PARTNER = 'partner',
  ADMIN = 'admin',
}

/**
 * User status
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

/**
 * User entity
 */
export interface User {
  _id: Types.ObjectId;
  email: string;
  customId: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  status: UserStatus;
  lastLoginAt?: Date;
  emailVerified: boolean;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * JWT payload
 */
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

/**
 * Authentication tokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Extended Express Request with user information
 */
export interface AuthenticatedRequest extends Request {
  user?: User;
  requestId?: string;
  logger?: any;
  uploadedFilePath?: string;
}

// ============================================================================
// Candidate Types
// ============================================================================

/**
 * Candidate status
 */
export enum CandidateStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PLACED = 'placed',
  UNAVAILABLE = 'unavailable',
}

/**
 * Experience level
 */
export enum ExperienceLevel {
  ENTRY = 'entry',
  JUNIOR = 'junior',
  MID = 'mid',
  SENIOR = 'senior',
  LEAD = 'lead',
  EXECUTIVE = 'executive',
}

/**
 * Education degree
 */
export interface Education {
  degree: string;
  field: string;
  institution: string;
  graduationYear: number;
  gpa?: number;
}

/**
 * Work experience
 */
export interface WorkExperience {
  company: string;
  position: string;
  startDate: Date;
  endDate: Date | undefined;
  description: string;
  current: boolean;
}

/**
 * Certification
 */
export interface Certification {
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate: Date | undefined;
  credentialId: string | undefined;
  credentialUrl: string | undefined;
}

/**
 * Project
 */
export interface Project {
  title: string;
  description: string;
  technologies: string[];
  startDate: Date;
  endDate: Date | undefined;
  current: boolean;
  projectUrl: string | undefined;
  githubUrl: string | undefined;
  role: string | undefined;
}

/**
 * Candidate profile
 */
export interface CandidateProfile {
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  certifications: Certification[];
  projects: Project[];
  summary: string | undefined;
  location: string | undefined;
  phoneNumber: string | undefined;
  linkedinUrl: string | undefined;
  portfolioUrl: string | undefined;
  preferredSalaryRange: {
    min: number;
    max: number;
    currency: string;
  } | undefined;
  availability: {
    startDate: Date | undefined;
    remote: boolean | undefined;
    relocation: boolean | undefined;
  } | undefined;
}

/**
 * Candidate entity
 */
export interface Candidate {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  assignedAgentId?: Types.ObjectId;
  profile: CandidateProfile;
  resumeFileId?: Types.ObjectId;
  status: CandidateStatus;
  rating?: number;
  notes: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Job Types
// ============================================================================

/**
 * Job status
 */
export enum JobStatus {
  OPEN = 'open',
  ASSIGNED = 'assigned',
  INTERVIEW = 'interview',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

/**
 * Job type
 */
export enum JobType {
  FULL_TIME = 'full-time',
  PART_TIME = 'part-time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship',
  REMOTE = 'remote',
}

/**
 * Job urgency
 */
export enum JobUrgency {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * Job requirements
 */
export interface JobRequirements {
  skills: string[];
  experience: ExperienceLevel;
  education: string[];
  languages?: string[];
  certifications?: string[];
}

/**
 * Job entity
 */
export interface Job {
  _id: Types.ObjectId;
  title: string;
  description: string;
  requirements: JobRequirements;
  location: string;
  type: JobType;
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  companyId: Types.ObjectId;
  status: JobStatus;
  urgency: JobUrgency;
  assignedAgentId?: Types.ObjectId;
  createdBy: Types.ObjectId;
  applications?: number;
  postedAt: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Application Types
// ============================================================================

/**
 * Application status
 */
export enum ApplicationStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  INTERVIEW = 'interview',
  OFFER = 'offer',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

/**
 * Application stage
 */
export enum ApplicationStage {
  APPLIED = 'applied',
  SCREENING = 'screening',
  TECHNICAL = 'technical',
  FINAL = 'final',
  OFFER = 'offer',
  HIRED = 'hired',
}

/**
 * Application entity
 */
export interface Application {
  _id: Types.ObjectId;
  candidateId: Types.ObjectId;
  jobId: Types.ObjectId;
  status: ApplicationStatus;
  stage: ApplicationStage;
  appliedAt: Date;
  notes: string[];
  documents: Types.ObjectId[];
  rating?: number;
  feedback?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Interview Types
// ============================================================================

/**
 * Interview type
 */
export enum InterviewType {
  PHONE = 'phone',
  VIDEO = 'video',
  IN_PERSON = 'in-person',
  TECHNICAL = 'technical',
}

/**
 * Interview status
 */
export enum InterviewStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled',
}

/**
 * Interview round
 */
export enum InterviewRound {
  SCREENING = 'screening',
  TECHNICAL = 'technical',
  BEHAVIORAL = 'behavioral',
  FINAL = 'final',
  CULTURAL = 'cultural',
}

/**
 * Interview entity
 */
export interface Interview {
  _id: Types.ObjectId;
  applicationId: Types.ObjectId;
  type: InterviewType;
  round: InterviewRound;
  scheduledAt: Date;
  duration: number; // in minutes
  location?: string;
  interviewers: Types.ObjectId[];
  status: InterviewStatus;
  feedback?: string;
  rating?: number;
  notes: string[];
  meetingLink?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Company Types
// ============================================================================

/**
 * Company status
 */
export enum CompanyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

/**
 * Partnership level
 */
export enum PartnershipLevel {
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

/**
 * Company contact information
 */
export interface CompanyContact {
  name: string;
  email: string;
  phone: string;
  position: string;
}

/**
 * Company entity
 */
export interface Company {
  _id: Types.ObjectId;
  name: string;
  description: string;
  industry: string;
  size: string;
  location: string;
  website?: string;
  logoUrl?: string;
  contacts: CompanyContact[];
  partnership: PartnershipLevel;
  status: CompanyStatus;
  rating?: number;
  totalJobs: number;
  totalHires: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Task Types
// ============================================================================

/**
 * Task status
 */
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Task priority
 */
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * Task checklist item
 */
export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: Date;
  completedBy?: Types.ObjectId;
}

/**
 * Task entity
 */
export interface Task {
  _id: Types.ObjectId;
  title: string;
  description: string;
  assignedTo: Types.ObjectId;
  relatedEntity?: {
    type: 'candidate' | 'job' | 'application' | 'interview' | 'company';
    id: Types.ObjectId;
  };
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  checklist: TaskChecklistItem[];
  notes: string[];
  createdBy: Types.ObjectId;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// File Types
// ============================================================================

/**
 * File category
 */
export enum FileCategory {
  RESUME = 'resume',
  COVER_LETTER = 'cover_letter',
  PORTFOLIO = 'portfolio',
  CERTIFICATE = 'certificate',
  PROFILE_IMAGE = 'profile_image',
  COMPANY_LOGO = 'company_logo',
  DOCUMENT = 'document',
}

/**
 * File entity
 */
export interface FileDocument {
  _id: Types.ObjectId;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
  category: FileCategory;
  uploadedBy: Types.ObjectId;
  relatedEntity?: {
    type: string;
    id: Types.ObjectId;
  };
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Audit Types
// ============================================================================

/**
 * Audit action types
 */
export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  UPLOAD = 'upload',
  DOWNLOAD = 'download',
  APPROVE = 'approve',
  REJECT = 'reject',
  ASSIGN = 'assign',
  ADVANCE = 'advance',
}

/**
 * Audit log entity
 */
export interface AuditLog {
  _id: Types.ObjectId;
  actor: Types.ObjectId;
  action: AuditAction;
  entityType: string;
  entityId: Types.ObjectId;
  before?: Record<string, any>;
  after?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  requestId?: string;
  sessionId?: string;
  changes?: any[];
  riskLevel?: string;
  businessProcess?: string;
  complianceCategory?: string;
  systemInfo?: any;
  success?: boolean;
  errorMessage?: string;
  errorCode?: string;
  duration?: number;
  tags?: string[];
  description?: string;
  retentionUntil?: Date;
}
