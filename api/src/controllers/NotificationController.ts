import { Response } from 'express';
import { NotificationService } from '@/services/NotificationService';
import { NotificationType } from '@/types/notifications';
import { AuthenticatedRequest } from '@/types';
import { asyncHandler } from '@/middleware/errorHandler';
import { logger } from '@/config/logger';

export class NotificationController {
  private static notificationService = NotificationService.getInstance();

  /**
   * @route   GET /notifications
   * @desc    Get user notifications with pagination
   * @access  Private
   */
  public static getNotifications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const {
        offset = 0,
        limit = 20,
        includeArchived = false,
        type
      } = req.query;

      const options = {
        offset: parseInt(offset as string) || 0,
        limit: Math.min(parseInt(limit as string) || 20, 100), // Cap at 100
        includeArchived: includeArchived === 'true',
        type: type as NotificationType
      };

      const result = await NotificationController.notificationService.getUserNotifications(
        userId,
        options
      );

      res.json({
        success: true,
        data: {
          notifications: result.notifications,
          hasMore: result.hasMore,
          total: result.total,
          offset: options.offset,
          limit: options.limit
        }
      });
    } catch (error) {
      logger.error('Failed to get notifications', { error, userId: req.user?._id?.toString() });
      res.status(500).json({ message: 'Failed to fetch notifications' });
    }
  });

  /**
   * @route   GET /notifications/unread
   * @desc    Get unread notification count
   * @access  Private
   */
  public static getUnreadCount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const count = await NotificationController.notificationService.getUnreadCount(userId);

      res.json({ 
        success: true,
        data: { count }
      });
    } catch (error) {
      logger.error('Failed to get unread count', { error, userId: req.user?._id?.toString() });
      res.status(500).json({ message: 'Failed to fetch unread count' });
    }
  });

  /**
   * @route   PUT /notifications/:id/read
   * @desc    Mark notification as read
   * @access  Private
   */
  public static markAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?._id?.toString();
      const id = req.params['id'];
      if (!id) {
        res.status(400).json({ message: 'Notification ID is required' });
        return;
      }

      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const notification = await NotificationController.notificationService.markAsRead(id, userId!);

      if (!notification) {
        res.status(404).json({ message: 'Notification not found' });
        return;
      }

      res.json({ 
        success: true,
        data: { message: 'Notification marked as read', notification }
      });
    } catch (error) {
      logger.error('Failed to mark notification as read', { error, userId: req.user?._id?.toString(), notificationId: req.params['id'] });
      res.status(500).json({ message: 'Failed to mark notification as read' });
    }
  });

  /**
   * @route   PUT /notifications/read-all
   * @desc    Mark all notifications as read
   * @access  Private
   */
  public static markAllAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const count = await NotificationController.notificationService.markAllAsRead(userId);

      res.json({ 
        success: true,
        data: { 
          message: 'All notifications marked as read',
          count 
        }
      });
    } catch (error) {
      logger.error('Failed to mark all notifications as read', { error, userId: req.user?._id?.toString() });
      res.status(500).json({ message: 'Failed to mark all notifications as read' });
    }
  });

  /**
   * @route   PUT /notifications/:id/archive
   * @desc    Archive notification
   * @access  Private
   */
  public static archiveNotification = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?._id?.toString();
      const id = req.params['id'];
      if (!id) {
        res.status(400).json({ message: 'Notification ID is required' });
        return;
      }

      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const notification = await NotificationController.notificationService.archiveNotification(id, userId!);

      if (!notification) {
        res.status(404).json({ message: 'Notification not found' });
        return;
      }

      res.json({ 
        success: true,
        data: { message: 'Notification archived', notification }
      });
    } catch (error) {
      logger.error('Failed to archive notification', { error, userId: req.user?._id?.toString(), notificationId: req.params['id'] });
      res.status(500).json({ message: 'Failed to archive notification' });
    }
  });

  /**
   * @route   DELETE /notifications/:id
   * @desc    Delete notification
   * @access  Private
   */
  public static deleteNotification = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?._id?.toString();
      const id = req.params['id'];
      if (!id) {
        res.status(400).json({ message: 'Notification ID is required' });
        return;
      }

      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const deleted = await NotificationController.notificationService.deleteNotification(id, userId!);

      if (!deleted) {
        res.status(404).json({ message: 'Notification not found' });
        return;
      }

      res.json({ 
        success: true,
        data: { message: 'Notification deleted' }
      });
    } catch (error) {
      logger.error('Failed to delete notification', { error, userId: req.user?._id?.toString(), notificationId: req.params['id'] });
      res.status(500).json({ message: 'Failed to delete notification' });
    }
  });

  /**
   * @route   POST /notifications/preferences
   * @desc    Update notification preferences (placeholder)
   * @access  Private
   */
  public static updatePreferences = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      // This is a placeholder implementation
      // In a real implementation, you would:
      // 1. Validate the preferences data
      // 2. Save preferences to a NotificationPreference model
      // 3. Return the updated preferences

      logger.warn('updatePreferences not fully implemented - would need NotificationPreference model');

      res.json({ 
        success: true,
        data: { 
          message: 'Notification preferences update not yet implemented',
          preferences: req.body 
        }
      });
    } catch (error) {
      logger.error('Failed to update notification preferences', { error, userId: req.user?._id?.toString() });
      res.status(500).json({ message: 'Failed to update notification preferences' });
    }
  });
}
