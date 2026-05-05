const express = require('express');
const router  = express.Router();

const { protect } = require('../middleware/authMiddleware');
const upload      = require('../middleware/uploadMiddleware');

const {
  getFeed,
  getNoteById,
  toggleLike,
  toggleSave,
  addComment,
  downloadNote,
  uploadNote,
  getUserNotes,
  getSavedNotes,
  deleteNote,
} = require('../controllers/communityController');

// ── Static / prefix routes FIRST (before /:id shadow them) ──────────────────
router.get('/feed',         protect, getFeed);
router.get('/saved',        protect, getSavedNotes);
router.get('/user/:userId', protect, getUserNotes);

// File-upload route (multipart/form-data)
router.post('/upload', protect, upload.single('file'), uploadNote);

// ── Single-note routes (dynamic :id last) ────────────────────────────────────
router.get('/:id',           protect, getNoteById);
router.post('/:id/like',     protect, toggleLike);
router.post('/:id/save',     protect, toggleSave);
router.post('/:id/comment',  protect, addComment);
router.post('/:id/download', protect, downloadNote);
router.delete('/:id',        protect, deleteNote);

module.exports = router;