/**
 * Fix jobs with past application deadlines
 * Options:
 * 1. Set past deadlines to null (no deadline)
 * 2. Extend them to 30 days from now
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function fixDeadlines() {
  try {
    console.log('🔄 Starting deadline fix...\n');

    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/hire-accel';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const jobsCollection = db.collection('jobs');

    // Find jobs with past deadlines
    const now = new Date();
    const jobsWithPastDeadlines = await jobsCollection.find({
      applicationDeadline: { $lt: now }
    }).toArray();

    console.log(`📊 Found ${jobsWithPastDeadlines.length} jobs with past deadlines\n`);

    if (jobsWithPastDeadlines.length === 0) {
      console.log('✨ All jobs have valid deadlines!\n');
      await mongoose.disconnect();
      return;
    }

    let updatedCount = 0;
    let errorCount = 0;

    // Option: Remove past deadlines (set to null)
    // If you prefer to extend them, uncomment the other option below
    
    for (const job of jobsWithPastDeadlines) {
      const oldDeadline = job.applicationDeadline;
      
      // OPTION 1: Remove deadline (set to null)
      const updateResult = await jobsCollection.updateOne(
        { _id: job._id },
        { $unset: { applicationDeadline: '' } }
      );

      // OPTION 2: Extend deadline by 30 days from now
      // const newDeadline = new Date();
      // newDeadline.setDate(newDeadline.getDate() + 30);
      // const updateResult = await jobsCollection.updateOne(
      //   { _id: job._id },
      //   { $set: { applicationDeadline: newDeadline } }
      // );

      if (updateResult.modifiedCount === 1) {
        console.log(`✅ Fixed: ${job.title} (${job._id})`);
        console.log(`   Old deadline: ${oldDeadline.toISOString()}`);
        console.log(`   Action: Removed deadline\n`);
        updatedCount++;
      } else {
        console.error(`❌ Failed to fix job: ${job.title} (${job._id})\n`);
        errorCount++;
      }
    }

    console.log('============================================================');
    console.log('📊 FIX SUMMARY');
    console.log('============================================================');
    console.log(`✅ Successfully updated: ${updatedCount} jobs`);
    console.log(`❌ Errors: ${errorCount} jobs`);
    console.log(`📝 Total processed: ${jobsWithPastDeadlines.length} jobs`);
    console.log('============================================================\n');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

fixDeadlines();

