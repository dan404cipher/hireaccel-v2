import { Router } from 'express';
import { InterviewController } from '@/controllers/InterviewController';
import { authenticate, requireHR } from '@/middleware/auth';

/**
 * Interview management routes
 * Handles CRUD operations for interviews
 */

const router = Router();

// All interview routes require authentication
router.use(authenticate);

/**
 * @route   GET /interviews/stats
 * @desc    Get interview statistics
 * @access  HR, Admin, Agent
 */
router.get('/stats', InterviewController.getInterviewStats);

/**
 * @route   GET /interviews
 * @desc    Get all interviews with filtering and pagination
 * @access  HR, Admin, Agent
 */
router.get('/', InterviewController.getInterviews);

/**
 * @route   GET /interviews/:id
 * @desc    Get single interview by ID
 * @access  HR, Admin, Agent
 */
router.get('/:id', InterviewController.getInterview);

/**
 * @route   POST /interviews
 * @desc    Create new interview
 * @access  HR, Admin
 */
router.post('/', requireHR, InterviewController.createInterview);

/**
 * @route   PUT /interviews/:id
 * @desc    Update interview
 * @access  HR, Admin
 */
router.put('/:id', requireHR, InterviewController.updateInterview);

/**
 * @route   DELETE /interviews/:id
 * @desc    Delete interview
 * @access  HR, Admin
 */
router.delete('/:id', requireHR, InterviewController.deleteInterview);

export default router;
