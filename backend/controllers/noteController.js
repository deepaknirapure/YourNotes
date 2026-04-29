const Note = require('../models/Note');
const Folder = require('../models/Folder');
const User = require('../models/User');
const crypto = require('crypto');

// Hindi: Reusable helper taaki user-scope validation har jagah consistent rahe
const findUserNote = (noteId, userId) => Note.findOne({ _id: noteId, user: userId });

exports.getNotes = async (req, res) => {
  try {
    const { folder, starred, trashed, tag, isPublic } = req.query;
    let filter = { user: req.user.id, isTrashed: false };
    if (trashed === 'true') filter.isTrashed = true;
    if (folder) filter.folder = folder;
    if (starred === 'true') filter.isStarred = true;
    if (isPublic === 'true') filter.isPublic = true;
    if (tag) filter.tags = tag;

    const notes = await Note.find(filter)
      .populate('folder', 'name color icon')
      .sort({ isPinned: -1, updatedAt: -1 });

    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching notes' });
  }
};

exports.getNote = async (req, res) => {
  try {
    const note = await findUserNote(req.params.id, req.user.id).populate('folder', 'name color icon');
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch note' });
  }
};

exports.createNote = async (req, res) => {
  try {
    const { title, content, plainText, folder, tags, isPublic, subject } = req.body;

    const note = await Note.create({
      title: title || 'Untitled Note',
      content: content || '',
      plainText: plainText || '',
      folder: folder || null,
      tags: tags || [],
      isPublic: isPublic || false,
      subject: subject || 'General',
      user: req.user.id,
    });

    await User.findByIdAndUpdate(req.user.id, { $inc: { notesCreatedThisWeek: 1 } });
    if (folder) {
      await Folder.findByIdAndUpdate(folder, { $inc: { noteCount: 1 } });
    }

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Note creation failed' });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const note = await findUserNote(req.params.id, req.user.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const oldFolder = note.folder ? note.folder.toString() : null;
    
    const allowedUpdates = ['title', 'content', 'plainText', 'folder', 'tags', 'isStarred', 'isPinned', 'isPublic', 'subject'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) note[field] = req.body[field];
    });

    await note.save();

    const newFolder = note.folder ? note.folder.toString() : null;
    if (oldFolder !== newFolder) {
      if (oldFolder) await Folder.findByIdAndUpdate(oldFolder, { $inc: { noteCount: -1 } });
      if (newFolder) await Folder.findByIdAndUpdate(newFolder, { $inc: { noteCount: 1 } });
    }

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Update failed' });
  }
};

exports.trashNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    note.isTrashed = !note.isTrashed;
    note.trashedAt = note.isTrashed ? new Date() : null;
    await note.save();

    if (note.folder) {
      const incValue = note.isTrashed ? -1 : 1;
      await Folder.findByIdAndUpdate(note.folder, { $inc: { noteCount: incValue } });
    }

    res.status(200).json({ message: note.isTrashed ? 'Moved to Trash' : 'Restored' });
  } catch (error) {
    res.status(500).json({ message: 'Action failed' });
  }
};

exports.restoreNote = async (req, res) => {
  try {
    const note = await findUserNote(req.params.id, req.user.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    note.isTrashed = false;
    note.trashedAt = null;
    await note.save();

    if (note.folder) {
      await Folder.findByIdAndUpdate(note.folder, { $inc: { noteCount: 1 } });
    }

    res.status(200).json({ message: 'Restored successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Restore failed' });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const note = await findUserNote(req.params.id, req.user.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (!note.isTrashed) {
      note.isTrashed = true;
      note.trashedAt = new Date();
      await note.save();
      if (note.folder) await Folder.findByIdAndUpdate(note.folder, { $inc: { noteCount: -1 } });
      return res.status(200).json({ message: 'Moved to trash' });
    }

    if (note.folder) await Folder.findByIdAndUpdate(note.folder, { $inc: { noteCount: -1 } });
    await note.deleteOne();
    res.status(200).json({ message: 'Permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed' });
  }
};

exports.toggleStar = async (req, res) => {
  try {
    const note = await findUserNote(req.params.id, req.user.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    note.isStarred = !note.isStarred;
    await note.save();
    res.status(200).json({ isStarred: note.isStarred });
  } catch (error) {
    res.status(500).json({ message: 'Star toggle failed' });
  }
};

exports.togglePin = async (req, res) => {
  try {
    const note = await findUserNote(req.params.id, req.user.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    note.isPinned = !note.isPinned;
    await note.save();
    res.status(200).json({ isPinned: note.isPinned });
  } catch (error) {
    res.status(500).json({ message: 'Pin toggle failed' });
  }
};

exports.searchNotes = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.status(200).json([]);

    const notes = await Note.find({
      user: req.user.id,
      isTrashed: false,
      $or: [{ title: new RegExp(q, 'i') }, { plainText: new RegExp(q, 'i') }, { tags: new RegExp(q, 'i') }],
    })
      .sort({ updatedAt: -1 })
      .populate('folder', 'name color icon');

    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Search failed' });
  }
};

exports.generateShareLink = async (req, res) => {
  try {
    const note = await findUserNote(req.params.id, req.user.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    const { action, permission } = req.body;

    if (action === 'revoke') {
      note.shareToken = null;
    } else {
      note.shareToken = crypto.randomBytes(24).toString('hex');
      note.sharePermission = permission || 'view';
    }

    await note.save();
    res.status(200).json({ token: note.shareToken, permission: note.sharePermission });
  } catch (error) {
    res.status(500).json({ message: 'Sharing failed' });
  }
};

exports.getSharedNote = async (req, res) => {
  try {
    const note = await Note.findOne({ shareToken: req.params.token, isTrashed: false }).populate('user', 'name');
    if (!note) return res.status(404).json({ message: 'Shared note not found' });
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load shared note' });
  }
};

exports.cleanupTrashedNotes = async () => {
  try {
    const limitDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await Note.deleteMany({ isTrashed: true, trashedAt: { $lt: limitDate } });
    if (result.deletedCount > 0) console.log(`Auto-deleted ${result.deletedCount} notes.`);
  } catch (error) {
    console.error('Cleanup Error:', error);
  }
};

module.exports = {
  getNotes: exports.getNotes,
  getNote: exports.getNote,
  createNote: exports.createNote,
  updateNote: exports.updateNote,
  toggleStar: exports.toggleStar,
  togglePin: exports.togglePin,
  trashNote: exports.trashNote,
  restoreNote: exports.restoreNote,
  deleteNote: exports.deleteNote,
  searchNotes: exports.searchNotes,
  generateShareLink: exports.generateShareLink,
  getSharedNote: exports.getSharedNote,
  cleanupTrashedNotes: exports.cleanupTrashedNotes,
};