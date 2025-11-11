#!/usr/bin/env tsx
/**
 * Check Banner Files Storage Status
 * 
 * This script checks the current storage status of banner files in the database.
 * It helps verify which files are stored locally vs. in S3.
 * 
 * Usage:
 *   npm run check:banner-files
 */

import mongoose from 'mongoose';
import { env } from '../config/env';
import { Banner } from '../models/Banner';
import fs from 'fs';
import path from 'path';

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const checkLocalFile = (filePath: string): { exists: boolean; size?: number } => {
  try {
    const fullPath = path.join(env.UPLOADS_PATH, filePath);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      return { exists: true, size: stats.size };
    }
    return { exists: false };
  } catch (error) {
    return { exists: false };
  }
};

async function checkBanners() {
  try {
    console.log('=== Banner Files Storage Check ===\n');

    // Connect to MongoDB
    await mongoose.connect(env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all banners
    const banners = await Banner.find({}).sort({ createdAt: -1 });
    console.log(`Total banners in database: ${banners.length}\n`);

    if (banners.length === 0) {
      console.log('No banners found in the database.');
      return;
    }

    // Categorize by storage provider
    const byStorage: { [key: string]: any[] } = {
      local: [],
      aws_s3: [],
      unknown: [],
    };

    banners.forEach((banner) => {
      // Check media file storage
      if (banner.mediaUrl) {
        const storageProvider = banner.storageProvider || 'local';
        byStorage[storageProvider].push({
          banner,
          type: 'media',
        });
      }

      // Check background media storage for text ads
      if (banner.backgroundMediaUrl) {
        const storageProvider = banner.backgroundStorageProvider || 'local';
        if (!byStorage[storageProvider]) {
          byStorage[storageProvider] = [];
        }
        byStorage[storageProvider].push({
          banner,
          type: 'background',
        });
      }
    });

    // Print summary
    console.log('=== Storage Provider Summary ===');
    console.log(`Local storage: ${byStorage.local.length} file(s)`);
    console.log(`S3 storage: ${byStorage.aws_s3.length} file(s)`);
    console.log(`Unknown storage: ${byStorage.unknown.length} file(s)\n`);

    // Print details for each storage provider
    for (const [provider, items] of Object.entries(byStorage)) {
      if (items.length === 0) continue;

      console.log(`\n=== ${provider.toUpperCase()} Storage ===`);
      console.log(`Total: ${items.length} file(s)\n`);

      items.forEach(({ banner, type }) => {
        console.log(`- ${banner.adType === 'text' ? 'Text Ad' : 'Media Ad'} (${type})`);
        console.log(`  ID: ${banner._id}`);
        console.log(`  Category: ${banner.category}`);
        console.log(`  Active: ${banner.isActive}`);
        console.log(`  Created: ${banner.createdAt.toISOString()}`);
        
        if (type === 'media') {
          console.log(`  Media URL: ${banner.mediaUrl}`);
          console.log(`  Media Type: ${banner.mediaType}`);
          console.log(`  Storage Location: ${banner.storageLocation || 'N/A'}`);
          console.log(`  Original Name: ${banner.originalName || 'N/A'}`);

          // Check if local file exists
          if (provider === 'local' && banner.mediaUrl) {
            const urlPath = banner.mediaUrl.replace(/^\/uploads\/banners\//, '');
            const fileCheck = checkLocalFile(`banners/${urlPath}`);
            console.log(`  File Exists Locally: ${fileCheck.exists ? '✅ Yes' : '❌ No'}`);
            if (fileCheck.exists && fileCheck.size) {
              console.log(`  File Size: ${formatBytes(fileCheck.size)}`);
            }
          }
        } else {
          console.log(`  Background URL: ${banner.backgroundMediaUrl}`);
          console.log(`  Background Type: ${banner.backgroundMediaType}`);
          console.log(`  Background Storage Location: ${banner.backgroundStorageLocation || 'N/A'}`);
          console.log(`  Background Original Name: ${banner.backgroundOriginalName || 'N/A'}`);

          // Check if local file exists
          if (provider === 'local' && banner.backgroundMediaUrl) {
            const urlPath = banner.backgroundMediaUrl.replace(/^\/uploads\/banners\//, '');
            const fileCheck = checkLocalFile(`banners/${urlPath}`);
            console.log(`  File Exists Locally: ${fileCheck.exists ? '✅ Yes' : '❌ No'}`);
            if (fileCheck.exists && fileCheck.size) {
              console.log(`  File Size: ${formatBytes(fileCheck.size)}`);
            }
          }
        }
        
        console.log('');
      });
    }

    // Check for orphaned files (files in uploads/banners/ not in database)
    console.log('\n=== Checking for Orphaned Files ===');
    const bannersDir = path.join(env.UPLOADS_PATH, 'banners');
    
    if (fs.existsSync(bannersDir)) {
      const files = fs.readdirSync(bannersDir);
      const dbFiles = new Set<string>();
      
      banners.forEach((banner) => {
        if (banner.mediaUrl) {
          const filename = banner.mediaUrl.replace(/^\/uploads\/banners\//, '');
          dbFiles.add(filename);
        }
        if (banner.backgroundMediaUrl) {
          const filename = banner.backgroundMediaUrl.replace(/^\/uploads\/banners\//, '');
          dbFiles.add(filename);
        }
      });

      const orphanedFiles = files.filter(f => !dbFiles.has(f) && f !== '.gitkeep');
      
      if (orphanedFiles.length > 0) {
        console.log(`Found ${orphanedFiles.length} orphaned file(s):`);
        orphanedFiles.forEach(file => {
          const stats = fs.statSync(path.join(bannersDir, file));
          console.log(`  - ${file} (${formatBytes(stats.size)})`);
        });
      } else {
        console.log('No orphaned files found.');
      }
    } else {
      console.log('Banners directory does not exist.');
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

// Run the check
checkBanners();

