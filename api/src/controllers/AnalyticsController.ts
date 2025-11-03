import { Response } from 'express';
import { z } from 'zod';
import { AnalyticsEvent } from '@/models/AnalyticsEvent';
import { AuthenticatedRequest } from '@/types';
import { asyncHandler, createBadRequestError } from '@/middleware/errorHandler';
import mongoose from 'mongoose';

/**
 * Analytics Controller
 * Handles analytics tracking and insights
 */

const trackEventSchema = z.object({
  eventName: z.string().min(1),
  page: z.string().min(1),
  referrer: z.string().optional(),
  sessionId: z.string().min(1),
  userId: z.string().optional(),
  eventData: z.record(z.any()).optional(),
  utm: z.object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
  }).optional(),
  duration: z.number().optional(),
});

const querySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  source: z.string().optional(),
  eventName: z.string().optional(),
});

export class AnalyticsController {
  /**
   * Track an analytics event
   * POST /api/analytics/track
   */
  static track = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validatedData = trackEventSchema.parse(req.body);
    
    // Use authenticated user ID if available, otherwise use provided userId
    const userId = req.user?._id || (validatedData.userId ? new mongoose.Types.ObjectId(validatedData.userId) : undefined);

    const event = new AnalyticsEvent({
      eventName: validatedData.eventName,
      page: validatedData.page,
      referrer: validatedData.referrer || req.get('referer') || null,
      sessionId: validatedData.sessionId,
      userId: userId,
      eventData: validatedData.eventData || {},
      utm: validatedData.utm || {},
      duration: validatedData.duration,
      timestamp: new Date(),
    });

    await event.save();

    res.status(201).json({
      success: true,
      data: event,
      message: 'Event tracked successfully',
    });
  });

  /**
   * Get analytics summary
   * GET /api/analytics/summary
   */
  static getSummary = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { startDate, endDate } = querySchema.parse(req.query);
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
    const end = endDate ? new Date(endDate) : new Date();

    // Total events
    const totalEvents = await AnalyticsEvent.countDocuments({
      timestamp: { $gte: start, $lte: end },
    });

    // Total unique sessions
    const uniqueSessions = await AnalyticsEvent.distinct('sessionId', {
      timestamp: { $gte: start, $lte: end },
    });

    // Total unique users
    const uniqueUsers = await AnalyticsEvent.distinct('userId', {
      timestamp: { $gte: start, $lte: end },
      userId: { $ne: null },
    });

    // Signups (signup_successful events)
    const signups = await AnalyticsEvent.countDocuments({
      eventName: 'signup_successful',
      timestamp: { $gte: start, $lte: end },
    });

    // Bounce analysis
    const sessionStats = await AnalyticsEvent.aggregate([
      {
        $match: {
          timestamp: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$sessionId',
          pages: { $addToSet: '$page' },
          duration: { $max: '$duration' },
          userId: { $first: '$userId' },
          startTime: { $min: '$timestamp' },
          endTime: { $max: '$timestamp' },
        },
      },
      {
        $project: {
          sessionId: '$_id',
          pageCount: { $size: '$pages' },
          duration: {
            $ifNull: [
              '$duration',
              {
                $divide: [
                  { $subtract: ['$endTime', '$startTime'] },
                  1000,
                ],
              },
            ],
          },
          userId: 1,
          isBounced: {
            $or: [
              { $lt: [{ $ifNull: ['$duration', { $divide: [{ $subtract: ['$endTime', '$startTime'] }, 1000] }] }, 5] },
              { $eq: [{ $size: '$pages' }, 1] },
            ],
          },
        },
      },
    ]);

    const totalSessions = sessionStats.length;
    const bouncedSessions = sessionStats.filter(s => s.isBounced).length;
    const bounceRate = totalSessions > 0 ? (bouncedSessions / totalSessions) * 100 : 0;

    const registeredSessions = sessionStats.filter(s => s.userId !== null);
    const avgDurationAll = sessionStats.reduce((sum, s) => sum + (s.duration || 0), 0) / totalSessions || 0;
    const avgDurationBounced = sessionStats
      .filter(s => s.isBounced)
      .reduce((sum, s) => sum + (s.duration || 0), 0) / bouncedSessions || 0;
    const avgDurationRegistered = registeredSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / registeredSessions.length || 0;

    // Daily Active Users (last 30 days)
    const dailyActiveUsers = await AnalyticsEvent.aggregate([
      {
        $match: {
          timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), $lte: end },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          uniqueSessions: { $addToSet: '$sessionId' },
        },
      },
      {
        $project: {
          date: '$_id',
          count: { $size: '$uniqueSessions' },
        },
      },
      {
        $sort: { date: 1 },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalEvents,
        totalSessions,
        uniqueSessions: uniqueSessions.length,
        uniqueUsers: uniqueUsers.length,
        signups,
        bounceRate: Math.round(bounceRate * 100) / 100,
        bouncedSessions,
        avgSessionDuration: {
          all: Math.round(avgDurationAll * 100) / 100,
          bounced: Math.round(avgDurationBounced * 100) / 100,
          registered: Math.round(avgDurationRegistered * 100) / 100,
        },
        dailyActiveUsers,
      },
    });
  });

  /**
   * Get funnel data
   * GET /api/analytics/funnels
   */
  static getFunnels = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { startDate, endDate } = querySchema.parse(req.query);
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Define funnel stages
    const stages = [
      { name: 'Visited', events: ['page_view', 'session_start'] },
      { name: 'Signup', events: ['signup_button_clicked'] },
      { name: 'OTP', events: ['otp_page_loaded'] },
      { name: 'Registered', events: ['signup_successful'] },
    ];

    // Get unique session counts for each stage
    const funnelData = await Promise.all(
      stages.map(async (stage) => {
        const uniqueSessions = await AnalyticsEvent.distinct('sessionId', {
          eventName: { $in: stage.events },
          timestamp: { $gte: start, $lte: end },
        });

        return {
          stage: stage.name,
          count: uniqueSessions.length,
        };
      })
    );

    // Calculate drop-off rates
    const funnelWithDropoff = funnelData.map((stage, index) => {
      const previousCount = index > 0 ? funnelData[index - 1].count : stage.count;
      const dropoff = previousCount > 0 
        ? ((previousCount - stage.count) / previousCount) * 100 
        : 0;
      
      return {
        ...stage,
        dropoff: Math.round(dropoff * 100) / 100,
      };
    });

    // Calculate conversion rate (dashboard reached vs total visitors)
    const totalVisitors = funnelData[0].count;
    const dashboardReached = await AnalyticsEvent.distinct('sessionId', {
      page: { $regex: /dashboard/i },
      timestamp: { $gte: start, $lte: end },
    }).then(sessions => sessions.length);

    const conversionRate = totalVisitors > 0 
      ? (dashboardReached / totalVisitors) * 100 
      : 0;

    res.json({
      success: true,
      data: {
        funnel: funnelWithDropoff,
        conversionRate: Math.round(conversionRate * 100) / 100,
        dashboardReached,
      },
    });
  });

  /**
   * Get referral source insights
   * GET /api/analytics/sources
   */
  static getSources = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { startDate, endDate } = querySchema.parse(req.query);
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get source performance
    const sourcePerformance = await AnalyticsEvent.aggregate([
      {
        $match: {
          timestamp: { $gte: start, $lte: end },
          'utm.source': { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$utm.source',
          totalEvents: { $sum: 1 },
          uniqueSessions: { $addToSet: '$sessionId' },
          signups: {
            $sum: {
              $cond: [{ $eq: ['$eventName', 'signup_successful'] }, 1, 0],
            },
          },
          conversions: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$eventName', 'signup_successful'] },
                    { $regexMatch: { input: '$page', regex: /dashboard/i } },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          source: '$_id',
          totalEvents: 1,
          uniqueSessions: { $size: '$uniqueSessions' },
          signups: 1,
          conversions: 1,
          conversionRate: {
            $cond: [
              { $gt: [{ $size: '$uniqueSessions' }, 0] },
              {
                $multiply: [
                  {
                    $divide: [
                      '$conversions',
                      { $size: '$uniqueSessions' },
                    ],
                  },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
      {
        $sort: { uniqueSessions: -1 },
      },
    ]);

    // Get top referral sources (from referrer field)
    const topReferrers = await AnalyticsEvent.aggregate([
      {
        $match: {
          timestamp: { $gte: start, $lte: end },
          referrer: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$referrer',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Direct vs Referral breakdown
    const directSessions = await AnalyticsEvent.distinct('sessionId', {
      timestamp: { $gte: start, $lte: end },
      $or: [
        { referrer: null },
        { referrer: '' },
        { 'utm.source': { $exists: false } },
      ],
    });

    const referralSessions = await AnalyticsEvent.distinct('sessionId', {
      timestamp: { $gte: start, $lte: end },
      referrer: { $exists: true, $ne: null, $ne: '' },
    });

    res.json({
      success: true,
      data: {
        sourcePerformance,
        topReferrers,
        directSessions: directSessions.length,
        referralSessions: referralSessions.length,
      },
    });
  });

  /**
   * Get raw event logs with filters
   * GET /api/analytics/events
   */
  static getEvents = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { startDate, endDate, source, eventName } = querySchema.parse(req.query);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const query: any = {};
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    if (source) {
      query['utm.source'] = source;
    }

    if (eventName) {
      query.eventName = eventName;
    }

    const [events, total] = await Promise.all([
      AnalyticsEvent.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'email firstName lastName role')
        .lean(),
      AnalyticsEvent.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: events,
      meta: {
        page: {
          current: page,
          total: Math.ceil(total / limit),
          hasMore: skip + events.length < total,
        },
        total,
        limit,
      },
    });
  });
}

