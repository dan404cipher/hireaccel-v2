import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from './env';
import { logger } from './logger';

// Extend Express Request interface to include custom properties
declare global {
  namespace Express {
    interface Request {
      user?: {
        role?: string;
      };
      uploadedFilePath?: string;
    }
  }
}

/**
 * File upload configuration using Multer
 * Handles file storage, validation, and organization
 */

/**
 * Allowed file types for different upload categories
 */
export const ALLOWED_FILE_TYPES = {
  resume: {
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    extensions: ['.pdf', '.doc', '.docx'],
    maxSize: env.MAX_FILE_SIZE_MB * 1024 * 1024, // Convert MB to bytes
  },
  image: {
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ],
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    maxSize: env.MAX_IMAGE_SIZE_MB * 1024 * 1024, // Convert MB to bytes
  },
  document: {
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ],
    extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'],
    maxSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
  banner: {
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
    ],
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.mp4'],
    maxSize: 10 * 1024 * 1024, // 10MB max for banners
  },
};

/**
 * Generate organized file path based on role and entity
 * Format: {role}/{entity}/{YYYY}/{MM}/filename
 */
const generateFilePath = (role: string, entity: string, originalName: string): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  // Sanitize filename: remove special characters and add timestamp
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension)
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50); // Limit length
  
  const sanitizedFilename = `${baseName}-${timestamp}-${randomSuffix}${extension}`;
  
  return path.join(role, entity, year.toString(), month, sanitizedFilename);
};

/**
 * Ensure directory exists, create if it doesn't
 */
const ensureDirectoryExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    logger.info('Created upload directory', { path: dirPath });
  }
};

/**
 * Custom storage engine for organized file uploads
 */
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    try {
      // Extract role and entity from request context
      const role = req.body.role || req.user?.role || 'general';
      const entity = req.body.entity || 'files';
      
      const relativePath = path.join(role, entity, new Date().getFullYear().toString(), 
                                   String(new Date().getMonth() + 1).padStart(2, '0'));
      const fullPath = path.join(env.UPLOADS_PATH, relativePath);
      
      ensureDirectoryExists(fullPath);
      cb(null, fullPath);
    } catch (error) {
      logger.error('Error creating upload directory', { error });
      cb(error as Error, '');
    }
  },
  
  filename: (req, file, cb) => {
    try {
      const role = req.body.role || req.user?.role || 'general';
      const entity = req.body.entity || 'files';
      const filePath = generateFilePath(role, entity, file.originalname);
      
      // Store the relative path in request for later use
      req.uploadedFilePath = filePath;
      
      cb(null, path.basename(filePath));
    } catch (error) {
      logger.error('Error generating filename', { error });
      cb(error as Error, '');
    }
  },
});

/**
 * File filter for validation
 */
const createFileFilter = (_allowedTypes: string[]) => {
  return (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    try {
      const fileType = req.body.fileType || 'document';
      const allowedConfig = ALLOWED_FILE_TYPES[fileType as keyof typeof ALLOWED_FILE_TYPES];
      
      if (!allowedConfig) {
        return cb(new Error(`Invalid file type category: ${fileType}`));
      }
      
      // Check MIME type
      if (!allowedConfig.mimeTypes.includes(file.mimetype)) {
        return cb(new Error(`Invalid file type. Allowed types: ${allowedConfig.mimeTypes.join(', ')}`));
      }
      
      // Check file extension
      const extension = path.extname(file.originalname).toLowerCase();
      if (!allowedConfig.extensions.includes(extension)) {
        return cb(new Error(`Invalid file extension. Allowed extensions: ${allowedConfig.extensions.join(', ')}`));
      }
      
      logger.info('File validation passed', {
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        fileType,
      });
      
      cb(null, true);
    } catch (error) {
      logger.error('File filter error', { error });
      cb(error as Error);
    }
  };
};

/**
 * Base multer configuration
 */
const createMulterConfig = (maxSize?: number) => ({
  storage,
  fileFilter: createFileFilter([]),
  limits: {
    fileSize: maxSize || env.MAX_FILE_SIZE_MB * 1024 * 1024,
    files: 5, // Maximum 5 files per request
  },
});

/**
 * Multer instances for different upload types
 */
export const uploadResume = multer({
  ...createMulterConfig(ALLOWED_FILE_TYPES.resume.maxSize),
  fileFilter: createFileFilter(ALLOWED_FILE_TYPES.resume.mimeTypes),
});

export const uploadImage = multer({
  ...createMulterConfig(ALLOWED_FILE_TYPES.image.maxSize),
  fileFilter: createFileFilter(ALLOWED_FILE_TYPES.image.mimeTypes),
});

export const uploadDocument = multer({
  ...createMulterConfig(ALLOWED_FILE_TYPES.document.maxSize),
  fileFilter: createFileFilter(ALLOWED_FILE_TYPES.document.mimeTypes),
});

/**
 * General upload middleware with dynamic validation
 */
export const uploadGeneral = multer(createMulterConfig());

// Custom storage for banners
const bannerStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    try {
      const bannerPath = path.join(env.UPLOADS_PATH, 'banners');
      ensureDirectoryExists(bannerPath);
      cb(null, bannerPath);
    } catch (error) {
      logger.error('Error creating banner upload directory', { error });
      cb(error as Error, '');
    }
  },
  filename: (_req, file, cb) => {
    try {
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const extension = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, extension)
        .replace(/[^a-zA-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50);
      
      const sanitizedFilename = `${baseName}-${timestamp}-${randomSuffix}${extension}`;
      cb(null, sanitizedFilename);
    } catch (error) {
      logger.error('Error generating banner filename', { error });
      cb(error as Error, '');
    }
  },
});

// Custom file filter for banners
const bannerFileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  try {
    const allowedConfig = ALLOWED_FILE_TYPES.banner;
    
    // Check MIME type
    if (!allowedConfig.mimeTypes.includes(file.mimetype)) {
      return cb(new Error(`Invalid file type. Allowed types: ${allowedConfig.mimeTypes.join(', ')}`));
    }
    
    // Check file extension
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedConfig.extensions.includes(extension)) {
      return cb(new Error(`Invalid file extension. Allowed extensions: ${allowedConfig.extensions.join(', ')}`));
    }
    
    logger.info('Banner file validation passed', {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });
    
    cb(null, true);
  } catch (error) {
    logger.error('Banner file filter error', { error });
    cb(error as Error);
  }
};

export const uploadBanner = multer({
  storage: bannerStorage,
  fileFilter: bannerFileFilter,
  limits: {
    fileSize: ALLOWED_FILE_TYPES.banner.maxSize,
    files: 1, // Only one banner at a time
  },
});

/**
 * Error handler for multer errors
 */
export const handleMulterError = (error: any, _req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    logger.error('Multer error', { error: error.message, code: error.code });
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(413).json({
          type: 'https://httpstatuses.com/413',
          title: 'File Too Large',
          status: 413,
          detail: `File size exceeds the maximum allowed limit of ${env.MAX_FILE_SIZE_MB}MB`,
        });
      
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          type: 'https://httpstatuses.com/400',
          title: 'Too Many Files',
          status: 400,
          detail: 'Maximum 5 files allowed per request',
        });
      
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          type: 'https://httpstatuses.com/400',
          title: 'Unexpected File Field',
          status: 400,
          detail: 'Unexpected file field in request',
        });
      
      default:
        return res.status(400).json({
          type: 'https://httpstatuses.com/400',
          title: 'Upload Error',
          status: 400,
          detail: error.message,
        });
    }
  }
  
  if (error.message && error.message.includes('Invalid file')) {
    return res.status(400).json({
      type: 'https://httpstatuses.com/400',
      title: 'Invalid File Type',
      status: 400,
      detail: error.message,
    });
  }
  
  next(error);
};

/**
 * Cleanup uploaded files in case of error
 */
export const cleanupUploadedFiles = (files: Express.Multer.File[]) => {
  files.forEach(file => {
    fs.unlink(file.path, (err) => {
      if (err) {
        logger.error('Failed to cleanup uploaded file', { 
          file: file.path, 
          error: err.message 
        });
      }
    });
  });
};

/**
 * Initialize upload directories
 */
export const initializeUploadDirectories = () => {
  try {
    ensureDirectoryExists(env.UPLOADS_PATH);
    logger.info('Upload directories initialized', { uploadsPath: env.UPLOADS_PATH });
  } catch (error) {
    logger.error('Failed to initialize upload directories', { error });
    throw error;
  }
};
