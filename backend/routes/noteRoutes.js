// Note routes — notes ke saare endpoints
const express = require('express');
const router = express.Router();
const {
  getNotes,
  getNote,
  createNote,
  updateNote,
  toggleStar,
  togglePin,
  trashNote,
  restoreNote,
  deleteNote,
  searchNotes,
  generateShareLink,
  getSharedNote,
} = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');
const { validateNote } = require('../middleware/validateMiddleware');

// Public route — share link se note dekhna (login ki zaroorat nahi)
router.get('/shared/:token', getSharedNote);

// Protected routes — login zaroori hai
router.get('/',       protect, getNotes);
router.get('/search', protect, searchNotes);
router.get('/:id',    protect, getNote);
router.post('/',      protect, validateNote, createNote);
// Hindi: Update partial hota hai, isliye title/content validation yahan force nahi karni.
router.put('/:id',    protect, updateNote);
router.delete('/:id', protect, deleteNote);

// Toggle actions — PATCH use karo (partial update)
router.patch('/:id/star',    protect, toggleStar);
router.patch('/:id/pin',     protect, togglePin);
router.patch('/:id/trash',   protect, trashNote);
router.patch('/:id/restore', protect, restoreNote);

// Share link generate/revoke
router.post('/:id/share', protect, generateShareLink);

module.exports = router;
