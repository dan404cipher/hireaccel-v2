import { Response } from 'express';
import { z } from 'zod';
import { AgentAssignment } from '@/models/AgentAssignment';
import { Job } from '@/models/Job';
import { Candidate } from '@/models/Candidate';
import { CandidateAssignment } from '@/models/CandidateAssignment';
import { AuditLog } from '@/models/AuditLog';
import { AuthenticatedRequest, UserRole, JobStatus, AuditAction } from '@/types';
import { asyncHandler, createNotFoundError, createBadRequestError, createForbiddenError } from '@/middleware/errorHandler';
import mongoose from 'mongoose';

/**
 * Agent Controller
 * Handles agent-specific operations for assignment management
 */

const assignCandidateSchema = z.object({
  candidateId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid candidate ID'),
  jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid job ID'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
  dueDate: z.string().datetime().optional(),
});

const querySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
  search: z.string().optional(),
  status: z.string().optional(),
  urgency: z.string().optional(),
  sortBy: z.enum(['createdAt', 'title', 'urgency', 'postedAt']).default('postedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export class AgentController {
  /**
   * Get jobs posted by HR users assigned to the current agent
   * @route GET /agents/me/jobs
   */
  static getMyJobs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Only agents can access this endpoint
    if (req.user!.role !== UserRole.AGENT) {
      throw createForbiddenError('Only agents can access this endpoint');
    }

    const query = querySchema.parse(req.query);
    const { page, limit, search, status, urgency, sortBy, sortOrder } = query;

    // Get HR users assigned to this agent
    const assignedHRs = await AgentAssignment.getHRsForAgent(req.user!._id);
    
    if (assignedHRs.length === 0) {
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

    // Build filter for jobs posted by assigned HR users
    const filter: any = {
      createdBy: { $in: assignedHRs },
    };

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (urgency && urgency !== 'all') {
      filter.urgency = urgency;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const jobs = await Job.find(filter)
      .populate('companyId', 'name industry location')
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedAgentId', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments(filter);

    // Log audit trail
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.READ,
      entityType: 'Job',
      entityId: new mongoose.Types.ObjectId(),
      metadata: { 
        queryType: 'agent_jobs', 
        resultCount: jobs.length, 
        assignedHRCount: assignedHRs.length,
        filter 
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      businessProcess: 'agent_management',
      description: `Agent retrieved ${jobs.length} jobs from assigned HR users`,
    });

    res.json({
      data: jobs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        assignedHRsCount: assignedHRs.length,
      },
    });
  });

  /**
   * Get candidates assigned to the current agent
   * @route GET /agents/me/candidates
   */
  static getMyCandidates = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Only agents can access this endpoint
    if (req.user!.role !== UserRole.AGENT) {
      throw createForbiddenError('Only agents can access this endpoint');
    }

    const query = querySchema.parse(req.query);
    const { page, limit, search, sortBy, sortOrder } = query;

    // Get candidates assigned to this agent
    const assignedCandidateIds = await AgentAssignment.getCandidatesForAgent(req.user!._id);
    
    if (assignedCandidateIds.length === 0) {
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

    // Build filter for assigned candidates
    const filter: any = {
      userId: { $in: assignedCandidateIds },
    };

    if (search) {
      // Search in candidate profile and user details
      filter.$or = [
        { 'profile.skills': { $regex: search, $options: 'i' } },
        { 'profile.summary': { $regex: search, $options: 'i' } },
        { 'profile.location': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy === 'createdAt' ? 'createdAt' : 'updatedAt'] = sortOrder === 'asc' ? 1 : -1;

    const candidates = await Candidate.find(filter)
      .populate('userId', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Candidate.countDocuments(filter);

    // Log audit trail
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.READ,
      entityType: 'Candidate',
      entityId: new mongoose.Types.ObjectId(),
      metadata: { 
        queryType: 'agent_candidates', 
        resultCount: candidates.length,
        assignedCandidateCount: assignedCandidateIds.length,
        filter 
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      businessProcess: 'agent_management',
      description: `Agent retrieved ${candidates.length} assigned candidates`,
    });

    res.json({
      data: candidates,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        assignedCandidatesCount: assignedCandidateIds.length,
      },
    });
  });

  /**
   * Get agent's assignment record
   * @route GET /agents/me/assignment
   */
  static getMyAssignment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Only agents can access this endpoint
    if (req.user!.role !== UserRole.AGENT) {
      throw createForbiddenError('Only agents can access this endpoint');
    }

    const assignment = await AgentAssignment.getAssignmentForAgent(req.user!._id);

    if (!assignment) {
      throw createNotFoundError('No assignment found for this agent');
    }

    // Log audit trail
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.READ,
      entityType: 'AgentAssignment',
      entityId: assignment._id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      businessProcess: 'agent_management',
      description: 'Agent retrieved assignment details',
    });

    res.json({ data: assignment });
  });

  /**
   * Assign candidate to job (create candidate assignment)
   * @route POST /agents/assignments
   */
  static assignCandidateToJob = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Only agents can create assignments
    if (req.user!.role !== UserRole.AGENT) {
      throw createForbiddenError('Only agents can assign candidates to jobs');
    }

    const validatedData = assignCandidateSchema.parse(req.body);

    // Verify agent has access to this candidate
    const assignedCandidateIds = await AgentAssignment.getCandidatesForAgent(req.user!._id);
    const candidateObjectId = new mongoose.Types.ObjectId(validatedData.candidateId);
    
    if (!assignedCandidateIds.some(id => id.equals(candidateObjectId))) {
      throw createForbiddenError('You do not have access to this candidate');
    }

    // Verify candidate exists
    const candidate = await Candidate.findById(validatedData.candidateId);
    if (!candidate) {
      throw createNotFoundError('Candidate not found');
    }

    // Verify job exists and agent has access to it
    const job = await Job.findById(validatedData.jobId).populate('createdBy');
    if (!job) {
      throw createNotFoundError('Job not found');
    }

    // Verify the job was posted by an HR user assigned to this agent
    const assignedHRs = await AgentAssignment.getHRsForAgent(req.user!._id);
    if (!assignedHRs.some(hrId => hrId.equals(job.createdBy as any))) {
      throw createForbiddenError('You do not have access to this job');
    }

    // Check if assignment already exists for this candidate-job combination
    const existingAssignment = await CandidateAssignment.findOne({
      candidateId: validatedData.candidateId,
      jobId: validatedData.jobId,
      status: 'active',
    });

    if (existingAssignment) {
      throw createBadRequestError('This candidate is already assigned to this job');
    }

    // Create candidate assignment
    const assignment = await CandidateAssignment.create({
      candidateId: validatedData.candidateId,
      assignedTo: job.createdBy, // HR user who posted the job
      assignedBy: req.user!._id,
      jobId: validatedData.jobId,
      priority: validatedData.priority,
      notes: validatedData.notes,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
    });

    // Populate the created assignment
    const populatedAssignment = await CandidateAssignment.findById(assignment._id)
      .populate({
        path: 'candidateId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        }
      })
      .populate('assignedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate({
        path: 'jobId',
        select: 'title description companyId location',
        populate: {
          path: 'companyId',
          select: 'name industry location'
        }
      });

    // Log audit trail
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.ASSIGN,
      entityType: 'CandidateAssignment',
      entityId: assignment._id,
      after: populatedAssignment?.toObject(),
      metadata: { 
        candidateId: validatedData.candidateId,
        jobId: validatedData.jobId,
        assignedTo: job.createdBy,
        priority: validatedData.priority 
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      businessProcess: 'agent_management',
      description: `Agent assigned candidate to job`,
    });

    res.status(201).json({ 
      data: populatedAssignment,
      message: 'Candidate assigned to job successfully'
    });
  });

  /**
   * Get candidate assignments created by the current agent
   * @route GET /agents/me/assignments
   */
  static getMyAssignments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Only agents can access this endpoint
    if (req.user!.role !== UserRole.AGENT) {
      throw createForbiddenError('Only agents can access this endpoint');
    }

    const query = querySchema.parse(req.query);
    const { page, limit, status, sortBy, sortOrder } = query;

    const filter: any = { assignedBy: req.user!._id };

    if (status && status !== 'all') {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy === 'createdAt' ? 'assignedAt' : 'assignedAt'] = sortOrder === 'asc' ? 1 : -1;

    const assignments = await CandidateAssignment.find(filter)
      .populate({
        path: 'candidateId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        }
      })
      .populate('assignedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate({
        path: 'jobId',
        select: 'title description companyId urgency location',
        populate: {
          path: 'companyId',
          select: 'name industry location'
        }
      })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await CandidateAssignment.countDocuments(filter);

    // Get assignment statistics
    const stats = await CandidateAssignment.aggregate([
      { $match: { assignedBy: req.user!._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Log audit trail
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.READ,
      entityType: 'CandidateAssignment',
      entityId: new mongoose.Types.ObjectId(),
      metadata: { 
        queryType: 'agent_assignments', 
        resultCount: assignments.length,
        filter 
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      businessProcess: 'agent_management',
      description: `Agent retrieved ${assignments.length} candidate assignments`,
    });

    res.json({
      data: assignments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {} as Record<string, number>),
    });
  });

  /**
   * Get assignment dashboard summary for agent
   * @route GET /agents/me/dashboard
   */
  static getDashboardSummary = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Only agents can access this endpoint
    if (req.user!.role !== UserRole.AGENT) {
      throw createForbiddenError('Only agents can access this endpoint');
    }

    // Get agent's assignment record
    const agentAssignment = await AgentAssignment.getAssignmentForAgent(req.user!._id);
    
    if (!agentAssignment) {
      return res.json({
        data: {
          assignedHRs: 0,
          assignedCandidates: 0,
          availableJobs: 0,
          activeAssignments: 0,
          completedAssignments: 0,
          pendingAssignments: 0,
        }
      });
    }

    // Get counts for dashboard
    const [
      availableJobsCount,
      activeAssignmentsCount,
      completedAssignmentsCount,
      pendingAssignmentsCount,
    ] = await Promise.all([
      // Count jobs from assigned HR users
      Job.countDocuments({
        createdBy: { $in: agentAssignment.assignedHRs },
        status: { $in: [JobStatus.OPEN, JobStatus.ASSIGNED] }
      }),
      // Count active assignments created by agent
      CandidateAssignment.countDocuments({
        assignedBy: req.user!._id,
        status: 'active'
      }),
      // Count completed assignments
      CandidateAssignment.countDocuments({
        assignedBy: req.user!._id,
        status: 'completed'
      }),
      // Count pending/rejected assignments
      CandidateAssignment.countDocuments({
        assignedBy: req.user!._id,
        status: { $in: ['rejected', 'withdrawn'] }
      }),
    ]);

    const summary = {
      assignedHRs: agentAssignment.assignedHRs.length,
      assignedCandidates: agentAssignment.assignedCandidates.length,
      availableJobs: availableJobsCount,
      activeAssignments: activeAssignmentsCount,
      completedAssignments: completedAssignmentsCount,
      pendingAssignments: pendingAssignmentsCount,
    };

    // Log audit trail
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.READ,
      entityType: 'AgentAssignment',
      entityId: agentAssignment._id,
      metadata: { queryType: 'dashboard_summary', summary },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      businessProcess: 'agent_management',
      description: 'Agent retrieved dashboard summary',
    });

    res.json({ data: summary });
  });
}
