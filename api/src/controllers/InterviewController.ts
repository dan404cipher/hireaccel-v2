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
  status: z.nativeEnum(InterviewStatus).optional(),
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

    console.log('Request user:', {
      id: req.user!._id,
      role: req.user!.role,
      email: req.user!.email
    });

    // Handle agent-specific filtering
    if (req.user!.role === UserRole.AGENT) {
      console.log('Agent filtering for user:', req.user!._id);
      
      // Get all HRs assigned to this agent
      const AgentAssignment = (await import('@/models/AgentAssignment')).AgentAssignment;
      console.log('Looking for agent assignment with:', {
        agentId: req.user!._id,
        status: 'active'
      });
      
      const agentAssignment = await AgentAssignment.findOne({
        agentId: req.user!._id,
        status: 'active'
      }).populate('assignedHRs');
      
      console.log('Found agent assignment:', {
        id: agentAssignment?._id,
        assignedHRs: agentAssignment?.assignedHRs?.length || 0,
        status: agentAssignment?.status
      });
      
      if (!agentAssignment || !agentAssignment.assignedHRs?.length) {
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

      // Find interviews created by assigned HRs
      console.log('Looking for interviews created by HRs:', agentAssignment.assignedHRs);
      const hrInterviews = await Interview.find({
        createdBy: { $in: agentAssignment.assignedHRs }
      }).distinct('_id');
      console.log('Found interviews:', hrInterviews);
      
      filter._id = { $in: hrInterviews };
      console.log('Final filter:', filter);
      console.log('Final filter:', filter);
    }
    // Handle candidate-specific filtering
    else if (req.user!.role === UserRole.CANDIDATE) {
      // Find the candidate record for this user
      const candidate = await (await import('@/models/Candidate')).Candidate.findOne({ userId: req.user!._id });
      if (!candidate) {
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

      // Find applications for this candidate
      const applications = await Application.find({ candidateId: candidate._id }).distinct('_id');
      filter.applicationId = { $in: applications };
    }

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

    // HR-specific filtering: Show interviews for candidates assigned to this HR user OR applications created by this HR
    let candidateFilter: any = {};
    if (req.user!.role === UserRole.HR) {
      // Get all candidates assigned to this HR user
      const assignedCandidateIds = await CandidateAssignment.find({
        assignedTo: req.user!._id,
        status: 'active'
      }).distinct('candidateId');

      // Get all applications created by this HR
      const hrApplications = await Application.find({
        $or: [
          { candidateId: { $in: assignedCandidateIds } },
          { createdBy: req.user!._id }
        ]
      }).distinct('_id');

      if (hrApplications.length === 0) {
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

      filter.applicationId = { $in: hrApplications };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // First, get applications that match the candidate filter (for HR users)
    if (req.user!.role === UserRole.HR) {
      const eligibleApplications = await Application.find(candidateFilter).distinct('_id');
      filter.applicationId = { $in: eligibleApplications };
    }

    console.log('Executing interview query with filter:', filter);
    
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
          {
            path: 'jobId',
            select: 'title companyId',
            populate: {
              path: 'companyId',
              select: 'name industry location'
            }
          }
        ]
      })
      .populate('interviewers', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .sort({ scheduledAt: 1 })
      .skip(skip)
      .limit(limit);

    // Fetch candidate assignments to get correct job info
    const populatedInterviews = await Promise.all(interviews.map(async (interview: any) => {
      const candidateId = interview.applicationId?.candidateId?._id;
      const assignedTo = req.user!._id;

      if (candidateId) {
        const candidateAssignment = await CandidateAssignment.findOne({
          candidateId,
          assignedTo,
          status: 'active'
        }).populate({
          path: 'jobId',
          select: 'title companyId',
          populate: {
            path: 'companyId',
            select: 'name'
          }
        });

        if (candidateAssignment?.jobId) {
          // Update the application's jobId with the one from candidateAssignment
          const application = await Application.findById(interview.applicationId._id);
          if (application) {
            application.jobId = candidateAssignment.jobId._id;
            await application.save();
          }

          // Update the interview response with the correct job info and agent info
          interview.applicationId.jobId = candidateAssignment.jobId;
          
          // Get the agent info from HR's assignment
          const AgentAssignment = (await import('@/models/AgentAssignment')).AgentAssignment;
          const agentAssignment = await AgentAssignment.findOne({
            assignedHRs: req.user!._id,
            status: 'active'
          }).populate('agentId', 'firstName lastName email');

          if (agentAssignment?.agentId) {
            // Add agent info to both the candidate and the interview response
            const candidate = await (await import('@/models/Candidate')).Candidate.findById(candidateId);
            if (candidate) {
              candidate.assignedAgentId = agentAssignment.agentId._id;
              await candidate.save();
            }
            interview.applicationId.candidateId.assignedAgentId = agentAssignment.agentId;
          }
        }
      }
      return interview;
    }));
      
    console.log('Found interviews:', populatedInterviews.length);

    // Apply search filter on populated data if needed
    let filteredInterviews = populatedInterviews;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredInterviews = populatedInterviews.filter(interview => {
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

    // Log the populated interviews for debugging
    console.log('Populated interviews:', populatedInterviews.map(interview => ({
      candidateId: interview.applicationId?.candidateId?._id,
      jobId: interview.applicationId?.jobId?._id,
      jobTitle: interview.applicationId?.jobId?.title,
      companyName: interview.applicationId?.jobId?.companyId?.name
    })));

    // Don't log audit trail for listing interviews - this was causing duplicate CREATE logs
    // Listing operations (READ) shouldn't create audit logs unless specifically required for compliance

    res.json({
      data: filteredInterviews,
      meta: {
        page,
        limit,
        total: filteredInterviews.length,
        totalPages: Math.ceil(filteredInterviews.length / limit),
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
          { 
            path: 'candidateId',
            populate: [
              { 
                path: 'userId', 
                select: 'firstName lastName email phone' 
              },
              {
                path: 'assignedAgentId',
                select: 'firstName lastName email'
              }
            ]
          },
          { path: 'jobId', select: 'title description companyId', populate: { path: 'companyId', select: 'name' } }
        ]
      })
      .populate('interviewers', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName');

    if (!interview) {
      throw createNotFoundError('Interview not found');
    }

    // Log audit trail for viewing (READ action, not CREATE)
    // Only log if needed for compliance - otherwise remove to avoid excessive logs
    // Commented out to prevent duplicate audit logs on every page refresh/view
    // try {
    //   await AuditLog.createLog({
    //     actor: req.user!._id,
    //     action: AuditAction.READ,
    //     entityType: 'Interview',
    //     entityId: interview._id,
    //     ipAddress: req.ip || '127.0.0.1',
    //     userAgent: req.get('User-Agent') || 'Unknown',
    //     businessProcess: 'interview_scheduling',
    //     description: `Viewed interview details`,
    //   });
    // } catch (auditError) {
    //   console.warn('Failed to create audit log:', auditError);
    // }

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
      // Find the candidate assignment to get the correct job
      const candidateAssignment = await CandidateAssignment.findOne({
        candidateId: validatedData.candidateId,
        assignedTo: req.user!._id,
        status: 'active'
      }).populate('jobId');

      let jobId;
      if (candidateAssignment?.jobId) {
        // Use the job from the candidate assignment
        jobId = candidateAssignment.jobId._id;
      } else {
        // If no job in assignment, try to find a job posted by the current HR user
        const hrJob = await Job.findOne({ createdBy: req.user!._id }).sort({ createdAt: -1 });
        if (!hrJob) {
          return res.status(400).json({
            error: 'No jobs available. Please create a job first before scheduling interviews.'
          });
        }
        jobId = hrJob._id;
      }

      // Create application with the correct job
      const newApplication = await Application.create({
        candidateId: validatedData.candidateId,
        jobId: jobId,
        status: 'submitted',
        stage: 'screening',
        source: 'direct_apply',
        appliedAt: new Date(),
        createdBy: req.user!._id
      });
      
      applicationId = newApplication._id.toString();
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
            populate: [
              { 
                path: 'userId', 
                select: 'firstName lastName email customId' 
              },
              {
                path: 'assignedAgentId',
                select: 'firstName lastName email customId'
              }
            ]
          },
          { path: 'jobId', select: 'title companyId jobId', populate: { path: 'companyId', select: 'name' } }
        ]
      })
      .populate('interviewers', 'firstName lastName email customId')
      .populate('createdBy', 'firstName lastName email customId');

    // Get detailed information for audit log
    const application = populatedInterview?.applicationId as any;
    const candidate = application?.candidateId as any;
    const candidateUser = candidate?.userId as any;
    const candidateName = candidateUser ? `${candidateUser.firstName} ${candidateUser.lastName}` : 'Unknown';
    const candidateCustomId = candidateUser?.customId || '';
    const job = application?.jobId as any;
    const jobTitle = job?.title || 'N/A';
    const jobId = job?.jobId || '';
    const interviewers = (populatedInterview?.interviewers || []) as any[];
    const interviewerNames = interviewers.map((inv: any) => `${inv.firstName} ${inv.lastName}`).join(', ');
    const createdBy = populatedInterview?.createdBy as any;
    const createdByName = createdBy ? `${createdBy.firstName} ${createdBy.lastName}` : 'Unknown';

    // Build description
    let description = `${req.user!.firstName} ${req.user!.lastName} scheduled ${interview.type} interview`;
    if (interview.round) {
      description += ` (Round ${interview.round})`;
    }
    description += ` for candidate ${candidateName}`;
    if (candidateCustomId) {
      description += ` (${candidateCustomId})`;
    }
    if (jobTitle && jobTitle !== 'N/A') {
      description += ` for job "${jobTitle}"`;
      if (jobId) {
        description += ` (${jobId})`;
      }
    }
    if (interview.scheduledAt) {
      description += ` scheduled for ${new Date(interview.scheduledAt).toLocaleString()}`;
    }

    // Log audit trail with detailed metadata
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.CREATE,
      entityType: 'Interview',
      entityId: interview._id,
      after: populatedInterview?.toObject(),
      metadata: {
        applicationId: applicationId,
        candidateId: candidate?._id?.toString(),
        candidateName,
        candidateCustomId,
        jobId: job?._id?.toString(),
        jobTitle,
        jobCustomId: jobId,
        interviewType: interview.type,
        interviewRound: interview.round,
        interviewStatus: interview.status,
        scheduledAt: interview.scheduledAt?.toISOString(),
        duration: interview.duration,
        location: interview.location || interview.meetingLink,
        interviewerIds: interviewers.map((inv: any) => inv._id.toString()),
        interviewerNames,
        createdById: interview.createdBy.toString(),
        createdByName,
        createdByCustomId: createdBy?.customId
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      businessProcess: 'interview_scheduling',
      description,
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

    const beforeState = interview.toObject();
    const oldStatus = interview.status;
    const oldScheduledAt = interview.scheduledAt;

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
    
    // Preserve existing interviewers if not being updated
    if (!updateFields.interviewers) {
      delete updateFields.interviewers;
    }
    
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
            populate: [
              { 
                path: 'userId', 
                select: 'firstName lastName email customId' 
              },
              {
                path: 'assignedAgentId',
                select: 'firstName lastName email customId'
              }
            ]
          },
          { path: 'jobId', select: 'title companyId jobId', populate: { path: 'companyId', select: 'name' } }
        ]
      })
      .populate('interviewers', 'firstName lastName email customId')
      .populate('createdBy', 'firstName lastName email customId');

    // Get detailed information for audit log
    const application = populatedInterview?.applicationId as any;
    const candidate = application?.candidateId as any;
    const candidateUser = candidate?.userId as any;
    const candidateName = candidateUser ? `${candidateUser.firstName} ${candidateUser.lastName}` : 'Unknown';
    const candidateCustomId = candidateUser?.customId || '';
    const job = application?.jobId as any;
    const jobTitle = job?.title || 'N/A';
    const jobId = job?.jobId || '';
    const interviewers = (populatedInterview?.interviewers || []) as any[];
    const interviewerNames = interviewers.map((inv: any) => `${inv.firstName} ${inv.lastName}`).join(', ');
    
    const newStatus = interview.status;
    const newScheduledAt = interview.scheduledAt;
    const statusChanged = oldStatus !== newStatus;
    const scheduledAtChanged = oldScheduledAt?.getTime() !== newScheduledAt?.getTime();

    // Build description based on what changed
    let description = '';
    if (statusChanged) {
      description = `${req.user!.firstName} ${req.user!.lastName} changed interview status from "${oldStatus}" to "${newStatus}"`;
      description += ` for candidate ${candidateName}`;
      if (candidateCustomId) description += ` (${candidateCustomId})`;
      if (jobTitle && jobTitle !== 'N/A') {
        description += ` for job "${jobTitle}"`;
        if (jobId) description += ` (${jobId})`;
      }
    } else if (scheduledAtChanged) {
      description = `${req.user!.firstName} ${req.user!.lastName} rescheduled interview`;
      if (oldScheduledAt && newScheduledAt) {
        description += ` from ${new Date(oldScheduledAt).toLocaleString()} to ${new Date(newScheduledAt).toLocaleString()}`;
      }
      description += ` for candidate ${candidateName}`;
      if (candidateCustomId) description += ` (${candidateCustomId})`;
      if (jobTitle && jobTitle !== 'N/A') {
        description += ` for job "${jobTitle}"`;
        if (jobId) description += ` (${jobId})`;
      }
    } else {
      description = `${req.user!.firstName} ${req.user!.lastName} updated interview`;
      description += ` for candidate ${candidateName}`;
      if (candidateCustomId) description += ` (${candidateCustomId})`;
      if (jobTitle && jobTitle !== 'N/A') {
        description += ` for job "${jobTitle}"`;
        if (jobId) description += ` (${jobId})`;
      }
    }

    // Log audit trail with detailed metadata
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.UPDATE,
      entityType: 'Interview',
      entityId: interview._id,
      before: beforeState,
      after: populatedInterview?.toObject(),
      metadata: {
        applicationId: interview.applicationId.toString(),
        candidateId: candidate?._id?.toString(),
        candidateName,
        candidateCustomId,
        jobId: job?._id?.toString(),
        jobTitle,
        jobCustomId: jobId,
        interviewType: interview.type,
        interviewRound: interview.round,
        oldStatus: statusChanged ? oldStatus : undefined,
        newStatus: statusChanged ? newStatus : undefined,
        oldScheduledAt: scheduledAtChanged ? oldScheduledAt?.toISOString() : undefined,
        newScheduledAt: scheduledAtChanged ? newScheduledAt?.toISOString() : undefined,
        statusChanged,
        scheduledAtChanged,
        interviewerNames,
        updatedById: req.user!._id.toString(),
        updatedByName: `${req.user!.firstName} ${req.user!.lastName}`,
        updatedByCustomId: req.user!.customId
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      businessProcess: 'interview_scheduling',
      description,
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

    const interview = await Interview.findById(id)
      .populate({
        path: 'applicationId',
        populate: [
          { 
            path: 'candidateId', 
            populate: [
              { 
                path: 'userId', 
                select: 'firstName lastName email customId' 
              }
            ]
          },
          { path: 'jobId', select: 'title companyId jobId' }
        ]
      })
      .populate('createdBy', 'firstName lastName email customId');

    if (!interview) {
      throw createNotFoundError('Interview not found');
    }

    const beforeState = interview.toObject();

    // Get detailed information for audit log before deletion
    const application = interview.applicationId as any;
    const candidate = application?.candidateId as any;
    const candidateUser = candidate?.userId as any;
    const candidateName = candidateUser ? `${candidateUser.firstName} ${candidateUser.lastName}` : 'Unknown';
    const candidateCustomId = candidateUser?.customId || '';
    const job = application?.jobId as any;
    const jobTitle = job?.title || 'N/A';
    const jobId = job?.jobId || '';

    await Interview.findByIdAndDelete(id);

    // Build description
    let description = `${req.user!.firstName} ${req.user!.lastName} deleted ${interview.type} interview`;
    if (interview.round) {
      description += ` (Round ${interview.round})`;
    }
    description += ` for candidate ${candidateName}`;
    if (candidateCustomId) {
      description += ` (${candidateCustomId})`;
    }
    if (jobTitle && jobTitle !== 'N/A') {
      description += ` for job "${jobTitle}"`;
      if (jobId) {
        description += ` (${jobId})`;
      }
    }

    // Log audit trail with detailed metadata
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.DELETE,
      entityType: 'Interview',
      entityId: interview._id,
      before: beforeState,
      metadata: {
        candidateId: candidate?._id?.toString(),
        candidateName,
        candidateCustomId,
        jobId: job?._id?.toString(),
        jobTitle,
        jobCustomId: jobId,
        interviewType: interview.type,
        interviewRound: interview.round,
        interviewStatus: interview.status,
        scheduledAt: interview.scheduledAt?.toISOString(),
        deletedById: req.user!._id.toString(),
        deletedByName: `${req.user!.firstName} ${req.user!.lastName}`,
        deletedByCustomId: req.user!.customId
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      businessProcess: 'interview_scheduling',
      description,
    });

    res.json({ message: 'Interview deleted successfully' });
  });

  /**
   * Get interview statistics
   * @route GET /interviews/stats
   */
  static getInterviewStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Build base filter for HR users, agents, and candidates
    let baseFilter: any = {};
    
    if (req.user!.role === UserRole.AGENT) {
      console.log('Agent filtering stats for user:', req.user!._id);
      
      // Get all candidates assigned to this agent
      const AgentAssignment = (await import('@/models/AgentAssignment')).AgentAssignment;
      console.log('Looking for agent assignment with:', {
        agentId: req.user!._id,
        status: 'active'
      });
      
      const agentAssignment = await AgentAssignment.findOne({
        agentId: req.user!._id,
        status: 'active'
      }).populate('assignedCandidates');
      
      console.log('Found agent assignment:', {
        id: agentAssignment?._id,
        assignedCandidates: agentAssignment?.assignedCandidates?.length || 0,
        status: agentAssignment?.status
      });
      
      if (!agentAssignment || !agentAssignment.assignedCandidates?.length) {
        return res.json({
          data: {
            byStatus: [],
            todayCount: 0,
          },
        });
      }

      // Find applications for assigned candidates
      console.log('Looking for applications with candidateIds:', agentAssignment.assignedCandidates);
      const eligibleApplications = await Application.find({
        candidateId: { $in: agentAssignment.assignedCandidates }
      }).distinct('_id');
      console.log('Found applications:', eligibleApplications);
      
      baseFilter.applicationId = { $in: eligibleApplications };
      console.log('Final filter:', baseFilter);
    }
    else if (req.user!.role === UserRole.CANDIDATE) {
      // Find the candidate record for this user
      const candidate = await (await import('@/models/Candidate')).Candidate.findOne({ userId: req.user!._id });
      if (!candidate) {
        return res.json({
          data: {
            byStatus: [],
            todayCount: 0,
          },
        });
      }

      // Find applications for this candidate
      const applications = await Application.find({ candidateId: candidate._id }).distinct('_id');
      baseFilter.applicationId = { $in: applications };
    } else if (req.user!.role === UserRole.HR) {
      // Get all candidates assigned to this HR user
      const assignedCandidateIds = await CandidateAssignment.find({
        assignedTo: req.user!._id,
        status: 'active'
      }).distinct('candidateId');

      // Get all applications created by this HR or for assigned candidates
      const hrApplications = await Application.find({
        $or: [
          { candidateId: { $in: assignedCandidateIds } },
          { createdBy: req.user!._id }
        ]
      }).distinct('_id');

      if (hrApplications.length === 0) {
        // If no candidates are assigned, return empty stats
        return res.json({
          data: {
            statusStats: [],
            todayCount: 0,
          },
        });
      }
      
      baseFilter.applicationId = { $in: hrApplications };
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

    // Don't log audit trail for retrieving statistics - this prevents excessive audit logs
    // Statistics/read operations shouldn't create audit logs unless specifically required for compliance

    res.json({
      data: {
        byStatus: stats,
        todayCount
      }
    });
  });
}
