// Rate limiting middleware — bots aur brute-force se bachata hai
const rateLimit = require('express-rate-limit');

// Auth routes ke liye rate limiter — login/register pe brute force rokta hai
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute ki window
  max: 20,                   // Max 20 requests per 15 min per IP
  message: { message: 'Too many attempts. Please try again after 15 minutes.' },
  standardHeaders: true,     // Rate limit info headers mein bhejo
  legacyHeaders: false,      // Purane X-RateLimit headers disable karo
});

// General API routes ke liye rate limiter
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute ki window
  max: 100,            // Max 100 requests per minute per IP
  message: { message: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, generalLimiter };
