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
        Flashcard.countDocuments({
          user: userId,
          nextReview: { $lte: new Date() },
        }).catch(() => 0), // graceful fallback if Flashcard model missing
        Note.find({ user: userId, isTrashed: false })
          .sort({ updatedAt: -1 })
          .limit(5)
          .select("title updatedAt folder tags")
          .populate("folder", "name color"),
      ]);

    res.status(200).json({
      totalNotes,
      totalFolders,
      starredNotes,
      flashcardsDue,
      aiSummaries: 0, // extend later
      recentNotes,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getDashboard };