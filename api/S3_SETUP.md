# AWS S3 Configuration for File Storage

This document explains how to configure AWS S3 for storing application files including Job Descriptions (JDs), banners, and resumes.

## Environment Variables

Add the following variables to your `.env` file in the `api` directory:

```env
# AWS S3 Configuration
AWS_S3_ENABLED=true
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_S3_BUCKET_NAME=your-bucket-name
```

### Configuration Details

- **AWS_S3_ENABLED**: Set to `true` to enable S3 storage, `false` to use local storage (default)
- **AWS_REGION**: AWS region where your S3 bucket is located (e.g., `us-east-1`, `ap-south-1`)
- **AWS_ACCESS_KEY_ID**: Your AWS access key ID
- **AWS_SECRET_ACCESS_KEY**: Your AWS secret access key
- **AWS_S3_BUCKET_NAME**: Name of your S3 bucket

## AWS Setup Steps

### 1. Create an S3 Bucket

1. Log in to AWS Console
2. Navigate to S3 service
3. Click "Create bucket"
4. Choose a unique bucket name
5. Select your preferred region
6. Configure bucket settings:
   - **Block Public Access**: Keep enabled for security (JD files are private)
   - **Versioning**: Optional, but recommended
   - **Encryption**: Enable server-side encryption (SSE-S3 or SSE-KMS)

### 2. Create IAM User and Access Keys

1. Navigate to IAM service in AWS Console
2. Click "Users" → "Add users"
3. Create a user with programmatic access
4. Attach a policy with the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name"
    }
  ]
}
```

5. Save the Access Key ID and Secret Access Key securely

### 3. Bucket Policy (Optional)

If you want to restrict access further, you can add a bucket policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowApplicationAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR_ACCOUNT_ID:user/YOUR_IAM_USER"
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

## File Storage Structure

Files are organized in S3 by type with the following structure:

### Banners
```
banners/
  {YYYY}/
    {MM}/
      {filename}-{timestamp}-{random}.{ext}
```

### Job Descriptions (JDs)
```
jds/
  {YYYY}/
    {MM}/
      {filename}-{timestamp}-{random}.pdf
```

### Resumes
```
resumes/
  {YYYY}/
    {MM}/
      {filename}-{timestamp}-{random}.pdf
```

Example:
```
banners/
  2025/
    01/
      hero-banner-1704067200000-abc123.jpg
      text-ad-bg-1704067300000-def456.mp4

jds/
  2024/
    01/
      job-description-1704067200000-abc123.pdf

resumes/
  2024/
    12/
      john-doe-resume-1704067200000-xyz789.pdf
```

## How It Works

### Banner Files (S3 Required)
Banners MUST use S3 storage - local storage is not supported:
1. **Upload**: Admin uploads banner via admin panel
2. **Processing**: File is stored in memory buffer
3. **S3 Upload**: File is uploaded to S3 `banners/` folder
4. **Database**: Banner record is saved with S3 URL and metadata
5. **Display**: Banners are served directly from S3 URLs

### Job Description Files (S3 with Local Fallback)
1. **Upload Flow**:
   - User uploads JD file via the "Post using JD" button or inline upload
   - File is stored in memory (buffer)
   - If S3 is enabled, file is uploaded to S3
   - File metadata is saved to database with `storageProvider: 'aws_s3'`
   - Local temporary file is cleaned up

2. **Parsing Flow**:
   - When parsing JD, system checks `storageProvider`
   - If S3: Downloads file from S3 to temporary location
   - Extracts text, parses with OpenAI
   - Cleans up temporary file

3. **Job Creation**:
   - When creating job with `jdFileId`, the JD file reference is stored
   - File remains in S3, accessible via the stored file ID

### Resume Files (S3 Preferred)
Similar to JD files, with migration available:
- Use S3 if enabled, fall back to local storage if needed
- Migration script available: `npm run migrate:resumes-to-s3`

## Fallback Behavior

### Banners
**No fallback** - Banners require S3:
- If S3 is not enabled, banner uploads will fail with an error
- This ensures consistent banner delivery across all environments
- To enable banner uploads, S3 must be properly configured

### JDs and Resumes
If S3 upload fails:
- System automatically falls back to local storage
- Error is logged but doesn't block the upload
- Files are stored locally in respective directories (`./api/uploads/`)

## Migration to S3

If you have existing files stored locally, migration scripts are available:

```bash
# Migrate banners to S3 (recommended - banners require S3 for new uploads)
npm run migrate:banners-to-s3

# Migrate resumes to S3 (optional - resumes have local fallback)
npm run migrate:resumes-to-s3

# Check current storage status
npm run check:banner-files
npm run check:resume-files
```

See `MIGRATE_BANNERS_TO_S3.md` and `MIGRATE_RESUMES_TO_S3.md` for detailed migration guides.

## Testing

```bash
# Test S3 connection and upload
npm run test:s3

# Test JD upload with S3
npm run test:jd-upload

# Check banner storage status
npm run check:banner-files

# Check resume storage status
npm run check:resume-files
```

Configuration testing:
1. Set `AWS_S3_ENABLED=false` to test with local storage (JDs/resumes only)
2. Set `AWS_S3_ENABLED=true` with valid credentials to test S3 upload
3. Check logs for S3 upload confirmations or errors
4. Note: Banners require `AWS_S3_ENABLED=true` to function

## Security Best Practices

1. **Never commit credentials to git** - Use environment variables
2. **Use IAM roles** in production (instead of access keys when possible)
3. **Enable S3 bucket encryption**
4. **Use bucket policies** to restrict access
5. **Enable CloudTrail** for audit logging
6. **Set up lifecycle policies** for automatic cleanup of old files

## Troubleshooting

### S3 Upload Fails
- Check AWS credentials are correct
- Verify bucket name and region
- Check IAM user has necessary permissions
- Review AWS CloudWatch logs

### Files Not Accessible
- Verify bucket policy allows access
- Check file keys are correct in database
- Ensure signed URLs are generated correctly (for private files)

### High Costs
- Set up S3 lifecycle policies to archive old files
- Consider using S3 Intelligent-Tiering
- Monitor usage in AWS Cost Explorer

