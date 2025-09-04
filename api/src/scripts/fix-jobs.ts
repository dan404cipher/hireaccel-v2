import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { Job } from '../models/Job';

const fixJobs = async () => {
  try {
    // Connect to database
    await mongoose.connect(env.MONGO_URI);
    logger.info('Connected to MongoDB');

    // Get all jobs
    const jobs = await Job.find({});
    logger.info(`Found ${jobs.length} jobs`);

    let fixedCount = 0;

    for (const job of jobs) {
      let needsUpdate = false;
      const updates: any = {};

      // Fix jobId field - generate custom ID if missing
      if (!job.jobId) {
        const JobModel = job.constructor as any;
        updates.jobId = await JobModel.generateJobId();
        needsUpdate = true;
        logger.info(`Generating jobId for job: ${job.title}`);
      }

      // Fix experience level field - ensure it's one of the valid enum values
      const validExperienceLevels = ['entry', 'junior', 'mid', 'senior', 'lead', 'executive'];
      if (job.requirements?.experience && !validExperienceLevels.includes(job.requirements.experience)) {
        // Map common invalid values to valid ones
        const experienceMapping: Record<string, string> = {
          'mid-level': 'mid',
          'senior-level': 'senior',
          'junior-level': 'junior',
          'entry-level': 'entry',
          'lead-level': 'lead',
          'executive-level': 'executive',
          'intermediate': 'mid',
          'advanced': 'senior',
          'beginner': 'entry'
        };
        
        const mappedExperience = experienceMapping[job.requirements.experience] || 'mid';
        job.requirements.experience = mappedExperience as any;
        needsUpdate = true;
        logger.info(`Fixing experience level for job: ${job.title} (was: ${job.requirements.experience}, now: ${mappedExperience})`);
      }

      // Apply updates if needed
      if (needsUpdate) {
        Object.assign(job, updates);
        await job.save();
        fixedCount++;
        logger.info(`✅ Fixed job: ${job.title} (${job.jobId})`);
      }
    }

    logger.info(`✅ Fixed ${fixedCount} jobs out of ${jobs.length} total`);

    // Verify the fix by trying to validate all jobs
    const allJobs = await Job.find({});
    let validationErrors = 0;

    for (const job of allJobs) {
      try {
        await job.validate();
      } catch (error: any) {
        validationErrors++;
        logger.error(`Validation error for job ${job.title}:`, error.message);
      }
    }

    if (validationErrors === 0) {
      logger.info('✅ All jobs now pass validation!');
    } else {
      logger.warn(`⚠️  ${validationErrors} jobs still have validation errors`);
    }

  } catch (error) {
    logger.error('Failed to fix jobs:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
};

// Run the fix
fixJobs().catch(console.error);
