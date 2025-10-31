import { Response } from 'express';
import { AuditLog } from '@/models/AuditLog';
import { AuthenticatedRequest, AuditAction } from '@/types';
import { asyncHandler, createBadRequestError } from '@/middleware/errorHandler';
import { z } from 'zod';
import mongoose from 'mongoose';

const querySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('50'),
  entityType: z.string().optional(),
  action: z.nativeEnum(AuditAction).optional(),
  entityId: z.string().optional(),
  actorId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

export class AuditLogController {
  /**
   * Get all audit logs with filtering and pagination
   * GET /audit-logs
   */
  static getAuditLogs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { page, limit, entityType, action, entityId, actorId, startDate, endDate, riskLevel } = querySchema.parse(req.query);
    
    const skip = (page - 1) * limit;
    const query: any = {};
    
    // For HR users, only show their own activities
    if (req.user?.role === 'hr') {
      query.actor = req.user._id;
      // If actorId is provided, ensure it matches the HR user's ID
      if (actorId && mongoose.Types.ObjectId.isValid(actorId)) {
        const requestedActorId = new mongoose.Types.ObjectId(actorId as string);
        // Only allow if the requested actor ID matches the HR user's ID
        if (!requestedActorId.equals(req.user._id)) {
          // Return empty results for unauthorized access
          return res.json({
            success: true,
            data: [],
            meta: {
              page: {
                current: page,
                total: 0,
                hasMore: false,
              },
              total: 0,
              limit,
            },
          });
        }
      }
    } else {
      // For admin/superadmin, allow filtering by any actorId
      if (actorId && mongoose.Types.ObjectId.isValid(actorId)) {
        query.actor = new mongoose.Types.ObjectId(actorId as string);
      }
    }
    
    if (entityType) query.entityType = entityType;
    if (action) query.action = action;
    if (entityId && mongoose.Types.ObjectId.isValid(entityId)) {
      query.entityId = new mongoose.Types.ObjectId(entityId as string);
    }
    if (riskLevel) query.riskLevel = riskLevel;
    
    if (startDate || endDate) {
      query.timestamp = {} as any;
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }
    
    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('actor', 'firstName lastName email role customId')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(query),
    ]);
    
    res.json({
      success: true,
      data: logs,
      meta: {
        page: {
          current: page,
          total: Math.ceil(total / limit),
          hasMore: skip + logs.length < total,
        },
        total,
        limit,
      },
    });
  });

  /**
   * Get audit logs for a specific entity
   * GET /audit-logs/entity/:entityType/:entityId
   */
  static getEntityLogs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { entityType, entityId } = req.params;
    const { limit = 50 } = req.query;
    
    if (!entityType || !entityId) {
      throw createBadRequestError('Entity type and entity ID are required');
    }
    
    if (!mongoose.Types.ObjectId.isValid(entityId)) {
      throw createBadRequestError('Invalid entity ID');
    }
    
    const options: any = { limit: Number(limit) };
    
    // For HR users, only show logs where they are the actor
    if (req.user?.role === 'hr') {
      options.actors = [req.user._id];
    }
    
    const logs = await (AuditLog as any).getEntityLogs(
      entityType,
      new mongoose.Types.ObjectId(entityId),
      options
    );
    
    res.json({
      success: true,
      data: logs,
    });
  });

  /**
   * Get audit statistics
   * GET /audit-logs/stats
   */
  static getAuditStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { startDate, endDate } = req.query;
    
    let dateRange: { start: Date; end: Date } | undefined;
    if (startDate && endDate) {
      dateRange = {
        start: new Date(startDate as string),
        end: new Date(endDate as string),
      };
    }
    
    // For HR users, only show stats for their own activities
    if (req.user?.role === 'hr') {
      // Get stats filtered by HR user's actor ID
      const query: any = { actor: req.user._id };
      if (dateRange) {
        query.timestamp = {
          $gte: dateRange.start,
          $lte: dateRange.end,
        };
      }
      
      const [logs, total] = await Promise.all([
        AuditLog.find(query),
        AuditLog.countDocuments(query),
      ]);
      
      // Calculate stats manually for HR user
      const actionStats: any[] = [];
      const actionCounts: Record<string, { count: number; action: any; entityType: string; success: boolean }> = {};
      
      logs.forEach((log) => {
        const key = `${log.action}-${log.entityType}-${log.success !== false ? 'success' : 'failed'}`;
        if (!actionCounts[key]) {
          actionCounts[key] = { count: 0, action: log.action, entityType: log.entityType, success: log.success !== false };
        }
        actionCounts[key]!.count++;
      });
      
      Object.values(actionCounts).forEach((stat: any) => {
        actionStats.push({
          action: stat.action,
          entityType: stat.entityType,
          success: stat.success,
          count: stat.count,
        });
      });
      
      return res.json({
        success: true,
        data: {
          actionStats,
          totalLogs: total,
        },
      });
    }
    
    const stats = await AuditLog.getAuditStats(dateRange);
    
    res.json({
      success: true,
      data: stats[0] || { actionStats: [], totalLogs: 0 },
    });
  });
}

