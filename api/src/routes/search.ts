import { Router } from 'express';
import { SearchController } from '@/controllers/SearchController';
import { authenticate } from '@/middleware/auth';

const router = Router();

/**
 * @route   GET /api/v1/search
 * @desc    Global search across jobs, candidates, companies, and users
 * @access  Private
 */
router.get('/', authenticate, SearchController.globalSearch);

export default router;

