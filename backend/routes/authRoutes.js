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

// Public routes
router.post('/register',              authLimiter, validateRegister, register);
router.post('/login',                 authLimiter, validateLogin,    login);
router.post('/forgot-password',       authLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);

// Protected routes
router.get('/me',                protect, getMe);
router.put('/update-profile',    protect, updateProfile);
// Hindi: Frontend /auth/profile call karta hai, isliye alias route add kiya
router.put('/profile',           protect, updateProfile);
router.put('/change-password',   protect, changePassword);
// Profile picture upload — multer single file
router.put('/profile-picture',   protect, upload.single('profilePic'), uploadProfilePicture);
// Hindi: Profile picture delete karne ka route
router.delete('/profile-picture', protect, deleteProfilePicture);

module.exports = router;
