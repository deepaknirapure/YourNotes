const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getTags } = require('../controllers/tagController');

router.use(protect);
router.get('/', getTags);

module.exports = router;