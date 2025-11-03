import { Router } from 'express';
import { CompanyController } from '@/controllers/CompanyController';
import { authenticate, requireHR } from '@/middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/deleted', CompanyController.getDeletedCompanies); // Must be before /:id
router.get('/stats', requireHR, CompanyController.getCompanyStats);
router.get('/', CompanyController.getCompanies);
router.post('/', requireHR, CompanyController.createCompany);
router.get('/:id', CompanyController.getCompanyById);
router.put('/:id', requireHR, CompanyController.updateCompany);
router.delete('/:id', requireHR, CompanyController.deleteCompany);
router.post('/:id/restore', CompanyController.restoreCompany);

export default router;
