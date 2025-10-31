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
      
      case 'AgentAssignment':
        return this.handleAgentAssignmentAudit(auditLog);
      
      case 'CandidateAssignment':
        return this.handleCandidateAssignmentAudit(auditLog);
      
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
        // Get creator information
        const creator = await User.findById(actor).select('firstName lastName email role customId');
        const creatorName = creator ? `${creator.firstName} ${creator.lastName}` : 'Unknown User';
        
        // Get company information to get companyId
        const { Company } = await import('@/models/Company');
        const company = await Company.findById(entityId).select('companyId');
        
        logger.debug('Company creation notification with creator info', {
          companyName: after?.['name'],
          creatorName,
          creatorRole: creator?.role,
          creatorId: actor.toString(),
          creatorCustomId: creator?.customId,
          companyCustomId: company?.companyId
        });
        
        return {
          type: NotificationType.COMPANY_CREATE,
          title: 'New Company Created',
          message: `A new company has been created: ${after?.['name']}`,
          recipients: [{ id: 'admin', role: UserRole.ADMIN }], // Notify all admins
          entityType: 'Company',
          entityId: entityId.toString(),
          metadata: { 
            companyName: after?.['name'],
            companyCustomId: company?.companyId,
            creatorId: actor.toString(),
            creatorCustomId: creator?.customId,
            creatorName: creatorName,
            creatorRole: creator?.role
          },
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
        // Get creator information
        const jobCreator = await User.findById(actor).select('firstName lastName email role customId');
        const jobCreatorName = jobCreator ? `${jobCreator.firstName} ${jobCreator.lastName}` : 'Unknown User';
        
        // Get job information to get jobId
        const { Job } = await import('@/models/Job');
        const job = await Job.findById(entityId).select('jobId');
        
        return {
          type: NotificationType.JOB_CREATE,
          title: 'New Job Posted',
          message: `A new job has been posted: ${after?.['title']}`,
          recipients: [
            { id: 'admin', role: UserRole.SUPERADMIN }, // Notify all superadmins
            { id: 'admin', role: UserRole.ADMIN }, // Notify all admins
            { id: 'all', role: UserRole.AGENT } // Notify all agents
          ],
          entityType: 'Job',
          entityId: entityId.toString(),
          metadata: { 
            jobTitle: after?.['title'], 
            jobCustomId: job?.jobId,
            companyId: after?.['companyId'],
            creatorId: actor.toString(),
            creatorCustomId: jobCreator?.customId,
            creatorName: jobCreatorName,
            creatorRole: jobCreator?.role
          },
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
        // For interview creation, notify candidate, assigned agent, and admins/superadmins
        const candidateId = metadata?.['candidateId'];
        const recipients: Array<{ id: string; role: UserRole }> = [];
        
        // Get candidate's userId and assigned agent
        try {
          const { Candidate } = await import('@/models/Candidate');
          if (candidateId) {
            const candidate = await Candidate.findById(candidateId).populate('assignedAgentId').select('userId assignedAgentId');
            if (candidate && candidate.userId) {
              recipients.push({ id: candidate.userId.toString(), role: UserRole.CANDIDATE });
            }
            if (candidate && (candidate as any).assignedAgentId) {
              recipients.push({ 
                id: ((candidate as any).assignedAgentId as any)._id.toString(), 
                role: UserRole.AGENT 
              });
            }
          }
        } catch (error) {
          console.error('Error fetching candidate for interview notification:', error);
        }
        
        // Notify all admins and superadmins
        recipients.push(
          { id: 'admin', role: UserRole.ADMIN },
          { id: 'admin', role: UserRole.SUPERADMIN }
        );
        
        return {
          type: NotificationType.INTERVIEW_SCHEDULE,
          title: 'Interview Scheduled',
          message: `${metadata?.['createdByName'] || 'Someone'} scheduled a ${metadata?.['interviewType'] || 'interview'} interview for ${metadata?.['candidateName']}`,
          recipients,
          entityType: 'Interview',
          entityId: entityId.toString(),
          metadata: {
            candidateName: metadata?.['candidateName'],
            candidateCustomId: metadata?.['candidateCustomId'],
            jobTitle: metadata?.['jobTitle'],
            jobCustomId: metadata?.['jobCustomId'],
            scheduledAt: metadata?.['scheduledAt'] || after?.['scheduledAt'],
            interviewType: metadata?.['interviewType'] || after?.['type'],
            interviewRound: metadata?.['interviewRound']
          },
          priority: NotificationPriority.HIGH,
          actionUrl: `/interviews/${entityId}`
        };

      case AuditAction.UPDATE:
        // For interview updates, notify based on what changed
        const updateRecipients: Array<{ id: string; role: UserRole }> = [];
        const updateCandidateId = metadata?.['candidateId'];
        
        // Get candidate's userId and assigned agent
        try {
          const { Candidate } = await import('@/models/Candidate');
          if (updateCandidateId) {
            const candidate = await Candidate.findById(updateCandidateId).populate('assignedAgentId').select('userId assignedAgentId');
            if (candidate && candidate.userId) {
              updateRecipients.push({ id: candidate.userId.toString(), role: UserRole.CANDIDATE });
            }
            if (candidate && (candidate as any).assignedAgentId) {
              updateRecipients.push({ 
                id: ((candidate as any).assignedAgentId as any)._id.toString(), 
                role: UserRole.AGENT 
              });
            }
          }
        } catch (error) {
          console.error('Error fetching candidate for interview update notification:', error);
        }
        
        // Notify all admins and superadmins for important updates (status change or reschedule)
        if (metadata?.['statusChanged'] || metadata?.['scheduledAtChanged']) {
          updateRecipients.push(
            { id: 'admin', role: UserRole.ADMIN },
            { id: 'admin', role: UserRole.SUPERADMIN }
          );
        }
        
        let updateMessage = `${metadata?.['updatedByName'] || 'Someone'} updated interview for ${metadata?.['candidateName']}`;
        if (metadata?.['statusChanged']) {
          updateMessage = `${metadata?.['updatedByName'] || 'Someone'} changed interview status from "${metadata?.['oldStatus']}" to "${metadata?.['newStatus']}" for ${metadata?.['candidateName']}`;
        } else if (metadata?.['scheduledAtChanged']) {
          updateMessage = `${metadata?.['updatedByName'] || 'Someone'} rescheduled interview for ${metadata?.['candidateName']}`;
        }
        
        return {
          type: NotificationType.INTERVIEW_UPDATE,
          title: 'Interview Updated',
          message: updateMessage,
          recipients: updateRecipients,
          entityType: 'Interview',
          entityId: entityId.toString(),
          metadata: {
            candidateName: metadata?.['candidateName'],
            candidateCustomId: metadata?.['candidateCustomId'],
            jobTitle: metadata?.['jobTitle'],
            jobCustomId: metadata?.['jobCustomId'],
            statusChanged: metadata?.['statusChanged'],
            oldStatus: metadata?.['oldStatus'],
            newStatus: metadata?.['newStatus'],
            scheduledAtChanged: metadata?.['scheduledAtChanged'],
            oldScheduledAt: metadata?.['oldScheduledAt'],
            newScheduledAt: metadata?.['newScheduledAt']
          },
          priority: NotificationPriority.HIGH,
          actionUrl: `/interviews/${entityId}`
        };
        
      case AuditAction.DELETE:
        // For interview deletion, notify candidate, assigned agent, and admins/superadmins
        const deleteRecipients: Array<{ id: string; role: UserRole }> = [];
        const deleteCandidateId = metadata?.['candidateId'];
        
        // Get candidate's userId and assigned agent
        try {
          const { Candidate } = await import('@/models/Candidate');
          if (deleteCandidateId) {
            const candidate = await Candidate.findById(deleteCandidateId).populate('assignedAgentId').select('userId assignedAgentId');
            if (candidate && candidate.userId) {
              deleteRecipients.push({ id: candidate.userId.toString(), role: UserRole.CANDIDATE });
            }
            if (candidate && (candidate as any).assignedAgentId) {
              deleteRecipients.push({ 
                id: ((candidate as any).assignedAgentId as any)._id.toString(), 
                role: UserRole.AGENT 
              });
            }
          }
        } catch (error) {
          console.error('Error fetching candidate for interview deletion notification:', error);
        }
        
        // Notify all admins and superadmins
        deleteRecipients.push(
          { id: 'admin', role: UserRole.ADMIN },
          { id: 'admin', role: UserRole.SUPERADMIN }
        );
        
        return {
          type: NotificationType.INTERVIEW_UPDATE,
          title: 'Interview Deleted',
          message: `${metadata?.['deletedByName'] || 'Someone'} deleted interview for ${metadata?.['candidateName']}`,
          recipients: deleteRecipients,
          entityType: 'Interview',
          entityId: entityId.toString(),
          metadata: {
            candidateName: metadata?.['candidateName'],
            candidateCustomId: metadata?.['candidateCustomId'],
            jobTitle: metadata?.['jobTitle'],
            jobCustomId: metadata?.['jobCustomId'],
            interviewType: metadata?.['interviewType']
          },
          priority: NotificationPriority.HIGH,
          actionUrl: `/interviews`
        };
    }

    return null;
  }

  /**
   * Handle AgentAssignment-related audit logs
   */
  private async handleAgentAssignmentAudit(auditLog: AuditLog) {
    const { action, entityId, actor, metadata, after } = auditLog;

    switch (action) {
      case AuditAction.CREATE:
      case AuditAction.UPDATE:
        // Get the assignment details
        const { AgentAssignment } = await import('@/models/AgentAssignment');
        const assignment = await AgentAssignment.findById(entityId)
          .populate('agentId', 'firstName lastName email customId')
          .populate('assignedHRs', 'firstName lastName email customId')
          .populate('assignedBy', 'firstName lastName email customId role')
          .populate({
            path: 'assignedCandidates',
            populate: {
              path: 'userId',
              select: 'firstName lastName email customId'
            }
          });

        if (!assignment) {
          logger.warn('AgentAssignment not found for audit log', { entityId });
          return null;
        }

        const agent = assignment.agentId as any;
        const assignedBy = assignment.assignedBy as any;
        const agentName = agent ? `${agent.firstName} ${agent.lastName}` : 'Unknown Agent';
        const adminName = assignedBy ? `${assignedBy.firstName} ${assignedBy.lastName}` : 'Unknown Admin';

        // Build recipients list
        const recipients: Array<{ id: string; role: UserRole }> = [
          // Notify the agent who was assigned
          { id: assignment.agentId.toString(), role: UserRole.AGENT },
          // Notify all HR users who were assigned to this agent
          ...(assignment.assignedHRs || []).map((hr: any) => ({ 
            id: hr._id.toString(), 
            role: UserRole.HR 
          })),
          // Notify all admins and superadmins
          { id: 'admin', role: UserRole.ADMIN },
          { id: 'admin', role: UserRole.SUPERADMIN }
        ];

        // Build notification message
        const hrCount = assignment.assignedHRs?.length || 0;
        const candidateCount = assignment.assignedCandidates?.length || 0;
        
        let message = '';
        if (action === AuditAction.CREATE) {
          message = `${adminName} assigned resources to agent ${agentName}`;
        } else {
          message = `${adminName} updated assignments for agent ${agentName}`;
        }
        
        if (hrCount > 0) {
          message += ` (${hrCount} HR user${hrCount > 1 ? 's' : ''}`;
          if (candidateCount > 0) {
            message += `, ${candidateCount} candidate${candidateCount > 1 ? 's' : ''}`;
          }
          message += ')';
        } else if (candidateCount > 0) {
          message += ` (${candidateCount} candidate${candidateCount > 1 ? 's' : ''})`;
        }

        return {
          type: NotificationType.AGENT_ASSIGN,
          title: action === AuditAction.CREATE ? 'Agent Assignment Created' : 'Agent Assignment Updated',
          message,
          recipients,
          entityType: 'AgentAssignment',
          entityId: entityId.toString(),
          metadata: {
            agentId: assignment.agentId.toString(),
            agentName,
            agentCustomId: agent?.customId,
            assignedBy: assignedBy?._id?.toString(),
            assignedByName: adminName,
            assignedByCustomId: assignedBy?.customId,
            assignedByRole: assignedBy?.role,
            hrCount,
            candidateCount,
            hrIds: (assignment.assignedHRs || []).map((hr: any) => hr._id.toString()),
            candidateIds: (assignment.assignedCandidates || []).map((candidate: any) => candidate._id?.toString() || candidate.toString())
          },
          priority: NotificationPriority.HIGH,
          actionUrl: `/users/agent-assignments/${assignment.agentId}`
        };

      case AuditAction.DELETE:
        return {
          type: NotificationType.AGENT_ASSIGN,
          title: 'Agent Assignment Removed',
          message: `Agent assignment has been removed`,
          recipients: [
            { id: actor.toString(), role: UserRole.ADMIN },
            { id: 'admin', role: UserRole.ADMIN },
            { id: 'admin', role: UserRole.SUPERADMIN }
          ],
          entityType: 'AgentAssignment',
          entityId: entityId.toString(),
          metadata: {
            deletedBy: actor.toString()
          },
          priority: NotificationPriority.HIGH
        };
    }

    return null;
  }

  /**
   * Handle CandidateAssignment-related audit logs
   */
  private async handleCandidateAssignmentAudit(auditLog: AuditLog) {
    const { action, entityId, actor, metadata, after } = auditLog;

    switch (action) {
      case AuditAction.UPDATE:
        // Check if candidate status changed
        if (metadata?.['candidateStatusChanged']) {
          const candidateName = metadata?.['candidateName'] || 'a candidate';
          const oldStatus = metadata?.['oldCandidateStatus'] || 'new';
          const newStatus = metadata?.['newCandidateStatus'] || 'new';
          const jobTitle = metadata?.['jobTitle'] || '';
          const assignedToId = metadata?.['assignedToId'];
          const assignedById = metadata?.['assignedById'];

          // Build recipients list
          const recipients: Array<{ id: string; role: UserRole }> = [
            // Notify the HR user the candidate is assigned to
            { id: assignedToId, role: UserRole.HR },
            // Notify the agent who assigned the candidate
            { id: assignedById, role: UserRole.AGENT },
          ];

          // Build notification message
          let message = `Candidate ${candidateName} status changed from "${oldStatus}" to "${newStatus}"`;
          if (jobTitle && jobTitle !== 'N/A') {
            message += ` for job "${jobTitle}"`;
          }

          return {
            type: NotificationType.CANDIDATE_STATUS_CHANGE,
            title: 'Candidate Status Updated',
            message,
            recipients,
            entityType: 'CandidateAssignment',
            entityId: entityId.toString(),
            metadata: {
              candidateId: metadata?.['candidateId'],
              candidateName,
              candidateCustomId: metadata?.['candidateCustomId'],
              oldStatus,
              newStatus,
              jobTitle,
              jobId: metadata?.['jobCustomId'],
              assignedToId,
              assignedById
            },
            priority: NotificationPriority.MEDIUM,
            actionUrl: `/candidate-assignments/${entityId}`
          };
        }
        break;
    }

    return null;
  }
}