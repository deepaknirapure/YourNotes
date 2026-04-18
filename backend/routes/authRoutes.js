const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Private route (needs token)
router.get("/me", protect, getMe);

module.exports = router;

// Profile update routes (protected)
const { updateProfile, changePassword } = require('../controllers/authController');
router.put('/me', protect, updateProfile);
router.put('/change-password', protect, changePassword);
