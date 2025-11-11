import express from 'express';
import { AutoMatchController } from '@/controllers/AutoMatchController';
import { authenticate } from '@/middleware/auth';

const router = express.Router();

/**
 * Auto Match Routes
 * AI-powered candidate-to-job matching
 * All routes require authentication
 */

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @swagger
 * /api/v1/auto-match/match-job:
 *   post:
 *     summary: Match candidates to a specific job using AI
 *     tags: [Auto Match]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *             properties:
 *               jobId:
 *                 type: string
 *                 format: objectId
 *                 description: ID of the job to match candidates against
 *               limit:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 50
 *                 default: 10
 *                 description: Maximum number of matches to return
 *     responses:
 *       200:
 *         description: List of matched candidates with scores and reasoning
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only agents, admins, and superadmins can access this endpoint
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.post('/match-job', AutoMatchController.matchJobToCandidates);

/**
 * @swagger
 * /api/v1/auto-match/match-candidate:
 *   post:
 *     summary: Match a candidate to multiple jobs using AI
 *     tags: [Auto Match]
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
 *             properties:
 *               candidateId:
 *                 type: string
 *                 format: objectId
 *                 description: ID of the candidate to match jobs against
 *               limit:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 50
 *                 default: 10
 *                 description: Maximum number of matches to return
 *     responses:
 *       200:
 *         description: List of matched jobs with scores and reasoning
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only agents, admins, and superadmins can access this endpoint
 *       404:
 *         description: Candidate not found
 *       500:
 *         description: Server error
 */
router.post('/match-candidate', AutoMatchController.matchCandidateToJobs);

/**
 * @swagger
 * /api/v1/auto-match/batch-match:
 *   post:
 *     summary: Batch match candidates to jobs or jobs to candidates
 *     tags: [Auto Match]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             oneOf:
 *               - type: object
 *                 required:
 *                   - jobId
 *                 properties:
 *                   jobId:
 *                     type: string
 *                     format: objectId
 *                   limit:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 50
 *                     default: 10
 *               - type: object
 *                 required:
 *                   - candidateIds
 *                 properties:
 *                   candidateIds:
 *                     type: array
 *                     items:
 *                       type: string
 *                       format: objectId
 *                   limit:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 50
 *                     default: 10
 *     responses:
 *       200:
 *         description: Batch matching results
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only agents, admins, and superadmins can access this endpoint
 *       404:
 *         description: Job or candidate not found
 *       500:
 *         description: Server error
 */
router.post('/batch-match', AutoMatchController.batchMatch);

export default router;

