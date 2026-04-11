const Note = require('../models/Note');

// GET ALL TAGS
const getTags = async (req, res) => {
  try {
    const notes = await Note.find({ 
      user: req.user.id, 
      isTrashed: false 
    }).select('tags');

    const tagMap = {};
    notes.forEach(note => {
      note.tags.forEach(tag => {
        tagMap[tag] = (tagMap[tag] || 0) + 1;
      });
    });

    const tags = Object.entries(tagMap)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    res.status(200).json(tags);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getTags };