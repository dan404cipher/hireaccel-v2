import { UserRole } from './index';

/**
 * Notification types enum
 */
export enum NotificationType {
  // User related
  USER_SIGNUP = 'user_signup',
  USER_UPDATE = 'user_update',
  USER_ROLE_CHANGE = 'user_role_change',
  USER_STATUS_CHANGE = 'user_status_change',

  // Company related
  COMPANY_CREATE = 'company_create',
  COMPANY_UPDATE = 'company_update',
  COMPANY_STATUS_CHANGE = 'company_status_change',

  // Job related
  JOB_CREATE = 'job_create',
  JOB_UPDATE = 'job_update',
  JOB_STATUS_CHANGE = 'job_status_change',
  JOB_CLOSE = 'job_close',

  // Candidate related
  CANDIDATE_ASSIGN = 'candidate_assign',
  CANDIDATE_STATUS_CHANGE = 'candidate_status_change',
  CANDIDATE_DOCUMENT_UPLOAD = 'candidate_document_upload',
  CANDIDATE_PROFILE_UPDATE = 'candidate_profile_update',

  // HR/Agent related
  HR_ASSIGN = 'hr_assign',
  AGENT_ASSIGN = 'agent_assign',
  ROLE_REASSIGN = 'role_reassign',

  // Interview related
  INTERVIEW_SCHEDULE = 'interview_schedule',
  INTERVIEW_UPDATE = 'interview_update',
  INTERVIEW_CANCEL = 'interview_cancel',

  // System notifications
  SYSTEM_MAINTENANCE = 'system_maintenance',
  SYSTEM_UPDATE = 'system_update'
}

/**
 * Notification priority levels
 */
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

/**
 * Notification channel types
 */
export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  PUSH = 'push'
}

/**
 * Base notification interface
 */
export interface INotification {
  _id?: string;
  type: NotificationType;
  title: string;
  message: string;
  recipientId: string;
  recipientRole: UserRole;
  entityType: string;
  entityId: string;
  metadata: Record<string, any>;
  isRead: boolean;
  isArchived: boolean;
  createdAt: Date;
  expiresAt?: Date;
  priority: NotificationPriority;
  actionUrl?: string;
}

/**
 * Notification preference interface
 */
export interface INotificationPreference {
  _id?: string;
  userId: string;
  channelPreferences: {
    [key in NotificationChannel]: boolean;
  };
  typePreferences: {
    [key in NotificationType]?: boolean;
  };
  updatedAt: Date;
}

/**
 * Role-based notification access mapping
 */
export const NOTIFICATION_ACCESS_MAP: Record<UserRole, NotificationType[]> = {
  [UserRole.ADMIN]: Object.values(NotificationType),
  [UserRole.AGENT]: [
    NotificationType.CANDIDATE_ASSIGN,
    NotificationType.CANDIDATE_STATUS_CHANGE,
    NotificationType.CANDIDATE_DOCUMENT_UPLOAD,
    NotificationType.CANDIDATE_PROFILE_UPDATE,
    NotificationType.AGENT_ASSIGN,
    NotificationType.ROLE_REASSIGN,
    NotificationType.JOB_CREATE,
    NotificationType.JOB_UPDATE,
    NotificationType.JOB_STATUS_CHANGE,
    NotificationType.JOB_CLOSE,
    NotificationType.INTERVIEW_SCHEDULE,
    NotificationType.INTERVIEW_UPDATE,
    NotificationType.INTERVIEW_CANCEL,
    NotificationType.SYSTEM_MAINTENANCE,
    NotificationType.SYSTEM_UPDATE
  ],
  [UserRole.HR]: [
    NotificationType.CANDIDATE_ASSIGN,
    NotificationType.CANDIDATE_STATUS_CHANGE,
    NotificationType.CANDIDATE_DOCUMENT_UPLOAD,
    NotificationType.CANDIDATE_PROFILE_UPDATE,
    NotificationType.HR_ASSIGN,
    NotificationType.ROLE_REASSIGN,
    NotificationType.JOB_CREATE,
    NotificationType.JOB_UPDATE,
    NotificationType.JOB_STATUS_CHANGE,
    NotificationType.JOB_CLOSE,
    NotificationType.INTERVIEW_SCHEDULE,
    NotificationType.INTERVIEW_UPDATE,
    NotificationType.INTERVIEW_CANCEL,
    NotificationType.SYSTEM_MAINTENANCE,
    NotificationType.SYSTEM_UPDATE
  ],
  [UserRole.CANDIDATE]: [
    NotificationType.CANDIDATE_STATUS_CHANGE,
    NotificationType.INTERVIEW_SCHEDULE,
    NotificationType.INTERVIEW_UPDATE,
    NotificationType.INTERVIEW_CANCEL,
    NotificationType.SYSTEM_MAINTENANCE,
    NotificationType.SYSTEM_UPDATE
  ],
  [UserRole.PARTNER]: [
    NotificationType.JOB_CREATE,
    NotificationType.JOB_UPDATE,
    NotificationType.JOB_STATUS_CHANGE,
    NotificationType.JOB_CLOSE,
    NotificationType.SYSTEM_MAINTENANCE,
    NotificationType.SYSTEM_UPDATE
  ]
};

