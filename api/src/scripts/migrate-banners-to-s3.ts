#!/usr/bin/env tsx
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { s3Service } from '../services/S3Service';
import { Banner } from '../models/Banner';

/**
 * Migration script to migrate banner files from local storage to S3
 * 
 * This script:
 * 1. Finds all banners stored locally (storageProvider !== 'aws_s3')
 * 2. Uploads each file to S3 in the 'banners' folder
 * 3. Updates the database with S3 information
 * 4. Optionally deletes local files after successful migration
 * 
 * Usage:
 *   npm run migrate:banners-to-s3
 *   npm run migrate:banners-to-s3 -- --dry-run  (preview only, no changes)
 *   npm run migrate:banners-to-s3 -- --delete-local  (delete local files after migration)
 */

interface MigrationStats {
  totalBanners: number;
  totalFiles: number;
  migratedFiles: number;
  skippedFiles: number;
  failedFiles: number;
  errors: Array<{ bannerId: string; fileType: string; error: string }>;
}

async function migrateBannersToS3(options: { dryRun: boolean; deleteLocal: boolean }): Promise<void> {
  const stats: MigrationStats = {
    totalBanners: 0,
    totalFiles: 0,
    migratedFiles: 0,
    skippedFiles: 0,
    failedFiles: 0,
    errors: [],
  };

  console.log('=== Banner Migration to S3 ===\n');

  // Check S3 configuration
  if (!s3Service.isS3Enabled()) {
    console.error('❌ S3 service is not enabled or not configured');
    console.error('   Please configure AWS credentials and enable S3 in your .env file');
    process.exit(1);
  }

  console.log('✅ S3 service is enabled and configured\n');

  // Connect to database
  console.log('Connecting to database...');
  await connectDatabase();
  console.log('✅ Connected to database\n');

  try {
    // Find all banners that have local files
    const localBanners = await Banner.find({
      $or: [
        // Banners with local media files
        {
          mediaUrl: { $exists: true, $ne: null },
          $or: [
            { storageProvider: { $ne: 'aws_s3' } },
            { storageProvider: { $exists: false } },
          ],
        },
        // Banners with local background media files
        {
          backgroundMediaUrl: { $exists: true, $ne: null },
          $or: [
            { backgroundStorageProvider: { $ne: 'aws_s3' } },
            { backgroundStorageProvider: { $exists: false } },
          ],
        },
      ],
    });

    stats.totalBanners = localBanners.length;

    console.log(`Found ${stats.totalBanners} banner(s) with local files\n`);

    if (options.dryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be made\n');
    }

    // Process each banner
    for (let i = 0; i < localBanners.length; i++) {
      const banner = localBanners[i];
      const bannerNumber = i + 1;

      console.log(`[${bannerNumber}/${stats.totalBanners}] Processing Banner: ${banner._id}`);
      console.log(`  Type: ${banner.adType}`);
      console.log(`  Category: ${banner.category}`);
      console.log(`  Active: ${banner.isActive}`);

      let bannerUpdated = false;

      // Migrate main media file (for media-type ads)
      if (banner.mediaUrl && banner.storageProvider !== 'aws_s3') {
        stats.totalFiles++;
        console.log(`\n  📷 Migrating main media file...`);
        
        const result = await migrateFile({
          banner,
          url: banner.mediaUrl,
          originalName: banner.originalName,
          fileType: 'media',
          dryRun: options.dryRun,
          deleteLocal: options.deleteLocal,
        });

        if (result.success) {
          if (!options.dryRun && result.s3Result) {
            banner.mediaUrl = result.s3Result.url;
            banner.storageProvider = 'aws_s3';
            banner.storageLocation = result.s3Result.key;
            bannerUpdated = true;
          }
          stats.migratedFiles++;
        } else if (result.skipped) {
          stats.skippedFiles++;
          stats.errors.push({
            bannerId: banner._id.toString(),
            fileType: 'media',
            error: result.error || 'Unknown error',
          });
        } else {
          stats.failedFiles++;
          stats.errors.push({
            bannerId: banner._id.toString(),
            fileType: 'media',
            error: result.error || 'Unknown error',
          });
        }
      }

      // Migrate background media file (for text-type ads with background)
      if (banner.backgroundMediaUrl && banner.backgroundStorageProvider !== 'aws_s3') {
        stats.totalFiles++;
        console.log(`\n  🖼️  Migrating background media file...`);
        
        const result = await migrateFile({
          banner,
          url: banner.backgroundMediaUrl,
          originalName: banner.backgroundOriginalName,
          fileType: 'background',
          dryRun: options.dryRun,
          deleteLocal: options.deleteLocal,
        });

        if (result.success) {
          if (!options.dryRun && result.s3Result) {
            banner.backgroundMediaUrl = result.s3Result.url;
            banner.backgroundStorageProvider = 'aws_s3';
            banner.backgroundStorageLocation = result.s3Result.key;
            bannerUpdated = true;
          }
          stats.migratedFiles++;
        } else if (result.skipped) {
          stats.skippedFiles++;
          stats.errors.push({
            bannerId: banner._id.toString(),
            fileType: 'background',
            error: result.error || 'Unknown error',
          });
        } else {
          stats.failedFiles++;
          stats.errors.push({
            bannerId: banner._id.toString(),
            fileType: 'background',
            error: result.error || 'Unknown error',
          });
        }
      }

      // Save banner if it was updated
      if (bannerUpdated && !options.dryRun) {
        await banner.save();
        console.log(`\n  ✅ Banner updated in database`);
        
        logger.info('Banner migrated to S3', {
          bannerId: banner._id.toString(),
          adType: banner.adType,
          category: banner.category,
          businessProcess: 'banner_migration',
        });
      }

      console.log(''); // Empty line for readability
    }

    // Print summary
    console.log('\n=== Migration Summary ===');
    console.log(`Total banners processed: ${stats.totalBanners}`);
    console.log(`Total files found: ${stats.totalFiles}`);
    console.log(`✅ Migrated: ${stats.migratedFiles}`);
    console.log(`⚠️  Skipped: ${stats.skippedFiles}`);
    console.log(`❌ Failed: ${stats.failedFiles}`);

    if (stats.errors.length > 0) {
      console.log('\n=== Errors ===');
      stats.errors.forEach((err) => {
        console.log(`  Banner ID: ${err.bannerId}`);
        console.log(`  File Type: ${err.fileType}`);
        console.log(`  Error: ${err.error}`);
        console.log('');
      });
    }

    if (options.dryRun) {
      console.log('\n🔍 This was a DRY RUN - No changes were made');
      console.log('   Run without --dry-run to perform the actual migration');
    } else {
      console.log('\n🎉 Migration completed!');
      
      if (options.deleteLocal && stats.migratedFiles > 0) {
        console.log('\n📝 Note: Local files were deleted after successful migration');
      } else if (stats.migratedFiles > 0) {
        console.log('\n📝 Note: Local files were NOT deleted. Use --delete-local flag to remove them');
      }
    }
  } catch (error) {
    console.error('\n❌ Fatal error during migration:');
    console.error(error instanceof Error ? error.message : 'Unknown error');
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    // Disconnect from database
    console.log('\nDisconnecting from database...');
    await disconnectDatabase();
    console.log('✅ Disconnected from database');
  }
}

interface MigrateFileOptions {
  banner: any;
  url: string;
  originalName?: string;
  fileType: 'media' | 'background';
  dryRun: boolean;
  deleteLocal: boolean;
}

interface MigrateFileResult {
  success: boolean;
  skipped: boolean;
  error?: string;
  s3Result?: {
    key: string;
    url: string;
    location: string;
  };
}

async function migrateFile(options: MigrateFileOptions): Promise<MigrateFileResult> {
  const { banner, url, originalName, fileType, dryRun, deleteLocal } = options;

  try {
    // Extract filename from URL (remove /uploads/banners/ prefix)
    const filename = url.replace(/^\/uploads\/banners\//, '');
    const filePath = path.join(env.UPLOADS_PATH, 'banners', filename);
    const absoluteFilePath = path.resolve(filePath);

    console.log(`     File: ${filename}`);

    // Check if file exists locally
    if (!fs.existsSync(absoluteFilePath)) {
      console.log(`     ⚠️  File not found locally: ${absoluteFilePath}`);
      return {
        success: false,
        skipped: true,
        error: `File not found: ${absoluteFilePath}`,
      };
    }

    // Read file from local storage
    const fileBuffer = fs.readFileSync(absoluteFilePath);
    const fileSizeKB = (fileBuffer.length / 1024).toFixed(2);
    console.log(`     Size: ${fileSizeKB} KB`);

    if (dryRun) {
      console.log(`     🔍 [DRY RUN] Would upload to S3: banners/${originalName || filename}`);
      return { success: true, skipped: false };
    }

    // Determine mimetype from file extension or banner data
    let mimetype = 'application/octet-stream';
    const ext = path.extname(filename).toLowerCase();
    
    if (fileType === 'media' && banner.mediaType) {
      if (banner.mediaType === 'video') {
        mimetype = 'video/mp4';
      } else if (banner.mediaType === 'gif') {
        mimetype = 'image/gif';
      } else {
        // Determine image type from extension
        const imageTypes: { [key: string]: string } = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.webp': 'image/webp',
        };
        mimetype = imageTypes[ext] || 'image/jpeg';
      }
    } else if (fileType === 'background' && banner.backgroundMediaType) {
      if (banner.backgroundMediaType === 'video') {
        mimetype = 'video/mp4';
      } else if (banner.backgroundMediaType === 'gif') {
        mimetype = 'image/gif';
      } else {
        const imageTypes: { [key: string]: string } = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.webp': 'image/webp',
        };
        mimetype = imageTypes[ext] || 'image/jpeg';
      }
    }

    // Upload to S3
    console.log('     📤 Uploading to S3...');
    const s3Result = await s3Service.uploadFile({
      fileBuffer,
      filename: originalName || filename,
      mimetype,
      folder: 'banners',
      makePublic: false,
    });

    console.log(`     ✅ Uploaded successfully!`);
    console.log(`        S3 Key: ${s3Result.key}`);
    console.log(`        S3 URL: ${s3Result.url}`);

    // Delete local file if requested
    if (deleteLocal) {
      try {
        fs.unlinkSync(absoluteFilePath);
        console.log(`     🗑️  Deleted local file`);
      } catch (deleteError) {
        console.log(`     ⚠️  Failed to delete local file: ${deleteError instanceof Error ? deleteError.message : 'Unknown error'}`);
        logger.warn('Failed to delete local file after migration', {
          bannerId: banner._id.toString(),
          path: absoluteFilePath,
          error: deleteError instanceof Error ? deleteError.message : 'Unknown error',
        });
      }
    }

    return {
      success: true,
      skipped: false,
      s3Result,
    };
  } catch (error) {
    console.error(`     ❌ Failed to migrate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    logger.error('Failed to migrate banner file to S3', {
      bannerId: banner._id.toString(),
      fileType,
      url,
      error: error instanceof Error ? error.message : 'Unknown error',
      businessProcess: 'banner_migration',
    });

    return {
      success: false,
      skipped: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const deleteLocal = args.includes('--delete-local');

// Run migration
migrateBannersToS3({ dryRun, deleteLocal })
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

