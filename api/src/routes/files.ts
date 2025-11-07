import { Router } from 'express'
import { FileController } from '@/controllers/FileController'
import { authenticate, requireRole, requireHR } from '@/middleware/auth'
import { UserRole } from '@/types'
import { uploadResume, uploadDocument, uploadJD, uploadProfilePhoto, uploadCompanyLogo, handleMulterError } from '@/config/multer'
import { heavyProcessLimiter } from '@/config/rateLimit'

const router = Router()

/**
 * File management routes
 * All routes require authentication
 */

// Apply authentication middleware to all routes
router.use(authenticate)

/**
 * @route   POST /files/resume
 * @desc    Upload resume for current candidate
 * @access  Private (Candidate only)
 */
router.post(
    '/resume',
    requireRole(UserRole.CANDIDATE),
    (req: any, _res: any, next: any) => {
        // Set file type for multer validation
        req.body.fileType = 'resume'
        req.body.entity = 'resumes'
        next()
    },
    uploadResume.single('resume'),
    handleMulterError,
    FileController.uploadResume,
)

/**
 * @route   GET /files/resume
 * @desc    Get current candidate's resume info
 * @access  Private (Candidate only)
 */
router.get('/resume', requireRole(UserRole.CANDIDATE), FileController.getResumeInfo)

/**
 * @route   GET /files/resume/:fileId
 * @desc    View resume file inline (for preview)
 * @access  Private (Own resume or HR/Admin)
 */
router.get('/resume/:fileId', FileController.viewResume)

/**
 * @route   GET /files/resume/:fileId/download
 * @desc    Download resume file (forces download)
 * @access  Private (Own resume or HR/Admin)
 */
router.get('/resume/:fileId/download', FileController.downloadResume)

/**
 * @route   DELETE /files/resume
 * @desc    Delete current candidate's resume
 * @access  Private (Candidate only)
 */
router.delete('/resume', requireRole(UserRole.CANDIDATE), FileController.deleteResume)

/**
 * @route   POST /files/resume/parse
 * @desc    Parse current candidate's resume and extract information
 * @access  Private (Candidate only)
 */
router.post('/resume/parse', heavyProcessLimiter, requireRole(UserRole.CANDIDATE), FileController.parseResume)

/**
 * @route   POST /files/jd
 * @desc    Upload JD (Job Description) file
 * @access  Private (HR/Admin/SuperAdmin only)
 */
router.post(
    '/jd',
    requireHR,
    uploadJD.single('jd'),
    handleMulterError,
    FileController.uploadJD,
)

/**
 * @route   POST /files/jd/parse
 * @desc    Parse JD file and extract job information
 * @access  Private (HR/Admin/SuperAdmin only)
 */
router.post(
    '/jd/parse',
    heavyProcessLimiter,
    requireHR,
    FileController.parseJD,
)

/**
 * @route   GET /files/jd/:fileId
 * @desc    View JD file inline (for preview)
 * @access  Private (Authenticated users)
 */
router.get('/jd/:fileId', FileController.viewJD)

/**
 * @route   GET /files/jd/:fileId/download
 * @desc    Download JD file (forces download)
 * @access  Private (Authenticated users)
 */
router.get('/jd/:fileId/download', FileController.downloadJD)

/**
 * @route   POST /files/profile-photo
 * @desc    Upload profile photo for current user
 * @access  Private (Authenticated users)
 */
router.post(
    '/profile-photo',
    uploadProfilePhoto.single('photo'),
    handleMulterError,
    FileController.uploadProfilePhoto,
)

/**
 * @route   GET /files/profile-photo/:fileId
 * @desc    View profile photo inline (for display)
 * @access  Private (Authenticated users)
 */
router.get('/profile-photo/:fileId', FileController.viewProfilePhoto)

/**
 * @route   POST /files/company-logo
 * @desc    Upload company logo
 * @access  Private (HR/Admin/SuperAdmin only)
 */
router.post(
    '/company-logo',
    requireHR,
    uploadCompanyLogo.single('logo'),
    handleMulterError,
    FileController.uploadCompanyLogo,
)

/**
 * @route   GET /files/company-logo/:fileId
 * @desc    View company logo inline (for display)
 * @access  Private (Authenticated users)
 */
router.get('/company-logo/:fileId', FileController.viewCompanyLogo)

export default router
