import { Router, Request, Response } from 'express'
import csurf from 'csurf'
import { env, isProduction } from './env'

/**
 * CSRF configuration
 * Enabled conditionally via environment configuration
 */

export const csrfProtectionEnabled = env.CSRF_ENABLED

// Configure double-submit cookie strategy
const csrfProtection = csurf({
    cookie: {
        key: env.CSRF_COOKIE_NAME,
        httpOnly: false, // allow frontend to read and send as header
        sameSite: 'strict',
        secure: isProduction(),
    },
    value: (req: Request) => {
        // read the token from custom header
        const headerName = env.CSRF_HEADER_NAME
        // @ts-ignore
        return req.headers[headerName.toLowerCase()] as string
    },
})

// Public router to fetch CSRF token
export const csrfRouter = Router()

if (csrfProtectionEnabled) {
    // Issue a CSRF token for clients to use
    csrfRouter.get('/csrf-token', csrfProtection, (req: Request, res: Response) => {
        // @ts-ignore
        const token = req.csrfToken()
        res.cookie(env.CSRF_COOKIE_NAME, token, {
            httpOnly: false,
            sameSite: 'strict',
            secure: isProduction(),
        })
        res.json({ token, headerName: env.CSRF_HEADER_NAME })
    })
}

export { csrfProtection }
