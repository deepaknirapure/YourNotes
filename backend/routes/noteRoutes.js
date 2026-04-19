const express = require('express');
const router = express.Router();
const {
  getNotes, getNote, createNote, updateNote,
  toggleStar, togglePin, trashNote, restoreNote,
  deleteNote, searchNotes, generateShareLink, getSharedNote,
} = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');
const { validateNote } = require('../middleware/validateMiddleware');

// ✅ Public
router.get('/shared/:token', getSharedNote);

// ✅ Protected
router.get('/',           protect, getNotes);
router.get('/search',     protect, searchNotes);
router.get('/:id',        protect, getNote);
router.post('/',          protect, validateNote, createNote);
router.put('/:id',        protect, validateNote, updateNote);
router.delete('/:id',     protect, deleteNote);

router.patch('/:id/star',    protect, toggleStar);
router.patch('/:id/pin',     protect, togglePin);
router.patch('/:id/trash',   protect, trashNote);
router.patch('/:id/restore', protect, restoreNote);
router.post('/:id/share',    protect, generateShareLink);

module.exports = router;

