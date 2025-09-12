import { AuditAction, AuditLog, UserRole } from '../types';
import { NotificationType, NotificationPriority } from '../types/notifications';
import { NotificationService } from './NotificationService';
import { User } from '../models/User';
import { logger } from '../config/logger';

export class AuditNotificationHandler {
  private static instance: AuditNotificationHandler;
  private notificationService: NotificationService;

  private constructor() {
    this.notificationService = NotificationService.getInstance();
  }

  public static getInstance(): AuditNotificationHandler {
    if (!AuditNotificationHandler.instance) {
      AuditNotificationHandler.instance = new AuditNotificationHandler();
    }
    return AuditNotificationHandler.instance;
  }

  /**
   * Handle audit log and create appropriate notifications
   */
  public async handleAuditLog(auditLog: AuditLog): Promise<void> {
    try {
      const notificationData = await this.mapAuditToNotification(auditLog);
      if (!notificationData) {
        return;
      }

      const { recipients, ...data } = notificationData;
      
      // Convert role-based recipients to actual user IDs
      const actualRecipients = await this.resolveRecipients(recipients);
      
      if (actualRecipients.length === 0) {
        logger.debug('No recipients found for notification', {
          auditLogId: auditLog._id,
          originalRecipients: recipients
        });
        return;
      }

      await this.notificationService.createNotificationForMany(actualRecipients, {
        ...data,
        isRead: false,
        isArchived: false
      });

      logger.debug('Created notifications from audit log', {
        auditLogId: auditLog._id,
        recipientCount: actualRecipients.length
      });
    } catch (error) {
      logger.error('Failed to handle audit log for notifications', {
        error,
        auditLogId: auditLog._id
      });
    }
  }

  /**
   * Resolve role-based recipients to actual user IDs
   */
  private async resolveRecipients(recipients: Array<{ id: string; role: UserRole }>): Promise<Array<{ id: string; role: UserRole }>> {
    const actualRecipients: Array<{ id: string; role: UserRole }> = [];

    for (const recipient of recipients) {
      if (recipient.id === 'admin' || recipient.id === 'all') {
        // Find all users with the specified role
        const users = await User.find({ role: recipient.role, status: 'active' }).select('_id role');
        actualRecipients.push(...users.map(user => ({ id: user._id.toString(), role: user.role as UserRole })));
      } else {
        // Direct user ID
        actualRecipients.push(recipient);
      }
    }

    return actualRecipients;
  }

  /**
   * Map audit log to notification data
   */
  private async mapAuditToNotification(auditLog: AuditLog): Promise<{
    type: NotificationType;
    title: string;
    message: string;
    recipients: Array<{ id: string; role: UserRole }>;
    entityType: string;
    entityId: string;
    metadata: Record<string, any>;
    priority: NotificationPriority;
    actionUrl?: string;
  } | null> {
    const { action, entityType } = auditLog;

    // Map entity types to notification types
    switch (entityType) {
      case 'User':
        return this.handleUserAudit(auditLog);
      
      case 'Company':
        return this.handleCompanyAudit(auditLog);
      
      case 'Job':
        return this.handleJobAudit(auditLog);
      
      case 'Candidate':
        return this.handleCandidateAudit(auditLog);
      
      case 'Application':
        return this.handleApplicationAudit(auditLog);
      
      case 'Interview':
        return this.handleInterviewAudit(auditLog);
      
      default:
        logger.debug('No notification mapping for entity type', {
          entityType,
          action
        });
        return null;
    }
  }

  /**
   * Handle User-related audit logs
   */
  private async handleUserAudit(auditLog: AuditLog) {
    const { action, entityId, actor, metadata, after } = auditLog;
    const userRole = after?.['role'] || metadata?.['role'];

    switch (action) {
      case AuditAction.CREATE:
        return {
          type: NotificationType.USER_SIGNUP,
          title: 'New User Registration',
          message: `A new user has registered: ${after?.['email']}`,
          recipients: [{ id: 'admin', role: UserRole.ADMIN }], // Notify all admins
          entityType: 'User',
          entityId: entityId.toString(),
          metadata: { email: after?.['email'], role: userRole },
          priority: NotificationPriority.MEDIUM
        };

      case AuditAction.UPDATE:
        if (metadata?.['roleChange']) {
          return {
            type: NotificationType.USER_ROLE_CHANGE,
            title: 'User Role Updated',
            message: `User role has been updated from ${metadata['oldRole']} to ${metadata['newRole']}`,
            recipients: [
              { id: entityId.toString(), role: userRole as UserRole },
              { id: actor.toString(), role: UserRole.ADMIN }
            ],
            entityType: 'User',
            entityId: entityId.toString(),
            metadata: { oldRole: metadata['oldRole'], newRole: metadata['newRole'] },
            priority: NotificationPriority.HIGH
          };
        }
        break;

      case AuditAction.DELETE:
        return {
          type: NotificationType.USER_STATUS_CHANGE,
          title: 'User Account Deleted',
          message: `User account has been deleted: ${metadata?.['email']}`,
          recipients: [{ id: actor.toString(), role: UserRole.ADMIN }],
          entityType: 'User',
          entityId: entityId.toString(),
          metadata: { email: metadata?.['email'] },
          priority: NotificationPriority.HIGH
        };
    }

    return null;
  }

  /**
   * Handle Company-related audit logs
   */
  private async handleCompanyAudit(auditLog: AuditLog) {
    const { action, entityId, actor, metadata, after } = auditLog;

    switch (action) {
      case AuditAction.CREATE:
        return {
          type: NotificationType.COMPANY_CREATE,
          title: 'New Company Created',
          message: `A new company has been created: ${after?.['name']}`,
          recipients: [{ id: 'admin', role: UserRole.ADMIN }], // Notify all admins
          entityType: 'Company',
          entityId: entityId.toString(),
          metadata: { companyName: after?.['name'] },
          priority: NotificationPriority.MEDIUM
        };

      case AuditAction.UPDATE:
        return {
          type: NotificationType.COMPANY_UPDATE,
          title: 'Company Details Updated',
          message: `Company details have been updated: ${metadata?.['name']}`,
          recipients: [
            { id: actor.toString(), role: UserRole.ADMIN },
            ...(metadata?.['hrIds'] || []).map((id: string) => ({ id, role: UserRole.HR }))
          ],
          entityType: 'Company',
          entityId: entityId.toString(),
          metadata: { companyName: metadata?.['name'] },
          priority: NotificationPriority.MEDIUM
        };
    }

    return null;
  }

  /**
   * Handle Job-related audit logs
   */
  private async handleJobAudit(auditLog: AuditLog) {
    const { action, entityId, actor, metadata, after } = auditLog;

    switch (action) {
      case AuditAction.CREATE:
        return {
          type: NotificationType.JOB_CREATE,
          title: 'New Job Posted',
          message: `A new job has been posted: ${after?.['title']}`,
          recipients: [
            { id: 'admin', role: UserRole.ADMIN }, // Notify all admins
            { id: 'all', role: UserRole.AGENT } // Notify all agents
          ],
          entityType: 'Job',
          entityId: entityId.toString(),
          metadata: { jobTitle: after?.['title'], companyId: after?.['companyId'] },
          priority: NotificationPriority.MEDIUM,
          actionUrl: `/jobs/${entityId}`
        };

      case AuditAction.UPDATE:
        if (metadata?.['statusChange']) {
          return {
            type: NotificationType.JOB_STATUS_CHANGE,
            title: 'Job Status Updated',
            message: `Job status has been updated from ${metadata['oldStatus']} to ${metadata['newStatus']}`,
            recipients: [
              { id: actor.toString(), role: UserRole.ADMIN },
              ...(metadata?.['hrIds'] || []).map((id: string) => ({ id, role: UserRole.HR })),
              ...(metadata?.['agentIds'] || []).map((id: string) => ({ id, role: UserRole.AGENT }))
            ],
            entityType: 'Job',
            entityId: entityId.toString(),
            metadata: { 
              jobTitle: metadata?.['title'],
              oldStatus: metadata['oldStatus'],
              newStatus: metadata['newStatus']
            },
            priority: NotificationPriority.HIGH,
            actionUrl: `/jobs/${entityId}`
          };
        }
        break;
    }

    return null;
  }

  /**
   * Handle Candidate-related audit logs
   */
  private async handleCandidateAudit(auditLog: AuditLog) {
    const { action, entityId, metadata } = auditLog;

    switch (action) {
      case AuditAction.ASSIGN:
        return {
          type: NotificationType.CANDIDATE_ASSIGN,
          title: 'Candidate Assigned',
          message: `Candidate has been assigned to ${metadata?.['assignedTo']}`,
          recipients: [
            { id: metadata?.['assignedToId'], role: UserRole.AGENT }, // Notify the assigned agent
            { id: 'admin', role: UserRole.ADMIN } // Notify all admins
          ],
          entityType: 'Candidate',
          entityId: entityId.toString(),
          metadata: { 
            candidateName: metadata?.['candidateName'],
            assignedTo: metadata?.['assignedTo']
          },
          priority: NotificationPriority.HIGH,
          actionUrl: `/candidates/${entityId}`
        };

      case AuditAction.UPDATE:
        if (metadata?.['statusChange']) {
          return {
            type: NotificationType.CANDIDATE_STATUS_CHANGE,
            title: 'Candidate Status Updated',
            message: `Candidate status has been updated from ${metadata['oldStatus']} to ${metadata['newStatus']}`,
            recipients: [
              { id: entityId.toString(), role: UserRole.CANDIDATE },
              ...(metadata?.['agentIds'] || []).map((id: string) => ({ id, role: UserRole.AGENT })),
              ...(metadata?.['hrIds'] || []).map((id: string) => ({ id, role: UserRole.HR }))
            ],
            entityType: 'Candidate',
            entityId: entityId.toString(),
            metadata: {
              candidateName: metadata?.['candidateName'],
              oldStatus: metadata['oldStatus'],
              newStatus: metadata['newStatus']
            },
            priority: NotificationPriority.HIGH,
            actionUrl: `/candidates/${entityId}`
          };
        }
        break;
    }

    return null;
  }

  /**
   * Handle Application-related audit logs
   */
  private async handleApplicationAudit(auditLog: AuditLog) {
    const { action, entityId, metadata } = auditLog;

    switch (action) {
      case AuditAction.UPDATE:
        if (metadata?.['statusChange']) {
          return {
            type: NotificationType.CANDIDATE_STATUS_CHANGE,
            title: 'Application Status Updated',
            message: `Application status has been updated from ${metadata['oldStatus']} to ${metadata['newStatus']}`,
            recipients: [
              { id: metadata?.['candidateId'], role: UserRole.CANDIDATE },
              ...(metadata?.['agentIds'] || []).map((id: string) => ({ id, role: UserRole.AGENT })),
              ...(metadata?.['hrIds'] || []).map((id: string) => ({ id, role: UserRole.HR }))
            ],
            entityType: 'Application',
            entityId: entityId.toString(),
            metadata: {
              jobTitle: metadata?.['jobTitle'],
              candidateName: metadata?.['candidateName'],
              oldStatus: metadata['oldStatus'],
              newStatus: metadata['newStatus']
            },
            priority: NotificationPriority.HIGH,
            actionUrl: `/applications/${entityId}`
          };
        }
        break;
    }

    return null;
  }

  /**
   * Handle Interview-related audit logs
   */
  private async handleInterviewAudit(auditLog: AuditLog) {
    const { action, entityId, metadata, after } = auditLog;

    switch (action) {
      case AuditAction.CREATE:
        return {
          type: NotificationType.INTERVIEW_SCHEDULE,
          title: 'Interview Scheduled',
          message: `New interview scheduled for ${metadata?.['candidateName']}`,
          recipients: [
            { id: metadata?.['candidateId'], role: UserRole.CANDIDATE },
            ...(metadata?.['agentIds'] || []).map((id: string) => ({ id, role: UserRole.AGENT })),
            ...(metadata?.['hrIds'] || []).map((id: string) => ({ id, role: UserRole.HR }))
          ],
          entityType: 'Interview',
          entityId: entityId.toString(),
          metadata: {
            candidateName: metadata?.['candidateName'],
            jobTitle: metadata?.['jobTitle'],
            scheduledAt: after?.['scheduledAt'],
            interviewType: after?.['type']
          },
          priority: NotificationPriority.HIGH,
          actionUrl: `/interviews/${entityId}`
        };

      case AuditAction.UPDATE:
        return {
          type: NotificationType.INTERVIEW_UPDATE,
          title: 'Interview Updated',
          message: `Interview details have been updated for ${metadata?.['candidateName']}`,
          recipients: [
            { id: metadata?.['candidateId'], role: UserRole.CANDIDATE },
            ...(metadata?.['agentIds'] || []).map((id: string) => ({ id, role: UserRole.AGENT })),
            ...(metadata?.['hrIds'] || []).map((id: string) => ({ id, role: UserRole.HR }))
          ],
          entityType: 'Interview',
          entityId: entityId.toString(),
          metadata: {
            candidateName: metadata?.['candidateName'],
            jobTitle: metadata?.['jobTitle'],
            changes: metadata?.['changes']
          },
          priority: NotificationPriority.HIGH,
          actionUrl: `/interviews/${entityId}`
        };
    }

    return null;
  }
}