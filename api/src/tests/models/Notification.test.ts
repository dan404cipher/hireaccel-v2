import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Notification } from '../../models/Notification';
import { NotificationType, NotificationPriority, UserRole } from '../../types/notifications';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Notification.deleteMany({});
});

describe('Notification Model', () => {
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

  it('should create a notification successfully', async () => {
    const notification = await Notification.createNotification(mockNotificationData);

    expect(notification._id).toBeDefined();
    expect(notification.type).toBe(mockNotificationData.type);
    expect(notification.title).toBe(mockNotificationData.title);
    expect(notification.message).toBe(mockNotificationData.message);
    expect(notification.isRead).toBe(false);
    expect(notification.isArchived).toBe(false);
  });

  it('should mark notification as read', async () => {
    const notification = await Notification.createNotification(mockNotificationData);
    await notification.markAsRead();

    const updatedNotification = await Notification.findById(notification._id);
    expect(updatedNotification?.isRead).toBe(true);
  });

  it('should mark notification as archived', async () => {
    const notification = await Notification.createNotification(mockNotificationData);
    await notification.markAsArchived();

    const updatedNotification = await Notification.findById(notification._id);
    expect(updatedNotification?.isArchived).toBe(true);
  });

  it('should get unread count correctly', async () => {
    const userId = new mongoose.Types.ObjectId();

    // Create multiple notifications
    await Promise.all([
      Notification.createNotification({ ...mockNotificationData, recipientId: userId }),
      Notification.createNotification({ ...mockNotificationData, recipientId: userId }),
      Notification.createNotification({ ...mockNotificationData, recipientId: userId, isRead: true }),
      Notification.createNotification({ ...mockNotificationData, recipientId: userId, isArchived: true })
    ]);

    const unreadCount = await Notification.getUnreadCount(userId.toString());
    expect(unreadCount).toBe(2);
  });

  it('should get user notifications with pagination', async () => {
    const userId = new mongoose.Types.ObjectId();

    // Create multiple notifications
    await Promise.all(
      Array(15).fill(null).map(() =>
        Notification.createNotification({ ...mockNotificationData, recipientId: userId })
      )
    );

    const notifications = await Notification.getUserNotifications(userId.toString(), {
      limit: 10,
      offset: 0
    });

    expect(notifications).toHaveLength(10);
  });

  it('should handle expired notifications', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    const notification = await Notification.createNotification({
      ...mockNotificationData,
      expiresAt: pastDate
    });

    expect(notification.isExpired()).toBe(true);
  });

  it('should filter archived notifications by default', async () => {
    const userId = new mongoose.Types.ObjectId();

    await Promise.all([
      Notification.createNotification({ ...mockNotificationData, recipientId: userId }),
      Notification.createNotification({ ...mockNotificationData, recipientId: userId, isArchived: true })
    ]);

    const notifications = await Notification.getUserNotifications(userId.toString());
    expect(notifications).toHaveLength(1);
  });

  it('should include archived notifications when specified', async () => {
    const userId = new mongoose.Types.ObjectId();

    await Promise.all([
      Notification.createNotification({ ...mockNotificationData, recipientId: userId }),
      Notification.createNotification({ ...mockNotificationData, recipientId: userId, isArchived: true })
    ]);

    const notifications = await Notification.getUserNotifications(userId.toString(), {
      includeArchived: true
    });
    expect(notifications).toHaveLength(2);
  });

  it('should filter by notification type', async () => {
    const userId = new mongoose.Types.ObjectId();

    await Promise.all([
      Notification.createNotification({ ...mockNotificationData, recipientId: userId }),
      Notification.createNotification({
        ...mockNotificationData,
        recipientId: userId,
        type: NotificationType.USER_UPDATE
      })
    ]);

    const notifications = await Notification.getUserNotifications(userId.toString(), {
      type: [NotificationType.USER_SIGNUP]
    });
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe(NotificationType.USER_SIGNUP);
  });
});

