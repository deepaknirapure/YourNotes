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
  uploadProfilePicture,
  deleteProfilePicture,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');
const { validateRegister, validateLogin } = require('../middleware/validateMiddleware');
const upload = require('../middleware/uploadMiddleware');

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
