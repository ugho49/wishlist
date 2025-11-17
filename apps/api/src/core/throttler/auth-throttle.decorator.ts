import { Throttle } from '@nestjs/throttler'

/**
 * Rate limit decorator for authentication endpoints
 * Limits to 10 requests per 15 minutes
 */
export const AuthThrottle = () => Throttle({ auth: { ttl: 900000, limit: 10 } })
