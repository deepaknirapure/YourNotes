// Auth routes — register, login, password reset ke endpoints
const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');
const { validateRegister, validateLogin } = require('../middleware/validateMiddleware');

// Public routes — koi bhi access kar sakta hai (rate limited)
router.post('/register',             authLimiter, validateRegister, register);
router.post('/login',                authLimiter, validateLogin,    login);
router.post('/forgot-password',      authLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);

// Protected routes — sirf logged-in user access kar sakta hai
router.get('/me',              protect, getMe);
router.put('/update-profile',  protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
