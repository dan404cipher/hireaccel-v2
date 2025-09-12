import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { NotificationService } from '../../services/NotificationService';
import { Notification } from '../../models/Notification';
import { NotificationPreference } from '../../models/NotificationPreference';
import { WebSocketService } from '../../services/WebSocketService';
import { EmailService } from '../../services/EmailService';
import { NotificationType, NotificationPriority, UserRole } from '../../types/notifications';

// Mock WebSocket and Email services
jest.mock('../../services/WebSocketService');
jest.mock('../../services/EmailService');

let mongoServer: MongoMemoryServer;
let notificationService: NotificationService;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Reset mocks
  (WebSocketService.getInstance as jest.Mock).mockImplementation(() => ({
    sendNotification: jest.fn(),
    broadcastNotification: jest.fn()
  }));

  (EmailService.getInstance as jest.Mock).mockImplementation(() => ({
    sendNotificationEmail: jest.fn()
  }));

  notificationService = NotificationService.getInstance();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Notification.deleteMany({});
  await NotificationPreference.deleteMany({});
  jest.clearAllMocks();
});

describe('NotificationService', () => {
  const mockNotificationData = {
    type: NotificationType.USER_SIGNUP,
    title: 'Test Notification',
    message: 'This is a test notification',
    recipientId: new mongoose.Types.ObjectId(),
    recipientRole: UserRole.ADMIN,
    entityType: 'User',
    entityId: new mongoose.Types.ObjectId(),
    metadata: { test: 'data' },
    priority: NotificationPriority.MEDIUM
  };

  describe('createNotification', () => {
    it('should create and deliver notification', async () => {
      await notificationService.createNotification(mockNotificationData);

      const notification = await Notification.findOne({ recipientId: mockNotificationData.recipientId });
      expect(notification).toBeDefined();
      expect(notification?.type).toBe(mockNotificationData.type);

      const webSocketService = WebSocketService.getInstance();
      expect(webSocketService.sendNotification).toHaveBeenCalled();

      const emailService = EmailService.getInstance();
      expect(emailService.sendNotificationEmail).toHaveBeenCalled();
    });

    it('should respect notification preferences', async () => {
      // Create preferences with email disabled
      await NotificationPreference.create({
        userId: mockNotificationData.recipientId,
        channelPreferences: {
          in_app: true,
          email: false,
          push: true
        }
      });

      await notificationService.createNotification(mockNotificationData);

      const webSocketService = WebSocketService.getInstance();
      expect(webSocketService.sendNotification).toHaveBeenCalled();

      const emailService = EmailService.getInstance();
      expect(emailService.sendNotificationEmail).not.toHaveBeenCalled();
    });

    it('should not create notification for disabled type', async () => {
      // Create preferences with notification type disabled
      await NotificationPreference.create({
        userId: mockNotificationData.recipientId,
        typePreferences: new Map([[NotificationType.USER_SIGNUP, false]])
      });

      await notificationService.createNotification(mockNotificationData);

      const notification = await Notification.findOne({ recipientId: mockNotificationData.recipientId });
      expect(notification).toBeNull();
    });
  });

  describe('createNotificationForMany', () => {
    it('should create notifications for multiple recipients', async () => {
      const recipients = [
        { id: new mongoose.Types.ObjectId(), role: UserRole.ADMIN },
        { id: new mongoose.Types.ObjectId(), role: UserRole.HR }
      ];

      const data = {
        type: NotificationType.JOB_CREATE,
        title: 'New Job',
        message: 'A new job has been created',
        entityType: 'Job',
        entityId: new mongoose.Types.ObjectId(),
        metadata: {}
      };

      await notificationService.createNotificationForMany(recipients, data);

      const notifications = await Notification.find({
        recipientId: { $in: recipients.map(r => r.id) }
      });

      expect(notifications).toHaveLength(2);
    });
  });

  describe('createNotificationForRoles', () => {
    it('should create notifications for all users with specified roles', async () => {
      // Create test users
      const users = await Promise.all([
        { _id: new mongoose.Types.ObjectId(), role: UserRole.ADMIN },
        { _id: new mongoose.Types.ObjectId(), role: UserRole.HR },
        { _id: new mongoose.Types.ObjectId(), role: UserRole.AGENT }
      ].map(user => ({ ...user })));

      // Mock User.find
      jest.spyOn(mongoose.Model, 'find').mockResolvedValueOnce(users);

      const data = {
        type: NotificationType.SYSTEM_MAINTENANCE,
        title: 'System Maintenance',
        message: 'System will be down for maintenance',
        entityType: 'System',
        entityId: new mongoose.Types.ObjectId(),
        metadata: {}
      };

      await notificationService.createNotificationForRoles(
        [UserRole.ADMIN, UserRole.HR],
        data
      );

      const notifications = await Notification.find();
      expect(notifications).toHaveLength(2);
    });
  });

  describe('Notification Management', () => {
    let notification: any;

    beforeEach(async () => {
      notification = await Notification.create(mockNotificationData);
    });

    it('should mark notification as read', async () => {
      await notificationService.markAsRead(notification._id.toString());

      const updated = await Notification.findById(notification._id);
      expect(updated?.isRead).toBe(true);
    });

    it('should mark all notifications as read', async () => {
      await Notification.create(mockNotificationData);
      await Notification.create(mockNotificationData);

      await notificationService.markAllAsRead(mockNotificationData.recipientId.toString());

      const notifications = await Notification.find({
        recipientId: mockNotificationData.recipientId
      });

      expect(notifications.every(n => n.isRead)).toBe(true);
    });

    it('should archive notification', async () => {
      await notificationService.archiveNotification(notification._id.toString());

      const updated = await Notification.findById(notification._id);
      expect(updated?.isArchived).toBe(true);
    });

    it('should get unread count', async () => {
      await Notification.create(mockNotificationData);
      await Notification.create({ ...mockNotificationData, isRead: true });

      const count = await notificationService.getUnreadCount(
        mockNotificationData.recipientId.toString()
      );

      expect(count).toBe(2);
    });

    it('should get user notifications with pagination', async () => {
      // Create 15 notifications
      await Promise.all(
        Array(15).fill(null).map(() => Notification.create(mockNotificationData))
      );

      const notifications = await notificationService.getUserNotifications(
        mockNotificationData.recipientId.toString(),
        { limit: 10, offset: 0 }
      );

      expect(notifications).toHaveLength(10);
    });
  });
});

