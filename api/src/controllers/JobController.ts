import { Response } from 'express';
import { z } from 'zod';
import { Job } from '@/models/Job';
import { Company } from '@/models/Company';
import { User } from '@/models/User';
import { AuditLog } from '@/models/AuditLog';
import { AuthenticatedRequest, JobStatus, JobType, JobUrgency, ExperienceLevel, UserRole, AuditAction } from '@/types';
import { asyncHandler, createNotFoundError } from '@/middleware/errorHandler';

/**
 * Job Controller
 * Handles job management operations
 */

const createJobSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  requirements: z.object({
    skills: z.array(z.string()).default([]),
    experience: z.nativeEnum(ExperienceLevel),
    education: z.array(z.string()).default([]),
    languages: z.array(z.string()).default([]),
    certifications: z.array(z.string()).default([]),
  }),
  location: z.string().min(1).max(200),
  type: z.nativeEnum(JobType),
  salaryRange: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
    currency: z.string().default('USD'),
  }).optional(),
  companyId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid company ID'),
  urgency: z.nativeEnum(JobUrgency).default(JobUrgency.MEDIUM),
  assignedAgentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid agent ID').optional(),
  isRemote: z.boolean().default(false),
  benefits: z.array(z.string()).default([]),
  applicationDeadline: z.string().datetime().optional(),
  interviewProcess: z.object({
    rounds: z.number().min(1).max(10).default(3),
    estimatedDuration: z.string().optional(),
  }).optional(),
});

const updateJobSchema = createJobSchema.partial();

const querySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
  status: z.array(z.nativeEnum(JobStatus)).or(z.nativeEnum(JobStatus)).optional(),
  type: z.nativeEnum(JobType).optional(),
  urgency: z.nativeEnum(JobUrgency).optional(),
  companyId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  assignedAgentId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  location: z.string().optional(),
  remote: z.string().transform(val => val === 'true').optional(),
  search: z.string().optional(),
  skills: z.array(z.string()).or(z.string()).optional(),
  salaryMin: z.string().transform(Number).optional(),
  salaryMax: z.string().transform(Number).optional(),
  sortBy: z.enum(['createdAt', 'postedAt', 'urgency', 'applications', 'title']).default('postedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export class JobController {
  /**
   * Get all jobs with filters and pagination
   * GET /jobs
   */
  static getJobs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const query = querySchema.parse(req.query);
    const { page, limit, sortBy, sortOrder, ...filters } = query;
    
    const skip = (page - 1) * limit;
    
    // Build search query
    const searchQuery: any = {};
    
    // Role-based filtering
    if (req.user?.role === UserRole.PARTNER) {
      // Partners can only see jobs from their company
      // TODO: Implement company association logic
      searchQuery.companyId = req.user._id; // Placeholder
    } else if (req.user?.role === UserRole.AGENT) {
      // Agents see assigned jobs and open jobs
      searchQuery.$or = [
        { assignedAgentId: req.user._id },
        { status: JobStatus.OPEN },
      ];
    }
    
    // Apply filters
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        searchQuery.status = { $in: filters.status };
      } else {
        searchQuery.status = filters.status;
      }
    }
    
    if (filters.type) searchQuery.type = filters.type;
    if (filters.urgency) searchQuery.urgency = filters.urgency;
    if (filters.companyId) searchQuery.companyId = filters.companyId;
    if (filters.assignedAgentId) searchQuery.assignedAgentId = filters.assignedAgentId;
    if (filters.remote !== undefined) searchQuery.isRemote = filters.remote;
    
    if (filters.location) {
      searchQuery.location = { $regex: filters.location, $options: 'i' };
    }
    
    if (filters.search) {
      searchQuery.$text = { $search: filters.search };
    }
    
    if (filters.skills) {
      const skillsArray = Array.isArray(filters.skills) ? filters.skills : [filters.skills];
      searchQuery['requirements.skills'] = { $in: skillsArray };
    }
    
    if (filters.salaryMin || filters.salaryMax) {
      searchQuery['salaryRange.min'] = {};
      if (filters.salaryMin) searchQuery['salaryRange.min'].$gte = filters.salaryMin;
      if (filters.salaryMax) searchQuery['salaryRange.max'] = { $lte: filters.salaryMax };
    }
    
    // Build sort
    const sort: any = {};
    if (sortBy === 'urgency') {
      // Custom urgency sorting
      sort['urgency'] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }
    
    const [jobs, total] = await Promise.all([
      Job.find(searchQuery)
        .populate('companyId', 'name industry location')
        .populate('assignedAgentId', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Job.countDocuments(searchQuery),
    ]);
    
    res.json({
      success: true,
      data: jobs,
      meta: {
        page: {
          current: page,
          total: Math.ceil(total / limit),
          hasMore: skip + jobs.length < total,
        },
        total,
        limit,
        filters: filters,
      },
    });
  });

  /**
   * Get job by ID
   * GET /jobs/:id
   */
  static getJobById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    
    const job = await Job.findById(id)
      .populate('companyId')
      .populate('assignedAgentId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName');
    
    if (!job) {
      throw createNotFoundError('Job', id);
    }
    
    // Role-based access control
    if (req.user?.role === UserRole.PARTNER) {
      // TODO: Check if user's company owns this job
    }
    
    // Increment view count
    job.incrementViews();
    await job.save();
    
    res.json({
      success: true,
      data: job,
    });
  });

  /**
   * Create new job
   * POST /jobs
   */
  static createJob = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validatedData = createJobSchema.parse(req.body);
    
    // Verify company exists
    const company = await Company.findById(validatedData.companyId);
    if (!company) {
      throw createNotFoundError('Company', validatedData.companyId);
    }
    
    // Verify agent exists if assigned
    if (validatedData.assignedAgentId) {
      const agent = await User.findOne({
        _id: validatedData.assignedAgentId,
        role: UserRole.AGENT,
        status: 'active',
      });
      if (!agent) {
        throw createNotFoundError('Agent', validatedData.assignedAgentId);
      }
    }
    
    const job = new Job({
      ...validatedData,
      createdBy: req.user!._id,
      postedAt: new Date(),
      status: validatedData.assignedAgentId ? JobStatus.ASSIGNED : JobStatus.OPEN,
    });
    
    await job.save();
    
    // Update company job count
    company.incrementJobs();
    await company.save();
    
    // Log job creation
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.CREATE,
      entityType: 'Job',
      entityId: job._id,
      after: job.toObject(),
      metadata: { companyId: company._id, urgency: job.urgency },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      businessProcess: 'job_management',
    });
    
    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job,
    });
  });

  /**
   * Update job
   * PUT /jobs/:id
   */
  static updateJob = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const updates = updateJobSchema.parse(req.body);
    
    const job = await Job.findById(id);
    if (!job) {
      throw createNotFoundError('Job', id);
    }
    
    const beforeState = job.toObject();
    
    // Update fields
    Object.assign(job, updates);
    await job.save();
    
    // Log job update
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.UPDATE,
      entityType: 'Job',
      entityId: job._id,
      before: beforeState,
      after: job.toObject(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      businessProcess: 'job_management',
    });
    
    res.json({
      success: true,
      message: 'Job updated successfully',
      data: job,
    });
  });

  /**
   * Delete job
   * DELETE /jobs/:id
   */
  static deleteJob = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    
    const job = await Job.findById(id);
    if (!job) {
      throw createNotFoundError('Job', id);
    }
    
    // Check if job has applications
    const { Application } = await import('@/models/Application');
    const applicationCount = await Application.countDocuments({ jobId: id });
    
    if (applicationCount > 0) {
      return res.status(400).json({
        type: 'https://httpstatuses.com/400',
        title: 'Bad Request',
        status: 400,
        detail: 'Cannot delete job with existing applications. Close the job instead.',
      });
    }
    
    const beforeState = job.toObject();
    
    await job.deleteOne();
    
    // Log job deletion
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.DELETE,
      entityType: 'Job',
      entityId: job._id,
      before: beforeState,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      businessProcess: 'job_management',
      riskLevel: 'medium',
    });
    
    res.json({
      success: true,
      message: 'Job deleted successfully',
    });
  });

  /**
   * Assign agent to job
   * POST /jobs/:id/assign
   */
  static assignAgent = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { agentId } = z.object({
      agentId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    }).parse(req.body);
    
    const [job, agent] = await Promise.all([
      Job.findById(id),
      User.findOne({ _id: agentId, role: UserRole.AGENT, status: 'active' }),
    ]);
    
    if (!job) throw createNotFoundError('Job', id);
    if (!agent) throw createNotFoundError('Agent', agentId);
    
    const beforeState = job.toObject();
    
    job.assignAgent(agent._id);
    await job.save();
    
    // Log agent assignment
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.ASSIGN,
      entityType: 'Job',
      entityId: job._id,
      before: beforeState,
      after: job.toObject(),
      metadata: { assignedAgent: agent._id, agentName: `${agent.firstName} ${agent.lastName}` },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      businessProcess: 'job_management',
    });
    
    res.json({
      success: true,
      message: 'Agent assigned successfully',
      data: job,
    });
  });

  /**
   * Close job
   * POST /jobs/:id/close
   */
  static closeJob = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { reason } = z.object({
      reason: z.string().optional(),
    }).parse(req.body);
    
    const job = await Job.findById(id);
    if (!job) {
      throw createNotFoundError('Job', id);
    }
    
    if (job.isClosed) {
      return res.status(400).json({
        type: 'https://httpstatuses.com/400',
        title: 'Bad Request',
        status: 400,
        detail: 'Job is already closed',
      });
    }
    
    const beforeState = job.toObject();
    
    job.closeJob(reason);
    await job.save();
    
    // Log job closure
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.UPDATE,
      entityType: 'Job',
      entityId: job._id,
      before: beforeState,
      after: job.toObject(),
      metadata: { action: 'close_job', reason },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      businessProcess: 'job_management',
    });
    
    res.json({
      success: true,
      message: 'Job closed successfully',
      data: job,
    });
  });

  /**
   * Get job statistics
   * GET /jobs/stats
   */
  static getJobStats = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const stats = await Job.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgApplications: { $avg: '$applications' },
          totalApplications: { $sum: '$applications' },
        },
      },
      {
        $group: {
          _id: null,
          statusStats: {
            $push: {
              status: '$_id',
              count: '$count',
              avgApplications: '$avgApplications',
              totalApplications: '$totalApplications',
            },
          },
          totalJobs: { $sum: '$count' },
        },
      },
    ]);
    
    const urgencyStats = await Job.aggregate([
      {
        $group: {
          _id: '$urgency',
          count: { $sum: 1 },
        },
      },
    ]);
    
    const result = {
      ...(stats[0] || { statusStats: [], totalJobs: 0 }),
      urgencyStats,
    };
    
    res.json({
      success: true,
      data: result,
    });
  });

  /**
   * Search jobs
   * GET /jobs/search
   */
  static searchJobs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { q, skills, location, type, limit = 20 } = req.query;
    
    if (!q && !skills && !location) {
      return res.status(400).json({
        type: 'https://httpstatuses.com/400',
        title: 'Bad Request',
        status: 400,
        detail: 'At least one search parameter is required',
      });
    }
    
    const searchQuery: any = {
      status: { $in: [JobStatus.OPEN, JobStatus.ASSIGNED] },
    };
    
    if (q) {
      searchQuery.$text = { $search: q as string };
    }
    
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      searchQuery['requirements.skills'] = { $in: skillsArray };
    }
    
    if (location) {
      searchQuery.location = { $regex: location as string, $options: 'i' };
    }
    
    if (type) {
      searchQuery.type = type;
    }
    
    const jobs = await Job.find(searchQuery)
      .populate('companyId', 'name industry location')
      .select('title location type salaryRange urgency postedAt companyId requirements.skills')
      .sort({ score: { $meta: 'textScore' }, urgency: -1, postedAt: -1 })
      .limit(Number(limit));
    
    res.json({
      success: true,
      data: jobs,
    });
  });
}
