// Initialize module aliases first (for production builds)
const moduleAlias = require('module-alias');
const path = require('path');

// Set up aliases for production
const isDist = __dirname.includes('dist');
const sourceRoot = isDist ? __dirname : __dirname;

moduleAlias.addAliases({
  '@': sourceRoot,
  '@/config': path.join(sourceRoot, 'config'),
  '@/models': path.join(sourceRoot, 'models'),
  '@/controllers': path.join(sourceRoot, 'controllers'),
  '@/services': path.join(sourceRoot, 'services'),
  '@/middleware': path.join(sourceRoot, 'middleware'),
  '@/routes': path.join(sourceRoot, 'routes'),
  '@/utils': path.join(sourceRoot, 'utils'),
  '@/types': path.join(sourceRoot, 'types'),
});

import { env } from '@/config/env';
import { logger, logStartup, logShutdown } from '@/config/logger';
import { connectDatabase, setupDatabaseEventListeners } from '@/config/database';
import { initializeUploadDirectories } from '@/config/multer';
import app from './app';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';

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
 * Start the Express server with Socket.IO
 */
const startServer = async (): Promise<void> => {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Initialize Socket.IO
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env['NODE_ENV'] === 'production' 
        ? process.env['CLIENT_URL'] 
        : "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Store io instance globally for use in other modules
  (global as any).io = io;

  // Initialize SocketService
  const { SocketService } = await import('@/services/SocketService');
  const socketService = SocketService.getInstance();
  socketService.initialize(io);

  // Socket.IO authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth['token'];
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify JWT token using the proper JWT utility
      const { verifyAccessToken } = await import('@/utils/jwt');
      const decoded = verifyAccessToken(token);
      
      // Get user from database
      const { User } = await import('@/models/User');
      const user = await User.findById(decoded.userId).select('_id email role status');
      
      if (!user || user.status !== 'active') {
        return next(new Error('Authentication error: User not found or inactive'));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    const user = socket.data.user;
    logger.info(`User connected via Socket.IO: ${user.email} (${user.role})`);

    // Join user to their role-based room
    socket.join(`role:${user.role}`);
    socket.join(`user:${user._id}`);

    // Handle subscription to notifications
    socket.on('subscribe:notifications', () => {
      socket.join('notifications');
      logger.debug(`User ${user.email} subscribed to notifications`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${user.email}`);
    });
  });

  // Start the server
  httpServer.listen(env.PORT, () => {
    logStartup(env.PORT);
    logger.info(`🌍 Server running on http://localhost:${env.PORT}`);
    logger.info(`📚 API Documentation: http://localhost:${env.PORT}/docs`);
    logger.info(`🏥 Health Check: http://localhost:${env.PORT}/health`);
    logger.info(`🔌 Socket.IO server ready for real-time notifications`);
  });

  // Graceful shutdown handlers
  const gracefulShutdown = (signal: string) => {
    logShutdown(signal);
    
    httpServer.close(async () => {
      logger.info('HTTP server closed');
      
      // Close Socket.IO server
      io.close(() => {
        logger.info('Socket.IO server closed');
      });
      
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
