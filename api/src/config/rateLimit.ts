import rateLimit from 'express-rate-limit'
import { env } from './env'
import type { Request } from 'express'

/**
 * Centralized rate limiter configurations for sensitive routes
 */

export const defaultLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
})

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 25,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        type: 'https://httpstatuses.com/429',
        title: 'Too Many Requests',
        status: 429,
        detail: 'Too many authentication attempts. Please try again later.',
    },
})

// More targeted limiter for login: key by IP + email to avoid penalizing other users behind same NAT
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 25,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
        const ip = req.ip || 'unknown-ip'
        const email = (req.body?.email || '').toString().toLowerCase()
        return `${ip}|${email}`
    },
    message: {
        type: 'https://httpstatuses.com/429',
        title: 'Too Many Login Attempts',
        status: 429,
        detail: 'Too many login attempts for this account. Please try again later.',
    },
})

export const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
        // Limit primarily by email to prevent spamming a single mailbox
        const email = (req.body?.email || '').toString().toLowerCase()
        if (email) return `otp|${email}`
        // fallback to IP if no email present
        return `otp-ip|${req.ip || 'unknown-ip'}`
    },
    message: {
        type: 'https://httpstatuses.com/429',
        title: 'Too Many Requests',
        status: 429,
        detail: 'Too many OTP requests. Please try again later.',
    },
})

export const refreshLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 60, // allow 1/sec average
    standardHeaders: true,
    legacyHeaders: false,
})

// Heavier operations limiter (e.g., resume parsing, file processing)
export const heavyProcessLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5, // up to 5 heavy ops per window
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
        // Prefer authenticated user ID; fallback to IP
        const userId = (req as any)?.user?._id?.toString()
        return userId ? `heavy|user:${userId}` : `heavy|ip:${req.ip || 'unknown-ip'}`
    },
    message: {
        type: 'https://httpstatuses.com/429',
        title: 'Too Many Requests',
        status: 429,
        detail: 'Too many heavy operations in a short time. Please slow down and try again later.',
    },
})
