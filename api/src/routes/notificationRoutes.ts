import { Router } from 'express';
import { NotificationController } from '@/controllers/NotificationController';
import { authenticate } from '@/middleware/auth';

/**
 * Notification routes
 * Handles notification-related operations for users
 */

const router = Router();

// All notification routes require authentication
router.use(authenticate);

/**
 * @route   GET /notifications
 * @desc    Get user notifications with pagination
 * @access  Private
 * @query   offset, limit, includeArchived, type
 */
router.get('/', NotificationController.getNotifications);

/**
 * @route   GET /notifications/unread
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/unread', NotificationController.getUnreadCount);

/**
 * @route   PUT /notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:id/read', NotificationController.markAsRead);

/**
 * @route   PUT /notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/read-all', NotificationController.markAllAsRead);

/**
 * @route   PUT /notifications/:id/archive
 * @desc    Archive notification
 * @access  Private
 */
router.put('/:id/archive', NotificationController.archiveNotification);

/**
 * @route   DELETE /notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
router.delete('/:id', NotificationController.deleteNotification);

/**
 * @route   POST /notifications/preferences
 * @desc    Update notification preferences
 * @access  Private
 */
router.post('/preferences', NotificationController.updatePreferences);

export default router;
