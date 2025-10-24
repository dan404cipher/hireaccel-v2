/**
 * Script to create an admin user
 * 
 * This script creates a single admin user with the specified credentials
 * 
 * Usage: npm run create-admin
 */

import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { User } from '../models/User';
import { UserRole, UserStatus } from '../types';
import { hashPassword } from '../utils/password';

// Admin user configuration
const ADMIN_USER = {
  email: 'admin@hireaccel.com',
  password: 'Admin123!',
  firstName: 'Admin',
  lastName: 'User',
  customId: 'ADMIN001',
  role: UserRole.ADMIN,
  status: UserStatus.ACTIVE,
  emailVerified: true,
  phoneNumber: '+1234567890',
  source: 'Email'
};

async function createAdminUser() {
  try {
    // Connect to MongoDB
    logger.info('Connecting to MongoDB...');
    
    if (!env.MONGO_URI) {
      throw new Error('MongoDB URI is not configured');
    }
    
    await mongoose.connect(env.MONGO_URI);
    logger.info('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: ADMIN_USER.email },
        { customId: ADMIN_USER.customId }
      ]
    });

    if (existingAdmin) {
      logger.warn(`Admin user already exists with email: ${existingAdmin.email}`);
      logger.info('Admin user details:');
      logger.info(`- ID: ${existingAdmin._id}`);
      logger.info(`- Email: ${existingAdmin.email}`);
      logger.info(`- Custom ID: ${existingAdmin.customId}`);
      logger.info(`- Role: ${existingAdmin.role}`);
      logger.info(`- Status: ${existingAdmin.status}`);
      logger.info(`- Created: ${existingAdmin.createdAt}`);
      
      // Close connection and exit
      await mongoose.connection.close();
      logger.info('\nScript completed. MongoDB connection closed.');
      process.exit(0);
    }

    // Hash the password
    logger.info('Hashing admin password...');
    const hashedPassword = await hashPassword(ADMIN_USER.password);

    // Create admin user
    logger.info('Creating admin user...');
    const adminUser = new User({
      ...ADMIN_USER,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Save the admin user
    const savedAdmin = await adminUser.save();
    
    logger.info('✅ Admin user created successfully!');
    logger.info('Admin user details:');
    logger.info(`- ID: ${savedAdmin._id}`);
    logger.info(`- Email: ${savedAdmin.email}`);
    logger.info(`- Custom ID: ${savedAdmin.customId}`);
    logger.info(`- Role: ${savedAdmin.role}`);
    logger.info(`- Status: ${savedAdmin.status}`);
    logger.info(`- Email Verified: ${savedAdmin.emailVerified}`);
    logger.info(`- Created: ${savedAdmin.createdAt}`);
    
    logger.info('\n🔐 Login Credentials:');
    logger.info(`Email: ${ADMIN_USER.email}`);
    logger.info(`Password: ${ADMIN_USER.password}`);
    logger.info('\n⚠️  IMPORTANT: Change the password after first login!');

    // Close connection
    await mongoose.connection.close();
    logger.info('\nScript completed successfully. MongoDB connection closed.');
    process.exit(0);

  } catch (error) {
    logger.error('Error creating admin user:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script
createAdminUser();
