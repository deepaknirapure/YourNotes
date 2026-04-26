// Tag routes — user ke tags fetch karne ka endpoint
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getTags } = require('../controllers/tagController');

// Protected route — login zaroori hai
router.use(protect);
router.get('/', getTags);

module.exports = router;
