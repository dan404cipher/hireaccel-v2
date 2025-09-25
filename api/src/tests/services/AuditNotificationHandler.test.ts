import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AuditNotificationHandler } from '../../services/AuditNotificationHandler';
import { NotificationService } from '../../services/NotificationService';
import { AuditAction, UserRole } from '../../types';
import { NotificationType } from '../../types/notifications';

let mongoServer: MongoMemoryServer;
let auditNotificationHandler: AuditNotificationHandler;

// Mock NotificationService
jest.mock('../../services/NotificationService');

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Reset NotificationService mock
  (NotificationService.getInstance as jest.Mock).mockImplementation(() => ({
    createNotificationForMany: jest.fn(),
    createNotification: jest.fn()
  }));

  auditNotificationHandler = AuditNotificationHandler.getInstance();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('AuditNotificationHandler', () => {
  const actorId = new mongoose.Types.ObjectId();

  describe('User Audit Handling', () => {
    it('should handle user creation audit', async () => {
      const auditLog = {
        _id: new mongoose.Types.ObjectId(),
        actor: actorId,
        action: AuditAction.CREATE,
        entityType: 'User',
        entityId: new mongoose.Types.ObjectId(),
        after: {
          email: 'test@example.com',
          role: UserRole.HR
        }
      };

      await auditNotificationHandler.handleAuditLog(auditLog);

      const notificationService = NotificationService.getInstance();
      expect(notificationService.createNotificationForMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ role: UserRole.ADMIN })
        ]),
        expect.objectContaining({
          type: NotificationType.USER_SIGNUP
        })
      );
    });

    it('should handle user role change audit', async () => {
      const auditLog = {
        _id: new mongoose.Types.ObjectId(),
        actor: actorId,
        action: AuditAction.UPDATE,
        entityType: 'User',
        entityId: new mongoose.Types.ObjectId(),
        metadata: {
          roleChange: true,
          oldRole: UserRole.AGENT,
          newRole: UserRole.HR
        }
      };

      await auditNotificationHandler.handleAuditLog(auditLog);

      const notificationService = NotificationService.getInstance();
      expect(notificationService.createNotificationForMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ role: UserRole.ADMIN }),
          expect.objectContaining({ id: auditLog.entityId })
        ]),
        expect.objectContaining({
          type: NotificationType.USER_ROLE_CHANGE
        })
      );
    });
  });

  describe('Company Audit Handling', () => {
    it('should handle company creation audit', async () => {
      const auditLog = {
        _id: new mongoose.Types.ObjectId(),
        actor: actorId,
        action: AuditAction.CREATE,
        entityType: 'Company',
        entityId: new mongoose.Types.ObjectId(),
        after: {
          name: 'Test Company'
        }
      };

      await auditNotificationHandler.handleAuditLog(auditLog);

      const notificationService = NotificationService.getInstance();
      expect(notificationService.createNotificationForMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ role: UserRole.ADMIN })
        ]),
        expect.objectContaining({
          type: NotificationType.COMPANY_CREATE
        })
      );
    });

    it('should handle company update audit', async () => {
      const auditLog = {
        _id: new mongoose.Types.ObjectId(),
        actor: actorId,
        action: AuditAction.UPDATE,
        entityType: 'Company',
        entityId: new mongoose.Types.ObjectId(),
        metadata: {
          name: 'Updated Company',
          hrIds: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()]
        }
      };

      await auditNotificationHandler.handleAuditLog(auditLog);

      const notificationService = NotificationService.getInstance();
      expect(notificationService.createNotificationForMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ role: UserRole.ADMIN }),
          ...auditLog.metadata.hrIds.map((id: string) =>
            expect.objectContaining({ id, role: UserRole.HR })
          )
        ]),
        expect.objectContaining({
          type: NotificationType.COMPANY_UPDATE
        })
      );
    });
  });

  describe('Job Audit Handling', () => {
    it('should handle job creation audit', async () => {
      const auditLog = {
        _id: new mongoose.Types.ObjectId(),
        actor: actorId,
        action: AuditAction.CREATE,
        entityType: 'Job',
        entityId: new mongoose.Types.ObjectId(),
        after: {
          title: 'Software Engineer',
          companyId: new mongoose.Types.ObjectId()
        },
        metadata: {
          hrIds: [new mongoose.Types.ObjectId()],
          agentIds: [new mongoose.Types.ObjectId()]
        }
      };

      await auditNotificationHandler.handleAuditLog(auditLog);

      const notificationService = NotificationService.getInstance();
      expect(notificationService.createNotificationForMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ role: UserRole.ADMIN }),
          expect.objectContaining({ role: UserRole.HR }),
          expect.objectContaining({ role: UserRole.AGENT })
        ]),
        expect.objectContaining({
          type: NotificationType.JOB_CREATE,
          actionUrl: expect.stringContaining('/jobs/')
        })
      );
    });

    it('should handle job status change audit', async () => {
      const auditLog = {
        _id: new mongoose.Types.ObjectId(),
        actor: actorId,
        action: AuditAction.UPDATE,
        entityType: 'Job',
        entityId: new mongoose.Types.ObjectId(),
        metadata: {
          statusChange: true,
          oldStatus: 'draft',
          newStatus: 'published',
          title: 'Software Engineer',
          hrIds: [new mongoose.Types.ObjectId()],
          agentIds: [new mongoose.Types.ObjectId()]
        }
      };

      await auditNotificationHandler.handleAuditLog(auditLog);

      const notificationService = NotificationService.getInstance();
      expect(notificationService.createNotificationForMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ role: UserRole.ADMIN }),
          expect.objectContaining({ role: UserRole.HR }),
          expect.objectContaining({ role: UserRole.AGENT })
        ]),
        expect.objectContaining({
          type: NotificationType.JOB_STATUS_CHANGE,
          priority: 'high'
        })
      );
    });
  });

  describe('Candidate Audit Handling', () => {
    it('should handle candidate assignment audit', async () => {
      const auditLog = {
        _id: new mongoose.Types.ObjectId(),
        actor: actorId,
        action: AuditAction.ASSIGN,
        entityType: 'Candidate',
        entityId: new mongoose.Types.ObjectId(),
        metadata: {
          assignedToId: new mongoose.Types.ObjectId(),
          assignedTo: 'John Agent',
          candidateName: 'Test Candidate'
        }
      };

      await auditNotificationHandler.handleAuditLog(auditLog);

      const notificationService = NotificationService.getInstance();
      expect(notificationService.createNotificationForMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ role: UserRole.ADMIN }),
          expect.objectContaining({ id: auditLog.metadata.assignedToId })
        ]),
        expect.objectContaining({
          type: NotificationType.CANDIDATE_ASSIGN,
          actionUrl: expect.stringContaining('/candidates/')
        })
      );
    });

    it('should handle candidate status change audit', async () => {
      const auditLog = {
        _id: new mongoose.Types.ObjectId(),
        actor: actorId,
        action: AuditAction.UPDATE,
        entityType: 'Candidate',
        entityId: new mongoose.Types.ObjectId(),
        metadata: {
          statusChange: true,
          oldStatus: 'new',
          newStatus: 'in_review',
          candidateName: 'Test Candidate',
          agentIds: [new mongoose.Types.ObjectId()],
          hrIds: [new mongoose.Types.ObjectId()]
        }
      };

      await auditNotificationHandler.handleAuditLog(auditLog);

      const notificationService = NotificationService.getInstance();
      expect(notificationService.createNotificationForMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ role: UserRole.CANDIDATE }),
          expect.objectContaining({ role: UserRole.AGENT }),
          expect.objectContaining({ role: UserRole.HR })
        ]),
        expect.objectContaining({
          type: NotificationType.CANDIDATE_STATUS_CHANGE,
          priority: 'high'
        })
      );
    });
  });

  describe('Interview Audit Handling', () => {
    it('should handle interview scheduling audit', async () => {
      const auditLog = {
        _id: new mongoose.Types.ObjectId(),
        actor: actorId,
        action: AuditAction.CREATE,
        entityType: 'Interview',
        entityId: new mongoose.Types.ObjectId(),
        after: {
          scheduledAt: new Date(),
          type: 'technical'
        },
        metadata: {
          candidateId: new mongoose.Types.ObjectId(),
          candidateName: 'Test Candidate',
          jobTitle: 'Software Engineer',
          agentIds: [new mongoose.Types.ObjectId()],
          hrIds: [new mongoose.Types.ObjectId()]
        }
      };

      await auditNotificationHandler.handleAuditLog(auditLog);

      const notificationService = NotificationService.getInstance();
      expect(notificationService.createNotificationForMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: auditLog.metadata.candidateId }),
          expect.objectContaining({ role: UserRole.AGENT }),
          expect.objectContaining({ role: UserRole.HR })
        ]),
        expect.objectContaining({
          type: NotificationType.INTERVIEW_SCHEDULE,
          actionUrl: expect.stringContaining('/interviews/')
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      const notificationService = NotificationService.getInstance();
      (notificationService.createNotificationForMany as jest.Mock).mockRejectedValueOnce(
        new Error('Test error')
      );

      const auditLog = {
        _id: new mongoose.Types.ObjectId(),
        actor: actorId,
        action: AuditAction.CREATE,
        entityType: 'User',
        entityId: new mongoose.Types.ObjectId(),
        after: {
          email: 'test@example.com',
          role: UserRole.HR
        }
      };

      // Should not throw error
      await expect(auditNotificationHandler.handleAuditLog(auditLog)).resolves.not.toThrow();
    });
  });
});

