import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import jobRoutes from './jobs';
import companyRoutes from './companies';
import applicationRoutes from './applications';
import interviewRoutes from './interviews';
import candidateRoutes from './candidates';
import candidateAssignmentRoutes from './candidateAssignments';
import agentRoutes from './agents';
import fileRoutes from './files';
import bannerRoutes from './banner';
import auditLogRoutes from './auditLogs';
import analyticsRoutes from './analytics';
import searchRoutes from './search';

/**
 * Main API routes
 * Combines all route modules
 */

const router = Router();

// Authentication routes
router.use('/auth', authRoutes);

// API v1 routes
router.use('/api/v1/users', userRoutes);
router.use('/api/v1/jobs', jobRoutes);
router.use('/api/v1/companies', companyRoutes);
router.use('/api/v1/applications', applicationRoutes);
router.use('/api/v1/interviews', interviewRoutes);
router.use('/api/v1/candidates', candidateRoutes);
router.use('/api/v1/candidate-assignments', candidateAssignmentRoutes);
router.use('/api/v1/agents', agentRoutes);
router.use('/api/v1/files', fileRoutes);
router.use('/api/v1/banners', bannerRoutes);
router.use('/api/v1/audit-logs', auditLogRoutes);
router.use('/api/analytics', analyticsRoutes);
router.use('/api/v1/search', searchRoutes);

// Health check route
router.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env['npm_package_version'] || '1.0.0',
  });
});

export default router;
