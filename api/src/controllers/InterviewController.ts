import { Response } from 'express';
import { z } from 'zod';
import { Interview } from '@/models/Interview';
import { Application } from '@/models/Application';
import { User } from '@/models/User';

import { AuditLog } from '@/models/AuditLog';
import { AuthenticatedRequest, InterviewType, InterviewStatus, InterviewRound, AuditAction } from '@/types';
import { asyncHandler, createNotFoundError } from '@/middleware/errorHandler';
import mongoose from 'mongoose';

/**
 * Interview Controller
 * Handles interview management operations
 */

const createInterviewSchema = z.object({
  applicationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid application ID'),
  type: z.nativeEnum(InterviewType),
  round: z.nativeEnum(InterviewRound),
  scheduledAt: z.string().datetime(),
  duration: z.number().min(15).max(480),
  location: z.string().optional(),
  interviewers: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid interviewer ID')),
  notes: z.string().optional(),
});

const updateInterviewSchema = createInterviewSchema.partial();

const querySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
  search: z.string().optional(),
  status: z.nativeEnum(InterviewStatus).optional(),
  type: z.nativeEnum(InterviewType).optional(),
  round: z.nativeEnum(InterviewRound).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  interviewer: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
});

export class InterviewController {
  /**
   * Get interviews with filtering and pagination
   * @route GET /interviews
   */
  static getInterviews = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const query = querySchema.parse(req.query);
    const { page, limit, search, status, type, round, dateFrom, dateTo, interviewer } = query;

    // Build MongoDB query
    const filter: any = {};

    // Search across candidate name and job title (requires population)
    if (search) {
      // We'll use text search on populated fields later
    }

    if (status) {
      filter.status = status;
    }

    if (type) {
      filter.type = type;
    }

    if (round) {
      filter.round = round;
    }

    if (dateFrom || dateTo) {
      filter.scheduledAt = {};
      if (dateFrom) filter.scheduledAt.$gte = new Date(dateFrom);
      if (dateTo) filter.scheduledAt.$lte = new Date(dateTo);
    }

    if (interviewer) {
      filter.interviewers = interviewer;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with population
    const interviews = await Interview.find(filter)
      .populate({
        path: 'applicationId',
        populate: [
          { 
            path: 'candidateId', 
            populate: { 
              path: 'userId', 
              select: 'firstName lastName email' 
            }
          },
          { path: 'jobId', select: 'title companyId', populate: { path: 'companyId', select: 'name' } }
        ]
      })
      .populate('interviewers', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .sort({ scheduledAt: 1 })
      .skip(skip)
      .limit(limit);

    // Apply search filter on populated data if needed
    let filteredInterviews = interviews;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredInterviews = interviews.filter(interview => {
        const application = interview.applicationId as any;
        const candidate = application?.candidateId;
        const job = application?.jobId;
        const company = job?.companyId;
        
        return (
          candidate?.firstName?.toLowerCase().includes(searchLower) ||
          candidate?.lastName?.toLowerCase().includes(searchLower) ||
          job?.title?.toLowerCase().includes(searchLower) ||
          company?.name?.toLowerCase().includes(searchLower)
        );
      });
    }

    const total = await Interview.countDocuments(filter);

    // Log audit trail (safely handle potential errors)
    try {
      await AuditLog.createLog({
        actor: req.user!._id,
        action: AuditAction.CREATE,
        entityType: 'Interview',
        entityId: new mongoose.Types.ObjectId(), // Use a dummy ID for list operations
        metadata: { queryType: 'list', resultCount: filteredInterviews.length },
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.get('User-Agent') || 'Unknown',
        businessProcess: 'interview_scheduling',
        description: `Retrieved ${filteredInterviews.length} interviews`,
      });
    } catch (auditError) {
      console.warn('Failed to create audit log:', auditError);
    }

    res.json({
      data: filteredInterviews,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  });

  /**
   * Get single interview by ID
   * @route GET /interviews/:id
   */
  static getInterview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw createNotFoundError('Interview not found');
    }

    const interview = await Interview.findById(id)
      .populate({
        path: 'applicationId',
        populate: [
          { path: 'candidateId', select: 'firstName lastName email phone' },
          { path: 'jobId', select: 'title description companyId', populate: { path: 'companyId', select: 'name' } }
        ]
      })
      .populate('interviewers', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName');

    if (!interview) {
      throw createNotFoundError('Interview not found');
    }

    // Log audit trail (safely handle potential errors)
    try {
      await AuditLog.createLog({
        actor: req.user!._id,
        action: AuditAction.CREATE,
        entityType: 'Interview',
        entityId: interview._id,
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.get('User-Agent') || 'Unknown',
        businessProcess: 'interview_scheduling',
        description: `Viewed interview details`,
      });
    } catch (auditError) {
      console.warn('Failed to create audit log:', auditError);
    }

    res.json({ data: interview });
  });

  /**
   * Create new interview
   * @route POST /interviews
   */
  static createInterview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validatedData = createInterviewSchema.parse(req.body);

    // Verify application exists
    const application = await Application.findById(validatedData.applicationId);
    if (!application) {
      throw createNotFoundError('Application not found');
    }

    // Verify interviewers exist
    const interviewers = await User.find({
      _id: { $in: validatedData.interviewers },
      role: { $in: ['hr', 'admin'] }
    });

    if (interviewers.length !== validatedData.interviewers.length) {
      return res.status(400).json({
        error: 'One or more interviewers not found or invalid role'
      });
    }

    // Create interview
    const interview = await Interview.create({
      ...validatedData,
      scheduledAt: new Date(validatedData.scheduledAt),
      createdBy: req.user!._id,
      status: InterviewStatus.SCHEDULED,
    });

    // Populate the created interview
    const populatedInterview = await Interview.findById(interview._id)
      .populate({
        path: 'applicationId',
        populate: [
          { 
            path: 'candidateId', 
            populate: { 
              path: 'userId', 
              select: 'firstName lastName email' 
            }
          },
          { path: 'jobId', select: 'title companyId', populate: { path: 'companyId', select: 'name' } }
        ]
      })
      .populate('interviewers', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName');

    // Log audit trail
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.CREATE,
      entityType: 'Interview',
      entityId: interview._id,
      after: populatedInterview?.toObject(),
      metadata: { applicationId: application._id },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      businessProcess: 'interview_scheduling',
      description: `Created interview for application ${application._id}`,
    });

    res.status(201).json({ data: populatedInterview });
  });

  /**
   * Update interview
   * @route PUT /interviews/:id
   */
  static updateInterview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const validatedData = updateInterviewSchema.parse(req.body);

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw createNotFoundError('Interview not found');
    }

    const interview = await Interview.findById(id);
    if (!interview) {
      throw createNotFoundError('Interview not found');
    }

    // Update interview
    Object.assign(interview, validatedData);
    if (validatedData.scheduledAt) {
      interview.scheduledAt = new Date(validatedData.scheduledAt);
    }
    
    await interview.save();

    // Populate the updated interview
    const populatedInterview = await Interview.findById(interview._id)
      .populate({
        path: 'applicationId',
        populate: [
          { 
            path: 'candidateId', 
            populate: { 
              path: 'userId', 
              select: 'firstName lastName email' 
            }
          },
          { path: 'jobId', select: 'title companyId', populate: { path: 'companyId', select: 'name' } }
        ]
      })
      .populate('interviewers', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName');

    // Log audit trail
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.UPDATE,
      entityType: 'Interview',
      entityId: interview._id,
      before: interview.toObject(),
      after: populatedInterview?.toObject(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      businessProcess: 'interview_scheduling',
      description: `Updated interview`,
    });

    res.json({ data: populatedInterview });
  });

  /**
   * Delete interview
   * @route DELETE /interviews/:id
   */
  static deleteInterview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw createNotFoundError('Interview not found');
    }

    const interview = await Interview.findById(id);
    if (!interview) {
      throw createNotFoundError('Interview not found');
    }

    await Interview.findByIdAndDelete(id);

    // Log audit trail
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.DELETE,
      entityType: 'Interview',
      entityId: interview._id,
      before: interview.toObject(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      businessProcess: 'interview_scheduling',
      description: `Deleted interview`,
    });

    res.json({ message: 'Interview deleted successfully' });
  });

  /**
   * Get interview statistics
   * @route GET /interviews/stats
   */
  static getInterviewStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const stats = await Interview.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCount = await Interview.countDocuments({
      scheduledAt: { $gte: today, $lt: tomorrow },
      status: { $nin: [InterviewStatus.CANCELLED] }
    });

    // Log audit trail (safely handle potential errors)
    try {
      await AuditLog.createLog({
        actor: req.user!._id,
        action: AuditAction.CREATE,
        entityType: 'Interview',
        entityId: new mongoose.Types.ObjectId(), // Use a dummy ID for stats operations
        metadata: { queryType: 'stats', statsData: { byStatus: stats, todayCount } },
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.get('User-Agent') || 'Unknown',
        businessProcess: 'interview_scheduling',
        description: `Retrieved interview statistics`,
      });
    } catch (auditError) {
      console.warn('Failed to create audit log:', auditError);
    }

    res.json({
      data: {
        byStatus: stats,
        todayCount
      }
    });
  });
}
