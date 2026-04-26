// Dashboard routes — home screen stats ka endpoint
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getDashboard } = require('../controllers/dashboardController');

// Protected route — login zaroori hai
router.use(protect);
router.get('/', getDashboard);

module.exports = router;
