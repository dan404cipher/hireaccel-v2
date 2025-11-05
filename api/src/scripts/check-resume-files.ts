import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { File } from '../models/File';
import { Candidate } from '../models/Candidate';
import { FileCategory } from '../types';

/**
 * Script to check resume files before and after migration
 * Usage: npm run check:resume-files
 */

async function checkResumeFiles() {
  console.log('=== Resume Files Check ===\n');

  // Connect to database
  console.log('Connecting to database...');
  await connectDatabase();
  console.log('✅ Connected to database\n');

  try {
    // Find all resume files
    const allResumeFiles = await File.find({
      $or: [
        { category: FileCategory.RESUME },
      ],
    }).sort({ createdAt: -1 });

    // Find candidates with resumes
    const candidatesWithResumes = await Candidate.find({
      resumeFileId: { $exists: true, $ne: null },
    }).populate('resumeFileId').select('userId resumeFileId');

    console.log(`Total resume files in database: ${allResumeFiles.length}`);
    console.log(`Candidates with resumes: ${candidatesWithResumes.length}\n`);

    // Group by storage provider
    const byStorage: { [key: string]: typeof allResumeFiles } = {};
    allResumeFiles.forEach((file) => {
      const provider = file.storageProvider || 'local';
      if (!byStorage[provider]) {
        byStorage[provider] = [];
      }
      byStorage[provider].push(file);
    });

    console.log('=== Files by Storage Provider ===');
    Object.keys(byStorage).forEach((provider) => {
      console.log(`\n${provider.toUpperCase()}: ${byStorage[provider].length} file(s)`);
      byStorage[provider].forEach((file) => {
        console.log(`  - ${file.originalName} (ID: ${file._id})`);
        console.log(`    Path: ${file.path}`);
        console.log(`    URL: ${file.url}`);
        console.log(`    Size: ${(file.size / 1024).toFixed(2)} KB`);
        console.log(`    Created: ${file.createdAt}`);
      });
    });

    // Check local files
    const localFiles = allResumeFiles.filter(
      (f) => !f.storageProvider || f.storageProvider !== 'aws_s3'
    );
    const s3Files = allResumeFiles.filter((f) => f.storageProvider === 'aws_s3');

    console.log('\n=== Summary ===');
    console.log(`Total files: ${allResumeFiles.length}`);
    console.log(`Local files: ${localFiles.length}`);
    console.log(`S3 files: ${s3Files.length}`);

    // Check candidates
    console.log('\n=== Candidates with Resumes ===');
    for (const candidate of candidatesWithResumes) {
      const resumeFile = candidate.resumeFileId as any;
      if (resumeFile) {
        console.log(`Candidate ID: ${candidate._id}`);
        console.log(`  Resume File: ${resumeFile.originalName}`);
        console.log(`  Storage: ${resumeFile.storageProvider || 'local'}`);
        console.log(`  Path: ${resumeFile.path}`);
      }
    }

  } catch (error) {
    console.error('Error checking resume files:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

checkResumeFiles().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

