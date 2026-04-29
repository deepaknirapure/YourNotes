const rateLimit = require('express-rate-limit');

/**
 * Hindi Comment: 
 * Ye middleware brute-force attacks aur API abuse ko rokta hai.
 * Isse hamara server safe rehta hai aur unwanted traffic cost bachti hai.
 */

// 1. Login aur Register ke liye (Brute-force security)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minute window
  max: 10,                   // Max 10 attempts (Production mein 10-20 sahi hai)
  message: { 
    message: 'Too many login/register attempts. Please try again after 15 minutes.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 2. Forgot Password ke liye specific (Email spamming rokne ke liye)
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 Ghanta window
  max: 3,                    // Max 3 reset requests per hour
  message: { 
    message: 'Too many reset requests. Check your email or try again in an hour.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 3. General API usage ke liye (Dashboard, Notes fetch etc.)
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 Minute window
  max: 100,                // 100 requests per minute
  message: { 
    message: 'Too many requests. Please slow down.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, forgotPasswordLimiter, generalLimiter };