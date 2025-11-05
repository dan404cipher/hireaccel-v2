# Quick Migration Guide

For detailed documentation, see [MIGRATE_RESUMES_TO_S3.md](../../MIGRATE_RESUMES_TO_S3.md)

## Quick Start

```bash
# 1. Check current state
npm run check:resume-files

# 2. Test S3 (if not already done)
npm run test:s3

# 3. Dry run (preview changes)
npm run migrate:resumes-to-s3 -- --dry-run

# 4. Execute migration
npm run migrate:resumes-to-s3

# 5. Verify migration
npm run check:resume-files
```

## Production Checklist

- [ ] Database backup created
- [ ] S3 configuration tested (`npm run test:s3`)
- [ ] Dry run completed successfully
- [ ] Migration executed
- [ ] Verification completed
- [ ] Application tested
- [ ] Local files kept for safety period

## Troubleshooting

**File not found**: Check file exists locally, may need manual path update  
**S3 upload failed**: Verify AWS credentials and permissions  
**Database update failed**: Check MongoDB connection and permissions

See full documentation for detailed troubleshooting steps.

