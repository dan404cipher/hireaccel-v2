import { Response } from 'express';
import { z } from 'zod';
import { Company } from '@/models/Company';
import { Job } from '@/models/Job';
import { AuditLog } from '@/models/AuditLog';
import { AuthenticatedRequest, CompanyStatus, AuditAction, UserRole } from '@/types';
import { asyncHandler, createNotFoundError } from '@/middleware/errorHandler';

const createCompanySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  size: z.enum(['1-10', '11-25', '26-50', '51-100', '101-250', '251-500', '501-1000', '1000+']),
  address: z.object({
    street: z.string().min(1, 'Street address is required').max(200),
    city: z.string().min(1, 'City is required').max(100),
    state: z.string().max(100).optional(),
    zipCode: z.string().max(20).optional(),
    country: z.string().max(100).optional(),
  }),
  website: z.string().url().optional(),
  foundedYear: z.number().min(1800, 'Founded year must be after 1800').max(new Date().getFullYear(), 'Founded year cannot be in the future'),
  numberOfOpenings: z.number().min(0).optional().default(0),
  contacts: z.array(z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    phone: z.string().min(1),
    position: z.string().min(1).max(100),
  })).optional().default([]),
  companyId: z.string().optional(), // Allow but don't require companyId
});

const updateCompanySchema = createCompanySchema.partial();

export class CompanyController {
  static getCompanies = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const query: any = {
      deleted: { $ne: true }, // Exclude deleted companies by default
    };
    if (status) query.status = status;
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
        .populate('createdBy', 'firstName lastName customId')
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
    const company = await Company.findById(req.params['id']).populate('createdBy', 'firstName lastName customId');
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
    
    // Check if already deleted
    if (company.deleted) {
      return res.status(400).json({
        type: 'https://httpstatuses.com/400',
        title: 'Bad Request',
        status: 400,
        detail: 'Company is already deleted',
      });
    }
    
    const beforeState = company.toObject();
    
    // Soft delete: mark as deleted instead of removing from database
    company.deleted = true;
    company.deletedAt = new Date();
    company.deletedBy = req.user!._id;
    company.status = CompanyStatus.INACTIVE;
    await company.save({ validateBeforeSave: false }); // Skip validation for soft delete
    
    await AuditLog.createLog({
      actor: req.user!._id,
      action: AuditAction.DELETE,
      entityType: 'Company',
      entityId: company._id,
      before: beforeState,
      after: company.toObject(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      businessProcess: 'company_management',
    });
    
    res.json({ success: true, message: 'Company deleted successfully' });
  });
  
  /**
   * Restore deleted company (Superadmin only)
   * POST /companies/:id/restore
   */
  static restoreCompany = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Only superadmin can restore
    if (req.user!.role !== UserRole.SUPERADMIN) {
      return res.status(403).json({
        type: 'https://httpstatuses.com/403',
        title: 'Forbidden',
        status: 403,
        detail: 'Only superadmin can restore deleted companies',
      });
    }
    
    const company = await Company.findOne({ _id: req.params['id'], deleted: true });
    if (!company) throw createNotFoundError('Deleted Company', req.params['id']);
    
    const beforeState = company.toObject();
    
    // Restore the company
    company.deleted = false;
    company.deletedAt = null as any;
    company.deletedBy = null as any;
    company.status = CompanyStatus.ACTIVE;
    await company.save({ validateBeforeSave: false }); // Skip validation for restore
    
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
      description: 'Company restored from recycle bin',
      riskLevel: 'low',
    });
    
    res.json({ 
      success: true, 
      message: 'Company restored successfully',
      data: company,
    });
  });
  
  /**
   * Get deleted companies (Superadmin only)
   * GET /companies/deleted
   */
  static getDeletedCompanies = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Only superadmin can view deleted companies
    if (req.user!.role !== UserRole.SUPERADMIN) {
      return res.status(403).json({
        type: 'https://httpstatuses.com/403',
        title: 'Forbidden',
        status: 403,
        detail: 'Only superadmin can view deleted companies',
      });
    }
    
    const companies = await Company.find({ deleted: true })
      .populate('deletedBy', 'firstName lastName email')
      .sort({ deletedAt: -1 });
    
    res.json({
      success: true,
      data: companies,
      meta: {
        total: companies.length,
      },
    });
  });

  static getCompanyStats = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const stats = await Company.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, avgRating: { $avg: '$rating' }, totalJobs: { $sum: '$totalJobs' } } },
      { $group: { _id: null, statusStats: { $push: { status: '$_id', count: '$count', avgRating: '$avgRating', totalJobs: '$totalJobs' } }, totalCompanies: { $sum: '$count' } } },
    ]);
    
    res.json({ success: true, data: stats[0] || { statusStats: [], totalCompanies: 0 } });
  });
}
