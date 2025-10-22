import { z } from 'zod'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

/**
 * Environment configuration schema using Zod for validation
 * This ensures all required environment variables are present and properly typed
 */
const envSchema = z.object({
    // Server Configuration
    PORT: z.string().transform(Number).default('8080'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // Database Configuration
    MONGO_URI: z.string().url().describe('MongoDB connection string'),

    // File Upload Configuration
    UPLOADS_PATH: z.string().default('./api/uploads'),
    MAX_FILE_SIZE_MB: z.string().transform(Number).default('10'),
    MAX_IMAGE_SIZE_MB: z.string().transform(Number).default('2'),
    MAX_BANNER_SIZE_MB: z.string().transform(Number).default('50'),

    // JWT Configuration
    JWT_ACCESS_SECRET: z.string().min(32, 'JWT access secret must be at least 32 characters'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT refresh secret must be at least 32 characters'),
    JWT_ACCESS_TTL: z.string().default('15m'),
    JWT_REFRESH_TTL: z.string().default('7d'),

    // Rate Limiting
    RATE_LIMIT_ENABLED: z
        .string()
        .transform((val) => val === 'true')
        .default('false'),
    RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

    // CORS Configuration
    CORS_ORIGIN: z.string().default('http://localhost:5173'),
    TRUST_PROXY: z
        .string()
        .transform((v) => v === 'true')
        .default('true'),

    // Frontend URL for email links
    FRONTEND_URL: z.string().url().optional(),

    // Email Configuration (optional for future implementation)
    EMAIL_HOST: z.string().optional(),
    EMAIL_PORT: z.string().transform(Number).optional(),
    EMAIL_USER: z.string().email().optional(),
    EMAIL_PASS: z.string().optional(),

    // Logging
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    LOG_FILE: z.string().optional(),

    // API Documentation
    API_DOCS_ENABLED: z
        .string()
        .transform((val) => val === 'true')
        .default('true'),

    // Google Sheets Integration
    GOOGLE_SHEETS_ID: z.string().optional(),
    GOOGLE_SHEETS_CREDENTIALS: z.string().optional(),

    // OpenAI Integration
    OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required'),

    // Security
    BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
    SESSION_SECRET: z.string().min(32, 'Session secret must be at least 32 characters').optional(),

    // CSRF Protection
    CSRF_ENABLED: z
        .string()
        .transform((val) => val === 'true')
        .default('false'),
    CSRF_COOKIE_NAME: z.string().default('XSRF-TOKEN'),
    CSRF_HEADER_NAME: z.string().default('X-CSRF-Token'),
})

/**
 * Parse and validate environment variables
 */
const parseEnv = () => {
    try {
        return envSchema.parse(process.env)
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missingVars = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('\n')

            throw new Error(
                `Environment validation failed:\n${missingVars}\n\n` +
                    'Please check your .env file and ensure all required variables are set.',
            )
        }
        throw error
    }
}

/**
 * Validated environment configuration
 * This is the single source of truth for all environment variables in the application
 */
export const env = parseEnv()

/**
 * Type definition for environment configuration
 */
export type Environment = typeof env

/**
 * Helper function to check if we're in development mode
 */
export const isDevelopment = () => env.NODE_ENV === 'development'

/**
 * Helper function to check if we're in production mode
 */
export const isProduction = () => env.NODE_ENV === 'production'

/**
 * Helper function to check if we're in test mode
 */
export const isTest = () => env.NODE_ENV === 'test'
