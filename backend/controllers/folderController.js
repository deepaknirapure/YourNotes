const Folder = require('../models/Folder');
const Note = require('../models/Note');

// ✅ GET ALL FOLDERS — optimized with aggregate (no N+1)
const getFolders = async (req, res) => {
  try {
    const folders = await Folder.find({ user: req.user.id }).sort({ createdAt: -1 }).lean();

    // Single aggregate query to get note counts — no N+1
    const counts = await Note.aggregate([
      { $match: { user: req.user.id, isTrashed: false, folder: { $ne: null } } },
      { $group: { _id: '$folder', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    counts.forEach(c => { countMap[c._id.toString()] = c.count; });

    const foldersWithCount = folders.map(f => ({
      ...f,
      noteCount: countMap[f._id.toString()] || 0
    }));

    res.status(200).json(foldersWithCount);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ CREATE FOLDER
const createFolder = async (req, res) => {
  try {
    const { name, color, icon, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Folder name required' });

    const folder = await Folder.create({
      name,
      color: color || '#E55B2D',
      icon: icon || '📁',
      description: description || '',
      user: req.user.id
    });

    res.status(201).json({ ...folder.toObject(), noteCount: 0 });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ UPDATE FOLDER
const updateFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, user: req.user.id });
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    const { name, color, icon, description } = req.body;
    if (name) folder.name = name;
    if (color) folder.color = color;
    if (icon) folder.icon = icon;
    if (description !== undefined) folder.description = description;

    await folder.save();
    res.status(200).json(folder);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ DELETE FOLDER
const deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, user: req.user.id });
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    await Note.updateMany({ folder: req.params.id }, { folder: null });
    await folder.deleteOne();

    res.status(200).json({ message: 'Folder deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getFolders, createFolder, updateFolder, deleteFolder };
