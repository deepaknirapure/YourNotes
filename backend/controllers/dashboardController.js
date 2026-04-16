const Note = require("../models/Note");
const Folder = require("../models/Folder");
const Flashcard = require("../models/Flashcard");
const User = require("../models/User");

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Sabhi counts ek saath fetch karein (Parallel execution)
    const [
      totalNotes,
      starredNotes,
      totalFolders,
      flashcardsDue,
      folders,
      user,
    ] = await Promise.all([
      Note.countDocuments({ user: userId, isTrashed: false }),
      Note.countDocuments({ user: userId, isStarred: true, isTrashed: false }),
      Folder.countDocuments({ user: userId }),
      Flashcard.countDocuments({
        user: userId,
        nextReviewDate: { $lte: new Date() },
      }),
      Folder.find({ user: userId }),
      User.findById(userId).select(
        "streak weeklyGoal notesCreatedThisWeek name",
      ),
    ]);

    // Folder breakdown calculation (Fast version)
    const folderBreakdown = await Promise.all(
      folders.map(async (f) => ({
        name: f.name,
        color: f.color,
        icon: f.icon,
        count: await Note.countDocuments({ folder: f._id, isTrashed: false }),
      })),
    );

    const recentNotes = await Note.find({ user: userId, isTrashed: false })
      .populate("folder", "name color icon")
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("title updatedAt folder tags");

    res.status(200).json({
      userName: user.name,
      totalNotes,
      starredNotes,
      totalFolders,
      flashcardsDue,
      folderBreakdown,
      recentNotes, 
      streak: user.streak,
     });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getDashboard };
