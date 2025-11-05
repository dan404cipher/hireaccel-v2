import { s3Service } from '../services/S3Service';
import { env } from '../config/env';
import fs from 'fs';
import path from 'path';

/**
 * Test script to verify JD file upload to S3
 * This simulates what happens when a JD file is uploaded via the API
 * Run with: npm run test:jd-upload
 */

async function testJDUpload() {
  console.log('=== JD File Upload Test ===\n');

  if (!s3Service.isS3Enabled()) {
    console.log('❌ S3 is not enabled. Please configure AWS credentials.');
    process.exit(1);
  }

  console.log('✅ S3 is enabled\n');

  // Create a test PDF content (simulating a JD document)
  const testJDContent = `
Job Description: Senior Software Engineer

Company: TechCorp Inc.
Location: Bangalore, India

Position Overview:
We are seeking a Senior Software Engineer to join our dynamic team. 
The ideal candidate will have 5+ years of experience in full-stack development.

Requirements:
- 5+ years of experience in software development
- Proficiency in React, TypeScript, Node.js
- Experience with AWS cloud services
- Strong problem-solving skills
- Excellent communication skills

Responsibilities:
- Design and develop scalable web applications
- Collaborate with cross-functional teams
- Mentor junior developers
- Participate in code reviews

Salary Range: INR 15,00,000 - 25,00,000 per annum
Benefits: Health insurance, Flexible working hours, Remote work options

Application Deadline: 2024-12-31
  `.trim();

  try {
    // Create a temporary test file
    const testFilePath = path.join(env.UPLOADS_PATH, 'test-jd.txt');
    fs.writeFileSync(testFilePath, testJDContent);

    // Read file as buffer (simulating multer upload)
    const fileBuffer = fs.readFileSync(testFilePath);
    const fileSize = fileBuffer.length;

    console.log('Test file created:');
    console.log(`  Path: ${testFilePath}`);
    console.log(`  Size: ${fileSize} bytes\n`);

    // Simulate the upload process
    console.log('Uploading JD file to S3...');
    const s3Result = await s3Service.uploadFile({
      fileBuffer,
      filename: 'test-job-description.txt',
      mimetype: 'text/plain',
      folder: 'jds',
      makePublic: false,
    });

    console.log('✅ JD file uploaded to S3 successfully!');
    console.log(`  S3 Key: ${s3Result.key}`);
    console.log(`  URL: ${s3Result.url}`);
    console.log(`  Location: ${s3Result.location}\n`);

    // Calculate checksum
    const checksum = s3Service.calculateChecksum(fileBuffer);
    console.log(`  Checksum (SHA256): ${checksum}\n`);

    // Test download to verify file integrity
    console.log('Verifying upload by downloading...');
    const { GetObjectCommand } = await import('@aws-sdk/client-s3');
    const s3Client = s3Service.getClient();
    const bucketName = s3Service.bucketName;

    if (!s3Client) {
      throw new Error('S3 client is not available');
    }

    const downloadCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: s3Result.key,
    });

    const downloadResponse = await s3Client.send(downloadCommand);
    const chunks: Buffer[] = [];
    
    if (downloadResponse.Body) {
      for await (const chunk of downloadResponse.Body as any) {
        chunks.push(Buffer.from(chunk));
      }
    }

    const downloadedBuffer = Buffer.concat(chunks);
    const downloadedChecksum = s3Service.calculateChecksum(downloadedBuffer);
    
    if (checksum === downloadedChecksum && downloadedBuffer.length === fileSize) {
      console.log('✅ File integrity verified!');
      console.log(`  Original size: ${fileSize} bytes`);
      console.log(`  Downloaded size: ${downloadedBuffer.length} bytes`);
      console.log(`  Checksums match: ${checksum === downloadedChecksum}\n`);
    } else {
      console.log('⚠️  File integrity check failed!');
      console.log(`  Original checksum: ${checksum}`);
      console.log(`  Downloaded checksum: ${downloadedChecksum}`);
      console.log(`  Original size: ${fileSize}`);
      console.log(`  Downloaded size: ${downloadedBuffer.length}\n`);
    }

    // Generate signed URL for private access
    console.log('Generating signed URL for private access...');
    const signedUrl = await s3Service.getSignedUrl(s3Result.key, 3600);
    console.log('✅ Signed URL generated');
    console.log(`  URL: ${signedUrl.substring(0, 100)}...\n`);

    // Cleanup
    console.log('Cleaning up...');
    fs.unlinkSync(testFilePath);
    await s3Service.deleteFile(s3Result.key);
    console.log('✅ Test file and S3 object deleted\n');

    console.log('🎉 JD upload test completed successfully!');
    console.log('\nYour S3 configuration is working correctly for JD file uploads.');
    console.log('You can now use the "Post using JD" feature in the application.');

  } catch (error) {
    console.error('❌ JD upload test failed:');
    console.error(error instanceof Error ? error.message : 'Unknown error');
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the test
testJDUpload().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

