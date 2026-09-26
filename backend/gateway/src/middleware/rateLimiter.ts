import rateLimit from 'express-rate-limit';

// Rate limiter for public auth and sensitive challenge endpoints (100 req/min)
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts from this IP, please try again after 1 minute.'
  }
});

// General rate limiter for all API traffic (1000 req/min)
export const generalApiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'API rate limit exceeded. Please throttle requests.'
  }
});
