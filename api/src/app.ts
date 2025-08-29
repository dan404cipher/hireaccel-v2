import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import 'express-async-errors'; // Automatically catches async errors

import { env, isDevelopment } from '@/config/env';
import { requestLogger } from '@/config/logger';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';
import { handleMulterError } from '@/config/multer';

/**
 * Express application setup with middleware configuration
 * Creates a production-ready Express app with security, logging, and error handling
 */

const app = express();

// ============================================================================
// Security Middleware
// ============================================================================

/**
 * Helmet for security headers
 * Helps secure Express apps by setting various HTTP headers
 */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: isDevelopment() ? false : true,
}));

/**
 * CORS configuration
 * Allow requests from frontend origins
 */
app.use(cors({
  origin: env.CORS_ORIGIN.split(',').map(origin => origin.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID', 'X-Total-Count'],
}));

/**
 * Rate limiting (disabled in development)
 * Prevents abuse by limiting requests per IP
 */
if (env.RATE_LIMIT_ENABLED) {
  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    message: {
      type: 'https://httpstatuses.com/429',
      title: 'Too Many Requests',
      status: 429,
      detail: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  app.use(limiter);
}

// ============================================================================
// Parsing Middleware
// ============================================================================

/**
 * Body parsing middleware
 */
app.use(express.json({ 
  limit: '10mb',
  type: ['application/json', 'text/plain']
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

/**
 * Compression middleware
 * Compress responses to reduce bandwidth
 */
app.use(compression());

// ============================================================================
// Logging Middleware
// ============================================================================

/**
 * Request logging
 * Logs all incoming requests with request IDs for tracing
 */
app.use(requestLogger);

// ============================================================================
// Health Check Routes
// ============================================================================

/**
 * Basic health check endpoint
 */
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: process.env['npm_package_version'] || '1.0.0',
    uptime: Math.floor(process.uptime()),
    memory: process.memoryUsage(),
  });
});

/**
 * Detailed health check with database status
 */
app.get('/health/detailed', async (_req, res) => {
  const { checkDatabaseHealth, getDatabaseStatus } = await import('@/config/database');
  
  const dbHealthy = await checkDatabaseHealth();
  const dbStatus = getDatabaseStatus();
  
  res.json({
    status: dbHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: process.env['npm_package_version'] || '1.0.0',
    uptime: Math.floor(process.uptime()),
    memory: process.memoryUsage(),
    database: {
      healthy: dbHealthy,
      ...dbStatus,
    },
  });
});

// ============================================================================
// API Routes
// ============================================================================

/**
 * API routes
 */
import routes from '@/routes';
app.use('/', routes);

// API Documentation
import { specs, swaggerUi, swaggerUiOptions } from '@/config/swagger';

if (env.NODE_ENV === 'development' || env.API_DOCS_ENABLED) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));
  app.get('/docs', (_req, res) => {
    res.redirect('/api-docs');
  });
}

// ============================================================================
// Static File Serving
// ============================================================================

/**
 * Serve uploaded files
 * Files are served with proper security headers
 */
app.use('/uploads', express.static(env.UPLOADS_PATH, {
  maxAge: '1d', // Cache for 1 day
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Set appropriate headers for different file types
    if (path.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
    } else if (path.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      res.setHeader('Content-Type', 'image/*');
    } else if (path.match(/\.(doc|docx)$/)) {
      res.setHeader('Content-Type', 'application/msword');
    }
    
    // Prevent XSS attacks
    res.setHeader('X-Content-Type-Options', 'nosniff');
  },
}));

// ============================================================================
// Error Handling Middleware
// ============================================================================

/**
 * Multer error handler
 * Handles file upload errors specifically
 */
app.use(handleMulterError);

/**
 * 404 handler for unknown routes
 */
app.use(notFoundHandler);

/**
 * Global error handler
 * Catches all errors and returns standardized responses
 */
app.use(errorHandler);

// ============================================================================
// Process Event Handlers
// ============================================================================

/**
 * Graceful shutdown handling
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception thrown:', error);
  process.exit(1);
});

export default app;
