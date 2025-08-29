import pino from 'pino';
import { env, isDevelopment } from './env';

/**
 * Logger configuration using Pino for structured logging
 * Provides consistent logging throughout the application
 */

/**
 * Create logger instance with environment-specific configuration
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  
  // Pretty print in development for better readability
  ...(isDevelopment() && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname,environment,service,requestId,method,url,userAgent,ip',
        singleLine: true,
        messageFormat: '{msg}',
      },
    },
  }),

  // Structured logging in production
  ...(!isDevelopment() && {
    formatters: {
      level: (label) => ({ level: label.toUpperCase() }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  }),

  // Base fields to include in all logs
  base: {
    pid: process.pid,
    environment: env.NODE_ENV,
    service: 'hire-accel-api',
  },

  // Serialize errors properly
  serializers: {
    error: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
});

/**
 * Create a child logger with additional context
 * Useful for adding request IDs, user IDs, etc.
 */
export const createChildLogger = (context: Record<string, any>) => {
  return logger.child(context);
};

/**
 * Express middleware for clean request logging
 */
export const requestLogger = (req: any, res: any, next: any) => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Add request ID to headers for tracing
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  // Simple console logging for development
  if (isDevelopment()) {
    // Clean terminal output - just like Express
    console.log(`\x1b[36m${new Date().toLocaleTimeString()}\x1b[0m \x1b[33m${req.method}\x1b[0m ${req.url}`);
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const statusColor = res.statusCode >= 400 ? '\x1b[31m' : res.statusCode >= 300 ? '\x1b[33m' : '\x1b[32m';
      console.log(`\x1b[36m${new Date().toLocaleTimeString()}\x1b[0m ${statusColor}${res.statusCode}\x1b[0m \x1b[33m${req.method}\x1b[0m ${req.url} - ${duration}ms`);
    });
  } else {
    // Use structured logging in production
    req.logger = createChildLogger({
      requestId,
      method: req.method,
      url: req.url,
    });

    req.logger.info(`${req.method} ${req.url}`);

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const logLevel = res.statusCode >= 400 ? 'error' : 'info';
      req.logger[logLevel](`${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    });
  }

  next();
};

/**
 * Log application startup information
 */
export const logStartup = (port: number) => {
  if (isDevelopment()) {
    console.log(`\n🚀 \x1b[32mServer running on http://localhost:${port}\x1b[0m`);
    console.log(`📝 Environment: \x1b[33m${env.NODE_ENV}\x1b[0m`);
    console.log(`📊 API Docs: \x1b[36mhttp://localhost:${port}/api-docs\x1b[0m\n`);
  } else {
    logger.info('🚀 Server starting up', {
      port,
      environment: env.NODE_ENV,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: process.memoryUsage(),
    });
  }
};

/**
 * Log application shutdown information
 */
export const logShutdown = (signal: string) => {
  logger.info('🛑 Server shutting down', {
    signal,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
};

/**
 * Error logging utility
 */
export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error('Application error', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    ...context,
  });
};

/**
 * Audit logging utility for tracking user actions
 */
export const logAudit = (action: string, context: Record<string, any>) => {
  logger.info('Audit log', {
    action,
    timestamp: new Date().toISOString(),
    ...context,
  });
};
