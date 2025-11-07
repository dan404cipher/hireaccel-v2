import { Response } from 'express';
import { Banner } from '../models/Banner';
import { AuthenticatedRequest } from '../types';
import { asyncHandler, createBadRequestError, createNotFoundError } from '../middleware/errorHandler';
import { s3Service } from '../services/S3Service';
import { logger } from '../config/logger';
import crypto from 'crypto';

export class BannerController {
  // Upload a new banner
  static uploadBanner = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    logger.info('Banner upload started', {
      userId: req.user?._id,
      category: req.body.category,
      businessProcess: 'banner_upload',
    });

    if (!req.file) {
      throw createBadRequestError('No file uploaded');
    }

    const { category } = req.body;
    
    if (!category || !['hr', 'candidate'].includes(category)) {
      throw createBadRequestError('Invalid or missing category. Must be "hr" or "candidate"');
    }
    
    // Determine media type from mimetype
    let mediaType: 'image' | 'gif' | 'video' = 'image';
    if (req.file.mimetype.startsWith('video/')) {
      mediaType = 'video';
    } else if (req.file.mimetype === 'image/gif') {
      mediaType = 'gif';
    }

    let bannerData: any = {
      mediaType,
      category,
      createdBy: req.user!._id,
      originalName: req.file.originalname,
    };

    // Upload to S3 (required for new uploads)
    if (!s3Service.isS3Enabled()) {
      throw createBadRequestError('S3 service is not enabled. Banner uploads require S3 storage.');
    }

    try {
      const s3Result = await s3Service.uploadFile({
        fileBuffer: req.file.buffer,
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        folder: 'banners',
        makePublic: false,
      });

      bannerData = {
        ...bannerData,
        mediaUrl: s3Result.url,
        storageProvider: 'aws_s3',
        storageLocation: s3Result.key,
      };

      logger.info('Banner uploaded to S3', {
        userId: req.user?._id,
        s3Key: s3Result.key,
        bucket: s3Service.bucketName,
        businessProcess: 'banner_upload',
      });
    } catch (s3Error) {
      logger.error('Failed to upload banner to S3', {
        error: s3Error instanceof Error ? s3Error.message : 'Unknown error',
        businessProcess: 'banner_upload',
      });
      throw createBadRequestError('Failed to upload banner to S3. Please try again.');
    }

    // Create banner
    const banner = await Banner.create(bannerData);

    logger.info('Banner created successfully', {
      userId: req.user?._id,
      bannerId: banner._id,
      category,
      s3Key: bannerData.storageLocation,
      businessProcess: 'banner_upload',
    });

    res.status(201).json(banner);
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

  // Create text-based ad
  static createTextAd = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    logger.info('Text ad creation started', {
      userId: req.user?._id,
      category: req.body.category,
      businessProcess: 'text_ad_creation',
    });

    const { 
      category, 
      title, 
      subtitle, 
      content, 
      textColor, 
      backgroundColor, 
      titleColor, 
      subtitleColor,
      titleSize,
      subtitleSize,
      contentSize,
      textAlignment
    } = req.body;

    if (!category || !['hr', 'candidate'].includes(category)) {
      throw createBadRequestError('Invalid or missing category. Must be "hr" or "candidate"');
    }

    if (!title || title.trim().length === 0) {
      throw createBadRequestError('Title is required for text-based ads');
    }

    let bannerData: any = {
      adType: 'text',
      category,
      title: title.trim(),
      subtitle: subtitle?.trim(),
      content: content?.trim(),
      textColor: textColor || '#000000',
      backgroundColor: backgroundColor || '#ffffff',
      titleColor: titleColor || '#000000',
      subtitleColor: subtitleColor || '#666666',
      titleSize: titleSize || 'large',
      subtitleSize: subtitleSize || 'medium',
      contentSize: contentSize || 'small',
      textAlignment: textAlignment || 'center',
      createdBy: req.user!._id,
    };

    // Handle background media if provided
    if (req.file) {
      // Determine media type from mimetype
      let backgroundMediaType: 'image' | 'gif' | 'video' = 'image';
      if (req.file.mimetype.startsWith('video/')) {
        backgroundMediaType = 'video';
      } else if (req.file.mimetype === 'image/gif') {
        backgroundMediaType = 'gif';
      }

      bannerData.backgroundMediaType = backgroundMediaType;
      bannerData.backgroundOriginalName = req.file.originalname;

      // Upload background media to S3
      if (!s3Service.isS3Enabled()) {
        throw createBadRequestError('S3 service is not enabled. Banner uploads require S3 storage.');
      }

      try {
        const s3Result = await s3Service.uploadFile({
          fileBuffer: req.file.buffer,
          filename: req.file.originalname,
          mimetype: req.file.mimetype,
          folder: 'banners',
          makePublic: false,
        });

        bannerData.backgroundMediaUrl = s3Result.url;
        bannerData.backgroundStorageProvider = 'aws_s3';
        bannerData.backgroundStorageLocation = s3Result.key;

        logger.info('Background media uploaded to S3', {
          userId: req.user?._id,
          s3Key: s3Result.key,
          bucket: s3Service.bucketName,
          businessProcess: 'text_ad_creation',
        });
      } catch (s3Error) {
        logger.error('Failed to upload background media to S3', {
          error: s3Error instanceof Error ? s3Error.message : 'Unknown error',
          businessProcess: 'text_ad_creation',
        });
        throw createBadRequestError('Failed to upload background media to S3. Please try again.');
      }
    }

    const banner = await Banner.create(bannerData);

    logger.info('Text ad created successfully', {
      userId: req.user?._id,
      bannerId: banner._id,
      category,
      hasBackgroundMedia: !!req.file,
      businessProcess: 'text_ad_creation',
    });

    res.status(201).json(banner);
  });

  // Update text-based ad
  static updateTextAd = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { bannerId } = req.params;
    const { 
      title, 
      subtitle, 
      content, 
      textColor, 
      backgroundColor, 
      titleColor, 
      subtitleColor,
      titleSize,
      subtitleSize,
      contentSize,
      textAlignment
    } = req.body;

    const banner = await Banner.findById(bannerId);
    if (!banner) {
      throw createNotFoundError('Banner', bannerId);
    }

    if (banner.adType !== 'text') {
      throw createBadRequestError('This banner is not a text-based ad');
    }

    // Handle background media update if provided
    if (req.file) {
      // Determine media type from mimetype
      let backgroundMediaType: 'image' | 'gif' | 'video' = 'image';
      if (req.file.mimetype.startsWith('video/')) {
        backgroundMediaType = 'video';
      } else if (req.file.mimetype === 'image/gif') {
        backgroundMediaType = 'gif';
      }

      banner.backgroundMediaType = backgroundMediaType;
      banner.backgroundOriginalName = req.file.originalname;

      // Upload background media to S3
      if (!s3Service.isS3Enabled()) {
        throw createBadRequestError('S3 service is not enabled. Banner uploads require S3 storage.');
      }

      try {
        const s3Result = await s3Service.uploadFile({
          fileBuffer: req.file.buffer,
          filename: req.file.originalname,
          mimetype: req.file.mimetype,
          folder: 'banners',
          makePublic: false,
        });

        banner.backgroundMediaUrl = s3Result.url;
        banner.backgroundStorageProvider = 'aws_s3';
        banner.backgroundStorageLocation = s3Result.key;

        logger.info('Background media updated and uploaded to S3', {
          userId: req.user?._id,
          bannerId: banner._id,
          s3Key: s3Result.key,
          businessProcess: 'text_ad_update',
        });
      } catch (s3Error) {
        logger.error('Failed to upload background media to S3', {
          error: s3Error instanceof Error ? s3Error.message : 'Unknown error',
          businessProcess: 'text_ad_update',
        });
        throw createBadRequestError('Failed to upload background media to S3. Please try again.');
      }
    }

    // Update text fields
    if (title !== undefined) banner.title = title.trim();
    if (subtitle !== undefined) banner.subtitle = subtitle?.trim();
    if (content !== undefined) banner.content = content?.trim();
    if (textColor !== undefined) banner.textColor = textColor;
    if (backgroundColor !== undefined) banner.backgroundColor = backgroundColor;
    if (titleColor !== undefined) banner.titleColor = titleColor;
    if (subtitleColor !== undefined) banner.subtitleColor = subtitleColor;
    if (titleSize !== undefined) banner.titleSize = titleSize;
    if (subtitleSize !== undefined) banner.subtitleSize = subtitleSize;
    if (contentSize !== undefined) banner.contentSize = contentSize;
    if (textAlignment !== undefined) banner.textAlignment = textAlignment;

    await banner.save();

    logger.info('Text ad updated successfully', {
      userId: req.user?._id,
      bannerId: banner._id,
      businessProcess: 'text_ad_update',
    });

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

  // Serve banner media file (proxy from S3)
  static serveBannerMedia = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { bannerId } = req.params;

    logger.info('🎥 Serving banner media', {
      bannerId,
      businessProcess: 'banner_media_proxy',
    });

    const banner = await Banner.findById(bannerId);
    if (!banner) {
      logger.error('❌ Banner not found', { bannerId });
      throw createNotFoundError('Banner', bannerId);
    }

    logger.info('✅ Banner found', {
      bannerId,
      storageProvider: banner.storageProvider,
      storageLocation: banner.storageLocation,
      mediaType: banner.mediaType,
    });

    if (!banner.mediaUrl || banner.storageProvider !== 'aws_s3') {
      throw createBadRequestError('Banner media not found or not stored in S3');
    }

    // Generate ETag based on banner ID and update time for caching
    const etag = crypto
      .createHash('md5')
      .update(`${banner._id}-${banner.updatedAt}`)
      .digest('hex');

    // Check if client has cached version
    const clientETag = req.headers['if-none-match'];
    if (clientETag === etag) {
      logger.info('💾 Client has cached version, returning 304', {
        bannerId,
        etag,
      });
      res.status(304).end();
      return;
    }

    if (!banner.storageLocation) {
      throw createBadRequestError('Banner storage location not found');
    }

    // Get file from S3 and stream to client
    const { GetObjectCommand } = await import('@aws-sdk/client-s3');
    const s3Client = s3Service.getClient();
    const bucketName = s3Service.bucketName;

    if (!s3Client) {
      throw createBadRequestError('S3 client is not available');
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: banner.storageLocation,
    });

    const response = await s3Client.send(command);

    logger.info('📥 Retrieved from S3, streaming to client', {
      bannerId,
      contentLength: response.ContentLength,
    });

    // Determine content type from media type
    let contentType = 'application/octet-stream';
    if (banner.mediaType === 'video') {
      contentType = 'video/mp4';
    } else if (banner.mediaType === 'gif') {
      contentType = 'image/gif';
    } else {
      contentType = 'image/jpeg'; // Default for images
    }

    const contentLength = response.ContentLength || 0;

    // Handle range requests for Safari video playback
    const range = req.headers.range;
    if (range && contentLength) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : contentLength - 1;
      const chunkSize = end - start + 1;

      logger.info('📍 Range request detected', {
        bannerId,
        range: `${start}-${end}/${contentLength}`,
      });

      // For range requests, need to fetch the specific range from S3
      const { GetObjectCommand: GetObjectCommandRange } = await import('@aws-sdk/client-s3');
      const rangeCommand = new GetObjectCommandRange({
        Bucket: bucketName,
        Key: banner.storageLocation,
        Range: `bytes=${start}-${end}`,
      });

      const rangeResponse = await s3Client.send(rangeCommand);

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${contentLength}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${banner.originalName || 'banner'}"`,
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Cache-Control': 'public, max-age=604800, immutable', // 7 days, immutable for better caching
        'ETag': etag,
      });

      if (rangeResponse.Body) {
        (rangeResponse.Body as any).pipe(res);
      }
    } else {
      // No range request - send full file
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Length', contentLength.toString());
      res.setHeader('Content-Disposition', `inline; filename="${banner.originalName || 'banner'}"`);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable'); // 7 days, immutable for better caching
      res.setHeader('ETag', etag);

      logger.info('📤 Headers set, piping response', {
        bannerId,
        contentType,
        contentLength,
      });

      if (response.Body) {
        (response.Body as any).pipe(res);
      } else {
        logger.error('❌ No response body from S3', { bannerId });
        throw createBadRequestError('Failed to retrieve banner media from S3');
      }
    }
  });

  // Serve banner background media file (for text ads)
  static serveBannerBackground = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { bannerId } = req.params;

    logger.info('🖼️  Serving banner background media', {
      bannerId,
      businessProcess: 'banner_background_proxy',
    });

    const banner = await Banner.findById(bannerId);
    if (!banner) {
      logger.error('❌ Banner not found', { bannerId });
      throw createNotFoundError('Banner', bannerId);
    }

    logger.info('✅ Banner found', {
      bannerId,
      backgroundStorageProvider: banner.backgroundStorageProvider,
      backgroundStorageLocation: banner.backgroundStorageLocation,
      backgroundMediaType: banner.backgroundMediaType,
    });

    if (!banner.backgroundMediaUrl || banner.backgroundStorageProvider !== 'aws_s3') {
      throw createBadRequestError('Banner background media not found or not stored in S3');
    }

    // Generate ETag based on banner ID and update time for caching
    const etag = crypto
      .createHash('md5')
      .update(`${banner._id}-${banner.updatedAt}-background`)
      .digest('hex');

    // Check if client has cached version
    const clientETag = req.headers['if-none-match'];
    if (clientETag === etag) {
      logger.info('💾 Client has cached background version, returning 304', {
        bannerId,
        etag,
      });
      res.status(304).end();
      return;
    }

    if (!banner.backgroundStorageLocation) {
      throw createBadRequestError('Banner background storage location not found');
    }

    // Get file from S3 and stream to client
    const { GetObjectCommand } = await import('@aws-sdk/client-s3');
    const s3Client = s3Service.getClient();
    const bucketName = s3Service.bucketName;

    if (!s3Client) {
      throw createBadRequestError('S3 client is not available');
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: banner.backgroundStorageLocation,
    });

    const response = await s3Client.send(command);

    logger.info('📥 Retrieved background from S3, streaming to client', {
      bannerId,
      contentLength: response.ContentLength,
    });

    // Determine content type from media type
    let contentType = 'application/octet-stream';
    if (banner.backgroundMediaType === 'video') {
      contentType = 'video/mp4';
    } else if (banner.backgroundMediaType === 'gif') {
      contentType = 'image/gif';
    } else {
      contentType = 'image/jpeg'; // Default for images
    }

    const contentLength = response.ContentLength || 0;

    // Handle range requests for Safari video playback
    const range = req.headers.range;
    if (range && contentLength) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : contentLength - 1;
      const chunkSize = end - start + 1;

      logger.info('📍 Range request detected for background', {
        bannerId,
        range: `${start}-${end}/${contentLength}`,
      });

      // For range requests, need to fetch the specific range from S3
      const { GetObjectCommand: GetObjectCommandRange } = await import('@aws-sdk/client-s3');
      const rangeCommand = new GetObjectCommandRange({
        Bucket: bucketName,
        Key: banner.backgroundStorageLocation,
        Range: `bytes=${start}-${end}`,
      });

      const rangeResponse = await s3Client.send(rangeCommand);

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${contentLength}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${banner.backgroundOriginalName || 'banner-background'}"`,
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Cache-Control': 'public, max-age=604800, immutable', // 7 days, immutable
        'ETag': etag,
      });

      if (rangeResponse.Body) {
        (rangeResponse.Body as any).pipe(res);
      }
    } else {
      // No range request - send full file
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Length', contentLength.toString());
      res.setHeader('Content-Disposition', `inline; filename="${banner.backgroundOriginalName || 'banner-background'}"`);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable'); // 7 days, immutable
      res.setHeader('ETag', etag);

      logger.info('📤 Background headers set, piping response', {
        bannerId,
        contentType,
        contentLength,
      });

      if (response.Body) {
        (response.Body as any).pipe(res);
      } else {
        logger.error('❌ No response body from S3', { bannerId });
        throw createBadRequestError('Failed to retrieve banner background media from S3');
      }
    }
  });
}