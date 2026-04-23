const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
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
} = require("../controllers/communityController");

// ── Static / prefix routes MUST come before wildcard /:id ──────────────────
router.get("/feed",           protect, getFeed);
router.get("/user/:userId",   protect, getUserNotes);   // was shadowed by /:id

// ── Upload ──────────────────────────────────────────────────────────────────
router.post("/upload", protect, upload.single("file"), uploadNote);

// ── Wildcard single-note routes (kept last to avoid shadowing above) ────────
router.get("/:id",             protect, getNoteById);
router.post("/:id/like",       protect, toggleLike);
router.post("/:id/save",       protect, toggleSave);
router.post("/:id/download",   protect, downloadNote);
router.post("/:id/comment",    protect, addComment);
router.delete("/:id",          protect, deleteNote);

module.exports = router;
