const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');

const {
  getStats,
  getUsers,
  toggleBanUser,
  deleteUser,
  toggleAdminRole,
  getCommunityNotes,
  forceRemoveNote,
  restoreNote,
  getReportedNotes,
  clearReports,
  getAiUsageStats,
} = require('../controllers/adminController');

// Sabhi admin routes protected hain — pehle login, phir admin check
const guard = [protect, adminOnly];

// ── Stats ────────────────────────────────────────────────────────────────────
router.get('/stats',           ...guard, getStats);
router.get('/ai-usage',        ...guard, getAiUsageStats);

// ── Users ────────────────────────────────────────────────────────────────────
router.get('/users',                     ...guard, getUsers);
router.patch('/users/:userId/ban',       ...guard, toggleBanUser);
router.patch('/users/:userId/role',      ...guard, toggleAdminRole);
router.delete('/users/:userId',          ...guard, deleteUser);

// ── Community Notes ───────────────────────────────────────────────────────────
router.get('/notes',                         ...guard, getCommunityNotes);
router.get('/notes/reported',                ...guard, getReportedNotes);
router.patch('/notes/:noteId/force-remove',  ...guard, forceRemoveNote);
router.patch('/notes/:noteId/restore',       ...guard, restoreNote);
router.patch('/notes/:noteId/clear-reports', ...guard, clearReports);

module.exports = router;
