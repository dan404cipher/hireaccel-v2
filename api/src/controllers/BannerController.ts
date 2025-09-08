import { Response } from 'express';
import { Banner } from '../models/Banner';
import { AuthenticatedRequest } from '../types';
import { asyncHandler, createBadRequestError, createNotFoundError } from '../middleware/errorHandler';

export class BannerController {
  // Upload a new banner
  static uploadBanner = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.file) {
      throw createBadRequestError('No file uploaded');
    }

    // Generate relative URL for the uploaded file
    const mediaUrl = `/uploads/banners/${req.file.filename}`;
    
    // Determine media type from mimetype
    let mediaType = 'image';
    if (req.file.mimetype.startsWith('video/')) {
      mediaType = 'video';
    } else if (req.file.mimetype === 'image/gif') {
      mediaType = 'gif';
    }

    // Create banner
    const banner = await Banner.create({
      mediaUrl,
      mediaType,
      createdBy: req.user!._id,
    });

    // Deactivate other banners if this one is active
    if (banner.isActive) {
      await Banner.updateMany(
        { _id: { $ne: banner._id } },
        { isActive: false }
      );
    }

    res.status(201).json(banner);
  });

  // Get active banner
  static getActiveBanner = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const banner = await Banner.findOne({ isActive: true })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'firstName lastName');

    if (!banner) {
      throw createNotFoundError('Banner', 'active');
    }

    res.json(banner);
  });

  // Get all banners (for admin)
  static getAllBanners = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const banners = await Banner.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'firstName lastName');

    res.json(banners);
  });

  // Update banner status
  static updateBannerStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { bannerId } = req.params;
    const { isActive } = req.body;

    const banner = await Banner.findById(bannerId);
    if (!banner) {
      throw createNotFoundError('Banner', bannerId);
    }

    // If activating this banner, deactivate others
    if (isActive) {
      await Banner.updateMany(
        { _id: { $ne: bannerId } },
        { isActive: false }
      );
    }

    banner.isActive = isActive;
    await banner.save();

    res.json(banner);
  });

  // Delete banner
  static deleteBanner = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { bannerId } = req.params;

    const banner = await Banner.findByIdAndDelete(bannerId);
    if (!banner) {
      throw createNotFoundError('Banner', bannerId);
    }

    res.json({ message: 'Banner deleted successfully' });
  });
}