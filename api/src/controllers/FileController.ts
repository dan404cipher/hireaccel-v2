import { Response } from 'express';
import { AuthenticatedRequest } from '@/types';
import { File } from '@/models/File';
import { Candidate } from '@/models/Candidate';
import { FileCategory, CandidateProfile } from '@/types';
import { asyncHandler, createNotFoundError, createBadRequestError } from '@/middleware/errorHandler';
import { logger } from '@/config/logger';
import path from 'path';
import fs from 'fs';
import { env } from '@/config/env';
import { TextExtractor } from '@/utils/textExtractor';
import { resumeParserService } from '@/services/ResumeParserService';

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
      // Validate file size (moved from client-side)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (req.file.size > maxSize) {
        throw createBadRequestError('File size exceeds 5MB limit');
      }

      // Validate file type (moved from client-side)
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        throw createBadRequestError('Invalid file type. Please upload a PDF or Word document (.pdf, .doc, .docx)');
      }

      let resumeText;
      try {
        // Extract text from the resume
        resumeText = await TextExtractor.extractText(req.file.path, req.file.mimetype);
        
        // Basic validation of extracted text
        if (!resumeText || resumeText.trim().length < 50) {
          throw createBadRequestError('Could not extract sufficient text from the resume. Please ensure the file is not corrupted or empty.');
        }
      } catch (error) {
        throw createBadRequestError('Failed to extract text from resume: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
      
      let parsedProfile;
      try {
        // Parse the resume using OpenAI
        parsedProfile = await resumeParserService.parseResume(resumeText);
        
        // Validate parsed profile
        if (!parsedProfile || Object.keys(parsedProfile).length === 0) {
          throw createBadRequestError('Failed to parse resume content. Please ensure the resume contains relevant information.');
        }
      } catch (error) {
        throw createBadRequestError('Failed to parse resume: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
      
      // Merge the parsed profile with existing profile
      // Only update fields that are not already set or are empty
      const updatedProfile = {
        ...candidate.profile,
        skills: parsedProfile.skills?.length ? parsedProfile.skills : candidate.profile.skills,
        experience: parsedProfile.experience?.length ? parsedProfile.experience : candidate.profile.experience,
        education: parsedProfile.education?.length ? parsedProfile.education : candidate.profile.education,
        certifications: parsedProfile.certifications?.length ? parsedProfile.certifications : candidate.profile.certifications,
        projects: parsedProfile.projects?.length ? parsedProfile.projects : candidate.profile.projects,
        summary: candidate.profile.summary || parsedProfile.summary,
        location: candidate.profile.location || parsedProfile.location,
        phoneNumber: candidate.profile.phoneNumber || parsedProfile.phoneNumber,
        linkedinUrl: candidate.profile.linkedinUrl || parsedProfile.linkedinUrl,
        portfolioUrl: candidate.profile.portfolioUrl || parsedProfile.portfolioUrl,
      };

      candidate.profile = updatedProfile;
      await candidate.save();

      // Helper function to check if a field has content
      const hasContent = (key: keyof Partial<CandidateProfile>) => {
        const value = parsedProfile[key];
        if (!value) return false;
        if (Array.isArray(value)) return value.length > 0;
        return true;
      };

      // Get fields that have content
      const extractedFields = Object.keys(parsedProfile)
        .filter(key => hasContent(key as keyof Partial<CandidateProfile>));

      logger.info('Resume uploaded and parsed successfully', {
        userId,
        candidateId: candidate._id,
        fileId: fileRecord._id,
        filename: req.file.originalname,
        filepath: relativePath,
        businessProcess: 'file_management',
        fieldsExtracted: extractedFields
      });

      // Don't update the profile yet, just return the parsed data
      res.status(201).json({
        success: true,
        message: 'Resume uploaded and parsed successfully',
        data: {
          file: {
            id: fileRecord._id,
            filename: fileRecord.filename,
            originalName: fileRecord.originalName,
            size: fileRecord.size,
            mimetype: fileRecord.mimetype,
            uploadedAt: fileRecord.createdAt,
          },
          parsedProfile, // Return the full parsed profile data
          parsedFields: extractedFields,
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

  /**
   * Parse resume and extract information
   * POST /files/resume/parse
   */
  static parseResume = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    
    // Find candidate and their resume
    const candidate = await Candidate.findOne({ userId }).populate('resumeFileId');
    if (!candidate || !candidate.resumeFileId) {
      throw createNotFoundError('No resume found to parse');
    }

    const file = candidate.resumeFileId as any;
    const filePath = path.join(env.UPLOADS_PATH, file.path);
    
    if (!fs.existsSync(filePath)) {
      throw createNotFoundError('Resume file not found on disk');
    }

    try {
      // Extract text from the resume
      const resumeText = await TextExtractor.extractText(filePath, file.mimetype);
      
      // Basic validation of extracted text
      if (!resumeText || resumeText.trim().length < 50) {
        throw createBadRequestError('Could not extract sufficient text from the resume. Please ensure the file is not corrupted or empty.');
      }

      // Parse the resume using OpenAI
      const parsedProfile = await resumeParserService.parseResume(resumeText);
      
      // Validate parsed profile
      if (!parsedProfile || Object.keys(parsedProfile).length === 0) {
        throw createBadRequestError('Failed to parse resume content. Please ensure the resume contains relevant information.');
      }

      // Helper function to check if a field has content
      const hasContent = (key: keyof Partial<CandidateProfile>) => {
        const value = parsedProfile[key];
        if (!value) return false;
        if (Array.isArray(value)) return value.length > 0;
        return true;
      };

      // Get fields that have content
      const extractedFields = Object.keys(parsedProfile)
        .filter(key => hasContent(key as keyof Partial<CandidateProfile>));

      logger.info('Resume parsed successfully', {
        userId,
        candidateId: candidate._id,
        fileId: file._id,
        filename: file.originalName,
        businessProcess: 'resume_parsing',
        fieldsExtracted: extractedFields
      });

      res.json({
        success: true,
        message: 'Resume parsed successfully',
        data: {
          parsedProfile,
          parsedFields: extractedFields,
        },
      });
    } catch (error) {
      logger.error('Failed to parse resume', {
        userId,
        candidateId: candidate._id,
        fileId: file._id,
        error: error instanceof Error ? error.message : 'Unknown error',
        businessProcess: 'resume_parsing',
      });
      throw error;
    }
  });
}
