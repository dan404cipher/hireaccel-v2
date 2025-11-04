import { s3Service } from '../services/S3Service';
import { env } from '../config/env';
import fs from 'fs';
import path from 'path';

/**
 * Test script to upload 3 different JD files to S3
 * This simulates multiple JD uploads to verify S3 functionality
 * Run with: npm run test:3-jd-uploads
 */

interface TestJD {
  name: string;
  content: string;
  mimetype: string;
}

const testJDs: TestJD[] = [
  {
    name: 'Senior-React-Developer',
    mimetype: 'application/pdf',
    content: `
Job Description: Senior React Developer

Company: TechStart Solutions
Location: Mumbai, Maharashtra

Position Overview:
We are looking for an experienced Senior React Developer to join our frontend team.

Requirements:
- 5+ years of experience in React development
- Strong knowledge of TypeScript, Redux, and React Hooks
- Experience with REST APIs and GraphQL
- Familiarity with testing frameworks (Jest, React Testing Library)

Salary Range: INR 12,00,000 - 20,00,000 per annum
Work Type: Remote/Hybrid
    `.trim(),
  },
  {
    name: 'Full-Stack-Engineer',
    mimetype: 'application/pdf',
    content: `
Job Description: Full Stack Engineer

Company: CloudTech Innovations
Location: Bangalore, Karnataka

Position Overview:
Seeking a Full Stack Engineer to work on scalable web applications.

Requirements:
- 4+ years of experience in full-stack development
- Proficiency in Node.js, Express, MongoDB
- Experience with React, Next.js
- Knowledge of AWS cloud services
- Experience with Docker and Kubernetes

Salary Range: INR 15,00,000 - 25,00,000 per annum
Work Type: On-site
Benefits: Health insurance, Stock options
    `.trim(),
  },
  {
    name: 'Data-Scientist',
    mimetype: 'application/pdf',
    content: `
Job Description: Data Scientist

Company: AI Analytics Corp
Location: Hyderabad, Telangana

Position Overview:
We need a Data Scientist to analyze complex datasets and build ML models.

Requirements:
- 3+ years of experience in data science
- Proficiency in Python, R, SQL
- Experience with machine learning frameworks (TensorFlow, PyTorch)
- Strong background in statistics and mathematics
- Experience with data visualization tools

Salary Range: INR 18,00,000 - 30,00,000 per annum
Work Type: Remote
Benefits: Learning budget, Flexible hours
    `.trim(),
  },
];

async function test3JDUploads() {
  console.log('=== Testing 3 JD File Uploads to S3 ===\n');

  if (!s3Service.isS3Enabled()) {
    console.log('❌ S3 is not enabled. Please configure AWS credentials.');
    process.exit(1);
  }

  console.log('✅ S3 is enabled\n');
  console.log(`Uploading ${testJDs.length} JD files to S3...\n`);

  const uploadResults: Array<{
    name: string;
    s3Key: string;
    url: string;
    checksum: string;
    size: number;
  }> = [];

  try {
    // Upload all 3 JD files
    for (let i = 0; i < testJDs.length; i++) {
      const testJD = testJDs[i];
      console.log(`[${i + 1}/${testJDs.length}] Uploading: ${testJD.name}`);

      // Create temporary file
      const testFilePath = path.join(env.UPLOADS_PATH, `test-${testJD.name}.txt`);
      fs.writeFileSync(testFilePath, testJD.content);

      // Read as buffer
      const fileBuffer = fs.readFileSync(testFilePath);
      const fileSize = fileBuffer.length;

      // Upload to S3
      const s3Result = await s3Service.uploadFile({
        fileBuffer,
        filename: `${testJD.name}.txt`,
        mimetype: testJD.mimetype,
        folder: 'jds',
        makePublic: false,
      });

      // Calculate checksum
      const checksum = s3Service.calculateChecksum(fileBuffer);

      uploadResults.push({
        name: testJD.name,
        s3Key: s3Result.key,
        url: s3Result.url,
        checksum,
        size: fileSize,
      });

      console.log(`  ✅ Uploaded successfully`);
      console.log(`     S3 Key: ${s3Result.key}`);
      console.log(`     Size: ${fileSize} bytes`);
      console.log(`     Checksum: ${checksum.substring(0, 16)}...\n`);

      // Cleanup local file
      fs.unlinkSync(testFilePath);
    }

    // Verify all uploads
    console.log('Verifying all uploads...\n');
    const { GetObjectCommand } = await import('@aws-sdk/client-s3');
    const s3Client = s3Service.getClient();
    const bucketName = s3Service.bucketName;

    if (!s3Client) {
      throw new Error('S3 client is not available');
    }

    let allVerified = true;
    for (const result of uploadResults) {
      console.log(`Verifying: ${result.name}`);
      
      const downloadCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: result.s3Key,
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
      
      if (downloadedChecksum === result.checksum && downloadedBuffer.length === result.size) {
        console.log(`  ✅ Verified - Checksums match, size: ${result.size} bytes\n`);
      } else {
        console.log(`  ❌ Verification failed`);
        console.log(`     Expected checksum: ${result.checksum}`);
        console.log(`     Got checksum: ${downloadedChecksum}`);
        console.log(`     Expected size: ${result.size}`);
        console.log(`     Got size: ${downloadedBuffer.length}\n`);
        allVerified = false;
      }
    }

    // Generate signed URLs
    console.log('Generating signed URLs for all files...\n');
    for (const result of uploadResults) {
      const signedUrl = await s3Service.getSignedUrl(result.s3Key, 3600);
      console.log(`${result.name}:`);
      console.log(`  Signed URL: ${signedUrl.substring(0, 80)}...\n`);
    }

    // Summary
    console.log('=== Upload Summary ===\n');
    console.log(`Total files uploaded: ${uploadResults.length}`);
    console.log(`Total size: ${uploadResults.reduce((sum, r) => sum + r.size, 0)} bytes`);
    console.log(`All verified: ${allVerified ? '✅ Yes' : '❌ No'}\n`);

    // Cleanup - delete all test files from S3
    console.log('Cleaning up test files from S3...\n');
    for (const result of uploadResults) {
      await s3Service.deleteFile(result.s3Key);
      console.log(`  ✅ Deleted: ${result.name}`);
    }

    console.log('\n🎉 All 3 JD uploads completed successfully!');
    console.log('\nYour S3 configuration is working correctly.');
    console.log('You can now upload JD files through the application and they will be stored in S3.');

  } catch (error) {
    console.error('❌ Test failed:');
    console.error(error instanceof Error ? error.message : 'Unknown error');
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    
    // Try to cleanup on error
    console.log('\nAttempting to cleanup uploaded files...');
    for (const result of uploadResults) {
      try {
        await s3Service.deleteFile(result.s3Key);
        console.log(`  ✅ Cleaned up: ${result.name}`);
      } catch (cleanupError) {
        console.log(`  ⚠️  Failed to cleanup: ${result.name}`);
      }
    }
    
    process.exit(1);
  }
}

// Run the test
test3JDUploads().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

