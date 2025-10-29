/**
 * Check all jobs in the database
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function checkJobs() {
  try {
    console.log('🔍 Checking all jobs in database...\n');
    
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/hire-accel';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const jobsCollection = db.collection('jobs');

    // Get total count
    const totalJobs = await jobsCollection.countDocuments();
    console.log(`📊 Total jobs in database: ${totalJobs}\n`);

    // Jobs with new format (experienceMin/Max)
    const jobsWithNewFormat = await jobsCollection.countDocuments({
      'requirements.experienceMin': { $exists: true }
    });
    console.log(`✅ Jobs with new format (experienceMin): ${jobsWithNewFormat}`);

    // Jobs with old format (experience as string)
    const jobsWithOldFormat = await jobsCollection.countDocuments({
      'requirements.experience': { $exists: true, $type: 'string' }
    });
    console.log(`⚠️  Jobs with old format (experience): ${jobsWithOldFormat}`);

    // Jobs without requirements at all
    const jobsWithoutRequirements = await jobsCollection.countDocuments({
      requirements: { $exists: false }
    });
    console.log(`❌ Jobs without requirements field: ${jobsWithoutRequirements}`);

    // Jobs with requirements but no experience data
    const jobsWithRequirementsNoExp = await jobsCollection.countDocuments({
      requirements: { $exists: true },
      'requirements.experienceMin': { $exists: false },
      'requirements.experience': { $exists: false }
    });
    console.log(`⚠️  Jobs with requirements but no experience: ${jobsWithRequirementsNoExp}\n`);

    // Show the 5 jobs that weren't migrated
    const unmigrated = totalJobs - jobsWithNewFormat;
    if (unmigrated > 0) {
      console.log(`🔍 Checking ${unmigrated} jobs that weren't migrated:\n`);
      
      const jobs = await jobsCollection.find({
        'requirements.experienceMin': { $exists: false }
      }).limit(10).toArray();

      jobs.forEach((job, index) => {
        console.log(`${index + 1}. ${job.title || 'Untitled'} (${job._id})`);
        console.log(`   Requirements:`, JSON.stringify(job.requirements, null, 2));
        console.log('');
      });
    }

    await mongoose.disconnect();
    console.log('✅ Done!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkJobs();

