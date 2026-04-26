// Note controller — notes ke saare CRUD operations yahan hain
const Note = require('../models/Note');
const Folder = require('../models/Folder');
const User = require('../models/User');
const crypto = require('crypto');

// ─────────────────────────────────────────────────────────────────────────────
// GET ALL NOTES — user ki saari notes fetch karo (filter ke saath)
// ─────────────────────────────────────────────────────────────────────────────
const getNotes = async (req, res) => {
  try {
    const { folder, starred, trashed, tag } = req.query;

    // Default: active notes (trash mein nahi)
    let filter = { user: req.user.id, isTrashed: false };

    // Agar trashed=true — sirf trash mein wali notes
    if (trashed === 'true') {
      filter = { user: req.user.id, isTrashed: true };
    }

    // Optional filters apply karo
    if (folder) filter.folder = folder;
    if (starred === 'true') filter.isStarred = true;
    if (tag) filter.tags = tag;

    // Notes fetch karo — pinned pehle, phir latest
    const notes = await Note.find(filter)
      .populate('folder', 'name color icon')
      .sort({ isPinned: -1, updatedAt: -1 });

    res.status(200).json(notes);
  } catch (error) {
    console.error('GetNotes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET SINGLE NOTE — ek specific note fetch karo
// ─────────────────────────────────────────────────────────────────────────────
const getNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user.id, // Ensure karo ki sirf apni note dekhe
    }).populate('folder', 'name color icon');

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.status(200).json(note);
  } catch (error) {
    console.error('GetNote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CREATE NOTE — naya note banao
// ─────────────────────────────────────────────────────────────────────────────
const createNote = async (req, res) => {
  try {
    const { title, content, plainText, folder, tags } = req.body;

    const note = await Note.create({
      title: title || 'Untitled Note',
      content: content || '',
      plainText: plainText || '',
      folder: folder || null,
      tags: tags || [],
      user: req.user.id,
    });

    // Is week notes count badhao
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { notesCreatedThisWeek: 1 },
    });

    // Agar folder mein daala — folder ka noteCount badhao
    if (folder) {
      await Folder.findByIdAndUpdate(folder, { $inc: { noteCount: 1 } });
    }

    res.status(201).json(note);
  } catch (error) {
    console.error('CreateNote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE NOTE — existing note update karo
// ─────────────────────────────────────────────────────────────────────────────
const updateNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const { title, content, plainText, folder, tags, isStarred } = req.body;

    // Folder change track karo — noteCount sync karne ke liye
    const oldFolder = note.folder ? note.folder.toString() : null;
    const newFolder = folder !== undefined ? (folder || null) : oldFolder;

    // Sirf wahi fields update karo jo provide ki gayi hain
    if (title !== undefined)     note.title = title;
    if (content !== undefined)   note.content = content;
    if (plainText !== undefined) note.plainText = plainText;
    if (folder !== undefined)    note.folder = folder;
    if (tags !== undefined)      note.tags = tags;
    if (isStarred !== undefined) note.isStarred = isStarred;

    await note.save();

    // Agar folder badla — dono folders ka noteCount update karo
    if (oldFolder !== newFolder) {
      if (oldFolder) {
        await Folder.findByIdAndUpdate(oldFolder, { $inc: { noteCount: -1 } });
      }
      if (newFolder) {
        await Folder.findByIdAndUpdate(newFolder, { $inc: { noteCount: 1 } });
      }
    }

    res.status(200).json(note);
  } catch (error) {
    console.error('UpdateNote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// TOGGLE STAR — note star/unstar karo
// ─────────────────────────────────────────────────────────────────────────────
const toggleStar = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.isStarred = !note.isStarred;
    await note.save();

    res.status(200).json({
      message: note.isStarred ? 'Note starred!' : 'Note unstarred!',
      isStarred: note.isStarred,
    });
  } catch (error) {
    console.error('ToggleStar error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// TOGGLE PIN — note pin/unpin karo
// ─────────────────────────────────────────────────────────────────────────────
const togglePin = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.isPinned = !note.isPinned;
    await note.save();

    res.status(200).json({
      message: note.isPinned ? 'Note pinned!' : 'Note unpinned!',
      isPinned: note.isPinned,
    });
  } catch (error) {
    console.error('TogglePin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// TRASH NOTE — note trash mein bhejo
// ─────────────────────────────────────────────────────────────────────────────
const trashNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.isTrashed = true;
    note.trashedAt = new Date();
    await note.save();

    // Folder ka noteCount kam karo
    if (note.folder) {
      await Folder.findByIdAndUpdate(note.folder, { $inc: { noteCount: -1 } });
    }

    res.status(200).json({ message: 'Note moved to trash' });
  } catch (error) {
    console.error('TrashNote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// RESTORE NOTE — trash se wapas lao
// ─────────────────────────────────────────────────────────────────────────────
const restoreNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.isTrashed = false;
    note.trashedAt = null;
    await note.save();

    // Folder ka noteCount badhao
    if (note.folder) {
      await Folder.findByIdAndUpdate(note.folder, { $inc: { noteCount: 1 } });
    }

    res.status(200).json({ message: 'Note restored!' });
  } catch (error) {
    console.error('RestoreNote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE NOTE — permanently delete karo
// ─────────────────────────────────────────────────────────────────────────────
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    await note.deleteOne();
    res.status(200).json({ message: 'Note permanently deleted' });
  } catch (error) {
    console.error('DeleteNote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH NOTES — text search karo
// ─────────────────────────────────────────────────────────────────────────────
const searchNotes = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query required' });
    }

    // MongoDB text search use karo (index banana zaroori hai)
    const notes = await Note.find(
      { user: req.user.id, isTrashed: false, $text: { $search: q } },
      { score: { $meta: 'textScore' } } // Relevance score
    )
      .populate('folder', 'name color icon')
      .sort({ score: { $meta: 'textScore' } }) // Most relevant pehle
      .limit(20);

    res.status(200).json(notes);
  } catch (error) {
    console.error('SearchNotes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GENERATE / REVOKE SHARE LINK — note share karo
// ─────────────────────────────────────────────────────────────────────────────
const generateShareLink = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const { action, permission } = req.body;

    // Agar revoke action — share link hatao
    if (action === 'revoke') {
      note.shareToken = null;
      note.sharePermission = 'view';
      await note.save();
      return res.status(200).json({ message: 'Share link revoked!' });
    }

    // Naya unique share token banao
    note.shareToken = crypto.randomBytes(24).toString('hex');
    note.sharePermission = permission || 'view';
    await note.save();

    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/shared/${note.shareToken}`;

    res.status(200).json({
      shareUrl,
      shareToken: note.shareToken,
      permission: note.sharePermission,
    });
  } catch (error) {
    console.error('GenerateShareLink error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET SHARED NOTE — public route — share link se note dekho
// ─────────────────────────────────────────────────────────────────────────────
const getSharedNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      shareToken: req.params.token,
      isTrashed: false,
    })
      .populate('user', 'name')
      .populate('folder', 'name color icon');

    if (!note) {
      return res.status(404).json({ message: 'Shared note not found or link revoked' });
    }

    // Sirf public-safe fields return karo
    res.status(200).json({
      title: note.title,
      content: note.content,
      plainText: note.plainText,
      tags: note.tags,
      permission: note.sharePermission,
      author: note.user?.name,
      folder: note.folder,
      updatedAt: note.updatedAt,
      createdAt: note.createdAt,
    });
  } catch (error) {
    console.error('GetSharedNote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CLEANUP TRASHED NOTES — 30 din purani trashed notes auto-delete karo
// Yeh function server.js mein setInterval se call hota hai
// ─────────────────────────────────────────────────────────────────────────────
const cleanupTrashedNotes = async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await Note.deleteMany({
      isTrashed: true,
      trashedAt: { $lt: thirtyDaysAgo },
    });

    if (result.deletedCount > 0) {
      console.log(`🗑️  Auto-cleanup: ${result.deletedCount} trashed notes deleted`);
    }
  } catch (error) {
    console.error('Trash cleanup error:', error);
  }
};

module.exports = {
  getNotes,
  getNote,
  createNote,
  updateNote,
  toggleStar,
  togglePin,
  trashNote,
  restoreNote,
  deleteNote,
  searchNotes,
  generateShareLink,
  getSharedNote,
  cleanupTrashedNotes,
};
