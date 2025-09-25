import { Router } from 'express';
import { BannerController } from '../controllers/BannerController';
import { authenticate, requireRole } from '../middleware/auth';
import { uploadBanner, handleMulterError } from '../config/multer';
import { UserRole } from '../types';

const router = Router();

// Upload banner (admin only)
router.post(
  '/',
  authenticate,
  requireRole(UserRole.ADMIN),
  (req: any, _res: any, next: any) => {
    // Set file type for multer validation
    req.body.fileType = 'banner';
    req.body.entity = 'banners';
    next();
  },
  uploadBanner.single('media'),
  handleMulterError,
  BannerController.uploadBanner as any
);

// Get active banner (public)
router.get('/active', BannerController.getActiveBanner as any);

// Get all banners (admin only)
router.get('/', 
  authenticate,
  requireRole(UserRole.ADMIN), 
  BannerController.getAllBanners as any
);

// Update banner status (admin only)
router.patch(
  '/:bannerId/status',
  authenticate,
  requireRole(UserRole.ADMIN),
  BannerController.updateBannerStatus as any
);

// Delete banner (admin only)
router.delete(
  '/:bannerId',
  authenticate,
  requireRole(UserRole.ADMIN),
  BannerController.deleteBanner as any
);

export default router;