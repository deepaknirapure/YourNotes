const Note = require('../models/Note');
const Folder = require('../models/Folder');
const Flashcard = require('../models/Flashcard');
const User = require('../models/User');

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Total notes
    const totalNotes = await Note.countDocuments({ 
      user: userId, 
      isTrashed: false 
    });

    // Starred notes
    const starredNotes = await Note.countDocuments({ 
      user: userId, 
      isStarred: true, 
      isTrashed: false 
    });

    // Total folders
    const totalFolders = await Folder.countDocuments({ user: userId });

    // Flashcards due today
    const flashcardsDue = await Flashcard.countDocuments({
      user: userId,
      nextReviewDate: { $lte: new Date() }
    });

    // Folder breakdown
    const folders = await Folder.find({ user: userId });
    const folderBreakdown = await Promise.all(
      folders.map(async (folder) => {
        const count = await Note.countDocuments({
          folder: folder._id,
          isTrashed: false
        });
        return {
          name: folder.name,
          color: folder.color,
          icon: folder.icon,
          count
        };
      })
    );

    // Recent notes (last 5)
    const recentNotes = await Note.find({ 
      user: userId, 
      isTrashed: false 
    })
    .populate('folder', 'name color icon')
    .sort({ updatedAt: -1 })
    .limit(5)
    .select('title updatedAt folder tags');

    // All tags with count
    const allNotes = await Note.find({ 
      user: userId, 
      isTrashed: false 
    }).select('tags');
    
    const tagMap = {};
    allNotes.forEach(note => {
      note.tags.forEach(tag => {
        tagMap[tag] = (tagMap[tag] || 0) + 1;
      });
    });
    const tagCloud = Object.entries(tagMap)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // User streak info
    const user = await User.findById(userId).select(
      'streak weeklyGoal notesCreatedThisWeek plan'
    );

    res.status(200).json({
      totalNotes,
      starredNotes,
      totalFolders,
      flashcardsDue,
      folderBreakdown,
      recentNotes,
      tagCloud,
      streak: user.streak,
      weeklyGoal: user.weeklyGoal,
      notesCreatedThisWeek: user.notesCreatedThisWeek,
      plan: user.plan
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getDashboard };