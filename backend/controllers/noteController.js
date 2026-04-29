const Note = require('../models/Note');
const Folder = require('../models/Folder');
const User = require('../models/User');
const crypto = require('crypto');

/**
 * Hindi Comment:
 * Ye final Note Controller hai. Isme notes ka CRUD, Star/Pin logic, 
 * Trash management (30 days cleanup), aur Community Privacy (Public/Private) 
 * ka poora functional code hai.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. GET NOTES (With Advanced Filters)
// ─────────────────────────────────────────────────────────────────────────────
exports.getNotes = async (req, res) => {
  try {
    const { folder, starred, trashed, tag, isPublic } = req.query;

    // Default filter: Active notes
    let filter = { user: req.user.id, isTrashed: false };

    // Conditions apply karo
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

// ─────────────────────────────────────────────────────────────────────────────
// 2. CREATE NOTE (With Goal Tracking)
// ─────────────────────────────────────────────────────────────────────────────
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

    // Hindi: User ka weekly goal count badhao
    await User.findByIdAndUpdate(req.user.id, { $inc: { notesCreatedThisWeek: 1 } });

    // Hindi: Folder ka note count update karo
    if (folder) {
      await Folder.findByIdAndUpdate(folder, { $inc: { noteCount: 1 } });
    }

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Note creation failed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. UPDATE NOTE (With Privacy & Folder Sync)
// ─────────────────────────────────────────────────────────────────────────────
exports.updateNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const oldFolder = note.folder ? note.folder.toString() : null;
    
    // Update fields
    const allowedUpdates = ['title', 'content', 'plainText', 'folder', 'tags', 'isStarred', 'isPinned', 'isPublic', 'subject'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) note[field] = req.body[field];
    });

    await note.save();

    // Hindi: Agar folder change hua hai toh counts sync karo
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

// ─────────────────────────────────────────────────────────────────────────────
// 4. TRASH/RESTORE NOTE
// ─────────────────────────────────────────────────────────────────────────────
exports.trashNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    note.isTrashed = !note.isTrashed;
    note.trashedAt = note.isTrashed ? new Date() : null;
    await note.save();

    // Sync folder count
    if (note.folder) {
      const incValue = note.isTrashed ? -1 : 1;
      await Folder.findByIdAndUpdate(note.folder, { $inc: { noteCount: incValue } });
    }

    res.status(200).json({ message: note.isTrashed ? 'Moved to Trash' : 'Restored' });
  } catch (error) {
    res.status(500).json({ message: 'Action failed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. SHARE LINK (Generate/Revoke)
// ─────────────────────────────────────────────────────────────────────────────
exports.generateShareLink = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
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

// ─────────────────────────────────────────────────────────────────────────────
// 6. AUTO-CLEANUP (30 Days)
// ─────────────────────────────────────────────────────────────────────────────
exports.cleanupTrashedNotes = async () => {
  try {
    const limitDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await Note.deleteMany({ isTrashed: true, trashedAt: { $lt: limitDate } });
    if (result.deletedCount > 0) console.log(`Auto-deleted ${result.deletedCount} notes.`);
  } catch (error) {
    console.error('Cleanup Error:', error);
  }
};