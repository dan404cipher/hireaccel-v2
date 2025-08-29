import { Router } from 'express';
import { ApplicationController } from '@/controllers/ApplicationController';
import { authenticate, requireAgent } from '@/middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/stats', requireAgent, ApplicationController.getApplicationStats);
router.get('/', ApplicationController.getApplications);
router.post('/', ApplicationController.createApplication);
router.post('/:id/advance', requireAgent, ApplicationController.advanceApplication);
router.post('/:id/reject', requireAgent, ApplicationController.rejectApplication);

export default router;
