import { Response } from 'express';
import { z } from 'zod';
import { ContactHistory } from '@/models/ContactHistory';
import { User } from '@/models/User';
import { Candidate } from '@/models/Candidate';
import { AuthenticatedRequest, UserRole } from '@/types';
import { asyncHandler, createNotFoundError, createBadRequestError, createForbiddenError } from '@/middleware/errorHandler';
import { logger } from '@/config/logger';

/**
 * Contact History Controller
 * Handles contact history logging and management for agents
 */

const createContactHistorySchema = z.object({
  contactType: z.enum(['hr', 'candidate']),
  contactId: z.string().min(1, 'Contact ID is required'),
  contactMethod: z.enum(['phone', 'email', 'meeting', 'whatsapp', 'other']),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject cannot exceed 200 characters'),
  notes: z.string().min(1, 'Notes are required').max(5000, 'Notes cannot exceed 5000 characters'),
  duration: z.number().min(0).max(1440).optional(),
  outcome: z.enum(['positive', 'neutral', 'negative', 'follow_up_required']).optional(),
  followUpDate: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
  followUpNotes: z.string().max(2000, 'Follow-up notes cannot exceed 2000 characters').optional(),
  tags: z.array(z.string().max(50)).optional(),
  relatedJobId: z.string().optional(),
  relatedCandidateAssignmentId: z.string().optional(),
});

const updateContactHistorySchema = createContactHistorySchema.partial();

const querySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
  contactType: z.enum(['hr', 'candidate']).optional(),
  agentId: z.string().optional(),
  contactId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortBy: z.enum(['createdAt', 'followUpDate']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export class ContactHistoryController {
  /**
   * Get contact history with filtering and pagination
   * GET /contact-history
   */
  static getContactHistory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const query = querySchema.parse(req.query);
    const { page, limit, contactType, agentId, contactId, dateFrom, dateTo, sortBy, sortOrder } = query;

    // Build filter based on user role
    const filter: any = {};
    
    if (req.user!.role === UserRole.AGENT) {
      // Agents can only see their own contact history
      filter.agentId = req.user!._id;
    } else if (req.user!.role === UserRole.HR) {
      // HR users can see contact history where they are the contact
      filter.contactType = 'hr';
      filter.contactId = req.user!._id;
    }
    // Admins and superadmins can see all contact history (no additional filter)

    if (contactType) filter.contactType = contactType;
    if (agentId && (req.user!.role === UserRole.ADMIN || req.user!.role === UserRole.SUPERADMIN)) {
      filter.agentId = agentId;
    }
    if (contactId) filter.contactId = contactId;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Build populate options for contactId
    // If filtering by a specific contactType, we can optimize populate
    // Otherwise, we need to handle mixed types
    let contactIdPopulate: any;
    if (contactType === 'hr') {
      // Only HR contacts - populate User directly
      contactIdPopulate = {
        path: 'contactId',
        select: 'firstName lastName email customId',
      };
    } else if (contactType === 'candidate') {
      // Only candidate contacts - populate Candidate with nested userId
      contactIdPopulate = {
        path: 'contactId',
        select: 'userId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email customId',
        },
      };
    } else {
      // Mixed types - populate contactId normally (refPath handles model selection)
      // Then we'll need to handle nested userId separately for candidates
      contactIdPopulate = 'contactId';
    }

    let contactHistoryQuery = ContactHistory.find(filter)
      .populate('agentId', 'firstName lastName email customId');
    
    if (typeof contactIdPopulate === 'string') {
      contactHistoryQuery = contactHistoryQuery.populate(contactIdPopulate);
    } else {
      // @ts-ignore - Complex union type
      contactHistoryQuery = contactHistoryQuery.populate(contactIdPopulate);
    }

    const [contactHistory, total] = await Promise.all([
      contactHistoryQuery
        .populate('relatedJobId', 'title companyId')
        .populate('relatedCandidateAssignmentId', 'status priority')
        .populate('createdBy', 'firstName lastName email')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      ContactHistory.countDocuments(filter),
    ]);

    // For mixed types, populate userId for candidate contacts
    if (!contactType) {
      const candidateContacts = contactHistory.filter((ch: any) => ch.contactType === 'candidate' && ch.contactId);
      if (candidateContacts.length > 0) {
        await Promise.all(
          candidateContacts.map((ch: any) =>
            ContactHistory.populate(ch, {
              path: 'contactId.userId',
              select: 'firstName lastName email customId',
            })
          )
        );
      }
    }

    res.json({
      success: true,
      data: contactHistory,
      meta: {
        page: {
          current: page,
          total: Math.ceil(total / limit),
          hasMore: skip + contactHistory.length < total,
        },
        total,
        limit,
      },
    });
  });

  /**
   * Get contact history by ID
   * GET /contact-history/:id
   */
  static getContactHistoryById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // First fetch to get contactType
    const contactHistoryTemp = await ContactHistory.findById(req.params.id);
    
    // Then populate with conditional logic
    const contactHistory = await ContactHistory.findById(req.params.id)
      .populate('agentId', 'firstName lastName email customId')
      .populate({
        path: 'contactId',
        populate: contactHistoryTemp?.contactType === 'candidate' ? {
          path: 'userId',
          select: 'firstName lastName email customId',
        } : undefined,
      })
      .populate('relatedJobId', 'title companyId')
      .populate('relatedCandidateAssignmentId', 'status priority')
      .populate('createdBy', 'firstName lastName email');

    if (!contactHistory) {
      throw createNotFoundError('Contact history', req.params.id);
    }

    // Check access permissions
    if (req.user!.role === UserRole.AGENT && contactHistory.agentId.toString() !== req.user!._id.toString()) {
      throw createForbiddenError('You can only view your own contact history');
    }
    if (req.user!.role === UserRole.HR && 
        (contactHistory.contactType !== 'hr' || contactHistory.contactId.toString() !== req.user!._id.toString())) {
      throw createForbiddenError('You can only view contact history where you are the contact');
    }

    res.json({
      success: true,
      data: contactHistory,
    });
  });

  /**
   * Create new contact history entry
   * POST /contact-history
   */
  static createContactHistory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Only agents, admins, and superadmins can create contact history
    if (req.user!.role !== UserRole.AGENT && 
        req.user!.role !== UserRole.ADMIN && 
        req.user!.role !== UserRole.SUPERADMIN) {
      throw createForbiddenError('Only agents, admins, and superadmins can create contact history');
    }

    const validatedData = createContactHistorySchema.parse(req.body);
    const userId = req.user!._id;

    // Determine agent ID
    let agentId;
    if (req.user!.role === UserRole.AGENT) {
      agentId = userId;
    } else {
      // For admins/superadmins, use the current user as agent if not specified
      // They can log contact history on behalf of themselves (acting as agent)
      agentId = userId;
    }

    // Validate contact exists
    if (validatedData.contactType === 'hr') {
      const hrUser = await User.findById(validatedData.contactId);
      if (!hrUser || hrUser.role !== UserRole.HR) {
        throw createBadRequestError('Invalid HR contact ID');
      }
    } else {
      const candidate = await Candidate.findById(validatedData.contactId);
      if (!candidate) {
        throw createBadRequestError('Invalid candidate contact ID');
      }
    }

    // Validate related entities if provided
    if (validatedData.relatedJobId) {
      const Job = (await import('@/models/Job')).Job;
      const job = await Job.findById(validatedData.relatedJobId);
      if (!job) {
        throw createBadRequestError('Invalid job ID');
      }
    }

    if (validatedData.relatedCandidateAssignmentId) {
      const CandidateAssignment = (await import('@/models/CandidateAssignment')).CandidateAssignment;
      const assignment = await CandidateAssignment.findById(validatedData.relatedCandidateAssignmentId);
      if (!assignment) {
        throw createBadRequestError('Invalid candidate assignment ID');
      }
    }

    const contactHistory = new ContactHistory({
      ...validatedData,
      agentId,
      createdBy: userId,
    });

    await contactHistory.save();

    // Populate for response
    await contactHistory.populate('agentId', 'firstName lastName email customId');
    
    // Populate contactId based on contact type
    if (contactHistory.contactType === 'candidate') {
      await contactHistory.populate({
        path: 'contactId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email customId',
        },
      });
    } else {
      // For HR contacts, just populate the contactId (User)
      await contactHistory.populate('contactId', 'firstName lastName email customId');
    }

    logger.info('Contact history created', {
      userId,
      contactHistoryId: contactHistory._id,
      agentId,
      contactType: validatedData.contactType,
      contactId: validatedData.contactId,
      businessProcess: 'contact_history',
    });

    res.status(201).json({
      success: true,
      message: 'Contact history logged successfully',
      data: contactHistory,
    });
  });

  /**
   * Update contact history entry
   * PUT /contact-history/:id
   */
  static updateContactHistory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const contactHistory = await ContactHistory.findById(req.params.id);

    if (!contactHistory) {
      throw createNotFoundError('Contact history', req.params.id);
    }

    // Check permissions
    if (req.user!.role === UserRole.AGENT && contactHistory.agentId.toString() !== req.user!._id.toString()) {
      throw createForbiddenError('You can only update your own contact history');
    }
    if (req.user!.role === UserRole.HR) {
      throw createForbiddenError('HR users cannot update contact history');
    }

    const validatedData = updateContactHistorySchema.parse(req.body);

    // Validate related entities if being updated
    if (validatedData.relatedJobId) {
      const Job = (await import('@/models/Job')).Job;
      const job = await Job.findById(validatedData.relatedJobId);
      if (!job) {
        throw createBadRequestError('Invalid job ID');
      }
    }

    if (validatedData.relatedCandidateAssignmentId) {
      const CandidateAssignment = (await import('@/models/CandidateAssignment')).CandidateAssignment;
      const assignment = await CandidateAssignment.findById(validatedData.relatedCandidateAssignmentId);
      if (!assignment) {
        throw createBadRequestError('Invalid candidate assignment ID');
      }
    }

    Object.assign(contactHistory, validatedData);
    await contactHistory.save();

    // Populate for response
    await contactHistory.populate('agentId', 'firstName lastName email customId');
    await contactHistory.populate({
      path: 'contactId',
      populate: contactHistory.contactType === 'candidate' ? {
        path: 'userId',
        select: 'firstName lastName email customId',
      } : undefined,
    });

    logger.info('Contact history updated', {
      userId: req.user!._id,
      contactHistoryId: contactHistory._id,
      businessProcess: 'contact_history',
    });

    res.json({
      success: true,
      message: 'Contact history updated successfully',
      data: contactHistory,
    });
  });

  /**
   * Delete contact history entry
   * DELETE /contact-history/:id
   */
  static deleteContactHistory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const contactHistory = await ContactHistory.findById(req.params.id);

    if (!contactHistory) {
      throw createNotFoundError('Contact history', req.params.id);
    }

    // Only admins and superadmins can delete contact history
    if (req.user!.role !== UserRole.ADMIN && req.user!.role !== UserRole.SUPERADMIN) {
      throw createForbiddenError('Only admins and superadmins can delete contact history');
    }

    await ContactHistory.findByIdAndDelete(req.params.id);

    logger.info('Contact history deleted', {
      userId: req.user!._id,
      contactHistoryId: req.params.id,
      businessProcess: 'contact_history',
    });

    res.json({
      success: true,
      message: 'Contact history deleted successfully',
    });
  });

  /**
   * Get contact history statistics
   * GET /contact-history/stats
   */
  static getContactHistoryStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { agentId, dateFrom, dateTo } = req.query;

    let filterAgentId;
    if (req.user!.role === UserRole.AGENT) {
      filterAgentId = req.user!._id;
    } else if (agentId && (req.user!.role === UserRole.ADMIN || req.user!.role === UserRole.SUPERADMIN)) {
      filterAgentId = agentId;
    }

    const dateRange = (dateFrom || dateTo) ? {
      start: dateFrom ? new Date(dateFrom as string) : new Date(0),
      end: dateTo ? new Date(dateTo as string) : new Date(),
    } : undefined;

    const stats = await ContactHistory.getContactHistoryStats(filterAgentId, dateRange);

    res.json({
      success: true,
      data: stats,
    });
  });
}

