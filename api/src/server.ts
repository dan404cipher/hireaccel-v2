// Initialize module aliases first (for production builds)
import './module-alias';

import { env } from '@/config/env';
import { logger, logStartup, logShutdown } from '@/config/logger';
import { connectDatabase, setupDatabaseEventListeners } from '@/config/database';
import { initializeUploadDirectories } from '@/config/multer';
import app from './app';

/**
 * Server startup and initialization
 * Handles database connection, server startup, and graceful shutdown
 */

/**
 * Initialize application services
 */
const initializeServices = async (): Promise<void> => {
  try {
    // Initialize upload directories
    initializeUploadDirectories();
    logger.info('✅ Upload directories initialized');

    // Connect to MongoDB
    setupDatabaseEventListeners();
    await connectDatabase();
    logger.info('✅ Database connected');

    logger.info('🎉 All services initialized successfully');
  } catch (error) {
    logger.error('❌ Failed to initialize services', { error });
    process.exit(1);
  }
};

/**
 * Start the Express server
 */
const startServer = (): void => {
  const server = app.listen(env.PORT, () => {
    logStartup(env.PORT);
    logger.info(`🌍 Server running on http://localhost:${env.PORT}`);
    logger.info(`📚 API Documentation: http://localhost:${env.PORT}/docs`);
    logger.info(`🏥 Health Check: http://localhost:${env.PORT}/health`);
  });

  // Graceful shutdown handlers
  const gracefulShutdown = (signal: string) => {
    logShutdown(signal);
    
    server.close(async () => {
      logger.info('HTTP server closed');
      
      // Close database connection
      const { disconnectDatabase } = await import('@/config/database');
      await disconnectDatabase();
      
      logger.info('👋 Graceful shutdown completed');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      logger.error('⏰ Forced shutdown due to timeout');
      process.exit(1);
    }, 10000);
  };

  // Handle shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('🚨 Unhandled Rejection', {
      reason,
      promise,
    });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('🚨 Uncaught Exception', { error });
    process.exit(1);
  });
};

/**
 * Main application bootstrap
 */
const bootstrap = async (): Promise<void> => {
  try {
    logger.info('🚀 Starting Hire Accel API...');
    
    // Initialize services
    await initializeServices();
    
    // Start HTTP server
    startServer();
    
  } catch (error) {
    logger.error('💥 Failed to start application', { error });
    process.exit(1);
  }
};

// Start the application
bootstrap();
