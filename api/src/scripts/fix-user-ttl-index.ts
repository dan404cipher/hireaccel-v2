/**
 * Script to fix the TTL index issue that was causing users to be deleted
 * 
 * This script drops the dangerous TTL index on refreshTokens.createdAt
 * that was causing entire user documents to be deleted after 7 days
 * 
 * Run this script once after deploying the User model fix
 */

import mongoose from 'mongoose';
import { config } from '../config/env';
import { logger } from '../config/logger';

async function fixUserTTLIndex() {
  try {
    // Connect to MongoDB
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(config.mongodb.uri);
    logger.info('Connected to MongoDB');

    // Get the User collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // List all indexes
    logger.info('Listing current indexes on users collection...');
    const indexes = await usersCollection.indexes();
    logger.info('Current indexes:', JSON.stringify(indexes, null, 2));

    // Find and drop the TTL index if it exists
    const ttlIndexName = 'refreshTokens.createdAt_1';
    const ttlIndexExists = indexes.some(index => index.name === ttlIndexName);

    if (ttlIndexExists) {
      logger.warn(`Found dangerous TTL index: ${ttlIndexName}`);
      logger.info('Dropping TTL index to prevent user deletion...');
      await usersCollection.dropIndex(ttlIndexName);
      logger.info('✅ Successfully dropped the TTL index!');
    } else {
      logger.info('✅ TTL index not found - it may have already been removed');
    }

    // Verify the fix
    logger.info('\nVerifying fix...');
    const updatedIndexes = await usersCollection.indexes();
    const stillExists = updatedIndexes.some(index => index.name === ttlIndexName);
    
    if (!stillExists) {
      logger.info('✅ VERIFIED: TTL index has been successfully removed');
      logger.info('Users will no longer be automatically deleted!');
    } else {
      logger.error('❌ WARNING: TTL index still exists after attempting to drop it');
    }

    // Count total users
    const userCount = await usersCollection.countDocuments();
    logger.info(`\nTotal users in database: ${userCount}`);

    // Close connection
    await mongoose.connection.close();
    logger.info('\nScript completed successfully. MongoDB connection closed.');
    process.exit(0);

  } catch (error) {
    logger.error('Error fixing TTL index:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script
fixUserTTLIndex();

