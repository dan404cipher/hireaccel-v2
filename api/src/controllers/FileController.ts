import { Response } from 'express';
import { AuthenticatedRequest } from '@/types';
import { File } from '@/models/File';
import { Candidate } from '@/models/Candidate';
import { FileCategory } from '@/types';
import { asyncHandler, createNotFoundError, createBadRequestError } from '@/middleware/errorHandler';
import { logger } from '@/config/logger';
import path from 'path';
import fs from 'fs';
import { env } from '@/config/env';

/**
 * File Controller
 * Handles file upload and management operations
 */
export class FileController {
  /**
   * Upload resume for candidate
   * POST /files/resume
   */
  static uploadResume = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.file) {
      throw createBadRequestError('No file uploaded');
    }

    const userId = req.user!._id;
    
    // Find or create candidate profile
    let candidate = await Candidate.findOne({ userId });
    if (!candidate) {
      // Create basic candidate profile if it doesn't exist
      candidate = new Candidate({
        userId,
        status: 'active',
        profile: {
          skills: [],
          experience: [],
          education: [],
          certifications: [],
          projects: [],
          summary: '',
          location: '',
          phoneNumber: '',
          linkedinUrl: '',
          portfolioUrl: '',
          preferredSalaryRange: {
            min: 0,
            max: 0,
            currency: 'USD'
          },
          availability: {
            startDate: new Date(),
            remote: false,
            relocation: false
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await candidate.save();
    }

    try {
      // Delete old resume file if exists
      if (candidate.resumeFileId) {
        const oldFile = await File.findById(candidate.resumeFileId);
        if (oldFile) {
          // Delete physical file
          const oldFilePath = path.join(env.UPLOADS_PATH, oldFile.path);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
          // Delete database record
          await File.findByIdAndDelete(candidate.resumeFileId);
        }
      }

      // Get the relative path from multer
      const relativePath = req.uploadedFilePath || path.relative(env.UPLOADS_PATH, req.file.path);
      
      // Create new file record
      const fileRecord = new File({
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: relativePath,
        url: `/uploads/${relativePath}`,
        size: req.file.size,
        mimetype: req.file.mimetype,
        category: FileCategory.RESUME,
        uploadedBy: userId,
      });

      await fileRecord.save();

      // Update candidate with new resume file ID
      candidate.resumeFileId = fileRecord._id;
      candidate.updatedAt = new Date();
      await candidate.save();

      logger.info('Resume uploaded successfully', {
        userId,
        candidateId: candidate._id,
        fileId: fileRecord._id,
        filename: req.file.originalname,
        filepath: relativePath,
        businessProcess: 'file_management',
      });

      res.status(201).json({
        success: true,
        message: 'Resume uploaded successfully',
        data: {
          file: {
            id: fileRecord._id,
            filename: fileRecord.filename,
            originalName: fileRecord.originalName,
            size: fileRecord.size,
            mimetype: fileRecord.mimetype,
            uploadedAt: fileRecord.createdAt,
          },
        },
      });
    } catch (error) {
      // Cleanup uploaded file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      throw error;
    }
  });

  /**
   * Download resume (forces download)
   * GET /files/resume/:fileId/download
   */
  static downloadResume = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { fileId } = req.params;
    const userId = req.user!._id;

    const file = await File.findById(fileId);
    if (!file) {
      throw createNotFoundError('File not found');
    }

    // Check if user has permission to download this file
    const candidate = await Candidate.findOne({ 
      $or: [
        { userId, resumeFileId: fileId }, // Own resume
        { resumeFileId: fileId } // For HR/Admin viewing candidate resumes
      ]
    });

    if (!candidate) {
      throw createNotFoundError('Resume not found or access denied');
    }

    // Check if user can access this file (own resume or HR/Admin)
    const userRole = req.user!.role;
    if (userRole !== 'hr' && userRole !== 'admin' && !candidate.userId.equals(userId)) {
      throw createNotFoundError('Access denied');
    }

    const filePath = path.join(env.UPLOADS_PATH, file.path);
    
    if (!fs.existsSync(filePath)) {
      throw createNotFoundError('File not found on disk');
    }

    logger.info('Resume downloaded', {
      userId,
      fileId,
      filename: file.originalName,
      businessProcess: 'file_management',
    });

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimetype);
    
    // Stream the file
    res.sendFile(filePath);
  });

  /**
   * View resume inline (for preview)
   * GET /files/resume/:fileId
   */
  static viewResume = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { fileId } = req.params;
    const userId = req.user!._id;

    console.log('ViewResume Debug:', {
      fileId,
      userId: userId.toString(),
      userRole: req.user!.role
    });

    const file = await File.findById(fileId);
    if (!file) {
      console.log('File not found:', fileId);
      throw createNotFoundError('File not found');
    }

    console.log('File found:', {
      fileId: file._id.toString(),
      path: file.path,
      originalName: file.originalName
    });

    // Check if user has permission to view this file
    const candidate = await Candidate.findOne({ 
      $or: [
        { userId, resumeFileId: fileId }, // Own resume
        { resumeFileId: fileId } // For HR/Admin viewing candidate resumes
      ]
    });

    if (!candidate) {
      console.log('No candidate found with file access');
      throw createNotFoundError('Resume not found or access denied');
    }

    console.log('Candidate found:', {
      candidateId: candidate._id.toString(),
      candidateUserId: candidate.userId.toString(),
      requestUserId: userId.toString(),
      userIdsMatch: candidate.userId.toString() === userId.toString()
    });

    // Check if user can access this file (own resume, HR/Admin, or Agent)
    const userRole = req.user!.role;
    const hasAccess = userRole === 'hr' || userRole === 'admin' || userRole === 'agent' || candidate.userId.toString() === userId.toString();
    
    console.log('Access check:', {
      userRole,
      hasAccess,
      isOwner: candidate.userId.toString() === userId.toString()
    });

    if (!hasAccess) {
      console.log('Access denied');
      throw createNotFoundError('Access denied');
    }

    const filePath = path.join(env.UPLOADS_PATH, file.path);
    
    console.log('File path check:', {
      filePath,
      exists: fs.existsSync(filePath)
    });

    if (!fs.existsSync(filePath)) {
      console.log('File not found on disk:', filePath);
      throw createNotFoundError('File not found on disk');
    }

    logger.info('Resume viewed', {
      userId,
      fileId,
      filename: file.originalName,
      businessProcess: 'file_management',
    });

    // Set headers for inline viewing
    res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimetype);
    
    console.log('Sending file:', filePath);
    
    // Stream the file - sendFile requires absolute path
    const absoluteFilePath = path.resolve(filePath);
    console.log('Absolute file path:', absoluteFilePath);
    res.sendFile(absoluteFilePath);
  });

  /**
   * Get candidate's current resume info
   * GET /files/resume
   */
  static getResumeInfo = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    
    const candidate = await Candidate.findOne({ userId }).populate('resumeFileId');
    if (!candidate) {
      throw createNotFoundError('Candidate profile not found');
    }

    if (!candidate.resumeFileId) {
      return res.json({
        success: true,
        message: 'No resume uploaded',
        data: { hasResume: false },
      });
    }

    const file = candidate.resumeFileId as any;
    
    res.json({
      success: true,
      data: {
        hasResume: true,
        file: {
          id: file._id,
          originalName: file.originalName,
          size: file.size,
          mimetype: file.mimetype,
          uploadedAt: file.createdAt,
        },
      },
    });
  });

  /**
   * Delete resume
   * DELETE /files/resume
   */
  static deleteResume = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    
    const candidate = await Candidate.findOne({ userId });
    if (!candidate || !candidate.resumeFileId) {
      throw createNotFoundError('No resume found to delete');
    }

    const file = await File.findById(candidate.resumeFileId);
    if (file) {
      // Delete physical file
      const filePath = path.join(env.UPLOADS_PATH, file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Delete database record
      await File.findByIdAndDelete(candidate.resumeFileId);
    }

    // Remove reference from candidate
    candidate.set('resumeFileId', undefined, { strict: false });
    await candidate.save();

    logger.info('Resume deleted', {
      userId,
      candidateId: candidate._id,
      businessProcess: 'file_management',
    });

    res.json({
      success: true,
      message: 'Resume deleted successfully',
    });
  });
}
