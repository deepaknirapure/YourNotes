const Folder = require('../models/Folder');
const Note = require('../models/Note');

/**
 * Hindi Comment:
 * Ye controller Folder management handle karta hai. 
 * Isme "Open Folder" feature (getFolderNotes) bhi add kiya gaya hai 
 * taaki users folder ke andar notes organize kar sakein.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. GET ALL FOLDERS (With Live Note Counts)
// ─────────────────────────────────────────────────────────────────────────────
exports.getFolders = async (req, res) => {
  try {
    const folders = await Folder.find({ user: req.user.id }).sort({ createdAt: -1 }).lean();

    // Hindi: Ek hi query mein saare folders ke counts nikalna (Aggregation Pipeline)
    const counts = await Note.aggregate([
      { $match: { user: req.user.id, isTrashed: false, folder: { $ne: null } } },
      { $group: { _id: '$folder', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    counts.forEach((c) => { countMap[c._id.toString()] = c.count; });

    const foldersWithCount = folders.map((f) => ({
      ...f,
      noteCount: countMap[f._id.toString()] || 0,
    }));

    res.status(200).json(foldersWithCount);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching folders' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. CREATE FOLDER
// ─────────────────────────────────────────────────────────────────────────────
exports.createFolder = async (req, res) => {
  try {
    const { name, color, icon, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const folder = await Folder.create({
      name,
      color: color || '#4F46E5',
      icon: icon || '📁',
      description: description || '',
      user: req.user.id,
    });

    res.status(201).json({ ...folder.toObject(), noteCount: 0 });
  } catch (error) {
    res.status(500).json({ message: 'Folder creation failed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. GET FOLDER NOTES (Open Folder Feature)
// ─────────────────────────────────────────────────────────────────────────────
exports.getFolderNotes = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if folder exists and belongs to user
    const folder = await Folder.findOne({ _id: id, user: req.user.id });
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    // Hindi: Is folder ke andar ki saari notes fetch karna
    const notes = await Note.find({ folder: id, user: req.user.id, isTrashed: false })
      .sort({ updatedAt: -1 });

    res.status(200).json({ folder, notes });
  } catch (error) {
    res.status(500).json({ message: 'Error opening folder' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. UPDATE FOLDER
// ─────────────────────────────────────────────────────────────────────────────
exports.updateFolder = async (req, res) => {
  try {
    const folder = await Folder.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!folder) return res.status(404).json({ message: 'Folder not found' });
    res.status(200).json(folder);
  } catch (error) {
    res.status(500).json({ message: 'Update failed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. DELETE FOLDER
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, user: req.user.id });
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    // Hindi: Folder delete karne par notes ko "Unassigned" (null) kar dena
    await Note.updateMany({ folder: req.params.id }, { folder: null });
    await folder.deleteOne();

    res.status(200).json({ message: 'Folder deleted, notes moved to general' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed' });
  }
};