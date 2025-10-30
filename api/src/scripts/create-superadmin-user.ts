/**
 * Script to create a superadmin user
 * 
 * This script creates a single superadmin user with the specified credentials
 * 
 * Usage: npm run create-superadmin
 */

import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { User } from '../models/User';
import { UserRole, UserStatus } from '../types';
import { hashPassword } from '../utils/password';

// SuperAdmin user configuration
const SUPERADMIN_USER = {
  email: 'venkat.ceo@v-accel.ai',
  password: 'SuperAdmin123!',
  firstName: 'Super',
  lastName: 'Admin',
  customId: 'SUPERADMIN001',
  role: UserRole.SUPERADMIN,
  status: UserStatus.ACTIVE,
  emailVerified: true,
  phoneNumber: '+918754453361',
  source: 'Email'
};

async function createSuperAdminUser() {
  try {
    // Connect to MongoDB
    logger.info('Connecting to MongoDB...');
    
    if (!env.MONGO_URI) {
      throw new Error('MongoDB URI is not configured');
    }
    
    await mongoose.connect(env.MONGO_URI);
    logger.info('Connected to MongoDB');

    // Check if superadmin user already exists
    const existingSuperAdmin = await User.findOne({ 
      $or: [
        { email: SUPERADMIN_USER.email },
        { customId: SUPERADMIN_USER.customId },
        { role: UserRole.SUPERADMIN }
      ]
    });

    if (existingSuperAdmin) {
      logger.warn(`Super Admin user already exists with email: ${existingSuperAdmin.email}`);
      logger.info('Super Admin user details:');
      logger.info(`- ID: ${existingSuperAdmin._id}`);
      logger.info(`- Email: ${existingSuperAdmin.email}`);
      logger.info(`- Custom ID: ${existingSuperAdmin.customId}`);
      logger.info(`- Role: ${existingSuperAdmin.role}`);
      logger.info(`- Status: ${existingSuperAdmin.status}`);
      logger.info(`- Created: ${existingSuperAdmin.createdAt}`);
      
      // Close connection and exit
      await mongoose.connection.close();
      logger.info('\nScript completed. MongoDB connection closed.');
      process.exit(0);
    }

    // Hash the password
    logger.info('Hashing superadmin password...');
    const hashedPassword = await hashPassword(SUPERADMIN_USER.password);

    // Create superadmin user
    logger.info('Creating superadmin user...');
    const superAdminUser = new User({
      ...SUPERADMIN_USER,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Save the superadmin user
    const savedSuperAdmin = await superAdminUser.save();
    
    logger.info('✅ Super Admin user created successfully!');
    logger.info('Super Admin user details:');
    logger.info(`- ID: ${savedSuperAdmin._id}`);
    logger.info(`- Email: ${savedSuperAdmin.email}`);
    logger.info(`- Custom ID: ${savedSuperAdmin.customId}`);
    logger.info(`- Role: ${savedSuperAdmin.role}`);
    logger.info(`- Status: ${savedSuperAdmin.status}`);
    logger.info(`- Email Verified: ${savedSuperAdmin.emailVerified}`);
    logger.info(`- Created: ${savedSuperAdmin.createdAt}`);
    
    logger.info('\n🔐 Login Credentials:');
    logger.info(`Email: ${SUPERADMIN_USER.email}`);
    logger.info(`Password: ${SUPERADMIN_USER.password}`);
    logger.info('\n⚠️  IMPORTANT: Change the password after first login!');
    logger.info('\n📝 The superadmin user can:');
    logger.info('- Access all admin screens');
    logger.info('- Create and manage admin users');
    logger.info('- Manage all system resources');

    // Close connection
    await mongoose.connection.close();
    logger.info('\nScript completed successfully. MongoDB connection closed.');
    process.exit(0);

  } catch (error) {
    logger.error('Error creating superadmin user:', error);
    console.error('Full error details:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script
createSuperAdminUser();

