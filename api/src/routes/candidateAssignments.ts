import express from 'express';
import { CandidateAssignmentController } from '@/controllers/CandidateAssignmentController';
import { authenticate } from '@/middleware/auth';

const router = express.Router();

/**
 * Candidate Assignment Routes
 * All routes require authentication
 */

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @swagger
 * /api/v1/candidate-assignments:
 *   get:
 *     summary: Get assignments with filtering and pagination
 *     tags: [Candidate Assignments]
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
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *       - in: query
 *         name: jobId
 *         schema:
 *           type: string
 *           format: objectId
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *           format: objectId
 *       - in: query
 *         name: assignedBy
 *         schema:
 *           type: string
 *           format: objectId
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [assignedAt, priority, status, dueDate]
 *           default: assignedAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: List of candidate assignments
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', CandidateAssignmentController.getAssignments);

/**
 * @swagger
 * /api/v1/candidate-assignments:
 *   post:
 *     summary: Create new assignment (Agent assigns candidate to HR)
 *     tags: [Candidate Assignments]
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
 *               - assignedTo
 *             properties:
 *               candidateId:
 *                 type: string
 *                 format: objectId
 *                 description: ID of the candidate to assign
 *               assignedTo:
 *                 type: string
 *                 format: objectId
 *                 description: ID of the HR user to assign to
 *               jobId:
 *                 type: string
 *                 format: objectId
 *                 description: Optional job ID this assignment is for
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
 *         description: Assignment created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only agents can create assignments
 *       404:
 *         description: Candidate or HR user not found
 *       500:
 *         description: Server error
 */
router.post('/', CandidateAssignmentController.createAssignment);

/**
 * @swagger
 * /api/v1/candidate-assignments/my-assignments:
 *   get:
 *     summary: Get assignments for current HR user (Shared Candidates view)
 *     tags: [Candidate Assignments]
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
 *           default: active
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *       - in: query
 *         name: jobId
 *         schema:
 *           type: string
 *           format: objectId
 *     responses:
 *       200:
 *         description: List of assignments for the current HR user
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only HR users can access this endpoint
 *       500:
 *         description: Server error
 */
router.get('/my-assignments', CandidateAssignmentController.getMyAssignments);

/**
 * @swagger
 * /api/v1/candidate-assignments/stats:
 *   get:
 *     summary: Get assignment statistics
 *     tags: [Candidate Assignments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Assignment statistics
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/stats', CandidateAssignmentController.getAssignmentStats);

/**
 * @swagger
 * /api/v1/candidate-assignments/{id}:
 *   get:
 *     summary: Get single assignment by ID
 *     tags: [Candidate Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *     responses:
 *       200:
 *         description: Assignment details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Server error
 */
router.get('/:id', CandidateAssignmentController.getAssignment);

/**
 * @swagger
 * /api/v1/candidate-assignments/{id}:
 *   put:
 *     summary: Update assignment
 *     tags: [Candidate Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, completed, rejected, withdrawn]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               feedback:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Feedback when completing or rejecting assignment
 *     responses:
 *       200:
 *         description: Assignment updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Server error
 */
router.put('/:id', CandidateAssignmentController.updateAssignment);

/**
 * @swagger
 * /api/v1/candidate-assignments/{id}:
 *   delete:
 *     summary: Delete assignment
 *     tags: [Candidate Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *     responses:
 *       200:
 *         description: Assignment deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', CandidateAssignmentController.deleteAssignment);

export default router;
