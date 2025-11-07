import { Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Job } from '@/models/Job';
import { Company } from '@/models/Company';
import { User } from '@/models/User';
import { AuditLog } from '@/models/AuditLog';
import { AgentAssignment } from '@/models/AgentAssignment';
import { CandidateAssignment } from '@/models/CandidateAssignment';
import { AuthenticatedRequest, JobStatus, JobType, JobUrgency, WorkType, UserRole, AuditAction } from '@/types';
import { asyncHandler, createNotFoundError } from '@/middleware/errorHandler';

/**
 * Job Controller
 * Handles job management operations
 */

const createJobSchema = z.object({
  jobId: z.string().optional(), // Optional - will be generated automatically
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  requirements: z.object({
    skills: z.array(z.string()).default([]),
    experienceMin: z.number().min(0, 'Minimum experience cannot be negative').optional(),
    experienceMax: z.number().min(0, 'Maximum experience cannot be negative').optional(),
    education: z.array(z.string()).default([]),
    languages: z.array(z.string()).default([]),
    certifications: z.array(z.string()).default([]),
  }).refine(data => {
    // If both are provided, max must be >= min
    if (data.experienceMin !== undefined && data.experienceMax !== undefined) {
      return data.experienceMax >= data.experienceMin;
    }
    return true;
  }, {
    message: 'Maximum experience must be greater than or equal to minimum experience',
    path: ['experienceMax'],
  }),
  location: z.string().min(1).max(200),
  address: z.object({
    street: z.string().min(1, 'Street address is required').max(200),
    city: z.string().min(1, 'City is required').max(100),
    state: z.string().max(100).optional(),
    zipCode: z.string().max(20).optional(),
    country: z.string().max(100).optional(),
  }),
  type: z.nativeEnum(JobType),
  salaryRange: z.object({
    min: z.number().min(0, 'Minimum salary must be at least 0'),
    max: z.number().min(0, 'Maximum salary must be at least 0'),
    currency: z.string().default('INR'),
  }),
  companyId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid company ID'),
  urgency: z.nativeEnum(JobUrgency).default(JobUrgency.MEDIUM),
  workType: z.nativeEnum(WorkType).default(WorkType.WFO),
  duration: z.string().max(100).optional(),
  numberOfOpenings: z.number().min(1, 'Number of openings must be at least 1').default(1),
  assignedAgentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid agent ID').optional(),
  isRemote: z.boolean().default(false),
  benefits: z.array(z.string()).default([]),
  applicationDeadline: z.string().datetime().optional(),
  interviewProcess: z.object({
    rounds: z.number().min(1).max(10).default(3),
    estimatedDuration: z.string().optional(),
  }).optional(),
  jdFileId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid JD file ID').optional(),
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
  createdBy: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
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
    const searchQuery: any = {
      deleted: { $ne: true }, // Exclude deleted jobs by default
    };
    
    // Role-based filtering
    if (req.user?.role === UserRole.PARTNER) {
      // Partners can only see jobs from their company
      // TODO: Implement company association logic
      searchQuery.companyId = req.user._id; // Placeholder
    } else if (req.user?.role === UserRole.HR) {
      // HR users can only see jobs they posted (unless explicitly filtered by createdBy)
      if (!filters.createdBy) {
        searchQuery.createdBy = req.user._id;
      }
    } else if (req.user?.role === UserRole.AGENT) {
      // Get agent's assignment to find assigned HRs
      const agentAssignment = await AgentAssignment.getAssignmentForAgent(req.user._id);
      
      console.log(`Agent ${req.user._id} (${req.user.firstName} ${req.user.lastName}) checking assignments:`, {
        hasAssignment: !!agentAssignment,
        assignedHRs: agentAssignment?.assignedHRs || [],
        assignedHRsLength: agentAssignment?.assignedHRs?.length || 0
      });
      
      if (agentAssignment && agentAssignment.assignedHRs && agentAssignment.assignedHRs.length > 0) {
        // Agents can only see jobs posted by their assigned HRs
        searchQuery.createdBy = { $in: agentAssignment.assignedHRs };
        console.log(`Agent ${req.user._id} filtered jobs by assigned HRs:`, agentAssignment.assignedHRs);
        
        // Also log the final search query for debugging
        console.log(`Final search query for agent:`, JSON.stringify(searchQuery, null, 2));
      } else {
        // If no HRs assigned or no assignment exists, agent sees no jobs
        // Use a query that will return no results without causing an error
        searchQuery._id = new mongoose.Types.ObjectId('000000000000000000000000');
        console.log(`Agent ${req.user._id} has no assigned HRs or no assignment exists, showing no jobs`);
      }
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
    if (filters.createdBy) searchQuery.createdBy = filters.createdBy;
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
        .populate('companyId', 'name industry location logoFileId')
        .populate('assignedAgentId', 'firstName lastName email customId profilePhotoFileId')
        .populate('createdBy', 'firstName lastName email customId profilePhotoFileId')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Job.countDocuments(searchQuery),
    ]);
    
    // For HR users, find the agent assigned to them (cache this lookup since it's the same for all jobs)
    let assignedAgent: any = null;
    if (req.user?.role === UserRole.HR) {
      const hrId = req.user._id;
      
      // Try to find agent through AgentAssignment first
      let agentAssignment = await AgentAssignment.findOne({
        assignedHRs: { $in: [hrId] },
        status: 'active'
      }).populate('agentId', 'firstName lastName email customId profilePhotoFileId');
      
      if (agentAssignment?.agentId) {
        assignedAgent = agentAssignment.agentId;
      } else {
        // Fallback: Find agent through CandidateAssignment (if agent has shared candidates to this HR)
        const candidateAssignment = await CandidateAssignment.findOne({
          assignedTo: hrId,
          status: { $in: ['active', 'completed'] }
        })
        .populate('assignedBy', 'firstName lastName email customId profilePhotoFileId role')
        .sort({ assignedAt: -1 }); // Get the most recent one
        
        if (candidateAssignment?.assignedBy && candidateAssignment.assignedBy.role === UserRole.AGENT) {
          assignedAgent = candidateAssignment.assignedBy;
        }
      }
    }
    
    // Calculate actual applications count for each job based on candidate assignments
    // Also populate assigned agent for HR users (from AgentAssignment)
    const jobsWithApplicationsCount = await Promise.all(
      jobs.map(async (job) => {
        const applicationsCount = await Job.calculateApplicationsCount(job._id);
        const jobObject = job.toObject();
        
        // For HR users, add the assigned agent (cached from above)
        if (req.user?.role === UserRole.HR && assignedAgent) {
          jobObject.assignedAgentId = assignedAgent;
        }
        
        return {
          ...jobObject,
          applications: applicationsCount
        };
      })
    );
    
    res.json({
      success: true,
      data: jobsWithApplicationsCount,
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
   * Debug endpoint to see all jobs with creators (Admin only)
   * GET /jobs/debug/all
   */
  static debugAllJobs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Only allow admins to access this debug endpoint
    if (req.user?.role !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.',
      });
    }

    const allJobs = await Job.find({})
      .populate('createdBy', 'firstName lastName email role customId')
      .populate('companyId', 'name')
      .sort({ createdAt: -1 });

    const jobsWithCreators = allJobs.map(job => {
      const jobObj = job.toObject();
      return {
        _id: jobObj._id,
        title: jobObj.title,
        company: (jobObj.companyId as any)?.name || null,
        createdBy: jobObj.createdBy ? {
          _id: jobObj.createdBy._id,
          name: `${(jobObj.createdBy as any).firstName} ${(jobObj.createdBy as any).lastName}`,
          email: (jobObj.createdBy as any).email,
          role: (jobObj.createdBy as any).role
        } : null,
        status: jobObj.status,
        createdAt: jobObj.createdAt
      };
    });

    res.json({
      success: true,
      data: jobsWithCreators,
      total: jobsWithCreators.length,
      message: 'Debug: All jobs with creator information'
    });
  });

  /**
   * Get job by ID
   * GET /jobs/:id
   */
  static getJobById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    
    // Try to find by custom jobId first, then by MongoDB _id
    let job = await Job.findOne({ jobId: id })
      .populate('companyId', 'name industry location logoFileId')
      .populate('assignedAgentId', 'firstName lastName email customId profilePhotoFileId')
      .populate('createdBy', 'firstName lastName customId profilePhotoFileId');
    
    // If not found by jobId, try by MongoDB _id
    if (!job) {
      job = await Job.findById(id)
        .populate('companyId', 'name industry location logoFileId')
        .populate('assignedAgentId', 'firstName lastName email customId profilePhotoFileId')
        .populate('createdBy', 'firstName lastName customId profilePhotoFileId');
    }
    
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
    
    // Calculate actual applications count based on candidate assignments
    const applicationsCount = await Job.calculateApplicationsCount(job._id);
    const jobWithApplicationsCount = {
      ...job.toObject(),
      applications: applicationsCount
    };
    
    res.json({
      success: true,
      data: jobWithApplicationsCount,
    });
  });

  /**
   * Create new job
   * POST /jobs
   */
  static createJob = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    console.log('Creating job with data:', req.body);
    const validatedData = createJobSchema.parse(req.body);
    console.log('Validated data:', validatedData);
    
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
    
    console.log('Job object before save:', job.toObject());
    await job.save();
    console.log('Job saved successfully with ID:', job.jobId);
    
    // Update company job count
    company.incrementJobs();
    // Temporarily skip successRate calculation to avoid validation error
    company.successRate = Math.min(100, Math.max(0, Math.round(((company.totalHires || 0) / (company.totalJobs || 1)) * 100)));
    await company.save();
    
    // Log job creation
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.CREATE,
      entityType: 'Job',
      entityId: job._id,
      after: job.toObject(),
      metadata: { 
        companyId: company._id, 
        urgency: job.urgency,
        jobTitle: job.title,
        jobId: job.jobId,
        userId: req.user!._id.toString(),
        userFirstName: req.user!.firstName,
        userLastName: req.user!.lastName
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      businessProcess: 'job_management',
      description: `${req.user!.firstName} ${req.user!.lastName} created job "${job.title}" (ID: ${job.jobId})`,
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
    
    // Try to find by custom jobId first, then by MongoDB _id
    let job = await Job.findOne({ jobId: id });
    if (!job) {
      job = await Job.findById(id);
    }
    
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
   * Delete job (Soft Delete)
   * DELETE /jobs/:id
   */
  static deleteJob = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    
    // Try to find by custom jobId first, then by MongoDB _id
    let job = await Job.findOne({ jobId: id });
    if (!job) {
      job = await Job.findById(id);
    }
    
    if (!job) {
      throw createNotFoundError('Job', id);
    }
    
    // Check if already deleted
    if (job.deleted) {
      return res.status(400).json({
        type: 'https://httpstatuses.com/400',
        title: 'Bad Request',
        status: 400,
        detail: 'Job is already deleted',
      });
    }
    
    const beforeState = job.toObject();
    
    // Soft delete: mark as deleted instead of removing from database
    job.deleted = true;
    job.deletedAt = new Date();
    job.deletedBy = req.user!._id;
    job.status = JobStatus.CLOSED; // Also close the job
    await job.save({ validateBeforeSave: false }); // Skip validation for soft delete
    
    // Log job deletion
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.DELETE,
      entityType: 'Job',
      entityId: job._id,
      before: beforeState,
      after: job.toObject(),
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
   * Restore deleted job (Superadmin only)
   * POST /jobs/:id/restore
   */
  static restoreJob = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    
    // Only superadmin can restore
    if (req.user!.role !== UserRole.SUPERADMIN) {
      return res.status(403).json({
        type: 'https://httpstatuses.com/403',
        title: 'Forbidden',
        status: 403,
        detail: 'Only superadmin can restore deleted jobs',
      });
    }
    
    // Try to find by custom jobId first, then by MongoDB _id
    let job = await Job.findOne({ jobId: id, deleted: true });
    if (!job) {
      job = await Job.findOne({ _id: id, deleted: true });
    }
    
    if (!job) {
      throw createNotFoundError('Deleted Job', id);
    }
    
    const beforeState = job.toObject();
    
    // Restore the job
    job.deleted = false;
    job.deletedAt = null as any;
    job.deletedBy = null as any;
    job.status = JobStatus.OPEN; // Reopen the job
    await job.save({ validateBeforeSave: false }); // Skip validation for restore
    
    // Log job restoration
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
      description: 'Job restored from recycle bin',
      riskLevel: 'low',
    });
    
    res.json({
      success: true,
      message: 'Job restored successfully',
      data: job,
    });
  });
  
  /**
   * Get deleted jobs (Superadmin only)
   * GET /jobs/deleted
   */
  static getDeletedJobs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Only superadmin can view deleted jobs
    if (req.user!.role !== UserRole.SUPERADMIN) {
      return res.status(403).json({
        type: 'https://httpstatuses.com/403',
        title: 'Forbidden',
        status: 403,
        detail: 'Only superadmin can view deleted jobs',
      });
    }
    
    const jobs = await Job.find({ deleted: true })
      .populate('companyId', 'name')
      .populate('deletedBy', 'firstName lastName email')
      .sort({ deletedAt: -1 });
    
    res.json({
      success: true,
      data: jobs,
      meta: {
        total: jobs.length,
      },
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
