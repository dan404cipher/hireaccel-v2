import { Router } from 'express';
import { AnalyticsController } from '@/controllers/AnalyticsController';
import { authenticate, requireAdmin, optionalAuth } from '@/middleware/auth';

/**
 * Analytics routes
 * Handles analytics tracking and insights
 */

const router = Router();

/**
 * @route   POST /api/analytics/track
 * @desc    Track an analytics event
 * @access  Public (optional auth for userId tracking)
 */
router.post('/track', optionalAuth, AnalyticsController.track);

/**
 * @route   GET /api/analytics/summary
 * @desc    Get analytics summary
 * @access  Admin only
 */
router.get('/summary', authenticate, requireAdmin, AnalyticsController.getSummary);

/**
 * @route   GET /api/analytics/funnels
 * @desc    Get funnel data
 * @access  Admin only
 */
router.get('/funnels', authenticate, requireAdmin, AnalyticsController.getFunnels);

/**
 * @route   GET /api/analytics/sources
 * @desc    Get referral source insights
 * @access  Admin only
 */
router.get('/sources', authenticate, requireAdmin, AnalyticsController.getSources);

/**
 * @route   GET /api/analytics/events
 * @desc    Get raw event logs with filters
 * @access  Admin only
 */
router.get('/events', authenticate, requireAdmin, AnalyticsController.getEvents);

export default router;

