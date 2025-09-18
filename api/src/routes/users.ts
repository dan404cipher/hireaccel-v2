import { Router } from 'express';
import { UserController } from '@/controllers/UserController';
import { authenticate, requireAdmin, requireHR, requireAgent, allowSelfOrAdmin } from '@/middleware/auth';

/**
 * User management routes
 * Handles CRUD operations for users
 */

const router = Router();

// All user routes require authentication
router.use(authenticate);

/**
 * @route   GET /users/stats
 * @desc    Get user statistics
 * @access  Admin, HR
 */
router.get('/stats', requireHR, UserController.getUserStats);

/**
 * @route   GET /users/search
 * @desc    Search users
 * @access  Admin, HR, Agent
 */
router.get('/search', UserController.searchUsers);

/**
 * @route   GET /users/role/:role
 * @desc    Get users by role
 * @access  Admin, HR
 */
router.get('/role/:role', requireHR, UserController.getUsersByRole);

/**
 * @route   GET /users
 * @desc    Get all users with pagination and filters
 * @access  Admin, HR
 */
router.get('/', requireHR, UserController.getUsers);

/**
 * @route   POST /users
 * @desc    Create new user
 * @access  Admin
 */
router.post('/', requireAdmin, UserController.createUser);

/**
 * @route   GET /users/agent-assignments
 * @desc    Get all agent assignments
 * @access  Admin
 */
router.get('/agent-assignments', requireAdmin, UserController.getAgentAssignments);

/**
 * @route   POST /users/agent-assignments
 * @desc    Create or update agent assignment
 * @access  Admin
 */
router.post('/agent-assignments', requireAdmin, UserController.createAgentAssignment);

/**
 * @route   GET /users/agent-assignments/me
 * @desc    Get current agent's assignment details
 * @access  Agent
 */
router.get('/agent-assignments/me', requireAgent, UserController.getMyAgentAssignment);

/**
 * @route   GET /users/agent-assignments/debug/all
 * @desc    Debug endpoint to see all agent assignments (Admin only)
 * @access  Admin
 */
router.get('/agent-assignments/debug/all', requireAdmin, UserController.debugAllAgentAssignments);

/**
 * @route   GET /users/agent-assignments/:agentId
 * @desc    Get specific agent assignment
 * @access  Admin
 */
router.get('/agent-assignments/:agentId', requireAdmin, UserController.getAgentAssignment);

/**
 * @route   PATCH /users/agent-assignments/:agentId/remove
 * @desc    Remove resources from agent assignment
 * @access  Admin
 */
router.patch('/agent-assignments/:agentId/remove', requireAdmin, UserController.removeFromAgentAssignment);

/**
 * @route   DELETE /users/agent-assignments/:agentId
 * @desc    Delete agent assignment
 * @access  Admin
 */
router.delete('/agent-assignments/:agentId', requireAdmin, UserController.deleteAgentAssignment);

/**
 * @route   GET /users/custom/:customId
 * @desc    Get user by custom ID
 * @access  Admin, HR, Agent
 */
router.get('/custom/:customId', requireAgent, UserController.getUserByCustomId);

/**
 * @route   GET /users/:id
 * @desc    Get user by ID
 * @access  Admin, HR, Agent
 */
router.get('/:id', requireAgent, UserController.getUserById);

/**
 * @route   PUT /users/:id
 * @desc    Update user
 * @access  Admin
 */
router.put('/:id', allowSelfOrAdmin, UserController.updateUser);

/**
 * @route   PATCH /users/:id/status
 * @desc    Update user status
 * @access  Admin
 */
router.patch('/:id/status', requireAdmin, UserController.updateUserStatus);

/**
 * @route   DELETE /users/:id
 * @desc    Delete user (soft delete)
 * @access  Admin
 */
router.delete('/:id', requireAdmin, UserController.deleteUser);

export default router;
