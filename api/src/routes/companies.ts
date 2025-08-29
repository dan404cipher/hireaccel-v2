import { Router } from 'express';
import { CompanyController } from '@/controllers/CompanyController';
import { authenticate, requireHR } from '@/middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/stats', requireHR, CompanyController.getCompanyStats);
router.get('/', CompanyController.getCompanies);
router.post('/', requireHR, CompanyController.createCompany);
router.get('/:id', CompanyController.getCompanyById);
router.put('/:id', requireHR, CompanyController.updateCompany);
router.delete('/:id', requireHR, CompanyController.deleteCompany);

export default router;
