import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

/**
 * Database connection configuration and utilities
 * Handles MongoDB connection with proper error handling and reconnection logic
 */

/**
 * MongoDB connection options for optimal performance and reliability
 */
const connectionOptions: mongoose.ConnectOptions = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  bufferCommands: false, // Disable mongoose buffering
};

/**
 * Connect to MongoDB database
 * Includes retry logic and proper error handling
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    logger.info('Connecting to MongoDB...', { uri: env.MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') });
    
    await mongoose.connect(env.MONGO_URI, connectionOptions);
    
    logger.info('Successfully connected to MongoDB', {
      database: mongoose.connection.db?.databaseName,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
    });
  } catch (error) {
    logger.error('Failed to connect to MongoDB', { error });
    process.exit(1);
  }
};

/**
 * Gracefully disconnect from MongoDB
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB', { error });
  }
};

/**
 * Setup database event listeners for connection monitoring
 */
export const setupDatabaseEventListeners = (): void => {
  // Connection events
  mongoose.connection.on('connected', () => {
    logger.info('Mongoose connected to MongoDB');
  });

  mongoose.connection.on('error', (error) => {
    logger.error('Mongoose connection error', { error });
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('Mongoose disconnected from MongoDB');
  });

  // Handle application termination
  process.on('SIGINT', async () => {
    logger.info('Received SIGINT, closing MongoDB connection...');
    await disconnectDatabase();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, closing MongoDB connection...');
    await disconnectDatabase();
    process.exit(0);
  });
};

/**
 * Health check for database connection
 */
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    const state = mongoose.connection.readyState;
    const isConnected = state === 1; // 1 = connected
    
    if (isConnected) {
      // Perform a simple operation to verify connectivity
      await mongoose.connection.db?.admin().ping();
      return true;
    }
    
    return false;
  } catch (error) {
    logger.error('Database health check failed', { error });
    return false;
  }
};

/**
 * Get database connection status
 */
export const getDatabaseStatus = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  
  return {
    status: states[state as keyof typeof states] || 'unknown',
    database: mongoose.connection.db?.databaseName,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
  };
};
