import { Notification, NotificationDocument } from '@/models/Notification';
import { INotification, NotificationType } from '@/types/notifications';
import { UserRole } from '@/types';
import { logger } from '@/config/logger';
import { SocketService } from './SocketService';

export class NotificationService {
  private static instance: NotificationService;
  private socketService: SocketService;

  private constructor() {
    this.socketService = SocketService.getInstance();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Create a single notification
   */
  public async createNotification(data: Omit<INotification, '_id' | 'createdAt'>): Promise<NotificationDocument> {
    try {
      const notification = new Notification(data);
      const savedNotification = await notification.save();
      
      logger.debug('Created notification', {
        notificationId: savedNotification._id,
        type: data.type,
        recipientId: data.recipientId
      });

      // Emit real-time notification
      const notificationData = {
        ...savedNotification.toObject(),
        _id: savedNotification._id.toString()
      };
      this.socketService.emitNotificationToUser(data.recipientId.toString(), notificationData);

      return savedNotification;
    } catch (error) {
      logger.error('Failed to create notification', { error, data });
      throw error;
    }
  }

  /**
   * Create notifications for multiple recipients
   */
  public async createNotificationForMany(
    recipients: Array<{ id: string; role: UserRole }>,
    data: Omit<INotification, '_id' | 'createdAt' | 'recipientId' | 'recipientRole'>
  ): Promise<NotificationDocument[]> {
    try {
      const notifications = recipients.map(recipient => ({
        ...data,
        recipientId: recipient.id,
        recipientRole: recipient.role
      }));

      const savedNotifications = await Notification.insertMany(notifications);
      
      logger.debug('Created notifications for multiple recipients', {
        notificationCount: savedNotifications.length,
        type: data.type
      });

      // Emit real-time notifications to each recipient
      savedNotifications.forEach(notification => {
        const notificationData = {
          ...notification.toObject(),
          _id: notification._id.toString()
        };
        this.socketService.emitNotificationToUser(notification.recipientId.toString(), notificationData);
      });

      return savedNotifications;
    } catch (error) {
      logger.error('Failed to create notifications for multiple recipients', { error, data });
      throw error;
    }
  }

  /**
   * Get notifications for a user with pagination
   */
  public async getUserNotifications(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      includeArchived?: boolean;
      type?: NotificationType;
    } = {}
  ): Promise<{ notifications: NotificationDocument[]; hasMore: boolean; total: number }> {
    try {
      const { limit = 20, offset = 0, includeArchived = false, type } = options;
      
      const query: any = { recipientId: userId };
      
      if (!includeArchived) {
        query.isArchived = false;
      }
      
      if (type) {
        query.type = type;
      }

      const [notifications, total] = await Promise.all([
        Notification.find(query)
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit + 1) // Get one extra to check if there are more
          .lean(),
        Notification.countDocuments(query)
      ]);

      const hasMore = notifications.length > limit;
      if (hasMore) {
        notifications.pop(); // Remove the extra notification
      }

      return {
        notifications: notifications as NotificationDocument[],
        hasMore,
        total
      };
    } catch (error) {
      logger.error('Failed to get user notifications', { error, userId, options });
      throw error;
    }
  }

  /**
   * Get unread notification count for a user
   */
  public async getUnreadCount(userId: string): Promise<number> {
    try {
      return await Notification.getUnreadCount(userId);
    } catch (error) {
      logger.error('Failed to get unread count', { error, userId });
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  public async markAsRead(notificationId: string, userId: string): Promise<NotificationDocument | null> {
    try {
      const notification = await Notification.markAsRead(notificationId, userId);
      
      if (notification) {
        logger.debug('Marked notification as read', {
          notificationId,
          userId
        });
      }

      return notification;
    } catch (error) {
      logger.error('Failed to mark notification as read', { error, notificationId, userId });
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  public async markAllAsRead(userId: string): Promise<number> {
    try {
      const count = await Notification.markAllAsRead(userId);
      
      logger.debug('Marked all notifications as read', {
        userId,
        count
      });

      return count;
    } catch (error) {
      logger.error('Failed to mark all notifications as read', { error, userId });
      throw error;
    }
  }

  /**
   * Archive a notification
   */
  public async archiveNotification(notificationId: string, userId: string): Promise<NotificationDocument | null> {
    try {
      const notification = await Notification.archiveNotification(notificationId, userId);
      
      if (notification) {
        logger.debug('Archived notification', {
          notificationId,
          userId
        });
      }

      return notification;
    } catch (error) {
      logger.error('Failed to archive notification', { error, notificationId, userId });
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  public async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      const result = await Notification.findOneAndDelete({
        _id: notificationId,
        recipientId: userId
      });

      if (result) {
        logger.debug('Deleted notification', {
          notificationId,
          userId
        });
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Failed to delete notification', { error, notificationId, userId });
      throw error;
    }
  }

  /**
   * Clean up expired notifications
   */
  public async cleanupExpiredNotifications(): Promise<number> {
    try {
      const deletedCount = await Notification.deleteExpiredNotifications();
      
      if (deletedCount > 0) {
        logger.info('Cleaned up expired notifications', { deletedCount });
      }

      return deletedCount;
    } catch (error) {
      logger.error('Failed to cleanup expired notifications', { error });
      throw error;
    }
  }

  /**
   * Create a system notification for all users with a specific role
   */
  public async createSystemNotification(
    role: UserRole,
    data: Omit<INotification, '_id' | 'createdAt' | 'recipientId' | 'recipientRole'>
  ): Promise<NotificationDocument[]> {
    try {
      // This would typically involve getting all users with the specified role
      // For now, we'll create a placeholder implementation
      // In a real implementation, you'd query the User model to get all users with the role
      
      logger.warn('createSystemNotification not fully implemented - would need to query users by role');
      
      // Placeholder return - in real implementation, you'd:
      // 1. Query User model for all users with the specified role
      // 2. Create notifications for each user
      // 3. Return the created notifications
      
      return [];
    } catch (error) {
      logger.error('Failed to create system notification', { error, role, data });
      throw error;
    }
  }
}
