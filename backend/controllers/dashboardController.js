// Dashboard controller — home screen ke stats fetch karta hai
const Note = require('../models/Note');
const Folder = require('../models/Folder');
const Flashcard = require('../models/Flashcard');

// ─────────────────────────────────────────────────────────────────────────────
// GET DASHBOARD — dashboard ke liye saari stats ek saath fetch karo
// ─────────────────────────────────────────────────────────────────────────────
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Saari queries simultaneously chalao — Promise.all se time bachta hai
    const [totalNotes, totalFolders, starredNotes, flashcardsDue, recentNotes] =
      await Promise.all([
        // Total active notes count
        Note.countDocuments({ user: userId, isTrashed: false }),

        // Total folders count
        Folder.countDocuments({ user: userId }),

        // Starred notes count
        Note.countDocuments({ user: userId, isStarred: true, isTrashed: false }),

        // Due flashcards count — aaj ya pehle review karne wale
        Flashcard.countDocuments({
          user: userId,
          nextReviewDate: { $lte: new Date() },
        }).catch(() => 0), // Agar error aaye toh 0 return karo

        // Recent 5 notes
        Note.find({ user: userId, isTrashed: false })
          .sort({ isPinned: -1, updatedAt: -1 })
          .limit(5)
          .select('title updatedAt folder tags isPinned isStarred')
          .populate('folder', 'name color'),
      ]);

    res.status(200).json({
      totalNotes,
      totalFolders,
      starredNotes,
      flashcardsDue,
      recentNotes,
    });
  } catch (error) {
    console.error('GetDashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDashboard };
