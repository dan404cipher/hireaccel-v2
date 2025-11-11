# Banner S3 Storage - Quickstart Guide

## 🎯 What You Need to Know

**Banner uploads now use S3 exclusively.** The code is already configured - you just need to migrate existing local files.

## ✅ Current Configuration Status

- ✅ **BannerController**: Already requires S3 for new uploads
- ✅ **Migration Script**: Ready to use
- ✅ **Database Model**: Supports S3 storage tracking
- ✅ **Multer Config**: Uses memory storage for S3 upload

**Result**: New banner uploads will automatically go to S3 (if S3 is enabled). Old banners stored locally need migration.

## 🚀 Quick Migration (3 Steps)

### 1. Check Your Environment

Ensure these are in your `api/.env` file:

```bash
AWS_S3_ENABLED=true
AWS_REGION=us-east-1  # or your region
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_S3_BUCKET_NAME=your-bucket-name
```

### 2. Run Migration Commands

```bash
cd api

# Step 1: Check current status (11 local files found)
npm run check:banner-files

# Step 2: Preview migration (safe, no changes)
npm run migrate:banners-to-s3 -- --dry-run

# Step 3: Migrate to S3
npm run migrate:banners-to-s3

# Step 4: Verify migration
npm run check:banner-files
```

### 3. Clean Up (Optional)

After verifying banners display correctly:

```bash
# Option A: Migrate and delete local files in one step
npm run migrate:banners-to-s3 -- --delete-local

# Option B: Manually delete after migration
rm -rf api/uploads/banners/*
```

## 📊 What Gets Migrated

The script migrates **both types of banner ads**:

1. **Media Ads** (standalone banners)
   - Main media file (image/GIF/video)
   - Example: Hero banner images, promotional videos

2. **Text Ads with Background** (text overlays)
   - Background media file
   - Example: Text ads with image/video backgrounds

## 🔍 Current Local Files

You have **11 banner files** in `api/uploads/banners/`:
- 2 MP4 videos
- 1 JPG image  
- 1 PNG image
- 7 JPEG images

These will all be migrated to S3.

## ⚠️ Important Notes

### Before Migration
- Backup your database (recommended)
- Ensure S3 credentials are correct
- Test S3 connection: `npm run test:s3`

### During Migration
- Migration is **idempotent** (safe to re-run)
- Already migrated banners are automatically skipped
- Failed uploads don't block other files

### After Migration
- Verify banners display in web app (HR & Candidate pages)
- Verify banners display in mobile app
- Test new banner uploads in admin panel
- All new uploads automatically go to S3

## 🎨 How Banner Display Works

### Before Migration
```
User Request → Express Server → Local File System → User
```

### After Migration
```
User Request → S3 URL (direct) → User
```

**Benefits**:
- Faster delivery (no server processing)
- Scalable (no server disk limits)
- CDN-ready (can add CloudFront)
- More reliable (S3 redundancy)

## 🛠️ Troubleshooting

### "S3 service is not enabled"
- Check `.env` has `AWS_S3_ENABLED=true`
- Verify AWS credentials are set
- Test connection: `npm run test:s3`

### "File not found locally"
- File was already deleted or moved
- Migration will skip and continue
- Check `api/uploads/banners/` directory

### Banner URLs not loading after migration
- Check S3 bucket is public or URLs are signed
- Verify CORS settings on S3 bucket
- Check browser console for errors

### New banner uploads failing
- S3 must be enabled for banner uploads
- Check AWS credentials and permissions
- Review API logs for specific error

## 📝 Migration Output Example

```
=== Banner Migration to S3 ===

✅ S3 service is enabled and configured
✅ Connected to database

Found 5 banner(s) with local files

[1/5] Processing Banner: 507f1f77bcf86cd799439011
  Type: media
  Category: hr
  Active: true

  📷 Migrating main media file...
     File: test-banner-1757334748449-xqoein.png
     Size: 1024.50 KB
     📤 Uploading to S3...
     ✅ Uploaded successfully!
        S3 Key: banners/2025/01/test-banner-1757334748449-xqoein.png
        S3 URL: https://your-bucket.s3.us-east-1.amazonaws.com/banners/2025/01/...

  ✅ Banner updated in database

=== Migration Summary ===
Total banners processed: 5
Total files found: 7
✅ Migrated: 7
⚠️  Skipped: 0
❌ Failed: 0

🎉 Migration completed!
```

## 📚 Additional Resources

- **Detailed Guide**: See `MIGRATE_BANNERS_TO_S3.md`
- **S3 Setup**: See `S3_SETUP.md`
- **Quick Summary**: See `BANNER_S3_MIGRATION_SUMMARY.md`

## 🎯 Next Steps

1. **Now**: Run migration to move existing files to S3
2. **Later**: Consider setting up CloudFront CDN for faster delivery
3. **Optional**: Set up S3 lifecycle policies for cost optimization

---

**Need Help?** Check the error logs in `api/logs/` or review the detailed guides.

