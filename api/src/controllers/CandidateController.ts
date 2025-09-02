import { Response } from 'express';
import { z } from 'zod';
import { Candidate } from '@/models/Candidate';
import { AuditLog } from '@/models/AuditLog';
import { AuthenticatedRequest, AuditAction, WorkExperience, Education, Certification, Project } from '@/types';
import { asyncHandler, createNotFoundError, createForbiddenError } from '@/middleware/errorHandler';

/**
 * Candidate Controller
 * Handles candidate profile management operations
 */

const workExperienceSchema = z.object({
  company: z.string().min(1).max(200),
  position: z.string().min(1).max(200),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  description: z.string().min(1).max(2000),
  current: z.boolean().default(false),
});

const educationSchema = z.object({
  degree: z.string().min(1).max(200),
  field: z.string().min(1).max(200),
  institution: z.string().min(1).max(200),
  graduationYear: z.number().int().min(1900).max(new Date().getFullYear() + 10),
  gpa: z.number().min(0).max(4.0).optional(),
});

const certificationSchema = z.object({
  name: z.string().min(1).max(200),
  issuer: z.string().min(1).max(200),
  issueDate: z.string().datetime(),
  expiryDate: z.string().datetime().optional(),
  credentialId: z.string().max(100).optional(),
  credentialUrl: z.string().url().optional(),
});

const projectSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  technologies: z.array(z.string().min(1).max(50)).default([]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  current: z.boolean().default(false),
  projectUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  role: z.string().max(100).optional(),
});

// Base schema for profile fields
const baseProfileSchema = z.object({
  skills: z.array(z.string().min(1).max(50)).default([]),
  experience: z.array(workExperienceSchema).default([]),
  education: z.array(educationSchema).default([]),
  certifications: z.array(certificationSchema).default([]),
  projects: z.array(projectSchema).default([]),
  summary: z.string().max(1000),
  location: z.string().max(200),
  phoneNumber: z.string().min(1).max(20),
  linkedinUrl: z.string().url(),
  portfolioUrl: z.string().url(),
  preferredSalaryRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']).default('USD'),
  }),
  availability: z.object({
    startDate: z.string(),
    remote: z.boolean().default(false),
    relocation: z.boolean().default(false),
  }),
});

// Schema for profile updates
const profileUpdateSchema = z.object({
  profile: z.object({
    summary: z.string().max(1000).optional(),
    skills: z.array(z.string()).optional(),
    experience: z.array(workExperienceSchema).optional(),
    education: z.array(educationSchema).optional(),
    certifications: z.array(certificationSchema).optional(),
    projects: z.array(projectSchema).optional(),
    location: z.string().optional(),
    phoneNumber: z.string().optional(),
    linkedinUrl: z.string().url().optional(),
    portfolioUrl: z.string().url().optional(),
    preferredSalaryRange: z.object({
      min: z.number(),
      max: z.number(),
      currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']),
    }).optional(),
    availability: z.object({
      startDate: z.string(),
      remote: z.boolean(),
      relocation: z.boolean(),
    }).optional(),
  }).partial(),
});

export class CandidateController {
  /**
   * Get candidate profile by user ID
   * GET /candidates/profile
   */
  static getMyProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    
    // Find candidate by user ID
    const candidate = await Candidate.findOne({ userId })
      .populate('userId', 'firstName lastName email')
      .select('-notes');
    
    if (!candidate) {
      throw createNotFoundError('Candidate profile not found');
    }
    
    res.json({
      success: true,
      data: candidate,
    });
  });

  /**
   * Update candidate profile
   * PUT /candidates/profile
   */
  static updateMyProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    
    // Find candidate by user ID
    let candidate = await Candidate.findOne({ userId });
    
    if (!candidate) {
      // For new profiles, create with default values from base schema
      const defaultProfile = baseProfileSchema.parse({
        summary: '',
        skills: [],
        experience: [],
        education: [],
        certifications: [],
        projects: [],
        location: '',
        phoneNumber: '',
        linkedinUrl: 'https://linkedin.com/in/default',
        portfolioUrl: 'https://example.com',
        preferredSalaryRange: {
          min: 0,
          max: 0,
          currency: 'USD'
        },
        availability: {
          startDate: new Date().toISOString(),
          remote: false,
          relocation: false
        }
      });

      candidate = new Candidate({
        userId,
        profile: defaultProfile,
        status: 'active',
      });
    }

    const beforeState = candidate.toObject();
    
    // Validate the update data
    const validatedData = profileUpdateSchema.parse(req.body);
    
    // Handle summary-only updates
    if (validatedData.profile && Object.keys(validatedData.profile).length === 1 && validatedData.profile.summary !== undefined) {
      candidate.profile.summary = validatedData.profile.summary;
    } else if (validatedData.profile) {
      // For other updates, only update the fields that are provided
      const { profile: updateData } = validatedData;
      
      // Handle each field type appropriately
      if (updateData.summary !== undefined) candidate.profile.summary = updateData.summary;
      if (updateData.skills !== undefined) candidate.profile.skills = updateData.skills;
      if (updateData.location !== undefined) candidate.profile.location = updateData.location;
      if (updateData.phoneNumber !== undefined) candidate.profile.phoneNumber = updateData.phoneNumber;
      if (updateData.linkedinUrl !== undefined) candidate.profile.linkedinUrl = updateData.linkedinUrl;
      if (updateData.portfolioUrl !== undefined) candidate.profile.portfolioUrl = updateData.portfolioUrl;
      
      // Handle arrays of objects with date conversions
      if (updateData.experience) {
        candidate.profile.experience = updateData.experience.map(exp => {
          const workExp: WorkExperience = {
            company: exp.company,
            position: exp.position,
            description: exp.description,
            startDate: new Date(exp.startDate),
            current: exp.current,
            endDate: exp.endDate ? new Date(exp.endDate) : new Date()
          };
          return workExp;
        });
      }
      
      if (updateData.certifications) {
        candidate.profile.certifications = updateData.certifications.map(cert => {
          const certification: Certification = {
            name: cert.name,
            issuer: cert.issuer,
            issueDate: new Date(cert.issueDate),
            expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : new Date(),
            credentialId: cert.credentialId || '',
            credentialUrl: cert.credentialUrl || ''
          };
          return certification;
        });
      }
      
      if (updateData.projects) {
        candidate.profile.projects = updateData.projects.map(proj => {
          const project: Project = {
            title: proj.title,
            description: proj.description,
            technologies: proj.technologies,
            startDate: new Date(proj.startDate),
            current: proj.current,
            endDate: proj.endDate ? new Date(proj.endDate) : new Date(),
            projectUrl: proj.projectUrl || '',
            githubUrl: proj.githubUrl || '',
            role: proj.role || ''
          };
          return project;
        });
      }
      
      if (updateData.education) {
        candidate.profile.education = updateData.education.map(edu => {
          const education: Education = {
            degree: edu.degree,
            field: edu.field,
            institution: edu.institution,
            graduationYear: edu.graduationYear,
            gpa: edu.gpa || 0
          };
          return education;
        });
      }
      
      if (updateData.preferredSalaryRange) {
        candidate.profile.preferredSalaryRange = updateData.preferredSalaryRange;
      }
      
      if (updateData.availability) {
        candidate.profile.availability = {
          startDate: new Date(updateData.availability.startDate),
          remote: updateData.availability.remote,
          relocation: updateData.availability.relocation
        };
      }
    }
    
    candidate.lastActivityAt = new Date();
    
    // Log profile update
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.UPDATE,
      entityType: 'Candidate',
      entityId: candidate._id,
      before: beforeState,
      after: candidate.toObject(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      businessProcess: 'candidate_profile_management',
    });
    
    try {
      await candidate.save({ validateModifiedOnly: true });
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: candidate,
      });
    } catch (error) {
      console.error('Save error:', error);
      throw error;
    }
  });

  /**
   * Get candidate profile by ID (for HR/Admin)
   * GET /candidates/:id
   */
  static getCandidateById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    
    // Only allow HR and Admin to view other candidate profiles
    if (!req.user || !['admin', 'hr', 'agent'].includes(req.user.role)) {
      throw createForbiddenError('Access denied');
    }
    
    const candidate = await Candidate.findById(id)
      .populate('userId', 'firstName lastName email')
      .populate('notes.createdBy', 'firstName lastName');
    
    if (!candidate) {
      throw createNotFoundError('Candidate', id);
    }
    
    // Increment profile views
    candidate.profileViews += 1;
    await candidate.save();
    
    res.json({
      success: true,
      data: candidate,
    });
  });

  /**
   * Search candidates with filters
   * GET /candidates
   */
  static getCandidates = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Only allow HR and Admin to search candidates
    if (!req.user || !['admin', 'hr', 'agent'].includes(req.user.role)) {
      throw createForbiddenError('Access denied');
    }
    
    const {
      page = 1,
      limit = 20,
      search,
      skills,
      location,
      experience,
      minSalary,
      maxSalary,
      remote,
      relocation,
      status = 'active'
    } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    // Build search query
    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    // Text search across multiple fields
    if (search) {
      query.$or = [
        { 'profile.summary': { $regex: search, $options: 'i' } },
        { 'profile.skills': { $regex: search, $options: 'i' } },
        { 'profile.experience.company': { $regex: search, $options: 'i' } },
        { 'profile.experience.position': { $regex: search, $options: 'i' } },
      ];
    }
    
    // Skills filter
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      query['profile.skills'] = { $in: skillsArray.map(skill => new RegExp(skill as string, 'i')) };
    }
    
    // Location filter
    if (location) {
      query['profile.location'] = { $regex: location, $options: 'i' };
    }
    
    // Experience level filter
    if (experience) {
      // This would need to be calculated based on years of experience
      // For now, we'll search in the experience array
      query['profile.experience.position'] = { $regex: experience, $options: 'i' };
    }
    
    // Salary range filter
    if (minSalary || maxSalary) {
      const salaryQuery: any = {};
      if (minSalary) salaryQuery['profile.preferredSalaryRange.min'] = { $gte: Number(minSalary) };
      if (maxSalary) salaryQuery['profile.preferredSalaryRange.max'] = { $lte: Number(maxSalary) };
      Object.assign(query, salaryQuery);
    }
    
    // Remote work preference
    if (remote !== undefined) {
      query['profile.availability.remote'] = remote === 'true';
    }
    
    // Relocation preference
    if (relocation !== undefined) {
      query['profile.availability.relocation'] = relocation === 'true';
    }
    
    const [candidates, total] = await Promise.all([
      Candidate.find(query)
        .populate('userId', 'firstName lastName email')
        .select('-notes') // Exclude internal notes from search results
        .sort({ lastActivityAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Candidate.countDocuments(query),
    ]);
    
    res.json({
      success: true,
      data: candidates,
      meta: {
        page: {
          current: Number(page),
          total: Math.ceil(total / Number(limit)),
          hasMore: skip + candidates.length < total,
        },
        total,
        limit: Number(limit),
        filters: {
          search,
          skills,
          location,
          experience,
          minSalary,
          maxSalary,
          remote,
          relocation,
          status,
        },
      },
    });
  });

  /**
   * Add note to candidate profile (for HR/Admin)
   * POST /candidates/:id/notes
   */
  static addCandidateNote = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { content, isInternal = false } = z.object({
      content: z.string().min(1).max(1000),
      isInternal: z.boolean().default(false),
    }).parse(req.body);
    
    // Only allow HR and Admin to add notes
    if (!req.user || !['admin', 'hr', 'agent'].includes(req.user.role)) {
      throw createForbiddenError('Access denied');
    }
    
    const candidate = await Candidate.findById(id);
    if (!candidate) {
      throw createNotFoundError('Candidate', id);
    }
    
    candidate.addNote(content, req.user._id, isInternal);
    await candidate.save();
    
    await AuditLog.createLog({
      actor: req.user._id,
      action: AuditAction.CREATE,
      entityType: 'CandidateNote',
      entityId: candidate._id,
      metadata: { noteContent: content, isInternal },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      businessProcess: 'candidate_management',
    });
    
    res.json({
      success: true,
      message: 'Note added successfully',
    });
  });

  /**
   * Update candidate status (for HR/Admin)
   * PATCH /candidates/:id/status
   */
  static updateCandidateStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { status, reason } = z.object({
      status: z.enum(['active', 'inactive', 'blacklisted']),
      reason: z.string().optional(),
    }).parse(req.body);
    
    // Only allow HR and Admin to update status
    if (!req.user || !['admin', 'hr'].includes(req.user.role)) {
      throw createForbiddenError('Access denied');
    }
    
    const candidate = await Candidate.findById(id);
    if (!candidate) {
      throw createNotFoundError('Candidate', id);
    }
    
    const beforeState = candidate.toObject();
    
    candidate.status = status as any;
    if (reason) {
      candidate.addNote(`Status changed to ${status}: ${reason}`, req.user._id, true);
    }
    
    await candidate.save();
    
    await AuditLog.createLog({
      actor: req.user._id,
      action: AuditAction.UPDATE,
      entityType: 'Candidate',
      entityId: candidate._id,
      before: beforeState,
      after: candidate.toObject(),
      metadata: { statusChange: { from: beforeState.status, to: status }, reason },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      businessProcess: 'candidate_management',
      riskLevel: status === 'blacklisted' ? 'high' : 'medium',
    });
    
    res.json({
      success: true,
      message: 'Candidate status updated successfully',
    });
  });

  /**
   * Get candidate statistics
   * GET /candidates/stats
   */
  static getCandidateStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Only allow HR and Admin to view stats
    if (!req.user || !['admin', 'hr'].includes(req.user.role)) {
      throw createForbiddenError('Access denied');
    }
    
    const stats = await Candidate.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
      {
        $group: {
          _id: null,
          statusStats: {
            $push: {
              status: '$_id',
              count: '$count',
              avgRating: '$avgRating',
            },
          },
          totalCandidates: { $sum: '$count' },
        },
      },
    ]);
    
    const skillsStats = await Candidate.aggregate([
      { $unwind: '$profile.skills' },
      {
        $group: {
          _id: '$profile.skills',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);
    
    const result = {
      ...(stats[0] || { statusStats: [], totalCandidates: 0 }),
      topSkills: skillsStats,
    };
    
    res.json({
      success: true,
      data: result,
    });
  });
}
