const Note = require("../models/Note");
const Folder = require("../models/Folder");
const Flashcard = require("../models/Flashcard");

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const [totalNotes, totalFolders, starredNotes, flashcardsDue, recentNotes] =
      await Promise.all([
        Note.countDocuments({ user: userId, isTrashed: false }),
        Folder.countDocuments({ user: userId }),
        Note.countDocuments({ user: userId, isStarred: true, isTrashed: false }),
        // FIX: was querying 'nextReview' but field is 'nextReviewDate' in Flashcard model
        Flashcard.countDocuments({
          user: userId,
          nextReviewDate: { $lte: new Date() },
        }).catch(() => 0),
        Note.find({ user: userId, isTrashed: false })
          .sort({ isPinned: -1, updatedAt: -1 })
          .limit(5)
          .select("title updatedAt folder tags isPinned isStarred")
          .populate("folder", "name color"),
      ]);

    res.status(200).json({
      totalNotes,
      totalFolders,
      starredNotes,
      flashcardsDue,
      recentNotes,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getDashboard };