// Folder controller — folders ke CRUD operations
const Folder = require('../models/Folder');
const Note = require('../models/Note');

// ─────────────────────────────────────────────────────────────────────────────
// GET ALL FOLDERS — user ke saare folders fetch karo (note count ke saath)
// ─────────────────────────────────────────────────────────────────────────────
const getFolders = async (req, res) => {
  try {
    // Saare folders fetch karo
    const folders = await Folder.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .lean(); // lean() se plain JS object milta hai — faster

    // Ek aggregate query se saare folders ka note count lo
    // Yeh N+1 problem se bachata hai (har folder ke liye alag query nahi)
    const counts = await Note.aggregate([
      {
        $match: {
          user: req.user.id,
          isTrashed: false,
          folder: { $ne: null },
        },
      },
      {
        $group: {
          _id: '$folder',
          count: { $sum: 1 },
        },
      },
    ]);

    // Counts ko map mein convert karo — O(1) lookup ke liye
    const countMap = {};
    counts.forEach((c) => {
      countMap[c._id.toString()] = c.count;
    });

    // Har folder mein actual note count add karo
    const foldersWithCount = folders.map((f) => ({
      ...f,
      noteCount: countMap[f._id.toString()] || 0,
    }));

    res.status(200).json(foldersWithCount);
  } catch (error) {
    console.error('GetFolders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CREATE FOLDER — naya folder banao
// ─────────────────────────────────────────────────────────────────────────────
const createFolder = async (req, res) => {
  try {
    const { name, color, icon, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Folder name required' });
    }

    const folder = await Folder.create({
      name,
      color: color || '#E55B2D',
      icon: icon || '📁',
      description: description || '',
      user: req.user.id,
    });

    // noteCount: 0 ke saath return karo (abhi naya folder hai)
    res.status(201).json({ ...folder.toObject(), noteCount: 0 });
  } catch (error) {
    console.error('CreateFolder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE FOLDER — folder ki details update karo
// ─────────────────────────────────────────────────────────────────────────────
const updateFolder = async (req, res) => {
  try {
    // Pehle check karo ki folder user ka hi hai
    const folder = await Folder.findOne({ _id: req.params.id, user: req.user.id });
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    const { name, color, icon, description } = req.body;

    // Sirf provided fields update karo
    if (name)                    folder.name = name;
    if (color)                   folder.color = color;
    if (icon)                    folder.icon = icon;
    if (description !== undefined) folder.description = description;

    await folder.save();
    res.status(200).json(folder);
  } catch (error) {
    console.error('UpdateFolder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE FOLDER — folder delete karo (notes unassigned ho jayenge)
// ─────────────────────────────────────────────────────────────────────────────
const deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, user: req.user.id });
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Is folder ki saari notes ko unassign karo (folder null set karo)
    await Note.updateMany({ folder: req.params.id }, { folder: null });

    // Folder delete karo
    await folder.deleteOne();

    res.status(200).json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('DeleteFolder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getFolders, createFolder, updateFolder, deleteFolder };
