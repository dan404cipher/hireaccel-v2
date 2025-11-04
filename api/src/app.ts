import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import hpp from 'hpp'
import mongoSanitize from 'express-mongo-sanitize'
// xss-clean types are not perfect; import as any to avoid TS friction
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import xssClean from 'xss-clean'
import 'express-async-errors' // Automatically catches async errors

import { env, isDevelopment } from '@/config/env'
import { requestLogger } from '@/config/logger'
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler'
import { handleMulterError } from '@/config/multer'
import { csrfRouter, csrfProtectionEnabled } from '@/config/csrf'

/**
 * Express application setup with middleware configuration
 * Creates a production-ready Express app with security, logging, and error handling
 */

const app = express()

// Trust proxy (required when running behind reverse proxy like Nginx)
// Ensures correct IP address, secure cookies, and protocol detection
if (env.TRUST_PROXY) {
    app.set('trust proxy', 1)
}

// Remove X-Powered-By header
app.disable('x-powered-by')

// ============================================================================
// Security Middleware
// ============================================================================

/**
 * Helmet for security headers
 * Helps secure Express apps by setting various HTTP headers
 */
app.use(
    helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                // Allow inline scripts only in development to avoid breaking Swagger UI
                scriptSrc: isDevelopment() ? ["'self'", "'unsafe-inline'"] : ["'self'"],
                // Allow images from same origin, data URIs, HTTPS, and localhost (for development)
                imgSrc: isDevelopment() 
                    ? ["'self'", 'data:', 'https:', 'http://localhost:*', 'http://127.0.0.1:*']
                    : ["'self'", 'data:', 'https:'],
            },
        },
        referrerPolicy: { policy: 'no-referrer' },
        crossOriginEmbedderPolicy: isDevelopment() ? false : true,
        crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin requests for images
    }),
)

/**
 * CORS configuration
 * Allow requests from frontend origins
 */
const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim())
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true) // Allow non-browser clients
            if (allowedOrigins.includes(origin)) return callback(null, true)
            return callback(new Error(`CORS not allowed from origin: ${origin}`))
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Requested-With', env.CSRF_HEADER_NAME],
        exposedHeaders: ['X-Request-ID', 'X-Total-Count'],
    }),
)

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
    })

    app.use(limiter)
}

// ============================================================================
// Parsing Middleware
// ============================================================================

/**
 * Body parsing middleware
 */
app.use(
    express.json({
        limit: '10mb',
        type: ['application/json', 'text/plain'],
    }),
)

app.use(
    express.urlencoded({
        extended: true,
        limit: '10mb',
    }),
)

// Cookie parser (needed for refresh token cookies and CSRF)
app.use(cookieParser())

// HTTP Parameter Pollution protection
app.use(hpp())

// NoSQL injection protection
app.use(mongoSanitize())

// XSS protection for user input
app.use(xssClean())

/**
 * Compression middleware
 * Compress responses to reduce bandwidth
 */
app.use(compression())

// ============================================================================
// Logging Middleware
// ============================================================================

/**
 * Request logging
 * Logs all incoming requests with request IDs for tracing
 */
app.use(requestLogger)

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
    })
})

/**
 * Detailed health check with database status
 */
app.get('/health/detailed', async (_req, res) => {
    const { checkDatabaseHealth, getDatabaseStatus } = await import('@/config/database')

    const dbHealthy = await checkDatabaseHealth()
    const dbStatus = getDatabaseStatus()

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
    })
})

// ============================================================================
// API Routes
// ============================================================================

/**
 * API routes
 */
import routes from '@/routes'
import notificationRoutes from '@/routes/notificationRoutes'

// API routes
app.use('/', routes)
app.use('/api/v1/notifications', notificationRoutes)

// CSRF support routes (enabled only if configured)
if (csrfProtectionEnabled) {
    app.use('/', csrfRouter)
}

// API Documentation
import { specs, swaggerUi, swaggerUiOptions } from '@/config/swagger'

if (env.NODE_ENV === 'development' || env.API_DOCS_ENABLED) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions))
    app.get('/docs', (_req, res) => {
        res.redirect('/api-docs')
    })
}

// ============================================================================
// Static File Serving
// ============================================================================

/**
 * Serve uploaded files
 * Files are served with proper security headers
 */
app.use(
    '/uploads',
    express.static(env.UPLOADS_PATH, {
        maxAge: '1d', // Cache for 1 day
        etag: true,
        lastModified: true,
        setHeaders: (res, path) => {
            // Set appropriate headers for different file types
            if (path.endsWith('.pdf')) {
                res.setHeader('Content-Type', 'application/pdf')
            } else if (path.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
                res.setHeader('Content-Type', 'image/*')
            } else if (path.match(/\.(doc|docx)$/)) {
                res.setHeader('Content-Type', 'application/msword')
            }

            // Prevent XSS attacks
            res.setHeader('X-Content-Type-Options', 'nosniff')
        },
    }),
)

// ============================================================================
// Error Handling Middleware
// ============================================================================

/**
 * Multer error handler
 * Handles file upload errors specifically
 */
app.use(handleMulterError)

/**
 * 404 handler for unknown routes
 */
app.use(notFoundHandler)

/**
 * Global error handler
 * Catches all errors and returns standardized responses
 */
app.use(errorHandler)

// ============================================================================
// Process Event Handlers
// ============================================================================

/**
 * Graceful shutdown handling
 */
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
    // Application specific logging, throwing an error, or other logic here
})

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception thrown:', error)
    process.exit(1)
})

export default app
