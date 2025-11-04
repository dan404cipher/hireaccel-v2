import { s3Service } from '../services/S3Service';
import { env } from '../config/env';
import { logger } from '../config/logger';

/**
 * Test script to verify S3 configuration and upload
 * Run with: npm run test:s3
 */

async function testS3Upload() {
  console.log('=== S3 Configuration Test ===\n');

  // Check environment variables
  console.log('Environment Variables:');
  console.log(`  AWS_S3_ENABLED: ${env.AWS_S3_ENABLED}`);
  console.log(`  AWS_REGION: ${env.AWS_REGION || 'NOT SET'}`);
  console.log(`  AWS_ACCESS_KEY_ID: ${env.AWS_ACCESS_KEY_ID ? 'SET' : 'NOT SET'}`);
  console.log(`  AWS_SECRET_ACCESS_KEY: ${env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET'}`);
  console.log(`  AWS_S3_BUCKET_NAME: ${env.AWS_S3_BUCKET_NAME || 'NOT SET'}`);
  console.log('');

  // Check if S3 is enabled
  if (!env.AWS_S3_ENABLED) {
    console.log('❌ S3 is disabled. Set AWS_S3_ENABLED=true in .env file');
    process.exit(1);
  }

  if (!s3Service.isS3Enabled()) {
    console.log('❌ S3 service is not properly configured');
    console.log('   Please check your AWS credentials and bucket name');
    process.exit(1);
  }

  console.log('✅ S3 service is enabled and configured\n');

  // Test upload
  console.log('Testing S3 upload...');
  try {
    const testContent = `Test JD File - ${new Date().toISOString()}\n\nThis is a test job description file to verify S3 upload functionality.`;
    const testBuffer = Buffer.from(testContent, 'utf-8');

    const result = await s3Service.uploadFile({
      fileBuffer: testBuffer,
      filename: 'test-jd.txt',
      mimetype: 'text/plain',
      folder: 'jds',
      makePublic: false,
    });

    console.log('✅ Upload successful!');
    console.log(`  S3 Key: ${result.key}`);
    console.log(`  URL: ${result.url}`);
    console.log(`  Location: ${result.location}\n`);

    // Test download (via GetObjectCommand)
    console.log('Testing S3 download...');
    const { GetObjectCommand } = await import('@aws-sdk/client-s3');
    const s3Client = s3Service.getClient();
    const bucketName = s3Service.bucketName;

    if (!s3Client) {
      throw new Error('S3 client is not available');
    }

    const downloadCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: result.key,
    });

    const downloadResponse = await s3Client.send(downloadCommand);
    const chunks: Buffer[] = [];
    
    if (downloadResponse.Body) {
      for await (const chunk of downloadResponse.Body as any) {
        chunks.push(Buffer.from(chunk));
      }
    }

    const downloadedContent = Buffer.concat(chunks).toString('utf-8');
    console.log('✅ Download successful!');
    console.log(`  Downloaded content: ${downloadedContent.substring(0, 100)}...\n`);

    // Test signed URL generation
    console.log('Testing signed URL generation...');
    const signedUrl = await s3Service.getSignedUrl(result.key, 3600);
    console.log('✅ Signed URL generated successfully!');
    console.log(`  Signed URL: ${signedUrl.substring(0, 100)}...\n`);

    // Cleanup - delete test file
    console.log('Cleaning up test file...');
    await s3Service.deleteFile(result.key);
    console.log('✅ Test file deleted successfully!\n');

    console.log('🎉 All S3 tests passed!');
    console.log('\nYour S3 configuration is working correctly.');
    console.log('You can now upload JD files and they will be stored in S3.');

  } catch (error) {
    console.error('❌ S3 test failed:');
    console.error(error instanceof Error ? error.message : 'Unknown error');
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the test
testS3Upload().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

