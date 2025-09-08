import { Response } from 'express';
import { Banner } from '../models/Banner';
import { AuthenticatedRequest } from '../types';
import { asyncHandler, createBadRequestError, createNotFoundError } from '../middleware/errorHandler';

export class BannerController {
  // Upload a new banner
  static uploadBanner = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    console.log('=== BANNER UPLOAD START ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file ? {
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file');
    console.log('User:', req.user ? { id: req.user._id, email: req.user.email } : 'No user');

    if (!req.file) {
      console.log('ERROR: No file uploaded');
      throw createBadRequestError('No file uploaded');
    }

    const { category } = req.body;
    console.log('Category from request:', category);
    
    if (!category || !['hr', 'candidate'].includes(category)) {
      console.log('ERROR: Invalid category:', category);
      throw createBadRequestError('Invalid or missing category. Must be "hr" or "candidate"');
    }

    // Generate relative URL for the uploaded file
    const mediaUrl = `/uploads/banners/${req.file.filename}`;
    console.log('Generated mediaUrl:', mediaUrl);
    
    // Determine media type from mimetype
    let mediaType = 'image';
    if (req.file.mimetype.startsWith('video/')) {
      mediaType = 'video';
    } else if (req.file.mimetype === 'image/gif') {
      mediaType = 'gif';
    }
    console.log('Determined mediaType:', mediaType);

    // Create banner
    console.log('Creating banner with data:', {
      mediaUrl,
      mediaType,
      category,
      createdBy: req.user!._id,
    });

    try {
      const banner = await Banner.create({
        mediaUrl,
        mediaType,
        category,
        createdBy: req.user!._id,
      });
      console.log('Banner created successfully:', banner);
      console.log('=== BANNER UPLOAD SUCCESS ===');
      res.status(201).json(banner);
    } catch (error) {
      console.log('ERROR creating banner:', error);
      throw error;
    }
  });

  // Get active banner by category
  static getActiveBanner = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { category } = req.query;
    
    if (!category || !['hr', 'candidate'].includes(category as string)) {
      throw createBadRequestError('Invalid or missing category. Must be "hr" or "candidate"');
    }

    const banner = await Banner.findOne({ isActive: true, category })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'firstName lastName');

    if (!banner) {
      throw createNotFoundError('Banner', `active ${category}`);
    }

    res.json(banner);
  });

  // Get all banners (for admin)
  static getAllBanners = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    console.log('=== GET ALL BANNERS START ===');
    const { category } = req.query;
    console.log('Category query param:', category);
    
    const filter: any = {};
    
    if (category && ['hr', 'candidate'].includes(category as string)) {
      filter.category = category;
    }
    
    console.log('Filter being used:', filter);

    const banners = await Banner.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'firstName lastName');

    console.log('Found banners:', banners.length);
    console.log('Banners data:', banners);
    console.log('=== GET ALL BANNERS END ===');

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

    // If activating this banner, deactivate others in the same category
    if (isActive) {
      await Banner.updateMany(
        { 
          _id: { $ne: bannerId },
          category: banner.category
        },
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