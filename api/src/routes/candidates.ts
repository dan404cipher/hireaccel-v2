import { Router } from 'express';
import { CandidateController } from '@/controllers/CandidateController';
import { authenticate, requireHR, requireAgent, requireCandidateAccess } from '@/middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /candidates/stats
 * @desc    Get candidate statistics
 * @access  HR, Admin
 */
router.get('/stats', requireHR, CandidateController.getCandidateStats);

/**
 * @route   GET /candidates/profile
 * @desc    Get current user's candidate profile
 * @access  Candidate
 */
router.get('/profile', CandidateController.getMyProfile);

/**
 * @route   PUT /candidates/profile
 * @desc    Update current user's candidate profile
 * @access  Candidate
 */
router.put('/profile', CandidateController.updateMyProfile);

/**
 * @route   GET /candidates
 * @desc    Search candidates with filters
 * @access  HR, Admin, Agent
 */
router.get('/', requireAgent, CandidateController.getCandidates);

/**
 * @route   GET /candidates/:id
 * @desc    Get candidate profile by ID
 * @access  HR, Admin, Agent
 */
router.get('/:id', requireCandidateAccess, CandidateController.getCandidateById);

/**
 * @route   POST /candidates/:id/notes
 * @desc    Add note to candidate profile
 * @access  HR, Admin, Agent
 */
router.post('/:id/notes', requireAgent, CandidateController.addCandidateNote);

/**
 * @route   PATCH /candidates/:id/status
 * @desc    Update candidate status
 * @access  HR, Admin
 */
router.patch('/:id/status', requireHR, CandidateController.updateCandidateStatus);

export default router;
