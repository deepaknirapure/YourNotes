const Folder = require('../models/Folder');
const Note = require('../models/Note');

// ✅ GET ALL FOLDERS
const getFolders = async (req, res) => {
  try {
    const folders = await Folder.find({ user: req.user.id })
                                .sort({ createdAt: -1 });

    // Note count har folder mein add karo
    const foldersWithCount = await Promise.all(
      folders.map(async (folder) => {
        const count = await Note.countDocuments({
          folder: folder._id,
          isTrashed: false
        });
        return { ...folder.toObject(), noteCount: count };
      })
    );

    res.status(200).json(foldersWithCount);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ CREATE FOLDER
const createFolder = async (req, res) => {
  try {
    const { name, color, icon, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Folder name required' });
    }

    // Free users ke liye 3 folder limit
    const folderCount = await Folder.countDocuments({ user: req.user.id });
    if (req.user.plan === 'free' && folderCount >= 3) {
      return res.status(403).json({ 
        message: 'Free plan mein sirf 3 folders allowed hain' 
      });
    }

    const folder = await Folder.create({
      name,
      color: color || '#4F46E5',
      icon: icon || '📁',
      description: description || '',
      user: req.user.id
    });

    res.status(201).json(folder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ UPDATE FOLDER
const updateFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    const { name, color, icon, description } = req.body;
    if (name) folder.name = name;
    if (color) folder.color = color;
    if (icon) folder.icon = icon;
    if (description !== undefined) folder.description = description;

    await folder.save();
    res.status(200).json(folder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ DELETE FOLDER
const deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Folder ke saare notes ko unfolder karo
    await Note.updateMany(
      { folder: req.params.id },
      { folder: null }
    );

    await folder.deleteOne();
    res.status(200).json({ message: 'Folder deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getFolders, createFolder, updateFolder, deleteFolder };
