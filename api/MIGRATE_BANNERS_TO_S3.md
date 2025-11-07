# Banner Migration to S3

This guide helps you migrate existing banner files from local storage to AWS S3.

## Overview

The application now uses AWS S3 for all banner file storage instead of local file system storage. This provides:

- **Scalability**: No server disk space limitations
- **Reliability**: Built-in redundancy and backups
- **Performance**: CDN integration capabilities
- **Cost-effectiveness**: Pay only for what you use
- **Security**: Fine-grained access controls

## Prerequisites

Before migrating, ensure:

1. **AWS S3 is configured** in your `.env` file:
   ```bash
   AWS_S3_ENABLED=true
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_S3_BUCKET_NAME=your-bucket-name
   ```

2. **S3 bucket exists** and is properly configured
3. **Database connection** is available
4. **Backup your database** before migration (recommended)

## Migration Process

### Step 1: Check Current Status

First, check which banners are stored locally:

```bash
npm run check:banner-files
```

This will show:
- Total number of banners in the database
- How many are stored locally vs. S3
- File sizes and locations
- Any orphaned files

### Step 2: Dry Run (Recommended)

Perform a dry run to preview the migration without making changes:

```bash
npm run migrate:banners-to-s3 -- --dry-run
```

This will:
- Show which files will be migrated
- Display file sizes
- Identify any issues (missing files, etc.)
- Not make any actual changes

### Step 3: Run Migration

Once you're confident, run the actual migration:

```bash
npm run migrate:banners-to-s3
```

This will:
1. Find all banners with local files
2. Upload each file to S3 in the `banners` folder
3. Update database records with S3 URLs and metadata
4. Keep local files (for safety)

#### Migration with Local File Cleanup

If you want to delete local files after successful migration:

```bash
npm run migrate:banners-to-s3 -- --delete-local
```

⚠️ **Warning**: Only use `--delete-local` after verifying the migration was successful!

### Step 4: Verify Migration

After migration, verify everything worked correctly:

```bash
npm run check:banner-files
```

All banners should now show `aws_s3` as the storage provider.

## Banner Types Supported

The migration handles both types of banner ads:

1. **Media Ads**: Standalone image/GIF/video banners
   - Migrates the main media file
   - Updates `mediaUrl`, `storageProvider`, and `storageLocation`

2. **Text Ads with Background**: Text-based ads with optional background media
   - Migrates the background media file
   - Updates `backgroundMediaUrl`, `backgroundStorageProvider`, and `backgroundStorageLocation`

## Troubleshooting

### File Not Found Errors

If the script reports files not found:
1. Check if files exist in `api/uploads/banners/`
2. Verify the file paths in the database match actual files
3. Files may have been manually deleted - these will be skipped

### S3 Upload Failures

If uploads fail:
1. Verify AWS credentials are correct
2. Check bucket permissions (write access required)
3. Ensure bucket exists in the specified region
4. Check network connectivity to AWS

### Database Update Failures

If database updates fail:
1. Check MongoDB connection
2. Verify user has write permissions
3. Review error logs for specific issues

### Partial Migration

If migration partially completes:
- The script is idempotent - you can re-run it safely
- Already migrated banners (with S3 storage) will be skipped
- Only remaining local files will be processed

## Post-Migration

### Verify Application Functionality

1. **Test banner display**:
   - Check both HR and Candidate banner views
   - Verify media ads display correctly
   - Verify text ads with backgrounds display correctly

2. **Test banner uploads**:
   - Upload a new banner (should go directly to S3)
   - Verify it appears correctly in the admin panel
   - Check database has correct S3 metadata

### Cleanup Local Files (Optional)

After confirming everything works:

1. **Backup local files** (optional, for safety):
   ```bash
   tar -czf banner-files-backup.tar.gz api/uploads/banners/
   ```

2. **Delete local files**:
   ```bash
   rm -rf api/uploads/banners/*
   ```

   Or keep the directory structure:
   ```bash
   find api/uploads/banners/ -type f ! -name '.gitkeep' -delete
   ```

### Update Server Configuration (Optional)

Consider updating your server configuration:

1. **Remove static file serving** (if no other files need local serving):
   - Update `api/src/app.ts` to remove or restrict the static uploads route
   - This prevents unauthorized access to any remaining local files

2. **Update nginx/reverse proxy** (if applicable):
   - Remove or restrict access to `/uploads/banners/`
   - Configure CDN for S3 bucket (optional, for better performance)

## New Banner Uploads

After migration, all new banner uploads automatically use S3:

- The system requires S3 to be enabled for banner uploads
- If S3 is not available, banner uploads will fail with an error
- No local storage fallback for banners

## Rollback (Emergency)

If you need to rollback (should be rare):

1. **Restore database from backup**:
   ```bash
   mongorestore --db your-database-name backup/
   ```

2. **Restore local files from backup** (if you created one):
   ```bash
   tar -xzf banner-files-backup.tar.gz
   ```

## Cost Estimation

S3 costs are typically very low for banner files:

- **Storage**: ~$0.023 per GB/month (standard tier)
- **Requests**: ~$0.005 per 1,000 PUT requests
- **Data Transfer**: Free for uploads, minimal for downloads (assuming reasonable traffic)

Example: 100 banners @ 2MB each = 200MB = ~$0.005/month storage

## Monitoring

After migration, monitor:

1. **S3 bucket usage** in AWS Console
2. **Application logs** for any S3-related errors
3. **Banner display** functionality in both web and mobile apps

## Support

For issues:
1. Check error logs in `api/logs/`
2. Review AWS S3 bucket permissions
3. Verify environment variables are set correctly
4. Run `npm run check:banner-files` to diagnose issues

## Summary

```bash
# Full migration workflow
npm run check:banner-files              # 1. Check current status
npm run migrate:banners-to-s3 -- --dry-run  # 2. Dry run (preview)
npm run migrate:banners-to-s3           # 3. Actual migration
npm run check:banner-files              # 4. Verify migration
```

That's it! Your banners are now served from S3 instead of local storage. 🎉

