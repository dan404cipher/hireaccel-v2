import mongoose from 'mongoose';
import { Banner } from '../models/Banner';
import { env } from '../config/env';
import { logger } from '../config/logger';

async function fixBannerAdType() {
  try {
    logger.info('Connecting to database...');
    await mongoose.connect(env.MONGO_URI);
    logger.info('Connected to database');

    // Find all banners without adType field
    const bannersWithoutAdType = await Banner.find({ adType: { $exists: false } });
    logger.info(`Found ${bannersWithoutAdType.length} banners without adType field`);

    if (bannersWithoutAdType.length > 0) {
      // Update all banners without adType to have adType: 'media'
      const result = await Banner.updateMany(
        { adType: { $exists: false } },
        { $set: { adType: 'media' } }
      );
      
      logger.info(`Updated ${result.modifiedCount} banners with adType: 'media'`);
    }

    // Verify the fix
    const allBanners = await Banner.find({});
    logger.info(`Total banners in database: ${allBanners.length}`);
    
    const mediaBanners = await Banner.find({ adType: 'media' });
    const textBanners = await Banner.find({ adType: 'text' });
    
    logger.info(`Media banners: ${mediaBanners.length}`);
    logger.info(`Text banners: ${textBanners.length}`);

    logger.info('Banner adType fix completed successfully');
  } catch (error) {
    logger.error('Error fixing banner adType:', error);
  } finally {
    await mongoose.connection.close();
    logger.info('Disconnected from database');
  }
}

// Run the script
fixBannerAdType();
