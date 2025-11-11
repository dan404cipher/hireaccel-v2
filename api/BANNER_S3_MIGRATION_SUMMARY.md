# Banner S3 Migration - Quick Summary

## Current Status

✅ **Banner uploads are already configured to use S3 exclusively**

The system is already set up to:
- Require S3 for all new banner uploads (both media and text ads with backgrounds)
- Reject new uploads if S3 is not enabled
- Store all new banners directly in S3 without local storage fallback

## What You Need to Do

### 1. Check Existing Banners

Run this command to see which banners are currently stored locally:

```bash
cd api
npm run check:banner-files
```

### 2. Migrate Existing Local Files to S3

If you have existing banners stored locally (which you likely do based on the 11 files in `uploads/banners/`), migrate them:

```bash
# Preview the migration first (safe, no changes)
npm run migrate:banners-to-s3 -- --dry-run

# Actually migrate the files
npm run migrate:banners-to-s3

# Verify the migration worked
npm run check:banner-files
```

### 3. Optional: Clean Up Local Files

After confirming the migration was successful and banners display correctly:

```bash
# Delete local files (they're now in S3)
npm run migrate:banners-to-s3 -- --delete-local

# Or manually delete them
rm -rf uploads/banners/*
```

## How It Works

### Before Migration
- **Old banners**: Stored in `api/uploads/banners/` directory
- **URLs**: Point to local server (`/uploads/banners/filename.jpg`)
- **Storage limitation**: Limited by server disk space

### After Migration
- **All banners**: Stored in AWS S3 bucket
- **URLs**: Point to S3 (`https://your-bucket.s3.region.amazonaws.com/banners/2025/01/filename.jpg`)
- **Benefits**: Scalable, reliable, CDN-ready

## Files Changed/Added

1. **Migration Script**: `api/src/scripts/migrate-banners-to-s3.ts`
   - Migrates existing local banner files to S3
   - Updates database records
   - Handles both media ads and text ads with backgrounds

2. **NPM Scripts** (in `api/package.json`):
   - `npm run migrate:banners-to-s3` - Run migration
   - `npm run check:banner-files` - Check storage status

3. **Documentation**:
   - `MIGRATE_BANNERS_TO_S3.md` - Comprehensive migration guide
   - This file - Quick summary

## No Code Changes Required

**Important**: The banner upload functionality already requires S3. No additional code changes are needed:

- `BannerController.uploadBanner()` - Already requires S3 (line 43-44)
- `BannerController.createTextAd()` - Already uses S3 for backgrounds (line 225)
- Banner model - Already has S3 storage tracking fields
- Multer config - Already uses memory storage for banners (enabling S3 upload)

## Verification Checklist

After migration, verify:

- [ ] Run `npm run check:banner-files` - all banners show `aws_s3` storage
- [ ] Web app - banners display correctly on HR and Candidate pages
- [ ] Mobile app - banners display correctly
- [ ] Admin panel - can view all existing banners
- [ ] Admin panel - can upload new banners successfully
- [ ] New banner URLs start with your S3 bucket URL

## Quick Command Reference

```bash
# Check status
npm run check:banner-files

# Preview migration
npm run migrate:banners-to-s3 -- --dry-run

# Migrate files
npm run migrate:banners-to-s3

# Migrate and delete local files
npm run migrate:banners-to-s3 -- --delete-local

# Test S3 connection
npm run test:s3
```

## Environment Variables Required

Ensure these are set in your `api/.env` file:

```bash
AWS_S3_ENABLED=true
AWS_REGION=your-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-bucket-name
```

## What About Other Files?

- **Resumes**: Have a similar migration script (`npm run migrate:resumes-to-s3`)
- **JD files**: Can use S3 but have local fallback
- **Other uploads**: Still use local storage by default

If you want to migrate everything to S3, you'll need to handle each file type separately.

## Support

For detailed information, see: `MIGRATE_BANNERS_TO_S3.md`

For S3 setup, see: `S3_SETUP.md`

