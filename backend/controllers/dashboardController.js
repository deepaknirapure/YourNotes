const Note = require('../models/Note');
const Folder = require('../models/Folder');
const Flashcard = require('../models/Flashcard');
const User = require('../models/User');

/**
 * Hindi Comment:
 * Ye controller Home Page/Dashboard ke indicators handle karta hai.
 * Isme Total, Public, aur Starred notes ke counts ek saath fetch hote hain.
 */

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Sabhi stats ko parallel mein fetch karna (Speed ke liye)
    const [
      totalNotes,
      publicNotes,
      starredNotes,
      totalFolders,
      flashcardsDue,
      recentNotes,
      userData
    ] = await Promise.all([
      // 1. Total active notes
      Note.countDocuments({ user: userId, isTrashed: false }),

      // 2. Public notes (Community indicators)
      Note.countDocuments({ user: userId, isPublic: true, isTrashed: false }),

      // 3. Starred/Bookmarked notes
      Note.countDocuments({ user: userId, isStarred: true, isTrashed: false }),

      // 4. Total folders count
      Folder.countDocuments({ user: userId }),

      // 5. SM-2 Due flashcards (Revision alerts)
      Flashcard.countDocuments({
        user: userId,
        nextReviewDate: { $lte: new Date() },
      }),

      // 6. Recent Notes (Dashboard par dikhane ke liye)
      Note.find({ user: userId, isTrashed: false })
        .sort({ isPinned: -1, updatedAt: -1 })
        .limit(6)
        .populate('folder', 'name color icon'),

      // 7. User specific goals and streaks
      User.findById(userId).select('streak weeklyGoal notesCreatedThisWeek')
    ]);

    // Response structure (Production-ready)
    res.status(200).json({
      success: true,
      totalNotes,
      publicNotes,
      starredNotes,
      totalFolders,
      flashcardsDue,
      indicators: {
        total: totalNotes,
        public: publicNotes,
        starred: starredNotes,
        folders: totalFolders,
        revisionDue: flashcardsDue
      },
      goals: {
        currentStreak: userData.streak.count,
        weeklyGoal: userData.weeklyGoal,
        completedThisWeek: userData.notesCreatedThisWeek,
        progressPercentage: Math.min(100, (userData.notesCreatedThisWeek / userData.weeklyGoal) * 100)
      },
      recentNotes
    });

  } catch (error) {
    console.error('Dashboard Fetch Error:', error);
    res.status(500).json({ message: 'Failed to load dashboard stats' });
  }
};