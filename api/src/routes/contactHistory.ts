import { Router } from 'express';
import { ContactHistoryController } from '@/controllers/ContactHistoryController';
import { authenticate, requireRole } from '@/middleware/auth';
import { UserRole } from '@/types';

const router = Router();

/**
 * Contact History routes
 * All routes require authentication
 * Accessible to agents, admins, and superadmins
 */
router.use(authenticate);

/**
 * @route   GET /contact-history
 * @desc    Get contact history with filtering and pagination
 * @access  Agents (own history), Admins/Superadmins (all history), HR (where they are contact)
 */
router.get(
  '/',
  ContactHistoryController.getContactHistory
);

/**
 * @route   GET /contact-history/stats
 * @desc    Get contact history statistics
 * @access  Agents (own stats), Admins/Superadmins (all stats)
 */
router.get(
  '/stats',
  ContactHistoryController.getContactHistoryStats
);

/**
 * @route   GET /contact-history/:id
 * @desc    Get contact history by ID
 * @access  Agents (own history), Admins/Superadmins (all history), HR (where they are contact)
 */
router.get(
  '/:id',
  ContactHistoryController.getContactHistoryById
);

/**
 * @route   POST /contact-history
 * @desc    Create new contact history entry
 * @access  Agents, Admins, Superadmins
 */
router.post(
  '/',
  ContactHistoryController.createContactHistory
);

/**
 * @route   PUT /contact-history/:id
 * @desc    Update contact history entry
 * @access  Agents (own history), Admins/Superadmins (all history)
 */
router.put(
  '/:id',
  ContactHistoryController.updateContactHistory
);

/**
 * @route   DELETE /contact-history/:id
 * @desc    Delete contact history entry
 * @access  Admins, Superadmins only
 */
router.delete(
  '/:id',
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  ContactHistoryController.deleteContactHistory
);

export default router;

