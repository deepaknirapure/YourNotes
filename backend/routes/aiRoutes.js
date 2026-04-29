// AI routes — Groq AI features ke endpoints
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
  generateQuiz,
  askAI,
  importNotes,
  getFlashcardNotes,
} = require('../controllers/aiController');
const upload = require('../middleware/uploadMiddleware');

// Saare AI routes protected hain
router.use(protect);

// Flashcard routes
router.get('/flashcards-due',           getDueFlashcards);
router.get('/flashcards/:id',           getFlashcards);
router.get('/flashcard-notes',         getFlashcardNotes);
router.patch('/flashcards/:id/review',  reviewFlashcard);

// AI generation routes — rate limit check bhi hoga
router.post('/summarize/:id',   checkAIRateLimit, summarizeNote);
router.post('/flashcards/:id',  checkAIRateLimit, generateFlashcards);
router.post('/quiz/:id',        checkAIRateLimit, generateQuiz);
router.post('/ask',             checkAIRateLimit, askAI);
router.post('/import',          upload.single('file'), importNotes);

module.exports = router;
