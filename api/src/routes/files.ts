import { Router } from 'express';
import { FileController } from '@/controllers/FileController';
import { authenticate, requireRole } from '@/middleware/auth';
import { UserRole } from '@/types';
import { uploadResume, handleMulterError } from '@/config/multer';

const router = Router();

/**
 * File management routes
 * All routes require authentication
 */

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   POST /files/resume
 * @desc    Upload resume for current candidate
 * @access  Private (Candidate only)
 */
router.post('/resume', 
  requireRole(UserRole.CANDIDATE),
  (req: any, _res: any, next: any) => {
    // Set file type for multer validation
    req.body.fileType = 'resume';
    req.body.entity = 'resumes';
    next();
  },
  uploadResume.single('resume'),
  handleMulterError,
  FileController.uploadResume
);

/**
 * @route   GET /files/resume
 * @desc    Get current candidate's resume info
 * @access  Private (Candidate only)
 */
router.get('/resume',
  requireRole(UserRole.CANDIDATE),
  FileController.getResumeInfo
);

/**
 * @route   GET /files/resume/:fileId
 * @desc    View resume file inline (for preview)
 * @access  Private (Own resume or HR/Admin)
 */
router.get('/resume/:fileId',
  FileController.viewResume
);

/**
 * @route   GET /files/resume/:fileId/download
 * @desc    Download resume file (forces download)
 * @access  Private (Own resume or HR/Admin)
 */
router.get('/resume/:fileId/download',
  FileController.downloadResume
);

/**
 * @route   DELETE /files/resume
 * @desc    Delete current candidate's resume
 * @access  Private (Candidate only)
 */
router.delete('/resume',
  requireRole(UserRole.CANDIDATE),
  FileController.deleteResume
);

/**
 * @route   POST /files/resume/parse
 * @desc    Parse current candidate's resume and extract information
 * @access  Private (Candidate only)
 */
router.post('/resume/parse',
  requireRole(UserRole.CANDIDATE),
  FileController.parseResume
);

export default router;
