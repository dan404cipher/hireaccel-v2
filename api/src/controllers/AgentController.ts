import { Response } from 'express';
import { z } from 'zod';
import { AgentAssignment } from '@/models/AgentAssignment';
import { Job } from '@/models/Job';
import { Candidate } from '@/models/Candidate';
import { CandidateAssignment } from '@/models/CandidateAssignment';
import { Interview } from '@/models/Interview';
import { Application } from '@/models/Application';
import { AuditLog } from '@/models/AuditLog';
import { AuthenticatedRequest, UserRole, JobStatus, AuditAction, InterviewStatus } from '@/types';
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
  sortBy: z.enum(['createdAt', 'title', 'urgency', 'postedAt', 'assignedAt', 'priority', 'status']).default('postedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const interviewQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
  search: z.string().optional(),
  status: z.string().optional(),
  sortBy: z.enum(['createdAt', 'scheduledAt', 'status']).default('scheduledAt'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
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

    // Get candidate assignment counts for each HR
    const hrAssignmentCounts = await CandidateAssignment.aggregate([
      {
        $match: {
          assignedBy: new mongoose.Types.ObjectId(req.user!._id.toString()),
          status: { $in: ['active', 'completed'] }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'hrUser'
        }
      },
      {
        $unwind: '$hrUser'
      },
      {
        $group: {
          _id: '$assignedTo',
          assignedCandidatesCount: { $sum: 1 },
          hrDetails: { $first: '$hrUser' }
        }
      }
    ]);

    // Add the counts to the HR objects
    const assignedHRsWithCounts = assignment.assignedHRs.map((hr: any) => ({
      ...hr.toObject(),
      assignedCandidatesCount: hrAssignmentCounts.find(count => count._id.equals(hr._id))?.assignedCandidatesCount || 0
    }));

    assignment.assignedHRs = assignedHRsWithCounts;

    // Debug logging
    console.log('Debug Info:', {
      agentId: req.user!._id.toString(),
      hrAssignmentCounts: hrAssignmentCounts.map(count => ({
        hrId: count._id.toString(),
        count: count.assignedCandidatesCount,
        hrName: `${count.hrDetails.firstName} ${count.hrDetails.lastName}`
      })),
      assignedHRs: assignment.assignedHRs.map((hr: any) => ({
        id: hr._id.toString(),
        name: `${hr.firstName} ${hr.lastName}`
      })),
      finalCounts: assignedHRsWithCounts.map(hr => ({
        id: hr._id.toString(),
        name: `${hr.firstName} ${hr.lastName}`,
        count: hr.assignedCandidatesCount
      }))
    });

    // Additional debug query to check actual assignments
    const actualAssignments = await CandidateAssignment.find({
      assignedBy: req.user!._id,
      status: { $in: ['active', 'completed', 'pending'] }
    }).populate('assignedTo', 'firstName lastName');

    console.log('Actual Assignments:', actualAssignments.map(a => ({
      id: a._id,
      status: a.status,
      assignedTo: `${(a.assignedTo as any).firstName} ${(a.assignedTo as any).lastName}`,
      assignedToId: a.assignedTo
    })));

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
    // Only agents and admins can access this endpoint
    if (req.user!.role !== UserRole.AGENT && req.user!.role !== UserRole.ADMIN) {
      throw createForbiddenError('Only agents and admins can access this endpoint');
    }

    const query = querySchema.parse(req.query);
    const { page, limit, status, sortBy, sortOrder } = query;

    // For agents, show only their assignments. For admins, show all assignments
    const filter: any = req.user!.role === UserRole.AGENT ? { assignedBy: req.user!._id } : {};

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
    const statsMatch = req.user!.role === UserRole.AGENT ? { assignedBy: req.user!._id } : {};
    const stats = await CandidateAssignment.aggregate([
      { $match: statsMatch },
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

  /**
   * Get interviews for candidates assigned to the current agent
   * @route GET /agents/me/interviews
   */
  static getMyInterviews = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Only agents can access this endpoint
    if (req.user!.role !== UserRole.AGENT) {
      throw createForbiddenError('Only agents can access this endpoint');
    }

    const query = interviewQuerySchema.parse(req.query);
    const { page, limit, search, status, sortBy, sortOrder } = query;

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

    // Find applications for assigned candidates
    const applications = await Application.find({ 
      candidateId: { $in: assignedCandidateIds } 
    }).distinct('_id');

    if (applications.length === 0) {
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

    // Build filter for interviews
    const filter: any = {
      applicationId: { $in: applications },
    };

    if (status && status !== 'all') {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy === 'createdAt' ? 'scheduledAt' : 'scheduledAt'] = sortOrder === 'asc' ? 1 : -1;

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
      .sort(sort)
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

    // Count total documents with the same filter applied
    const total = await Interview.countDocuments(filter);

    // Log audit trail
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.READ,
      entityType: 'Interview',
      entityId: new mongoose.Types.ObjectId(),
      metadata: { 
        queryType: 'agent_interviews', 
        resultCount: filteredInterviews.length,
        assignedCandidateCount: assignedCandidateIds.length,
        filter 
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      businessProcess: 'agent_management',
      description: `Agent retrieved ${filteredInterviews.length} interviews for assigned candidates`,
    });

    res.json({
      data: filteredInterviews,
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
   * Get interview statistics for agent's assigned candidates
   * @route GET /agents/me/interviews/stats
   */
  static getMyInterviewStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Only agents can access this endpoint
    if (req.user!.role !== UserRole.AGENT) {
      throw createForbiddenError('Only agents can access this endpoint');
    }

    // Get candidates assigned to this agent
    const assignedCandidateIds = await AgentAssignment.getCandidatesForAgent(req.user!._id);
    
    if (assignedCandidateIds.length === 0) {
      return res.json({
        data: {
          byStatus: [],
          todayCount: 0,
          upcomingCount: 0,
        },
      });
    }

    // Find applications for assigned candidates
    const applications = await Application.find({ 
      candidateId: { $in: assignedCandidateIds } 
    }).distinct('_id');

    if (applications.length === 0) {
      return res.json({
        data: {
          byStatus: [],
          todayCount: 0,
          upcomingCount: 0,
        },
      });
    }

    const baseFilter = { applicationId: { $in: applications } };

    const stats = await Interview.aggregate([
      { $match: baseFilter },
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
      ...baseFilter,
      scheduledAt: { $gte: today, $lt: tomorrow },
      status: { $nin: [InterviewStatus.CANCELLED] }
    });

    const upcomingCount = await Interview.countDocuments({
      ...baseFilter,
      scheduledAt: { $gte: new Date() },
      status: { $in: [InterviewStatus.SCHEDULED, InterviewStatus.CONFIRMED] }
    });

    // Log audit trail
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.READ,
      entityType: 'Interview',
      entityId: new mongoose.Types.ObjectId(),
      metadata: { 
        queryType: 'agent_interview_stats', 
        statsData: { byStatus: stats, todayCount, upcomingCount },
        assignedCandidateCount: assignedCandidateIds.length
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      businessProcess: 'agent_management',
      description: `Agent retrieved interview statistics for assigned candidates`,
    });

    res.json({
      data: {
        byStatus: stats,
        todayCount,
        upcomingCount,
        assignedCandidatesCount: assignedCandidateIds.length,
      }
    });
  });

  /**
   * Get single interview by ID (for agent's assigned candidates)
   * @route GET /agents/me/interviews/:id
   */
  static getMyInterview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Only agents can access this endpoint
    if (req.user!.role !== UserRole.AGENT) {
      throw createForbiddenError('Only agents can access this endpoint');
    }

    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw createNotFoundError('Interview not found');
    }

    // Get candidates assigned to this agent
    const assignedCandidateIds = await AgentAssignment.getCandidatesForAgent(req.user!._id);
    
    if (assignedCandidateIds.length === 0) {
      throw createForbiddenError('No candidates assigned to you');
    }

    // Find applications for assigned candidates
    const applications = await Application.find({ 
      candidateId: { $in: assignedCandidateIds } 
    }).distinct('_id');

    const interview = await Interview.findOne({
      _id: id,
      applicationId: { $in: applications }
    })
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
      throw createNotFoundError('Interview not found or you do not have access to it');
    }

    // Log audit trail
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.READ,
      entityType: 'Interview',
      entityId: interview._id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      businessProcess: 'agent_management',
      description: `Agent viewed interview details`,
    });

    res.json({ data: interview });
  });
}
