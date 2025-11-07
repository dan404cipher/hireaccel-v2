import { Router } from 'express';
import { BannerController } from '../controllers/BannerController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { uploadBanner, handleMulterError } from '../config/multer';

const router = Router();

// Upload banner (admin only)
router.post(
  '/',
  authenticate,
  requireAdmin,
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

// Create text-based ad (admin only)
router.post(
  '/text',
  authenticate,
  requireAdmin,
  (req: any, _res: any, next: any) => {
    // Set file type for multer validation (optional background media)
    req.body.fileType = 'banner';
    req.body.entity = 'banners';
    next();
  },
  uploadBanner.single('backgroundMedia'),
  handleMulterError,
  BannerController.createTextAd as any
);

// Update text-based ad (admin only)
router.put(
  '/text/:bannerId',
  authenticate,
  requireAdmin,
  (req: any, _res: any, next: any) => {
    // Set file type for multer validation (optional background media)
    req.body.fileType = 'banner';
    req.body.entity = 'banners';
    next();
  },
  uploadBanner.single('backgroundMedia'),
  handleMulterError,
  BannerController.updateTextAd as any
);

// Get all banners (admin only)
router.get('/', 
  authenticate,
  requireAdmin, 
  BannerController.getAllBanners as any
);

// Update banner status (admin only)
router.patch(
  '/:bannerId/status',
  authenticate,
  requireAdmin,
  BannerController.updateBannerStatus as any
);

// Delete banner (admin only)
router.delete(
  '/:bannerId',
  authenticate,
  requireAdmin,
  BannerController.deleteBanner as any
);

// Serve banner media file (public - for display)
router.get(
  '/:bannerId/media',
  BannerController.serveBannerMedia as any
);

// Serve banner background media file (public - for display)
router.get(
  '/:bannerId/background',
  BannerController.serveBannerBackground as any
);

export default router;