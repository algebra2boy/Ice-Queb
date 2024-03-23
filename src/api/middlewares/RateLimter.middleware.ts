import rateLimit from 'express-rate-limit';
import { ErrorMessages as error } from '../configs/errorsMessage.config.js';

/**
 * Rate limiter for the auth service.
 *
 * 429 (Too Many Requests) status code is returned when the limit is exceeded
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 5 minutes
    max: 20, // limit each IP to 20 requests per windowMs
    message: error.RATE_LIMITER_AUTH,
});

/**
 * Rate limiter for the office hour service.
 *
 * 429 (Too Many Requests) status code is returned when the limit is exceeded
 */
export const officeHourLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 10 minutes
    max: 150, // limit each IP to 150 requests per windowMs
    message: error.RATE_LIMITER_OFFICE_HOUR,
});
