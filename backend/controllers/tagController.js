// Tag controller — user ke saare tags aur unka count return karta hai
const Note = require('../models/Note');

// ─────────────────────────────────────────────────────────────────────────────
// GET TAGS — user ki saari notes se tags collect karo
// ─────────────────────────────────────────────────────────────────────────────
const getTags = async (req, res) => {
  try {
    // Sirf tags field fetch karo — poori note nahi chahiye
    const notes = await Note.find({
      user: req.user.id,
      isTrashed: false,
    }).select('tags');

    // Har tag ka count calculate karo
    const tagMap = {};
    notes.forEach((note) => {
      note.tags.forEach((tag) => {
        tagMap[tag] = (tagMap[tag] || 0) + 1;
      });
    });

    // Map ko array mein convert karo aur count ke hisaab se sort karo
    const tags = Object.entries(tagMap)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count); // Sabse zyada use hue tag pehle

    res.status(200).json(tags);
  } catch (error) {
    console.error('GetTags error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getTags };
