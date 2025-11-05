import { Response } from 'express';
import { AuthenticatedRequest } from '@/types';
import { File } from '@/models/File';
import { Candidate } from '@/models/Candidate';
import { Job } from '@/models/Job';
import { User } from '@/models/User';
import { FileCategory, CandidateProfile } from '@/types';
import { asyncHandler, createNotFoundError, createBadRequestError } from '@/middleware/errorHandler';
import { logger } from '@/config/logger';
import path from 'path';
import fs from 'fs';
import { env } from '@/config/env';
import { TextExtractor } from '@/utils/textExtractor';
import { resumeParserService } from '@/services/ResumeParserService';
import { jdParserService } from '@/services/JDParserService';
import { s3Service } from '@/services/S3Service';

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
    
    // Validate file size
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      throw createBadRequestError('File size exceeds 5MB limit');
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      throw createBadRequestError('Invalid file type. Please upload a PDF or Word document (.pdf, .doc, .docx)');
    }
    
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
          // Delete from S3 if applicable
          if (oldFile.storageProvider === 'aws_s3' && s3Service.isS3Enabled()) {
            try {
              await s3Service.deleteFile(oldFile.path);
              logger.info('Old resume deleted from S3', {
                userId,
                s3Key: oldFile.path,
                businessProcess: 'resume_upload',
              });
            } catch (s3Error) {
              logger.warn('Failed to delete old resume from S3', {
                userId,
                s3Key: oldFile.path,
                error: s3Error instanceof Error ? s3Error.message : 'Unknown error',
                businessProcess: 'resume_upload',
              });
            }
          } else {
            // Delete local file
            const oldFilePath = path.join(env.UPLOADS_PATH, oldFile.path);
            if (fs.existsSync(oldFilePath)) {
              fs.unlinkSync(oldFilePath);
            }
          }
          // Delete database record
          await File.findByIdAndDelete(candidate.resumeFileId);
        }
      }

      // Read file buffer (memory storage provides buffer directly)
      const fileBuffer = req.file.buffer;
      if (!fileBuffer) {
        throw createBadRequestError('File buffer is required');
      }

      // Generate filename if not provided
      const filename = req.file.filename || req.file.originalname || `resume-${Date.now()}.${path.extname(req.file.originalname || '.pdf')}`;
      
      let fileData: any = {
        filename: filename,
        originalName: req.file.originalname || filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        category: FileCategory.RESUME,
        uploadedBy: userId,
      };

      // Upload to S3 (required, no fallback for new uploads)
      if (!s3Service.isS3Enabled()) {
        throw createBadRequestError('S3 service is not enabled. Resume uploads require S3 storage.');
      }

      try {
        const s3Result = await s3Service.uploadFile({
          fileBuffer,
          filename: req.file.originalname,
          mimetype: req.file.mimetype,
          folder: 'resumes',
          makePublic: false, // Resumes should be private
        });

        // Calculate checksum
        const checksum = s3Service.calculateChecksum(fileBuffer);

        fileData = {
          ...fileData,
          path: s3Result.key, // Store S3 key in path field
          url: s3Result.url,
          storageProvider: 'aws_s3',
          storageLocation: s3Result.location,
          checksum,
          checksumAlgorithm: 'sha256',
        };

        logger.info('Resume uploaded to S3', {
          userId,
          s3Key: s3Result.key,
          bucket: s3Service.bucketName,
          businessProcess: 'resume_upload',
        });
      } catch (s3Error) {
        logger.error('Failed to upload resume to S3', {
          error: s3Error instanceof Error ? s3Error.message : 'Unknown error',
          businessProcess: 'resume_upload',
        });
        throw createBadRequestError('Failed to upload resume to S3. Please try again.');
      }

      // Create file record
      const fileRecord = new File(fileData);
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
        s3Key: fileData.path,
        businessProcess: 'resume_upload'
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
          }
        },
      });
    } catch (error) {
      logger.error('Failed to upload resume', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        businessProcess: 'resume_upload',
      });
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

    // Check if user can access this file (own resume, HR/Admin/SuperAdmin, or Agent)
    const userRole = req.user!.role;
    const hasAccess = userRole === 'hr' || userRole === 'admin' || userRole === 'superadmin' || userRole === 'agent' || candidate.userId.toString() === userId.toString();
    if (!hasAccess) {
      throw createNotFoundError('Access denied');
    }

    logger.info('Resume downloaded', {
      userId,
      fileId,
      filename: file.originalName,
      businessProcess: 'file_management',
    });

    // Get file content based on storage provider
    // Try S3 first, then fallback to local
    if (file.storageProvider === 'aws_s3' && s3Service.isS3Enabled()) {
      try {
        // Download from S3
        const { GetObjectCommand } = await import('@aws-sdk/client-s3');
        const s3Client = s3Service.getClient();
        const bucketName = s3Service.bucketName;
        
        if (!s3Client) {
          throw new Error('S3 client is not available');
        }
        
        const command = new GetObjectCommand({
          Bucket: bucketName,
          Key: file.path,
        });

        const response = await s3Client.send(command);
        
        // Set headers for file download
        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
        res.setHeader('Content-Type', file.mimetype);
        
        // Stream the file from S3
        if (response.Body) {
          (response.Body as any).pipe(res);
          return; // Successfully streamed from S3
        } else {
          throw new Error('Failed to download file from S3');
        }
      } catch (s3Error) {
        logger.warn('Failed to download resume from S3, falling back to local', {
          fileId,
          s3Key: file.path,
          error: s3Error instanceof Error ? s3Error.message : 'Unknown error',
          businessProcess: 'resume_download',
        });
        // Fall through to local storage fallback
      }
    }
    
    // Fallback to local storage
    const filePath = path.join(env.UPLOADS_PATH, file.path);
    
    if (!fs.existsSync(filePath)) {
      throw createNotFoundError('Resume file not found');
    }

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimetype);
    
    // Stream the file
    const absoluteFilePath = path.resolve(filePath);
    res.sendFile(absoluteFilePath);
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

    // Check if user can access this file (own resume, HR/Admin/SuperAdmin, or Agent)
    const userRole = req.user!.role;
    const hasAccess = userRole === 'hr' || userRole === 'admin' || userRole === 'superadmin' || userRole === 'agent' || candidate.userId.toString() === userId.toString();
    
    console.log('Access check:', {
      userRole,
      hasAccess,
      isOwner: candidate.userId.toString() === userId.toString()
    });

    if (!hasAccess) {
      console.log('Access denied');
      throw createNotFoundError('Access denied');
    }

    logger.info('Resume viewed', {
      userId,
      fileId,
      filename: file.originalName,
      businessProcess: 'file_management',
    });

    // Get file content based on storage provider
    // Try S3 first, then fallback to local
    if (file.storageProvider === 'aws_s3' && s3Service.isS3Enabled()) {
      try {
        // Download from S3 and stream to client (to avoid CSP issues with direct S3 URLs)
        const { GetObjectCommand } = await import('@aws-sdk/client-s3');
        const s3Client = s3Service.getClient();
        const bucketName = s3Service.bucketName;
        
        if (!s3Client) {
          throw new Error('S3 client is not available');
        }
        
        const command = new GetObjectCommand({
          Bucket: bucketName,
          Key: file.path,
        });

        const response = await s3Client.send(command);
        
        // Set headers for inline viewing
        res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
        res.setHeader('Content-Type', file.mimetype);
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        
        // Stream the file from S3 to client
        if (response.Body) {
          (response.Body as any).pipe(res);
          return; // Successfully streamed from S3
        } else {
          throw new Error('Failed to download file from S3');
        }
      } catch (s3Error) {
        logger.warn('Failed to fetch resume from S3, falling back to local', {
          fileId,
          s3Key: file.path,
          error: s3Error instanceof Error ? s3Error.message : 'Unknown error',
          businessProcess: 'resume_view',
        });
        // Fall through to local storage fallback
      }
    }
    
    // Fallback to local storage
    const filePath = path.join(env.UPLOADS_PATH, file.path);
    
    console.log('File path check:', {
      filePath,
      exists: fs.existsSync(filePath)
    });

    if (!fs.existsSync(filePath)) {
      console.log('File not found on disk:', filePath);
      throw createNotFoundError('Resume file not found');
    }

    // Set headers for inline viewing
    res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    
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
      // Delete from S3 if applicable
      if (file.storageProvider === 'aws_s3' && s3Service.isS3Enabled()) {
        try {
          await s3Service.deleteFile(file.path);
          logger.info('Resume deleted from S3', {
            userId,
            s3Key: file.path,
            businessProcess: 'resume_delete',
          });
        } catch (s3Error) {
          logger.warn('Failed to delete resume from S3', {
            userId,
            s3Key: file.path,
            error: s3Error instanceof Error ? s3Error.message : 'Unknown error',
            businessProcess: 'resume_delete',
          });
        }
      } else {
        // Delete local file
        const filePath = path.join(env.UPLOADS_PATH, file.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
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
    
    let filePath: string;
    let tempFilePath: string | null = null;

    // Get file content based on storage provider
    // Try S3 first, then fallback to local
    if (file.storageProvider === 'aws_s3' && s3Service.isS3Enabled()) {
      try {
        // Download from S3
        const { GetObjectCommand } = await import('@aws-sdk/client-s3');
        const s3Client = s3Service.getClient();
        const bucketName = s3Service.bucketName;
        
        if (!s3Client) {
          throw new Error('S3 client is not available');
        }
        
        const command = new GetObjectCommand({
          Bucket: bucketName,
          Key: file.path,
        });

        const response = await s3Client.send(command);
        const chunks: Buffer[] = [];
        
        if (response.Body) {
          for await (const chunk of response.Body as any) {
            chunks.push(Buffer.from(chunk));
          }
        }
        
        const fileBuffer = Buffer.concat(chunks);
        
        // Create temporary file for text extraction
        tempFilePath = path.join(env.UPLOADS_PATH, `temp_resume_${Date.now()}_${file.filename}`);
        fs.writeFileSync(tempFilePath, fileBuffer);
        filePath = tempFilePath;
      } catch (s3Error) {
        logger.warn('Failed to fetch resume from S3 for parsing, falling back to local', {
          fileId: file._id,
          s3Key: file.path,
          error: s3Error instanceof Error ? s3Error.message : 'Unknown error',
          businessProcess: 'resume_parsing',
        });
        // Fall through to local storage
        filePath = path.join(env.UPLOADS_PATH, file.path);
      }
    } else {
      filePath = path.join(env.UPLOADS_PATH, file.path);
    }
    
    if (!fs.existsSync(filePath)) {
      throw createNotFoundError('Resume file not found');
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
    } finally {
      // Cleanup temporary file if created from S3
      if (tempFilePath && tempFilePath.includes('temp_resume_')) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (unlinkError) {
          logger.warn('Failed to cleanup temporary resume file', {
            path: tempFilePath,
            error: unlinkError instanceof Error ? unlinkError.message : 'Unknown error',
          });
        }
      }
    }
  });

  /**
   * Upload JD (Job Description) file
   * POST /files/jd
   */
  static uploadJD = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.file) {
      throw createBadRequestError('No file uploaded');
    }

    const userId = req.user!._id;
    
    try {
      // Read file buffer (memory storage provides buffer directly)
      const fileBuffer = req.file.buffer;
      if (!fileBuffer) {
        throw createBadRequestError('File buffer is required');
      }

      // Generate filename if not provided (memory storage doesn't set filename)
      const filename = req.file.filename || req.file.originalname || `jd-${Date.now()}.${path.extname(req.file.originalname || '.pdf')}`;
      
      let fileData: any = {
        filename: filename,
        originalName: req.file.originalname || filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        category: FileCategory.DOCUMENT,
        uploadedBy: userId,
        relatedEntity: {
          type: 'job',
        },
      };

      // Upload to S3 if enabled, otherwise use local storage
      if (s3Service.isS3Enabled()) {
        try {
          const s3Result = await s3Service.uploadFile({
            fileBuffer,
            filename: req.file.originalname,
            mimetype: req.file.mimetype,
            folder: 'jds',
            makePublic: false, // JD files should be private
          });

          // Calculate checksum
          const checksum = s3Service.calculateChecksum(fileBuffer);

          fileData = {
            ...fileData,
            path: s3Result.key, // Store S3 key in path field
            url: s3Result.url,
            storageProvider: 'aws_s3',
            storageLocation: s3Result.location,
            checksum,
            checksumAlgorithm: 'sha256',
          };

          logger.info('JD uploaded to S3', {
            userId,
            s3Key: s3Result.key,
            bucket: s3Service.bucketName,
            businessProcess: 'jd_upload',
          });
        } catch (s3Error) {
          logger.error('Failed to upload JD to S3, falling back to local storage', {
            error: s3Error instanceof Error ? s3Error.message : 'Unknown error',
            businessProcess: 'jd_upload',
          });
          // Fallback to local storage - save file to disk first
          const relativePath = path.join('hr', 'jds', new Date().getFullYear().toString(), String(new Date().getMonth() + 1).padStart(2, '0'));
          const fullPath = path.join(env.UPLOADS_PATH, relativePath);
          
          // Ensure directory exists
          if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
          }
          
          // Generate unique filename
          const timestamp = Date.now();
          const randomSuffix = Math.random().toString(36).substring(2, 8);
          const extension = path.extname(req.file.originalname || '');
          const diskFilename = `${path.basename(req.file.originalname || 'jd', extension)}-${timestamp}-${randomSuffix}${extension}`;
          const diskPath = path.join(fullPath, diskFilename);
          
          // Write buffer to disk
          fs.writeFileSync(diskPath, fileBuffer);
          
          const relativeFilePath = path.join(relativePath, diskFilename);
          fileData = {
            ...fileData,
            path: relativeFilePath,
            url: `/uploads/${relativeFilePath}`,
            storageProvider: 'local',
          };
        }
      } else {
        // Local storage - save file to disk
        const relativePath = path.join('hr', 'jds', new Date().getFullYear().toString(), String(new Date().getMonth() + 1).padStart(2, '0'));
        const fullPath = path.join(env.UPLOADS_PATH, relativePath);
        
        // Ensure directory exists
        if (!fs.existsSync(fullPath)) {
          fs.mkdirSync(fullPath, { recursive: true });
        }
        
        // Generate unique filename
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const extension = path.extname(req.file.originalname || '');
        const diskFilename = `${path.basename(req.file.originalname || 'jd', extension)}-${timestamp}-${randomSuffix}${extension}`;
        const diskPath = path.join(fullPath, diskFilename);
        
        // Write buffer to disk
        fs.writeFileSync(diskPath, fileBuffer);
        
        const relativeFilePath = path.join(relativePath, diskFilename);
        fileData = {
          ...fileData,
          path: relativeFilePath,
          url: `/uploads/${relativeFilePath}`,
          storageProvider: 'local',
        };
      }

      // Create file record
      const file = new File(fileData);
      await file.save();

      // Cleanup local file if uploaded to S3 and file exists on disk
      // (Memory storage doesn't create disk files, so this is only for fallback cases)
      if (fileData.storageProvider === 'aws_s3' && req.file.path && typeof req.file.path === 'string' && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          logger.warn('Failed to cleanup local file after S3 upload', {
            path: req.file.path,
            error: unlinkError instanceof Error ? unlinkError.message : 'Unknown error',
          });
        }
      }

      logger.info('JD uploaded successfully', {
        userId,
        fileId: file._id,
        filename: file.originalName,
        storageProvider: fileData.storageProvider,
        businessProcess: 'jd_upload',
      });

      res.status(201).json({
        success: true,
        data: {
          file: {
            id: file._id,
            originalName: file.originalName,
            filename: file.filename,
            size: file.size,
            mimetype: file.mimetype,
            url: file.url,
            storageProvider: file.storageProvider,
          },
        },
      });
    } catch (error) {
      // Cleanup uploaded file on error (only if file exists on disk)
      // Memory storage doesn't create disk files, so this is only for fallback cases
      if (req.file && req.file.path && typeof req.file.path === 'string' && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          logger.error('Failed to cleanup uploaded JD file', {
            path: req.file.path,
            error: unlinkError instanceof Error ? unlinkError.message : 'Unknown error',
          });
        }
      }

      logger.error('Failed to upload JD', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        businessProcess: 'jd_upload',
      });
      throw error;
    }
  });

  /**
   * Parse JD file and extract information
   * POST /files/jd/parse
   */
  static parseJD = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    const { fileId } = req.body;
    
    if (!fileId) {
      throw createBadRequestError('File ID is required');
    }

    // Find the JD file
    const file = await File.findById(fileId);
    if (!file) {
      throw createNotFoundError('JD file not found');
    }

    // Verify file belongs to user or is accessible
    if (file.uploadedBy.toString() !== userId.toString()) {
      throw createBadRequestError('You do not have permission to access this file');
    }

    let fileBuffer: Buffer;
    let tempFilePath: string | null = null;

    try {
      // Get file content based on storage provider
      if (file.storageProvider === 'aws_s3' && s3Service.isS3Enabled()) {
        // Download from S3 using S3Service
        const { GetObjectCommand } = await import('@aws-sdk/client-s3');
        const s3Client = s3Service.getClient();
        const bucketName = s3Service.bucketName;
        
        if (!s3Client) {
          throw createBadRequestError('S3 client is not available');
        }
        
        const command = new GetObjectCommand({
          Bucket: bucketName,
          Key: file.path, // S3 key stored in path field
        });

        const response = await s3Client.send(command);
        const chunks: Buffer[] = [];
        
        if (response.Body) {
          for await (const chunk of response.Body as any) {
            chunks.push(Buffer.from(chunk));
          }
        }
        
        fileBuffer = Buffer.concat(chunks);
        
        // Create temporary file for text extraction
        tempFilePath = path.join(env.UPLOADS_PATH, `temp_${Date.now()}_${file.filename}`);
        fs.writeFileSync(tempFilePath, fileBuffer);
      } else {
        // Local storage
        const filePath = path.join(env.UPLOADS_PATH, file.path);
        
        if (!fs.existsSync(filePath)) {
          throw createNotFoundError('JD file not found on disk');
        }
        
        fileBuffer = fs.readFileSync(filePath);
        tempFilePath = filePath;
      }

      // Extract text from the JD
      const jdText = await TextExtractor.extractText(tempFilePath, file.mimetype);
      
      // Cleanup temporary file if created from S3
      if (file.storageProvider === 'aws_s3' && tempFilePath && tempFilePath.includes('temp_')) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (unlinkError) {
          logger.warn('Failed to cleanup temporary file', {
            path: tempFilePath,
            error: unlinkError instanceof Error ? unlinkError.message : 'Unknown error',
          });
        }
      }
      
      // Basic validation of extracted text
      if (!jdText || jdText.trim().length < 50) {
        throw createBadRequestError('Could not extract sufficient text from the JD. Please ensure the file is not corrupted or empty.');
      }

      // Parse the JD using OpenAI
      const parsedJD = await jdParserService.parseJD(jdText);
      
      // Validate parsed JD
      if (!parsedJD || !parsedJD.title || !parsedJD.description) {
        throw createBadRequestError('Failed to parse JD content. Please ensure the JD contains relevant information.');
      }

      logger.info('JD parsed successfully', {
        userId,
        fileId: file._id,
        title: parsedJD.title,
        storageProvider: file.storageProvider,
        businessProcess: 'jd_parsing',
      });

      res.status(200).json({
        success: true,
        data: {
          parsedJD,
          fileId: file._id,
        },
      });
    } catch (error) {
      // Cleanup temporary file on error
      if (tempFilePath && tempFilePath.includes('temp_') && fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (unlinkError) {
          logger.warn('Failed to cleanup temporary file on error', {
            path: tempFilePath,
            error: unlinkError instanceof Error ? unlinkError.message : 'Unknown error',
          });
        }
      }

      logger.error('Failed to parse JD', {
        userId,
        fileId: file._id,
        error: error instanceof Error ? error.message : 'Unknown error',
        businessProcess: 'jd_parsing',
      });
      throw error;
    }
  });

  /**
   * View JD file inline (for preview)
   * GET /files/jd/:fileId
   */
  static viewJD = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { fileId } = req.params;
    const userId = req.user!._id;

    const file = await File.findById(fileId);
    if (!file) {
      throw createNotFoundError('File not found');
    }

    // Check if file is associated with a job (JD file)
    const job = await Job.findOne({ jdFileId: fileId });
    if (!job) {
      throw createNotFoundError('JD file not found or access denied');
    }

    // Any authenticated user can view JD files (they're part of public job postings)
    logger.info('JD viewed', {
      userId,
      fileId,
      filename: file.originalName,
      jobId: job._id,
      businessProcess: 'file_management',
    });

    // Get file content based on storage provider
    if (file.storageProvider === 'aws_s3' && s3Service.isS3Enabled()) {
      // Download from S3 and stream to client (to avoid CSP issues with direct S3 URLs)
      const { GetObjectCommand } = await import('@aws-sdk/client-s3');
      const s3Client = s3Service.getClient();
      const bucketName = s3Service.bucketName;
      
      if (!s3Client) {
        throw createBadRequestError('S3 client is not available');
      }
      
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: file.path,
      });

      const response = await s3Client.send(command);
      
      // Set headers for inline viewing
      res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
      res.setHeader('Content-Type', file.mimetype);
      
      // Stream the file from S3 to client
      if (response.Body) {
        (response.Body as any).pipe(res);
      } else {
        throw createBadRequestError('Failed to download file from S3');
      }
    } else {
      // Local storage
      const filePath = path.join(env.UPLOADS_PATH, file.path);
      
      if (!fs.existsSync(filePath)) {
        throw createNotFoundError('File not found on disk');
      }

      // Set headers for inline viewing
      res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
      res.setHeader('Content-Type', file.mimetype);
      
      // Stream the file
      const absoluteFilePath = path.resolve(filePath);
      res.sendFile(absoluteFilePath);
    }
  });

  /**
   * Download JD file (forces download)
   * GET /files/jd/:fileId/download
   */
  static downloadJD = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { fileId } = req.params;
    const userId = req.user!._id;

    const file = await File.findById(fileId);
    if (!file) {
      throw createNotFoundError('File not found');
    }

    // Check if file is associated with a job (JD file)
    const job = await Job.findOne({ jdFileId: fileId });
    if (!job) {
      throw createNotFoundError('JD file not found or access denied');
    }

    logger.info('JD downloaded', {
      userId,
      fileId,
      filename: file.originalName,
      jobId: job._id,
      businessProcess: 'file_management',
    });

    // Get file content based on storage provider
    if (file.storageProvider === 'aws_s3' && s3Service.isS3Enabled()) {
      // Download from S3
      const { GetObjectCommand } = await import('@aws-sdk/client-s3');
      const s3Client = s3Service.getClient();
      const bucketName = s3Service.bucketName;
      
      if (!s3Client) {
        throw createBadRequestError('S3 client is not available');
      }
      
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: file.path,
      });

      const response = await s3Client.send(command);
      
      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
      res.setHeader('Content-Type', file.mimetype);
      
      // Stream the file from S3
      if (response.Body) {
        (response.Body as any).pipe(res);
      } else {
        throw createBadRequestError('Failed to download file from S3');
      }
    } else {
      // Local storage
      const filePath = path.join(env.UPLOADS_PATH, file.path);
      
      if (!fs.existsSync(filePath)) {
        throw createNotFoundError('File not found on disk');
      }

      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
      res.setHeader('Content-Type', file.mimetype);
      
      // Stream the file
      const absoluteFilePath = path.resolve(filePath);
      res.sendFile(absoluteFilePath);
    }
  });

  /**
   * Upload profile photo for user
   * POST /files/profile-photo
   */
  static uploadProfilePhoto = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.file) {
      throw createBadRequestError('No file uploaded');
    }

    const userId = req.user!._id;
    
    try {
      // Read file buffer (memory storage provides buffer directly)
      const fileBuffer = req.file.buffer;
      if (!fileBuffer) {
        throw createBadRequestError('File buffer is required');
      }

      // Generate filename if not provided
      const filename = req.file.filename || req.file.originalname || `profile-photo-${Date.now()}.${path.extname(req.file.originalname || '.jpg')}`;
      
      let fileData: any = {
        filename: filename,
        originalName: req.file.originalname || filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        category: FileCategory.PROFILE_IMAGE,
        uploadedBy: userId,
        relatedEntity: {
          type: 'user',
          id: userId,
        },
      };

      // Upload to S3 if enabled, otherwise use local storage
      if (s3Service.isS3Enabled()) {
        try {
          const s3Result = await s3Service.uploadFile({
            fileBuffer,
            filename: req.file.originalname,
            mimetype: req.file.mimetype,
            folder: 'profile-photos',
            makePublic: false, // Profile photos should be private
          });

          // Calculate checksum
          const checksum = s3Service.calculateChecksum(fileBuffer);

          fileData = {
            ...fileData,
            path: s3Result.key, // Store S3 key in path field
            url: s3Result.url,
            storageProvider: 'aws_s3',
            storageLocation: s3Result.location,
            checksum,
            checksumAlgorithm: 'sha256',
          };

          logger.info('Profile photo uploaded to S3', {
            userId,
            s3Key: s3Result.key,
            bucket: s3Service.bucketName,
            businessProcess: 'profile_photo_upload',
          });
        } catch (s3Error) {
          logger.error('Failed to upload profile photo to S3, falling back to local storage', {
            error: s3Error instanceof Error ? s3Error.message : 'Unknown error',
            businessProcess: 'profile_photo_upload',
          });
          // Fallback to local storage
          const relativePath = path.join('users', 'profile-photos', new Date().getFullYear().toString(), String(new Date().getMonth() + 1).padStart(2, '0'));
          const fullPath = path.join(env.UPLOADS_PATH, relativePath);
          
          // Ensure directory exists
          if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
          }
          
          // Generate unique filename
          const timestamp = Date.now();
          const randomSuffix = Math.random().toString(36).substring(2, 8);
          const extension = path.extname(req.file.originalname || '');
          const diskFilename = `${path.basename(req.file.originalname || 'profile-photo', extension)}-${timestamp}-${randomSuffix}${extension}`;
          const diskPath = path.join(fullPath, diskFilename);
          
          // Write buffer to disk
          fs.writeFileSync(diskPath, fileBuffer);
          
          const relativeFilePath = path.join(relativePath, diskFilename);
          fileData = {
            ...fileData,
            path: relativeFilePath,
            url: `/uploads/${relativeFilePath}`,
            storageProvider: 'local',
          };
        }
      } else {
        // Local storage - save file to disk
        const relativePath = path.join('users', 'profile-photos', new Date().getFullYear().toString(), String(new Date().getMonth() + 1).padStart(2, '0'));
        const fullPath = path.join(env.UPLOADS_PATH, relativePath);
        
        // Ensure directory exists
        if (!fs.existsSync(fullPath)) {
          fs.mkdirSync(fullPath, { recursive: true });
        }
        
        // Generate unique filename
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const extension = path.extname(req.file.originalname || '');
        const diskFilename = `${path.basename(req.file.originalname || 'profile-photo', extension)}-${timestamp}-${randomSuffix}${extension}`;
        const diskPath = path.join(fullPath, diskFilename);
        
        // Write buffer to disk
        fs.writeFileSync(diskPath, fileBuffer);
        
        const relativeFilePath = path.join(relativePath, diskFilename);
        fileData = {
          ...fileData,
          path: relativeFilePath,
          url: `/uploads/${relativeFilePath}`,
          storageProvider: 'local',
        };
      }

      // Delete old profile photo if exists
      const user = await User.findById(userId);
      if (user && user.profilePhotoFileId) {
        const oldFile = await File.findById(user.profilePhotoFileId);
        if (oldFile) {
          // Delete from S3 if applicable
          if (oldFile.storageProvider === 'aws_s3' && s3Service.isS3Enabled()) {
            try {
              await s3Service.deleteFile(oldFile.path);
              logger.info('Old profile photo deleted from S3', {
                userId,
                s3Key: oldFile.path,
                businessProcess: 'profile_photo_upload',
              });
            } catch (s3Error) {
              logger.warn('Failed to delete old profile photo from S3', {
                userId,
                s3Key: oldFile.path,
                error: s3Error instanceof Error ? s3Error.message : 'Unknown error',
                businessProcess: 'profile_photo_upload',
              });
            }
          } else {
            // Delete local file
            const oldFilePath = path.join(env.UPLOADS_PATH, oldFile.path);
            if (fs.existsSync(oldFilePath)) {
              try {
                fs.unlinkSync(oldFilePath);
                logger.info('Old profile photo deleted from local storage', {
                  userId,
                  filePath: oldFilePath,
                  businessProcess: 'profile_photo_upload',
                });
              } catch (unlinkError) {
                logger.warn('Failed to delete old profile photo from local storage', {
                  userId,
                  filePath: oldFilePath,
                  error: unlinkError instanceof Error ? unlinkError.message : 'Unknown error',
                  businessProcess: 'profile_photo_upload',
                });
              }
            }
          }
          // Delete database record
          await File.findByIdAndDelete(user.profilePhotoFileId);
        }
      }

      // Create new file record
      const fileRecord = new File(fileData);
      await fileRecord.save();

      // Update user with new profile photo file ID
      await User.findByIdAndUpdate(userId, {
        profilePhotoFileId: fileRecord._id,
      });

      logger.info('Profile photo uploaded successfully', {
        userId,
        fileId: fileRecord._id,
        filename: fileRecord.originalName,
        storageProvider: fileRecord.storageProvider,
        businessProcess: 'profile_photo_upload',
      });

      res.status(200).json({
        success: true,
        message: 'Profile photo uploaded successfully',
        data: {
          file: {
            id: fileRecord._id,
            filename: fileRecord.originalName,
            url: fileRecord.url,
            size: fileRecord.size,
            mimetype: fileRecord.mimetype,
            storageProvider: fileRecord.storageProvider,
          },
        },
      });
    } catch (error) {
      logger.error('Failed to upload profile photo', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        businessProcess: 'profile_photo_upload',
      });
      throw error;
    }
  });

  /**
   * View profile photo inline
   * GET /files/profile-photo/:fileId
   */
  static viewProfilePhoto = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { fileId } = req.params;
    const userId = req.user!._id;

    const file = await File.findById(fileId);
    if (!file) {
      throw createNotFoundError('File not found');
    }

    // Check if file is associated with a user
    const user = await User.findOne({ profilePhotoFileId: fileId });
    if (!user) {
      throw createNotFoundError('Profile photo not found');
    }

    // Allow viewing (profile photos are generally viewable by authenticated users)
    logger.info('Profile photo viewed', {
      userId,
      fileId,
      filename: file.originalName,
      ownerId: user._id,
      businessProcess: 'file_management',
    });

    // Get file content based on storage provider
    if (file.storageProvider === 'aws_s3' && s3Service.isS3Enabled()) {
      // Download from S3 and stream to client (to avoid CSP issues)
      const { GetObjectCommand } = await import('@aws-sdk/client-s3');
      const s3Client = s3Service.getClient();
      const bucketName = s3Service.bucketName;
      
      if (!s3Client) {
        throw createBadRequestError('S3 client is not available');
      }
      
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: file.path,
      });

      const response = await s3Client.send(command);
      
      // Set headers for inline viewing
      res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
      res.setHeader('Content-Type', file.mimetype);
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); // Allow cross-origin access
      
      // Stream the file from S3 to client
      if (response.Body) {
        (response.Body as any).pipe(res);
      } else {
        throw createBadRequestError('Failed to download file from S3');
      }
    } else {
      // Local storage
      const filePath = path.join(env.UPLOADS_PATH, file.path);
      if (!fs.existsSync(filePath)) {
        throw createNotFoundError('File not found on server');
      }

      // Set headers for inline viewing
      res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
      res.setHeader('Content-Type', file.mimetype);
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); // Allow cross-origin access

      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    }
  });
}
