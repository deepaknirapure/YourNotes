// Community routes — shared notes community ke endpoints
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  uploadNote,
  getFeed,
  toggleLike,
  toggleSave,
  downloadNote,
  addComment,
  getNoteById,
  getUserNotes,
  deleteNote,
} = require('../controllers/communityController');

// IMPORTANT: Static/prefix routes pehle aani chahiye — /:id se pehle
// Warna "/feed" ko /:id samjh lega Express
router.get('/feed',         protect, getFeed);
router.get('/user/:userId', protect, getUserNotes);

// File upload route
router.post('/upload', protect, upload.single('file'), uploadNote);

// Single note routes — yeh baad mein (shadowing avoid karne ke liye)
router.get('/:id',            protect, getNoteById);
router.post('/:id/like',      protect, toggleLike);
router.post('/:id/save',      protect, toggleSave);
router.post('/:id/download',  protect, downloadNote);
router.post('/:id/comment',   protect, addComment);
router.delete('/:id',         protect, deleteNote);

module.exports = router;
