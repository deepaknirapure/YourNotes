const { body, validationResult } = require('express-validator');

/**
 * Hindi Comment:
 * Ye middleware check karta hai ki user ne jo data form mein bhara hai wo sahi format mein hai ya nahi.
 * Isse hamara server "Bad Requests" se bacha rehta hai.
 */

// ─────────────────────────────────────────────────────────────────────────────
// ERROR HANDLER HELPER
// ─────────────────────────────────────────────────────────────────────────────
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Hindi: Hum sirf pehla error message bhej rahe hain frontend ko (Clean UI ke liye)
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION RULES
// ─────────────────────────────────────────────────────────────────────────────

// 1. Account Registration Validation
const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Full Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  handleValidation,
];

// 2. Login Validation
const validateLogin = [
  body('email').trim().isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password cannot be empty'),
  handleValidation,
];

// 3. NEW: Password Reset Request (Forgot Password)
const validateForgot = [
  body('email').trim().isEmail().withMessage('Valid email is required for reset link'),
  handleValidation,
];

// 4. NEW: Reset Password Execution
const validateReset = [
  body('password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  handleValidation,
];

// 5. Note Creation Validation
const validateNote = [
  body('title')
    .trim()
    .notEmpty().withMessage('Note title is required')
    .isLength({ max: 200 }).withMessage('Title is too long (max 200)'),
  body('content').optional(),
  handleValidation,
];

// 6. NEW: Community Upload Validation
const validateCommunityUpload = [
  body('title').trim().notEmpty().withMessage('Title is required for public sharing'),
  body('subject').trim().notEmpty().withMessage('Please specify a subject (e.g. Physics)'),
  body('exam').optional().isIn(['JEE', 'NEET', 'GATE', 'UPSC', 'CA', 'Class 10', 'Class 12', 'Polytechnic', 'Other'])
    .withMessage('Please select a valid exam category'),
  handleValidation,
];

module.exports = { 
  validateRegister, 
  validateLogin, 
  validateForgot, 
  validateReset, 
  validateNote,
  validateCommunityUpload 
};