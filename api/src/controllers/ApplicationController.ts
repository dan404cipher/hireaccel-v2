import { Response } from 'express';
import { z } from 'zod';
import { Application } from '@/models/Application';
import { Job } from '@/models/Job';
import { Candidate } from '@/models/Candidate';
import { AuditLog } from '@/models/AuditLog';
import { AuthenticatedRequest, ApplicationStatus, ApplicationStage, UserRole, AuditAction } from '@/types';
import { asyncHandler, createNotFoundError, createBadRequestError } from '@/middleware/errorHandler';

const createApplicationSchema = z.object({
  candidateId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  jobId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  source: z.enum(['direct_apply', 'referral', 'recruiter', 'job_board', 'linkedin', 'company_website']).default('direct_apply'),
  referredBy: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
});

const advanceApplicationSchema = z.object({
  newStage: z.nativeEnum(ApplicationStage),
  newStatus: z.nativeEnum(ApplicationStatus),
  note: z.string().optional(),
});

export class ApplicationController {
  static getApplications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { page = 1, limit = 20, status, stage, candidateId, jobId, userId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const query: any = {};
    if (status) query.status = Array.isArray(status) ? { $in: status } : status;
    if (stage) query.stage = stage;
    if (candidateId) query.candidateId = candidateId;
    if (jobId) query.jobId = jobId;
    
    // If userId is provided, find the corresponding candidate
    if (userId) {
      const candidate = await Candidate.findOne({ userId });
      if (candidate) {
        query.candidateId = candidate._id;
      } else {
        // If no candidate profile exists for this user, return empty results
        return res.json({
          success: true,
          data: [],
          meta: { page: { current: Number(page), total: 0, hasMore: false }, total: 0, limit: Number(limit) },
        });
      }
    }
    
    // Role-based filtering
    if (req.user?.role === UserRole.AGENT) {
      const { Job } = await import('@/models/Job');
      const agentJobs = await Job.find({ assignedAgentId: req.user._id }).select('_id');
      query.jobId = { $in: agentJobs.map(j => j._id) };
    }
    
    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate({ path: 'candidateId', populate: { path: 'userId', select: 'firstName lastName email' } })
        .populate({ 
          path: 'jobId', 
          select: 'title location type status urgency salaryRange',
          populate: { 
            path: 'companyId', 
            select: 'name industry size' 
          }
        })
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Application.countDocuments(query),
    ]);
    
    res.json({
      success: true,
      data: applications,
      meta: { page: { current: Number(page), total: Math.ceil(total / Number(limit)), hasMore: skip + applications.length < total }, total, limit: Number(limit) },
    });
  });

  static createApplication = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validatedData = createApplicationSchema.parse(req.body);
    
    // Verify job and candidate exist
    const [job, candidate] = await Promise.all([
      Job.findById(validatedData.jobId),
      Candidate.findById(validatedData.candidateId),
    ]);
    
    if (!job) throw createNotFoundError('Job', validatedData.jobId);
    if (!candidate) throw createNotFoundError('Candidate', validatedData.candidateId);
    
    // Check if application already exists
    const existingApplication = await Application.findOne({
      candidateId: validatedData.candidateId,
      jobId: validatedData.jobId,
    });
    
    if (existingApplication) {
      throw createBadRequestError('Application already exists for this candidate and job');
    }
    
    const application = new Application(validatedData);
    await application.save();
    
    // Update job application count
    job.incrementApplications();
    await job.save();
    
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.CREATE,
      entityType: 'Application',
      entityId: application._id,
      after: application.toObject(),
      metadata: { jobId: job._id, candidateId: candidate._id },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      businessProcess: 'application_processing',
    });
    
    res.status(201).json({ success: true, message: 'Application created successfully', data: application });
  });

  static advanceApplication = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { newStage, newStatus, note } = advanceApplicationSchema.parse(req.body);
    
    const application = await Application.findById(id);
    if (!application) throw createNotFoundError('Application', id);
    
    const beforeState = application.toObject();
    
    application.advanceStage(newStage, newStatus, req.user!._id, note);
    await application.save();
    
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.ADVANCE,
      entityType: 'Application',
      entityId: application._id,
      before: beforeState,
      after: application.toObject(),
      metadata: { stageAdvancement: { from: beforeState.stage, to: newStage }, note },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      businessProcess: 'application_processing',
    });
    
    res.json({ success: true, message: 'Application advanced successfully', data: application });
  });

  static rejectApplication = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { reason } = z.object({ reason: z.string().min(1) }).parse(req.body);
    
    const application = await Application.findById(id);
    if (!application) throw createNotFoundError('Application', id);
    
    const beforeState = application.toObject();
    
    application.reject(reason, req.user!._id);
    await application.save();
    
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.REJECT,
      entityType: 'Application',
      entityId: application._id,
      before: beforeState,
      after: application.toObject(),
      metadata: { rejectionReason: reason },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      businessProcess: 'application_processing',
    });
    
    res.json({ success: true, message: 'Application rejected successfully', data: application });
  });

  static getApplicationStats = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const stats = await Application.aggregate([
      { $group: { _id: '$stage', count: { $sum: 1 }, avgDays: { $avg: { $divide: [{ $subtract: ['$$NOW', '$appliedAt'] }, 86400000] } } } },
      { $group: { _id: null, stageStats: { $push: { stage: '$_id', count: '$count', avgDays: '$avgDays' } }, totalApplications: { $sum: '$count' } } },
    ]);
    
    res.json({ success: true, data: stats[0] || { stageStats: [], totalApplications: 0 } });
  });
}
