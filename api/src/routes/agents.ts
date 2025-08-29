import express from 'express';
import { AgentController } from '@/controllers/AgentController';
import { authenticate, requireRole } from '@/middleware/auth';
import { UserRole } from '@/types';

const router = express.Router();

/**
 * Agent Routes
 * All routes require authentication and agent role
 */

// Apply authentication middleware to all routes
router.use(authenticate);

// Apply agent role requirement to all routes
router.use(requireRole(UserRole.AGENT));

/**
 * @swagger
 * /api/v1/agents/me/dashboard:
 *   get:
 *     summary: Get agent dashboard summary
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary with counts and statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     assignedHRs:
 *                       type: integer
 *                       description: Number of HR users assigned to agent
 *                     assignedCandidates:
 *                       type: integer
 *                       description: Number of candidates assigned to agent
 *                     availableJobs:
 *                       type: integer
 *                       description: Number of jobs from assigned HR users
 *                     activeAssignments:
 *                       type: integer
 *                       description: Number of active candidate assignments
 *                     completedAssignments:
 *                       type: integer
 *                       description: Number of completed assignments
 *                     pendingAssignments:
 *                       type: integer
 *                       description: Number of pending/rejected assignments
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only agents can access this endpoint
 *       500:
 *         description: Server error
 */
router.get('/me/dashboard', AgentController.getDashboardSummary);

/**
 * @swagger
 * /api/v1/agents/me/assignment:
 *   get:
 *     summary: Get agent's assignment record (HR users and candidates assigned by admin)
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Agent assignment details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only agents can access this endpoint
 *       404:
 *         description: No assignment found for this agent
 *       500:
 *         description: Server error
 */
router.get('/me/assignment', AgentController.getMyAssignment);

/**
 * @swagger
 * /api/v1/agents/me/jobs:
 *   get:
 *     summary: Get jobs posted by HR users assigned to the current agent
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           description: Search in job title, description, or location
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           description: Filter by job status
 *       - in: query
 *         name: urgency
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           description: Filter by job urgency
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, title, urgency, postedAt]
 *           default: postedAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: List of jobs from assigned HR users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only agents can access this endpoint
 *       500:
 *         description: Server error
 */
router.get('/me/jobs', AgentController.getMyJobs);

/**
 * @swagger
 * /api/v1/agents/me/candidates:
 *   get:
 *     summary: Get candidates assigned to the current agent
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           description: Search in candidate skills, summary, or location
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, title, urgency, postedAt]
 *           default: postedAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: List of candidates assigned to agent
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only agents can access this endpoint
 *       500:
 *         description: Server error
 */
router.get('/me/candidates', AgentController.getMyCandidates);

/**
 * @swagger
 * /api/v1/agents/me/assignments:
 *   get:
 *     summary: Get candidate assignments created by the current agent
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, rejected, withdrawn]
 *           description: Filter by assignment status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, title, urgency, postedAt]
 *           default: postedAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: List of candidate assignments with statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CandidateAssignment'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *                 stats:
 *                   type: object
 *                   description: Assignment statistics by status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only agents can access this endpoint
 *       500:
 *         description: Server error
 */
router.get('/me/assignments', AgentController.getMyAssignments);

/**
 * @swagger
 * /api/v1/agents/assignments:
 *   post:
 *     summary: Assign candidate to job (create candidate assignment)
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - candidateId
 *               - jobId
 *             properties:
 *               candidateId:
 *                 type: string
 *                 format: objectId
 *                 description: ID of the candidate to assign (must be assigned to agent)
 *               jobId:
 *                 type: string
 *                 format: objectId
 *                 description: ID of the job to assign to (must be from assigned HR)
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Optional notes about the assignment
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Optional due date for the assignment
 *     responses:
 *       201:
 *         description: Candidate assigned to job successfully
 *       400:
 *         description: Validation error or candidate already assigned to job
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only agents can assign candidates or access denied to candidate/job
 *       404:
 *         description: Candidate or job not found
 *       500:
 *         description: Server error
 */
router.post('/assignments', AgentController.assignCandidateToJob);

export default router;
