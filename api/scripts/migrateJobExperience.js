/**
 * Migration Script: Convert old experience format to experienceMin/Max
 * 
 * Old format: requirements.experience = "junior" | "mid" | "senior" | "expert"
 * New format: requirements.experienceMin = number, requirements.experienceMax = number
 * 
 * Usage: node scripts/migrateJobExperience.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Experience level mapping
const EXPERIENCE_MAPPING = {
  'entry': { min: 0, max: 2 },
  'junior': { min: 0, max: 2 },
  'fresher': { min: 0, max: 1 },
  'mid': { min: 2, max: 5 },
  'intermediate': { min: 2, max: 5 },
  'senior': { min: 5, max: 10 },
  'expert': { min: 10, max: 15 },
  'lead': { min: 10, max: 15 },
  'principal': { min: 12, max: 20 },
};

async function migrateJobs() {
  try {
    console.log('🔄 Starting job experience migration...\n');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/hire-accel';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get the jobs collection
    const db = mongoose.connection.db;
    const jobsCollection = db.collection('jobs');

    // Find all jobs with old experience format
    const jobsWithOldFormat = await jobsCollection.find({
      'requirements.experience': { $exists: true, $type: 'string' }
    }).toArray();

    console.log(`📊 Found ${jobsWithOldFormat.length} jobs with old experience format\n`);

    if (jobsWithOldFormat.length === 0) {
      console.log('✨ No jobs to migrate. All jobs are up to date!');
      await mongoose.disconnect();
      return;
    }

    // Statistics
    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    // Migrate each job
    for (const job of jobsWithOldFormat) {
      try {
        const experienceLevel = job.requirements?.experience?.toLowerCase();
        
        if (!experienceLevel) {
          console.log(`⚠️  Skipping job ${job._id} - No experience level found`);
          skipped++;
          continue;
        }

        const mapping = EXPERIENCE_MAPPING[experienceLevel];

        if (!mapping) {
          console.log(`⚠️  Skipping job ${job._id} - Unknown experience level: "${experienceLevel}"`);
          console.log(`    Available levels: ${Object.keys(EXPERIENCE_MAPPING).join(', ')}`);
          skipped++;
          continue;
        }

        // Update the job
        const result = await jobsCollection.updateOne(
          { _id: job._id },
          {
            $set: {
              'requirements.experienceMin': mapping.min,
              'requirements.experienceMax': mapping.max,
              updatedAt: new Date()
            },
            $unset: {
              'requirements.experience': ''
            }
          }
        );

        if (result.modifiedCount > 0) {
          console.log(`✅ Migrated: ${job.title || 'Untitled'} (${job._id})`);
          console.log(`   ${experienceLevel} → experienceMin: ${mapping.min}, experienceMax: ${mapping.max}`);
          migrated++;
        } else {
          console.log(`⚠️  No changes for: ${job.title || 'Untitled'} (${job._id})`);
          skipped++;
        }

      } catch (error) {
        console.error(`❌ Error migrating job ${job._id}:`, error.message);
        errors++;
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully migrated: ${migrated} jobs`);
    console.log(`⚠️  Skipped: ${skipped} jobs`);
    console.log(`❌ Errors: ${errors} jobs`);
    console.log(`📝 Total processed: ${jobsWithOldFormat.length} jobs`);
    console.log('='.repeat(60) + '\n');

    // Verify migration
    const remainingOldFormat = await jobsCollection.countDocuments({
      'requirements.experience': { $exists: true, $type: 'string' }
    });

    if (remainingOldFormat === 0) {
      console.log('🎉 Migration completed successfully! All jobs updated.');
    } else {
      console.log(`⚠️  Warning: ${remainingOldFormat} jobs still have old format. Review skipped jobs.`);
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateJobs()
  .then(() => {
    console.log('\n✨ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  });

