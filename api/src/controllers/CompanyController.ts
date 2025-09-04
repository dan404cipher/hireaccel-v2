import { Response } from 'express';
import { z } from 'zod';
import { Company } from '@/models/Company';
import { Job } from '@/models/Job';
import { AuditLog } from '@/models/AuditLog';
import { AuthenticatedRequest, CompanyStatus, PartnershipLevel, AuditAction, UserRole } from '@/types';
import { asyncHandler, createNotFoundError } from '@/middleware/errorHandler';

const createCompanySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  industry: z.string().min(1).max(100),
  size: z.enum(['1-10', '11-25', '26-50', '51-100', '101-250', '251-500', '501-1000', '1000+']),
  location: z.string().min(1).max(200),
  website: z.string().url().optional(),
  employees: z.number().min(0).optional().default(0),
  foundedYear: z.number().min(1800).max(new Date().getFullYear()).optional().default(new Date().getFullYear()),
  contacts: z.array(z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    phone: z.string().min(1),
    position: z.string().min(1).max(100),
  })).optional().default([]),
  partnership: z.nativeEnum(PartnershipLevel).default(PartnershipLevel.BASIC),
  companyId: z.string().optional(), // Allow but don't require companyId
});

const updateCompanySchema = createCompanySchema.partial();

export class CompanyController {
  static getCompanies = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { page = 1, limit = 20, status, partnership, industry, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const query: any = {};
    if (status) query.status = status;
    if (partnership) query.partnership = partnership;
    if (industry) query.industry = { $regex: industry, $options: 'i' };
    if (search) query.$text = { $search: search as string };
    
    // HR-specific filtering: Show companies the HR user created OR has posted jobs for
    if (req.user!.role === UserRole.HR) {
      // Get all company IDs for jobs posted by this HR user
      const jobCompanyIds = await Job.find({
        createdBy: req.user!._id
      }).distinct('companyId');

      // Get all companies created by this HR user
      const createdCompanyIds = await Company.find({
        createdBy: req.user!._id
      }).distinct('_id');

      // Combine both sets of company IDs
      const allAccessibleCompanyIds = [...new Set([...jobCompanyIds, ...createdCompanyIds])];

      if (allAccessibleCompanyIds.length === 0) {
        // If HR user hasn't created companies or posted jobs, return empty result
        return res.json({
          success: true,
          data: [],
          meta: { 
            page: { current: Number(page), total: 0, hasMore: false }, 
            total: 0, 
            limit: Number(limit) 
          },
        });
      }

      // Filter companies to only include those the HR user created or posted jobs for
      query._id = { $in: allAccessibleCompanyIds };
    }
    
    const [companies, total] = await Promise.all([
      Company.find(query)
        .populate('createdBy', 'firstName lastName')
        .sort({ rating: -1, totalHires: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Company.countDocuments(query),
    ]);
    
    res.json({
      success: true,
      data: companies,
      meta: { page: { current: Number(page), total: Math.ceil(total / Number(limit)), hasMore: skip + companies.length < total }, total, limit: Number(limit) },
    });
  });

  static getCompanyById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const company = await Company.findById(req.params['id']).populate('createdBy', 'firstName lastName');
    if (!company) throw createNotFoundError('Company', req.params['id']);
    
    // HR-specific access control: Only allow access to companies they created or posted jobs for
    if (req.user!.role === UserRole.HR) {
      // Check if this HR user created this company OR has posted any jobs for this company
      const hasAccess = company.createdBy.toString() === req.user!._id.toString() ||
        await Job.exists({
          createdBy: req.user!._id,
          companyId: company._id
        });

      if (!hasAccess) {
        throw createNotFoundError('Company', req.params['id']);
      }
    }
    
    res.json({ success: true, data: company });
  });

  static createCompany = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validatedData = createCompanySchema.parse(req.body);
    
    // Ensure contacts array is provided (temporary workaround for model validation)
    const companyData = {
      ...validatedData,
      createdBy: req.user!._id,
      contacts: validatedData.contacts || []
    };
    
    const company = new Company(companyData);
    await company.save();
    
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.CREATE,
      entityType: 'Company',
      entityId: company._id,
      after: company.toObject(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      businessProcess: 'company_management',
    });
    
    res.status(201).json({ success: true, message: 'Company created successfully', data: company });
  });

  static updateCompany = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const updates = updateCompanySchema.parse(req.body);
    const company = await Company.findById(req.params['id']);
    if (!company) throw createNotFoundError('Company', req.params['id']);
    
    // HR-specific access control: Only allow updates to companies they created or posted jobs for
    if (req.user!.role === UserRole.HR) {
      const hasAccess = company.createdBy.toString() === req.user!._id.toString() ||
        await Job.exists({
          createdBy: req.user!._id,
          companyId: company._id
        });

      if (!hasAccess) {
        throw createNotFoundError('Company', req.params['id']);
      }
    }
    
    const beforeState = company.toObject();
    Object.assign(company, updates);
    await company.save();
    
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.UPDATE,
      entityType: 'Company',
      entityId: company._id,
      before: beforeState,
      after: company.toObject(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      businessProcess: 'company_management',
    });
    
    res.json({ success: true, message: 'Company updated successfully', data: company });
  });

  static deleteCompany = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const company = await Company.findById(req.params['id']);
    if (!company) throw createNotFoundError('Company', req.params['id']);
    
    // HR-specific access control: Only allow deletion of companies they created or posted jobs for
    if (req.user!.role === UserRole.HR) {
      const hasAccess = company.createdBy.toString() === req.user!._id.toString() ||
        await Job.exists({
          createdBy: req.user!._id,
          companyId: company._id
        });

      if (!hasAccess) {
        throw createNotFoundError('Company', req.params['id']);
      }
    }
    
    company.status = CompanyStatus.INACTIVE;
    await company.save();
    
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.DELETE,
      entityType: 'Company',
      entityId: company._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      businessProcess: 'company_management',
    });
    
    res.json({ success: true, message: 'Company deleted successfully' });
  });

  static getCompanyStats = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const stats = await Company.aggregate([
      { $group: { _id: '$partnership', count: { $sum: 1 }, avgRating: { $avg: '$rating' }, totalJobs: { $sum: '$totalJobs' } } },
      { $group: { _id: null, partnershipStats: { $push: { partnership: '$_id', count: '$count', avgRating: '$avgRating', totalJobs: '$totalJobs' } }, totalCompanies: { $sum: '$count' } } },
    ]);
    
    res.json({ success: true, data: stats[0] || { partnershipStats: [], totalCompanies: 0 } });
  });
}
