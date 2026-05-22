// Auth routes — register, login, password reset, aur OTP verification ke endpoints
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
  uploadProfilePicture,
  deleteProfilePicture,
} = require('../controllers/authController');
const { sendOTP, verifyOTP } = require('../controllers/otpController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');
const { validateRegister, validateLogin } = require('../middleware/validateMiddleware');
const upload = require('../middleware/uploadMiddleware');

// ── OTP Routes (Phone Verification) ──────────────────────────────────────────
// Mobile number pe OTP bhejne ke liye
router.post('/send-otp',    authLimiter, sendOTP);
// OTP verify karne ke liye
router.post('/verify-otp',  authLimiter, verifyOTP);

// ── Public Routes ─────────────────────────────────────────────────────────────
router.post('/register',              authLimiter, validateRegister, register);
router.post('/login',                 authLimiter, validateLogin,    login);
router.post('/forgot-password',       authLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);

// ── Protected Routes ──────────────────────────────────────────────────────────
router.get('/me',                protect, getMe);
router.put('/update-profile',    protect, updateProfile);
router.put('/profile',           protect, updateProfile);
router.put('/change-password',   protect, changePassword);
router.put('/profile-picture',   protect, upload.single('profilePic'), uploadProfilePicture);
router.delete('/profile-picture', protect, deleteProfilePicture);

module.exports = router;
