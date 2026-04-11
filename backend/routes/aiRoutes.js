const express = require('express');
const router = express.Router();
const { summarizeNote, generateFlashcards, getFlashcards, reviewFlashcard, getDueFlashcards } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/summarize/:id', protect, summarizeNote);
router.post('/flashcards/:id', protect, generateFlashcards);
router.get('/flashcards/:id', protect, getFlashcards);
router.patch('/flashcards/:id/review', protect, reviewFlashcard);
router.get('/flashcards-due', protect, getDueFlashcards);

module.exports = router;
