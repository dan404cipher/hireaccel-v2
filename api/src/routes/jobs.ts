import { Router } from 'express';
import { JobController } from '@/controllers/JobController';
import { authenticate, requireHR, requireAgent } from '@/middleware/auth';

/**
 * Job management routes
 * Handles CRUD operations for jobs
 */

const router = Router();

// All job routes require authentication
router.use(authenticate);

/**
 * @route   GET /jobs/stats
 * @desc    Get job statistics
 * @access  HR, Admin, Agent
 */
router.get('/stats', requireAgent, JobController.getJobStats);

/**
 * @route   GET /jobs/search
 * @desc    Search jobs
 * @access  All authenticated users
 */
router.get('/search', JobController.searchJobs);

/**
 * @route   GET /jobs/debug/all
 * @desc    Debug endpoint to see all jobs with creators (Admin only)
 * @access  Admin
 */
router.get('/debug/all', JobController.debugAllJobs);

/**
 * @route   GET /jobs
 * @desc    Get all jobs with filters and pagination
 * @access  All authenticated users (filtered by role)
 */
router.get('/', JobController.getJobs);

/**
 * @route   POST /jobs
 * @desc    Create new job
 * @access  HR, Admin
 */
router.post('/', requireHR, JobController.createJob);

/**
 * @route   GET /jobs/:id
 * @desc    Get job by ID
 * @access  All authenticated users
 */
router.get('/:id', JobController.getJobById);

/**
 * @route   PUT /jobs/:id
 * @desc    Update job
 * @access  HR, Admin
 */
router.put('/:id', requireHR, JobController.updateJob);

/**
 * @route   POST /jobs/:id/assign
 * @desc    Assign agent to job
 * @access  HR, Admin
 */
router.post('/:id/assign', requireHR, JobController.assignAgent);

/**
 * @route   POST /jobs/:id/close
 * @desc    Close job
 * @access  HR, Admin
 */
router.post('/:id/close', requireHR, JobController.closeJob);

/**
 * @route   DELETE /jobs/:id
 * @desc    Delete job
 * @access  Admin
 */
router.delete('/:id', requireHR, JobController.deleteJob);

export default router;
