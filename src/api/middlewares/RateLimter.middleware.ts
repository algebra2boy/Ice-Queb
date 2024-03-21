import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for the auth service
 * 429 (Too Many Requests) status code is returned when the limit is exceeded
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 5 minutes
    max: 20, // limit each IP to 20 requests per windowMs
    message: 'Too many requests to the auth service from this IP, please try again after 5 minutes',
});

/**
 * Rate limiter for the office hour service
 * 429 (Too Many Requests) status code is returned when the limit is exceeded
 */
export const officeHourLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 10 minutes
    max: 50, // limit each IP to 20 requests per windowMs
    message:
        'Too many requests to the office hour service from this IP, please try again after 10 minutes',
});
