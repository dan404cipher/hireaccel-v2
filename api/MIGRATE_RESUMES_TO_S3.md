# Resume Files Migration to S3 - Production Guide

This document provides a comprehensive guide for migrating candidate resume files from local storage to AWS S3. This migration should be performed before deploying to production or when moving to S3-based storage.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Pre-Migration Checklist](#pre-migration-checklist)
4. [Migration Process](#migration-process)
5. [Post-Migration Verification](#post-migration-verification)
6. [Troubleshooting](#troubleshooting)
7. [Rollback Procedure](#rollback-procedure)
8. [Best Practices](#best-practices)

---

## Overview

### What This Migration Does

- **Source**: Local file storage (`uploads/candidate/files/`)
- **Destination**: AWS S3 bucket (`resumes/` folder)
- **Scope**: All candidate resume files (PDFs) stored in the database

### Benefits

- ✅ Centralized cloud storage
- ✅ Improved scalability
- ✅ Better backup and disaster recovery
- ✅ Reduced server disk usage
- ✅ Consistent file access patterns

### Migration Process

1. **Pre-Migration Check**: Verify current state of resume files
2. **Dry Run**: Test migration without making changes
3. **Migration**: Upload files to S3 and update database
4. **Verification**: Confirm all files migrated successfully
5. **Cleanup**: Optionally remove local files (after verification period)

---

## Prerequisites

### 1. Environment Variables

Ensure the following environment variables are set in your `.env` file:

```bash
# AWS S3 Configuration
AWS_S3_ENABLED=true
AWS_REGION=ap-south-1  # or your preferred region
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=your-bucket-name

# Database
MONGO_URI=mongodb://your-connection-string

# File Uploads (for local path resolution)
UPLOADS_PATH=./api/uploads
```

### 2. AWS S3 Setup

- ✅ S3 bucket created and accessible
- ✅ IAM user with S3 permissions (PutObject, GetObject, DeleteObject)
- ✅ Bucket name matches `AWS_S3_BUCKET_NAME` in `.env`
- ✅ S3 service tested and working

### 3. Database Access

- ✅ MongoDB connection string configured
- ✅ Read/write access to `files` and `candidates` collections
- ✅ Database backup created (recommended)

### 4. Required Scripts

The following npm scripts should be available:

```bash
npm run check:resume-files        # Check current state
npm run migrate:resumes-to-s3     # Run migration
```

---

## Pre-Migration Checklist

### Step 1: Verify S3 Configuration

```bash
cd api
npm run test:s3
```

Expected output:
```
✅ S3 service is enabled and configured
✅ Upload successful!
✅ Download successful!
✅ Signed URL generated successfully!
```

### Step 2: Check Current Resume Files

```bash
npm run check:resume-files
```

This will show:
- Total number of resume files
- Files stored locally vs. S3
- File details (size, path, URL)
- Candidates with resume references

**Example Output:**
```
Total resume files in database: 10
Local files: 10
S3 files: 0

=== Files by Storage Provider ===
LOCAL: 10 file(s)
  - resume1.pdf (ID: ...)
    Path: candidate/files/2025/11/resume1.pdf
    Size: 150.25 KB
```

### Step 3: Verify Local Files Exist

Check that local files referenced in the database actually exist:

```bash
# Count files in uploads directory
find api/uploads/candidate -type f -name "*.pdf" | wc -l

# List files
find api/uploads/candidate -type f -name "*.pdf" | head -20
```

### Step 4: Create Database Backup (Recommended)

```bash
# MongoDB backup command (adjust for your setup)
mongodump --uri="your-mongo-uri" --out=./backup-$(date +%Y%m%d-%H%M%S)
```

---

## Migration Process

### Phase 1: Dry Run (MANDATORY)

**Always run a dry run first to preview changes:**

```bash
npm run migrate:resumes-to-s3 -- --dry-run
```

**What to check:**
- ✅ Number of files to be migrated
- ✅ Files that will be skipped (missing locally)
- ✅ Estimated S3 upload paths
- ⚠️ Any errors or warnings

**Expected Output:**
```
Found 10 resume file(s) to migrate

🔍 DRY RUN MODE - No changes will be made

[1/10] Processing: resume1.pdf
  📄 File size: 150.25 KB
  🔍 [DRY RUN] Would upload to S3: resumes/resume1.pdf

=== Migration Summary ===
Total files: 10
✅ Migrated: 9
⚠️  Skipped: 1
❌ Failed: 0
```

### Phase 2: Execute Migration

**Option A: Migration with Local File Retention (RECOMMENDED)**

```bash
npm run migrate:resumes-to-s3
```

This will:
- ✅ Upload files to S3
- ✅ Update database records
- ✅ Keep local files (for safety)

**Option B: Migration with Local File Deletion**

```bash
npm run migrate:resumes-to-s3 -- --delete-local
```

⚠️ **Warning**: Only use this after verifying S3 migration is successful!

**Expected Output:**
```
Found 10 resume file(s) to migrate

[1/10] Processing: resume1.pdf
  📄 File size: 150.25 KB
  📤 Uploading to S3...
  💾 Updating database...
  ✅ Migrated successfully!
     S3 Key: resumes/2025/11/resume1-1762263245226-abc123.pdf
     S3 URL: https://bucket.s3.region.amazonaws.com/resumes/...

=== Migration Summary ===
Total files: 10
✅ Migrated: 9
⚠️  Skipped: 1
❌ Failed: 0
```

### Phase 3: Monitor Progress

During migration, watch for:
- ✅ Successful uploads
- ⚠️ Files skipped (missing locally)
- ❌ Errors (network, permissions, etc.)

Large migrations may take time. Monitor the console output.

---

## Post-Migration Verification

### Step 1: Verify Migration Status

```bash
npm run check:resume-files
```

**Verify:**
- ✅ All expected files are now in S3
- ✅ Database records show `storageProvider: 'aws_s3'`
- ✅ S3 URLs are correct and accessible
- ⚠️ Any files still marked as local

**Expected Output:**
```
=== Files by Storage Provider ===

AWS_S3: 9 file(s)
  - resume1.pdf
    Path: resumes/2025/11/resume1-...pdf
    URL: https://bucket.s3.region.amazonaws.com/...
    Storage: aws_s3

LOCAL: 1 file(s)  # Should match skipped files
```

### Step 2: Test File Access

Manually test accessing a few migrated files:

1. **Via API** (if viewing endpoint exists):
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-api.com/api/v1/files/resume/FILE_ID
   ```

2. **Via S3 URL** (verify file exists):
   - Check S3 console for uploaded files
   - Verify file sizes match

### Step 3: Verify Candidate References

```bash
npm run check:resume-files
```

Check the "Candidates with Resumes" section - all should show `Storage: aws_s3` for migrated files.

### Step 4: Test Application Functionality

- ✅ Candidate profile page loads resumes
- ✅ HR/Admin can view candidate resumes
- ✅ Resume downloads work correctly
- ✅ No 404 errors in application logs

---

## Troubleshooting

### Issue 1: File Not Found Locally

**Symptom:**
```
⚠️  File not found locally: /path/to/file.pdf
```

**Possible Causes:**
- File was manually deleted
- Path mismatch between database and filesystem
- File moved to different location

**Solutions:**
1. Check if file exists with different path:
   ```bash
   find api/uploads -name "*filename*" -type f
   ```
2. If file exists elsewhere, manually update database path
3. If file is missing, mark as skipped (will remain local in DB)

### Issue 2: S3 Upload Failed

**Symptom:**
```
❌ Failed to migrate: S3 service is not enabled
```

**Solutions:**
1. Verify S3 configuration:
   ```bash
   npm run test:s3
   ```
2. Check AWS credentials in `.env`
3. Verify bucket permissions
4. Check network connectivity

### Issue 3: Database Update Failed

**Symptom:**
```
❌ Failed to update database
```

**Solutions:**
1. Check MongoDB connection
2. Verify database permissions
3. Check for duplicate keys or constraints
4. Review database logs

### Issue 4: Partial Migration

**Symptom:**
Some files migrated, others did not.

**Solutions:**
1. Re-run migration (skips already migrated files):
   ```bash
   npm run migrate:resumes-to-s3
   ```
2. Check skipped files list
3. Manually migrate missing files if needed

---

## Rollback Procedure

If migration causes issues, you can rollback:

### Option 1: Database Rollback (If Backup Available)

```bash
# Restore database from backup
mongorestore --uri="your-mongo-uri" ./backup-YYYYMMDD-HHMMSS
```

### Option 2: Manual Rollback

1. **Identify migrated files:**
   ```bash
   npm run check:resume-files
   ```

2. **Update database records:**
   ```javascript
   // MongoDB shell or script
   db.files.updateMany(
     { storageProvider: 'aws_s3', category: 'resume' },
     {
       $set: {
         storageProvider: 'local',
         path: 'original-path',  // Restore original path
         url: 'original-url'      // Restore original URL
       },
       $unset: {
         storageLocation: "",
         checksum: "",
         checksumAlgorithm: ""
       }
     }
   )
   ```

3. **Keep S3 files** (optional - can delete later):
   - Files in S3 don't interfere with local storage
   - Can be cleaned up later via AWS console

---

## Best Practices

### Before Migration

1. ✅ **Always backup database** before migration
2. ✅ **Test S3 configuration** with test script
3. ✅ **Run dry run** to preview changes
4. ✅ **Schedule during low-traffic period** (if possible)
5. ✅ **Monitor disk space** on server

### During Migration

1. ✅ **Monitor console output** for errors
2. ✅ **Don't interrupt the process** once started
3. ✅ **Keep local files** until verification complete
4. ✅ **Document any skipped files** for follow-up

### After Migration

1. ✅ **Verify all files migrated** successfully
2. ✅ **Test application functionality** thoroughly
3. ✅ **Monitor for errors** in application logs
4. ✅ **Keep local files** for 7-30 days (safety period)
5. ✅ **Clean up local files** only after verification period

### Production Deployment

1. ✅ **Run migration in staging** environment first
2. ✅ **Test thoroughly** before production
3. ✅ **Schedule maintenance window** if needed
4. ✅ **Have rollback plan** ready
5. ✅ **Document migration** for future reference

---

## Migration Commands Quick Reference

```bash
# 1. Check current state
npm run check:resume-files

# 2. Test S3 configuration
npm run test:s3

# 3. Dry run (preview changes)
npm run migrate:resumes-to-s3 -- --dry-run

# 4. Execute migration (keep local files)
npm run migrate:resumes-to-s3

# 5. Execute migration (delete local files - USE WITH CAUTION)
npm run migrate:resumes-to-s3 -- --delete-local

# 6. Verify migration
npm run check:resume-files
```

---

## Migration Script Details

### check-resume-files.ts

**Purpose**: Check current state of resume files in database

**Output:**
- Total resume files count
- Files grouped by storage provider (local/S3)
- File details (size, path, URL, creation date)
- Candidates with resume references

**Usage:**
```bash
npm run check:resume-files
```

### migrate-resumes-to-s3.ts

**Purpose**: Migrate resume files from local storage to S3

**Options:**
- `--dry-run`: Preview changes without making them
- `--delete-local`: Delete local files after successful migration

**Process:**
1. Finds all local resume files
2. Reads file from local storage
3. Uploads to S3 (`resumes/` folder)
4. Updates database with S3 information
5. Optionally deletes local file

**Output:**
- Progress for each file
- Summary statistics
- Error details for failed files

**Usage:**
```bash
# Dry run
npm run migrate:resumes-to-s3 -- --dry-run

# Execute migration
npm run migrate:resumes-to-s3

# Execute with local file deletion
npm run migrate:resumes-to-s3 -- --delete-local
```

---

## Expected Migration Times

| Files | Estimated Time | Notes |
|-------|---------------|-------|
| 1-10 | < 1 minute | Quick migration |
| 10-50 | 1-5 minutes | Medium migration |
| 50-100 | 5-15 minutes | Large migration |
| 100+ | 15+ minutes | Very large migration |

*Times vary based on file sizes and network speed*

---

## Support and Maintenance

### Regular Checks

Run monthly to verify file integrity:
```bash
npm run check:resume-files
```

### Monitoring

Monitor for:
- New local resume files (should be rare after migration)
- S3 access errors
- Database inconsistencies

### Updates

If file structure changes, update scripts accordingly:
- `api/src/scripts/check-resume-files.ts`
- `api/src/scripts/migrate-resumes-to-s3.ts`

---

## Version History

- **v1.0** (2025-11-04): Initial migration script and documentation
  - Support for local to S3 migration
  - Dry run capability
  - Verification script

---

## Notes

- Files are stored in S3 with private access (not public)
- Original filenames are preserved in `originalName` field
- S3 keys include timestamp to prevent conflicts
- Checksums are calculated and stored for integrity verification
- Local files are kept by default for safety (can be deleted manually)

---

## Contact

For issues or questions about this migration:
- Check application logs
- Review AWS S3 console
- Verify database records
- Contact DevOps team if needed

---

**Last Updated**: November 4, 2025  
**Migration Version**: 1.0

