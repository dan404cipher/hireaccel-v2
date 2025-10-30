import { Response } from 'express';
import { z } from 'zod';
import { CandidateAssignment } from '@/models/CandidateAssignment';
import { Candidate } from '@/models/Candidate';
import { User } from '@/models/User';
import { Job } from '@/models/Job';
import { AuditLog } from '@/models/AuditLog';
import { AuthenticatedRequest, UserRole, UserStatus, AuditAction } from '@/types';
import { asyncHandler, createNotFoundError, createBadRequestError } from '@/middleware/errorHandler';
import mongoose from 'mongoose';

/**
 * Candidate Assignment Controller
 * Handles assignment of candidates from agents to HR users
 */

const createAssignmentSchema = z.object({
  candidateId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid candidate ID'),
  assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid HR user ID').optional(),
  jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid job ID').optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
  dueDate: z.string().datetime().optional(),
}).refine((data) => {
  // Either assignedTo or jobId must be provided
  return data.assignedTo || data.jobId;
}, {
  message: "Either assignedTo or jobId must be provided",
  path: ["assignedTo"]
});

const updateAssignmentSchema = z.object({
  status: z.enum(['active', 'completed', 'rejected', 'withdrawn']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  candidateStatus: z.enum(['new', 'reviewed', 'shortlisted', 'interview_scheduled', 'interviewed', 'offer_sent', 'hired', 'rejected']).optional(),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
  dueDate: z.string().datetime().optional(),
  feedback: z.string().max(2000, 'Feedback cannot exceed 2000 characters').optional(),
});

const querySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
  status: z.enum(['active', 'completed', 'rejected', 'withdrawn']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  jobId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  assignedBy: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  sortBy: z.enum(['assignedAt', 'priority', 'status', 'dueDate']).default('assignedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export class CandidateAssignmentController {
  /**
   * Get assignments with filtering and pagination
   * @route GET /candidate-assignments
   */
  static getAssignments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const query = querySchema.parse(req.query);
    const { page, limit, status, priority, jobId, assignedTo, assignedBy, sortBy, sortOrder } = query;

    // Build filter based on user role and permissions
    const filter: any = {};
    
    if (req.user!.role === UserRole.HR) {
      // HR users can only see assignments assigned to them
      filter.assignedTo = req.user!._id;
    } else if (req.user!.role === UserRole.AGENT) {
      // Agents can see assignments they created
      filter.assignedBy = req.user!._id;
    }
    // Admins and superadmins can see all assignments (no additional filter)

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (jobId) filter.jobId = jobId;
    if (assignedTo && (req.user!.role === UserRole.ADMIN || req.user!.role === UserRole.SUPERADMIN)) filter.assignedTo = assignedTo;
    if (assignedBy && (req.user!.role === UserRole.ADMIN || req.user!.role === UserRole.SUPERADMIN)) filter.assignedBy = assignedBy;

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // First get all assignments
    const allAssignments = await CandidateAssignment.find(filter)
      .populate({
        path: 'candidateId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email customId'
        }
      })
      .populate('assignedBy', 'firstName lastName email customId')
      .populate('assignedTo', 'firstName lastName email customId')
      .populate({
        path: 'jobId',
        select: 'title companyId location createdBy',
        populate: [
          {
            path: 'companyId',
            select: 'name industry location'
          },
          {
            path: 'createdBy',
            select: 'firstName lastName customId'
          }
        ]
      })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Filter out assignments with broken candidate references
    const assignments = allAssignments.filter(assignment => {
      // Check if candidateId exists and is populated (not just an ObjectId)
      if (!assignment.candidateId || typeof assignment.candidateId !== 'object') {
        return false;
      }
      
      const candidate = assignment.candidateId as any;
      return (
        candidate.userId && 
        typeof candidate.userId === 'object' &&
        candidate.userId.firstName &&
        candidate.userId.lastName &&
        candidate.userId.customId
      );
    });

    // Use the filtered count instead of querying again
    const total = assignments.length;

    // Log audit trail
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.CREATE,
      entityType: 'CandidateAssignment',
      entityId: new mongoose.Types.ObjectId(), // Dummy ID for list operations
      metadata: { queryType: 'list', resultCount: assignments.length, filter },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      businessProcess: 'candidate_management',
      description: `Retrieved ${assignments.length} candidate assignments`,
    });

    res.json({
      data: assignments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  });

  /**
   * Get single assignment by ID
   * @route GET /candidate-assignments/:id
   */
  static getAssignment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw createNotFoundError('Assignment not found');
    }

    const assignment = await CandidateAssignment.findById(id)
      .populate({
        path: 'candidateId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email phone'
        }
      })
      .populate('assignedBy', 'firstName lastName email customId')
      .populate('assignedTo', 'firstName lastName email customId')
      .populate({
        path: 'jobId',
        select: 'title description companyId createdBy',
        populate: [
          {
            path: 'companyId',
            select: 'name industry location'
          },
          {
            path: 'createdBy',
            select: 'firstName lastName customId'
          }
        ]
      });

    if (!assignment) {
      throw createNotFoundError('Assignment not found');
    }

    // Check permissions
    if (req.user!.role === UserRole.HR && assignment.assignedTo.toString() !== req.user!._id.toString()) {
      throw createNotFoundError('Assignment not found');
    }
    if (req.user!.role === UserRole.AGENT && assignment.assignedBy.toString() !== req.user!._id.toString()) {
      throw createNotFoundError('Assignment not found');
    }

    // Log audit trail
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.CREATE,
      entityType: 'CandidateAssignment',
      entityId: assignment._id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      businessProcess: 'candidate_management',
      description: `Viewed candidate assignment details`,
    });

    res.json({ data: assignment });
  });

  /**
   * Create new assignment (Agent assigns candidate to HR)
   * @route POST /candidate-assignments
   */
  static createAssignment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Only agents, admins, and superadmins can create assignments
    if (req.user!.role !== UserRole.AGENT && req.user!.role !== UserRole.ADMIN && req.user!.role !== UserRole.SUPERADMIN) {
      throw createBadRequestError('Only agents can assign candidates to HR');
    }

    const validatedData = createAssignmentSchema.parse(req.body);

    // Verify candidate exists
    const candidate = await Candidate.findById(validatedData.candidateId);
    if (!candidate) {
      throw createNotFoundError('Candidate not found');
    }

    let hrUser;
    let finalAssignedTo = validatedData.assignedTo;

    // If jobId is provided, automatically determine the HR user from the job
    if (validatedData.jobId) {
      const job = await Job.findById(validatedData.jobId);
      if (!job) {
        throw createNotFoundError('Job not found');
      }

      // Use the HR user who posted the job
      finalAssignedTo = job.createdBy.toString();
      
      // Verify HR user exists and has correct role
      hrUser = await User.findOne({
        _id: finalAssignedTo,
        role: UserRole.HR,
        $or: [
          { status: UserStatus.ACTIVE },
          { status: 'active' } // Fallback for any case sensitivity issues
        ]
      });
      if (!hrUser) {
        throw createNotFoundError('HR user who posted this job not found');
      }

      // If agent is creating assignment, verify they have access to this job
      if (req.user!.role === UserRole.AGENT) {
        const agentAssignment = await mongoose.model('AgentAssignment').findOne({
          agentId: req.user!._id,
          'assignedHRs': finalAssignedTo
        });
        
        if (!agentAssignment) {
          throw createBadRequestError('You can only assign candidates to jobs from HR users you are assigned to work with');
        }
      }
    } else {
      // If no jobId provided, use the explicitly provided assignedTo
      hrUser = await User.findOne({
        _id: validatedData.assignedTo,
        role: UserRole.HR,
        $or: [
          { status: UserStatus.ACTIVE },
          { status: 'active' } // Fallback for any case sensitivity issues
        ]
      });
      if (!hrUser) {
        throw createNotFoundError('HR user not found');
      }

      // If agent is creating assignment, verify they have access to this HR user
      if (req.user!.role === UserRole.AGENT) {
        const agentAssignment = await mongoose.model('AgentAssignment').findOne({
          agentId: req.user!._id,
          'assignedHRs': validatedData.assignedTo
        });
        
        if (!agentAssignment) {
          throw createBadRequestError('You can only assign candidates to HR users you are assigned to work with');
        }
      }
    }

    // Check if assignment already exists for this candidate-HR pair
    const existingAssignment = await CandidateAssignment.findOne({
      candidateId: validatedData.candidateId,
      assignedTo: finalAssignedTo,
      status: 'active',
    });

    if (existingAssignment) {
      throw createBadRequestError('This candidate is already assigned to this HR user');
    }

    // Create assignment
    const assignment = await CandidateAssignment.create({
      ...validatedData,
      assignedTo: finalAssignedTo,
      assignedBy: req.user!._id,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
    });

    // Populate the created assignment
    const populatedAssignment = await CandidateAssignment.findById(assignment._id)
      .populate({
        path: 'candidateId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email customId'
        }
      })
      .populate('assignedBy', 'firstName lastName email customId')
      .populate('assignedTo', 'firstName lastName email customId')
      .populate({
        path: 'jobId',
        select: 'title companyId location createdBy',
        populate: [
          {
            path: 'companyId',
            select: 'name industry location'
          },
          {
            path: 'createdBy',
            select: 'firstName lastName customId'
          }
        ]
      });

    // Log audit trail
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.CREATE,
      entityType: 'CandidateAssignment',
      entityId: assignment._id,
      after: populatedAssignment?.toObject(),
      metadata: { 
        candidateId: validatedData.candidateId,
        assignedTo: finalAssignedTo,
        jobId: validatedData.jobId,
        priority: validatedData.priority 
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      businessProcess: 'candidate_management',
      description: `Assigned candidate to HR user`,
    });

    res.status(201).json({ data: populatedAssignment });
  });

  /**
   * Update assignment
   * @route PUT /candidate-assignments/:id
   */
  static updateAssignment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const validatedData = updateAssignmentSchema.parse(req.body);

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw createNotFoundError('Assignment not found');
    }

    const assignment = await CandidateAssignment.findById(id);
    if (!assignment) {
      throw createNotFoundError('Assignment not found');
    }

    // Check permissions
    const canUpdate = 
      req.user!.role === UserRole.ADMIN ||
      req.user!.role === UserRole.SUPERADMIN ||
      (req.user!.role === UserRole.HR && assignment.assignedTo.toString() === req.user!._id.toString()) ||
      (req.user!.role === UserRole.AGENT && assignment.assignedBy.toString() === req.user!._id.toString());

    if (!canUpdate) {
      throw createNotFoundError('Assignment not found');
    }

    const beforeState = assignment.toObject();

    // Update assignment
    Object.assign(assignment, validatedData);
    if (validatedData.dueDate) {
      assignment.dueDate = new Date(validatedData.dueDate);
    }

    // Handle status changes
    if (validatedData.status && validatedData.status !== assignment.status) {
      if (validatedData.status === 'completed') {
        assignment.markCompleted(validatedData.feedback);
      } else if (validatedData.status === 'rejected') {
        assignment.reject(validatedData.feedback || 'No reason provided');
      } else if (validatedData.status === 'withdrawn') {
        assignment.withdraw(validatedData.feedback || 'No reason provided');
      }
    }

    await assignment.save();

    // Populate the updated assignment
    const populatedAssignment = await CandidateAssignment.findById(assignment._id)
      .populate({
        path: 'candidateId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email customId'
        }
      })
      .populate('assignedBy', 'firstName lastName email customId')
      .populate('assignedTo', 'firstName lastName email customId')
      .populate({
        path: 'jobId',
        select: 'title companyId location createdBy',
        populate: [
          {
            path: 'companyId',
            select: 'name industry location'
          },
          {
            path: 'createdBy',
            select: 'firstName lastName customId'
          }
        ]
      });

    // Log audit trail
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.UPDATE,
      entityType: 'CandidateAssignment',
      entityId: assignment._id,
      before: beforeState,
      after: populatedAssignment?.toObject(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      businessProcess: 'candidate_management',
      description: `Updated candidate assignment`,
    });

    res.json({ data: populatedAssignment });
  });

  /**
   * Delete assignment
   * @route DELETE /candidate-assignments/:id
   */
  static deleteAssignment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw createNotFoundError('Assignment not found');
    }

    const assignment = await CandidateAssignment.findById(id);
    if (!assignment) {
      throw createNotFoundError('Assignment not found');
    }

    // Only admin, superadmin, or the agent who created the assignment can delete it
    const canDelete = 
      req.user!.role === UserRole.ADMIN ||
      req.user!.role === UserRole.SUPERADMIN ||
      (req.user!.role === UserRole.AGENT && assignment.assignedBy.toString() === req.user!._id.toString());

    if (!canDelete) {
      throw createNotFoundError('Assignment not found');
    }

    await CandidateAssignment.findByIdAndDelete(id);

    // Log audit trail
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.DELETE,
      entityType: 'CandidateAssignment',
      entityId: assignment._id,
      before: assignment.toObject(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      businessProcess: 'candidate_management',
      description: `Deleted candidate assignment`,
    });

    res.json({ message: 'Assignment deleted successfully' });
  });

  /**
   * Get assignments for current HR/Agent user
   * @route GET /candidate-assignments/my-assignments
   */
  static getMyAssignments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const query = querySchema.parse(req.query);
    const { page, limit, status = 'active', priority, jobId, sortBy, sortOrder } = query;

    let assignments;
    let total;

    if (req.user!.role === UserRole.HR) {
      // HR users see assignments assigned to them
      assignments = await CandidateAssignment.getAssignmentsForHR(req.user!._id, {
        status,
        priority,
        jobId,
        limit,
        skip: (page - 1) * limit,
        sortBy,
        sortOrder: sortOrder === 'asc' ? 1 : -1,
      });

      total = await CandidateAssignment.countDocuments({
        assignedTo: req.user!._id,
        ...(status && { status }),
        ...(priority && { priority }),
        ...(jobId && { jobId }),
      });
    } else if (req.user!.role === UserRole.AGENT) {
      // Agents see assignments for their assigned candidates
      const agentAssignment = await mongoose.model('AgentAssignment').findOne({
        agentId: req.user!._id,
        status: 'active'
      });

      if (!agentAssignment) {
        return res.json({
          data: [],
          meta: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        });
      }

      const filter = {
        candidateId: { $in: agentAssignment.assignedCandidates },
        ...(status && { status }),
        ...(priority && { priority }),
        ...(jobId && { jobId }),
      };

      assignments = await CandidateAssignment.find(filter)
        .populate({
          path: 'candidateId',
          populate: {
            path: 'userId',
            select: 'firstName lastName email customId'
          }
        })
        .populate('assignedBy', 'firstName lastName email customId')
        .populate('assignedTo', 'firstName lastName email customId')
        .populate({
          path: 'jobId',
          select: 'title companyId location createdBy',
          populate: [
            {
              path: 'companyId',
              select: 'name industry location'
            },
            {
              path: 'createdBy',
              select: 'firstName lastName customId'
            }
          ]
        })
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      total = await CandidateAssignment.countDocuments(filter);
    } else {
      throw createBadRequestError('Only HR and Agent users can access this endpoint');
    }

    res.json({
      data: assignments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  });

  /**
   * Get assignment statistics
   * @route GET /candidate-assignments/stats
   */
  static getAssignmentStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    let stats;

    if (req.user!.role === UserRole.HR) {
      // HR users get stats for their assignments only
      stats = await CandidateAssignment.aggregate([
        { $match: { assignedTo: req.user!._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
    } else if (req.user!.role === UserRole.AGENT) {
      // Agents get stats for assignments they created
      stats = await CandidateAssignment.aggregate([
        { $match: { assignedBy: req.user!._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
    } else {
      // Admins get overall stats
      stats = await CandidateAssignment.getAssignmentStats();
    }

    // Get counts for different priorities and overdue assignments
    const today = new Date();
    const overdueCounts = await CandidateAssignment.countDocuments({
      ...(req.user!.role === UserRole.HR && { assignedTo: req.user!._id }),
      ...(req.user!.role === UserRole.AGENT && { assignedBy: req.user!._id }),
      status: 'active',
      dueDate: { $lt: today }
    });

    const dueSoonCounts = await CandidateAssignment.countDocuments({
      ...(req.user!.role === UserRole.HR && { assignedTo: req.user!._id }),
      ...(req.user!.role === UserRole.AGENT && { assignedBy: req.user!._id }),
      status: 'active',
      dueDate: { 
        $gte: today,
        $lte: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000) // Next 2 days
      }
    });

    res.json({
      data: {
        byStatus: stats,
        overdue: overdueCounts,
        dueSoon: dueSoonCounts,
      }
    });
  });
}
