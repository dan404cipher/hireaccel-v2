import { Router } from 'express';
import { AuditLogController } from '../controllers/AuditLogController';
import { authenticate, requireHR } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /audit-logs
 * @desc    Get all audit logs with filtering
 * @access  HR, Admin, SuperAdmin
 */
router.get('/', authenticate, requireHR, AuditLogController.getAuditLogs);

/**
 * @route   GET /audit-logs/entity/:entityType/:entityId
 * @desc    Get audit logs for a specific entity
 * @access  HR, Admin, SuperAdmin
 */
router.get('/entity/:entityType/:entityId', authenticate, requireHR, AuditLogController.getEntityLogs);

/**
 * @route   GET /audit-logs/stats
 * @desc    Get audit log statistics
 * @access  HR, Admin, SuperAdmin
 */
router.get('/stats', authenticate, requireHR, AuditLogController.getAuditStats);

export default router;

