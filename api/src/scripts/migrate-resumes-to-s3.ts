import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { s3Service } from '../services/S3Service';
import { File } from '../models/File';
import { Candidate } from '../models/Candidate';
import { FileCategory } from '../types';

/**
 * Migration script to migrate candidate resume files from local storage to S3
 * 
 * This script:
 * 1. Finds all resume files stored locally (storageProvider !== 'aws_s3')
 * 2. Uploads each file to S3 in the 'resumes' folder
 * 3. Updates the database with S3 information
 * 4. Optionally deletes local files after successful migration
 * 
 * Usage:
 *   npm run migrate:resumes-to-s3
 *   npm run migrate:resumes-to-s3 -- --dry-run  (preview only, no changes)
 *   npm run migrate:resumes-to-s3 -- --delete-local  (delete local files after migration)
 */

interface MigrationStats {
  total: number;
  migrated: number;
  skipped: number;
  failed: number;
  errors: Array<{ fileId: string; error: string }>;
}

async function migrateResumesToS3(options: { dryRun: boolean; deleteLocal: boolean }): Promise<void> {
  const stats: MigrationStats = {
    total: 0,
    migrated: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  console.log('=== Resume Migration to S3 ===\n');

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
    // Find all resume files that are stored locally
    // This includes files with category RESUME or files linked to candidates via resumeFileId
    const candidatesWithResumes = await Candidate.find({
      resumeFileId: { $exists: true, $ne: null },
    }).select('resumeFileId');
    
    const resumeFileIds = candidatesWithResumes
      .map((c) => c.resumeFileId)
      .filter((id): id is mongoose.Types.ObjectId => id !== null && id !== undefined);

    const localResumeFiles = await File.find({
      $and: [
        {
          $or: [
            { category: FileCategory.RESUME },
            { _id: { $in: resumeFileIds } },
          ],
        },
        {
          $or: [
            { storageProvider: { $ne: 'aws_s3' } },
            { storageProvider: { $exists: false } },
          ],
        },
      ],
    });

    stats.total = localResumeFiles.length;

    console.log(`Found ${stats.total} resume file(s) to migrate\n`);

    if (options.dryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be made\n');
    }

    // Process each file
    for (let i = 0; i < localResumeFiles.length; i++) {
      const file = localResumeFiles[i];
      const fileNumber = i + 1;

      console.log(`[${fileNumber}/${stats.total}] Processing: ${file.originalName} (${file._id})`);

      try {
        // Check if file exists locally
        const filePath = path.join(env.UPLOADS_PATH, file.path);
        const absoluteFilePath = path.resolve(filePath);

        if (!fs.existsSync(absoluteFilePath)) {
          console.log(`  ⚠️  File not found locally: ${absoluteFilePath}`);
          stats.skipped++;
          stats.errors.push({
            fileId: file._id.toString(),
            error: `File not found: ${absoluteFilePath}`,
          });
          continue;
        }

        // Read file from local storage
        const fileBuffer = fs.readFileSync(absoluteFilePath);
        console.log(`  📄 File size: ${(fileBuffer.length / 1024).toFixed(2)} KB`);

        if (options.dryRun) {
          console.log(`  🔍 [DRY RUN] Would upload to S3: resumes/${file.originalName}`);
          stats.migrated++;
          continue;
        }

        // Upload to S3
        console.log('  📤 Uploading to S3...');
        const s3Result = await s3Service.uploadFile({
          fileBuffer,
          filename: file.originalName,
          mimetype: file.mimetype,
          folder: 'resumes',
          makePublic: false, // Resumes should be private
        });

        // Calculate checksum
        const checksum = s3Service.calculateChecksum(fileBuffer);

        // Update database
        console.log('  💾 Updating database...');
        file.path = s3Result.key;
        file.url = s3Result.url;
        file.storageProvider = 'aws_s3';
        file.storageLocation = s3Result.location;
        file.checksum = checksum;
        file.checksumAlgorithm = 'sha256';

        await file.save();

        console.log(`  ✅ Migrated successfully!`);
        console.log(`     S3 Key: ${s3Result.key}`);
        console.log(`     S3 URL: ${s3Result.url}`);

        // Delete local file if requested
        if (options.deleteLocal) {
          try {
            fs.unlinkSync(absoluteFilePath);
            console.log(`  🗑️  Deleted local file: ${absoluteFilePath}`);
          } catch (deleteError) {
            console.log(`  ⚠️  Failed to delete local file: ${deleteError instanceof Error ? deleteError.message : 'Unknown error'}`);
            logger.warn('Failed to delete local file after migration', {
              fileId: file._id.toString(),
              path: absoluteFilePath,
              error: deleteError instanceof Error ? deleteError.message : 'Unknown error',
            });
          }
        }

        stats.migrated++;

        logger.info('Resume migrated to S3', {
          fileId: file._id.toString(),
          originalName: file.originalName,
          s3Key: s3Result.key,
          s3Url: s3Result.url,
          businessProcess: 'resume_migration',
        });
      } catch (error) {
        console.error(`  ❌ Failed to migrate: ${error instanceof Error ? error.message : 'Unknown error'}`);
        stats.failed++;
        stats.errors.push({
          fileId: file._id.toString(),
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        logger.error('Failed to migrate resume to S3', {
          fileId: file._id.toString(),
          originalName: file.originalName,
          error: error instanceof Error ? error.message : 'Unknown error',
          businessProcess: 'resume_migration',
        });
      }

      console.log(''); // Empty line for readability
    }

    // Print summary
    console.log('\n=== Migration Summary ===');
    console.log(`Total files: ${stats.total}`);
    console.log(`✅ Migrated: ${stats.migrated}`);
    console.log(`⚠️  Skipped: ${stats.skipped}`);
    console.log(`❌ Failed: ${stats.failed}`);

    if (stats.errors.length > 0) {
      console.log('\n=== Errors ===');
      stats.errors.forEach((err) => {
        console.log(`  File ID: ${err.fileId}`);
        console.log(`  Error: ${err.error}`);
        console.log('');
      });
    }

    if (options.dryRun) {
      console.log('\n🔍 This was a DRY RUN - No changes were made');
      console.log('   Run without --dry-run to perform the actual migration');
    } else {
      console.log('\n🎉 Migration completed!');
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

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const deleteLocal = args.includes('--delete-local');

// Run migration
migrateResumesToS3({ dryRun, deleteLocal })
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

