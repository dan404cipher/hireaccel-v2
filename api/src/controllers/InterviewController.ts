import { Response } from 'express';
import { z } from 'zod';
import { Interview } from '@/models/Interview';
import { Application } from '@/models/Application';
import { User } from '@/models/User';
import { CandidateAssignment } from '@/models/CandidateAssignment';

import { AuditLog } from '@/models/AuditLog';
import { AuthenticatedRequest, InterviewType, InterviewStatus, InterviewRound, AuditAction, UserRole } from '@/types';
import { asyncHandler, createNotFoundError } from '@/middleware/errorHandler';
import mongoose from 'mongoose';

/**
 * Interview Controller
 * Handles interview management operations
 */

const createInterviewSchema = z.object({
  // Support both applicationId and candidateId
  applicationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid application ID').optional(),
  candidateId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid candidate ID').optional(),
  type: z.nativeEnum(InterviewType),
  round: z.nativeEnum(InterviewRound),
  scheduledAt: z.string().datetime(),
  duration: z.number().min(15).max(480),
  location: z.string().optional(),
  interviewers: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid interviewer ID')).optional().default([]),
  notes: z.string().optional(),
}).refine(data => data.applicationId || data.candidateId, {
  message: "Either applicationId or candidateId must be provided",
  path: ["applicationId", "candidateId"]
});

const updateInterviewSchema = z.object({
  applicationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid application ID').optional(),
  candidateId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid candidate ID').optional(),
  type: z.nativeEnum(InterviewType).optional(),
  round: z.nativeEnum(InterviewRound).optional(),
  scheduledAt: z.string().datetime().optional(),
  duration: z.number().min(15).max(480).optional(),
  location: z.string().optional(),
  interviewers: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid interviewer ID')).optional(),
  notes: z.string().optional(),
});

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

    // HR-specific filtering: Only show interviews for candidates assigned to this HR user
    let candidateFilter: any = {};
    if (req.user!.role === UserRole.HR) {
      // Get all candidates assigned to this HR user
      const assignedCandidateIds = await CandidateAssignment.find({
        assignedTo: req.user!._id,
        status: 'active'
      }).distinct('candidateId');

      if (assignedCandidateIds.length === 0) {
        // If no candidates are assigned to this HR user, return empty result
        return res.json({
          data: [],
          meta: {
            total: 0,
            page,
            limit,
            totalPages: 0,
          },
        });
      }

      candidateFilter = { candidateId: { $in: assignedCandidateIds } };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // First, get applications that match the candidate filter (for HR users)
    if (req.user!.role === UserRole.HR) {
      const eligibleApplications = await Application.find(candidateFilter).distinct('_id');
      filter.applicationId = { $in: eligibleApplications };
    }

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

    // Count total documents with the same filter applied
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

    let applicationId = validatedData.applicationId;

    // If candidateId is provided instead of applicationId, handle it differently
    if (validatedData.candidateId && !validatedData.applicationId) {
      // Import the necessary models
      const { Candidate } = await import('@/models/Candidate');
      const { Job } = await import('@/models/Job');
      
      // Verify candidate exists
      const candidate = await Candidate.findById(validatedData.candidateId);
      if (!candidate) {
        throw createNotFoundError('Candidate not found');
      }

      // Try to find existing application for this candidate
      let existingApplication = await Application.findOne({ candidateId: validatedData.candidateId });
      
      if (existingApplication) {
        applicationId = existingApplication._id.toString();
      } else {
        // If no application exists, create a generic one for interview purposes
        // First, try to find a job posted by the current HR user
        const hrJob = await Job.findOne({ createdBy: req.user!._id }).sort({ createdAt: -1 });
        
        if (!hrJob) {
          // If HR hasn't posted any jobs, find any active job
          const anyJob = await Job.findOne({ status: 'active' }).sort({ createdAt: -1 });
          if (!anyJob) {
            return res.status(400).json({
              error: 'No jobs available. Please create a job first before scheduling interviews.'
            });
          }
          
          // Create a generic application for this candidate to the found job
          const newApplication = await Application.create({
            candidateId: validatedData.candidateId,
            jobId: anyJob._id,
            status: 'submitted',
            stage: 'screening',
            source: 'direct_apply',
            appliedAt: new Date(),
          });
          
          applicationId = newApplication._id.toString();
        } else {
          // Create application for HR's job
          const newApplication = await Application.create({
            candidateId: validatedData.candidateId,
            jobId: hrJob._id,
            status: 'submitted',
            stage: 'screening',
            source: 'direct_apply',
            appliedAt: new Date(),
          });
          
          applicationId = newApplication._id.toString();
        }
      }
    } else if (validatedData.applicationId) {
      // Verify application exists
      const application = await Application.findById(validatedData.applicationId);
      if (!application) {
        throw createNotFoundError('Application not found');
      }
    }

    // Verify interviewers exist (if provided)
    let interviewerIds = validatedData.interviewers || [];
    if (interviewerIds.length > 0) {
      const interviewers = await User.find({
        _id: { $in: interviewerIds },
        role: { $in: ['hr', 'admin'] }
      });

      if (interviewers.length !== interviewerIds.length) {
        return res.status(400).json({
          error: 'One or more interviewers not found or invalid role'
        });
      }
    } else {
      // If no interviewers provided, use the current user as interviewer
      interviewerIds = [req.user!._id.toString()];
    }

    // Prepare notes array if notes are provided
    const notesArray = validatedData.notes ? [{
      content: validatedData.notes,
      createdBy: req.user!._id,
      createdAt: new Date(),
      isPrivate: false,
    }] : [];

    // Prepare interview data with proper field mapping
    const interviewData: any = {
      applicationId: applicationId,
      type: validatedData.type,
      round: validatedData.round,
      scheduledAt: new Date(validatedData.scheduledAt),
      duration: validatedData.duration,
      interviewers: interviewerIds,
      notes: notesArray,
      createdBy: req.user!._id,
      status: InterviewStatus.SCHEDULED,
    };

    // Handle location/meetingLink properly based on interview type
    if (validatedData.location) {
      if (validatedData.type === 'video' || validatedData.type === 'phone') {
        // For virtual interviews, use meetingLink if location looks like a URL
        if (validatedData.location.startsWith('http')) {
          interviewData.meetingLink = validatedData.location;
        } else {
          // Otherwise, put it in location and provide a placeholder meetingLink
          interviewData.location = validatedData.location;
          interviewData.meetingLink = 'https://zoom.us/j/placeholder';
        }
      } else {
        // For in-person interviews, use location field
        interviewData.location = validatedData.location;
      }
    } else if (validatedData.type === 'video' || validatedData.type === 'phone') {
      // Provide default meeting link for virtual interviews
      interviewData.meetingLink = 'https://zoom.us/j/placeholder';
    }

    // Create interview
    const interview = await Interview.create(interviewData);

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
      metadata: { 
        applicationId: applicationId,
        candidateId: validatedData.candidateId 
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      businessProcess: 'interview_scheduling',
      description: `Created interview for ${validatedData.candidateId ? 'candidate' : 'application'} ${validatedData.candidateId || applicationId}`,
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

    // Handle notes properly if provided
    if (validatedData.notes) {
      const notesArray = [{
        content: validatedData.notes,
        createdBy: req.user!._id,
        createdAt: new Date(),
        isPrivate: false,
      }];
      interview.notes = notesArray as any;
    }

    // Handle location/meetingLink properly based on interview type
    if (validatedData.location) {
      if (validatedData.type === 'video' || validatedData.type === 'phone') {
        // For virtual interviews, use meetingLink if location looks like a URL
        if (validatedData.location.startsWith('http')) {
          interview.meetingLink = validatedData.location;
          (interview as any).location = undefined;
        } else {
          // Otherwise, put it in location and provide a placeholder meetingLink
          interview.location = validatedData.location;
          interview.meetingLink = 'https://zoom.us/j/placeholder';
        }
      } else {
        // For in-person interviews, use location field
        interview.location = validatedData.location;
        (interview as any).meetingLink = undefined;
      }
    } else if (validatedData.type === 'video' || validatedData.type === 'phone') {
      // Provide default meeting link for virtual interviews if no location provided
      if (!interview.meetingLink) {
        interview.meetingLink = 'https://zoom.us/j/placeholder';
      }
    }

    // Update other fields
    const updateFields = { ...validatedData };
    delete updateFields.notes; // Already handled above
    delete updateFields.location; // Already handled above
    
    Object.assign(interview, updateFields);
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
    // Build base filter for HR users
    let baseFilter: any = {};
    
    if (req.user!.role === UserRole.HR) {
      // Get all candidates assigned to this HR user
      const assignedCandidateIds = await CandidateAssignment.find({
        assignedTo: req.user!._id,
        status: 'active'
      }).distinct('candidateId');

      if (assignedCandidateIds.length === 0) {
        // If no candidates are assigned, return empty stats
        return res.json({
          data: {
            statusStats: [],
            todayCount: 0,
          },
        });
      }

      // Get applications for assigned candidates
      const eligibleApplications = await Application.find({
        candidateId: { $in: assignedCandidateIds }
      }).distinct('_id');
      
      baseFilter.applicationId = { $in: eligibleApplications };
    }

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
