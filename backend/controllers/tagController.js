const Note = require('../models/Note');

/**
 * Hindi Comment:
 * Ye controller user ke saare unique tags aur unke counts fetch karta hai.
 * Humne yahan Aggregation Pipeline use ki hai taaki performance fast rahe 
 * chahe user ki kitni bhi notes ho.
 */

exports.getTags = async (req, res) => {
  try {
    const userId = req.user.id;

    // Hindi: Database level par hi tags ko 'unwind' karke count kar rahe hain
    const tagsWithCounts = await Note.aggregate([
      // 1. Sirf is user ki active notes pakdo
      { 
        $match: { 
          user: new require('mongoose').Types.ObjectId(userId), 
          isTrashed: false 
        } 
      },
      // 2. Tags array ko tod kar individual words mein convert karo
      { $unwind: "$tags" },
      // 3. Har unique tag ka group banao aur count increment karo
      { 
        $group: { 
          _id: "$tags", 
          count: { $sum: 1 } 
        } 
      },
      // 4. Sabse zyada use hone wale tags ko upar rakho
      { $sort: { count: -1 } },
      // 5. Output format set karo (id ko 'tag' mein badlo)
      { 
        $project: { 
          _id: 0, 
          tag: "$_id", 
          count: 1 
        } 
      }
    ]);

    res.status(200).json(tagsWithCounts);
  } catch (error) {
    console.error('GetTags Error:', error);
    res.status(500).json({ message: 'Failed to fetch tags' });
  }
};