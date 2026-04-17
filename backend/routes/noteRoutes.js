const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
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
} = require("../controllers/noteController");

// ✅ PUBLIC route — no auth needed (shared note)
router.get("/shared/:token", getSharedNote);

// ✅ All routes below need auth
router.use(protect);

router.get("/search", searchNotes);
router.get("/", getNotes);
router.get("/:id", getNote);
router.post("/", createNote);
router.put("/:id", updateNote);
router.patch("/:id", updateNote);       // ← FIX: auto-save uses PATCH, was missing
router.patch("/:id/star", toggleStar);
router.patch("/:id/pin", togglePin);
router.patch("/:id/trash", trashNote);
router.patch("/:id/restore", restoreNote);
router.patch("/:id/share", generateShareLink);
router.delete("/:id", deleteNote);

module.exports = router; 