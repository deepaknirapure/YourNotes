const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  summarizeNote,
  generateFlashcards,
  getFlashcards,
  reviewFlashcard,
  getDueFlashcards,
  checkAIRateLimit,
} = require('../controllers/aiController');

router.use(protect);

router.get('/flashcards-due',         getDueFlashcards);
router.get('/flashcards/:id',         getFlashcards);
router.post('/summarize/:id',         checkAIRateLimit, summarizeNote);
router.post('/flashcards/:id',        checkAIRateLimit, generateFlashcards);
router.patch('/flashcards/:id/review', reviewFlashcard);

module.exports = router;
