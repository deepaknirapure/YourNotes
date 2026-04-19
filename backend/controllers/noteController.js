const Note = require("../models/Note");
const Folder = require("../models/Folder");

// ✅ GET ALL NOTES
const getNotes = async (req, res) => {
  try {
    const { folder, starred, trashed, tag } = req.query;
    let filter = { user: req.user.id, isTrashed: false };
    if (trashed === "true") filter = { user: req.user.id, isTrashed: true };
    if (folder) filter.folder = folder;
    if (starred === "true") filter.isStarred = true;
    if (tag) filter.tags = tag;
    const notes = await Note.find(filter)
      .populate("folder", "name color icon")
      .sort({ isPinned: -1, updatedAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET SINGLE NOTE
const getNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("folder", "name color icon");
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ CREATE NOTE
const createNote = async (req, res) => {
  try {
    const { title, content, plainText, folder, tags } = req.body;
    const note = await Note.create({
      title: title || "Untitled Note",
      content: content || "",
      plainText: plainText || "",
      folder: folder || null,
      tags: tags || [],
      user: req.user.id,
    });

    // FIX: update user weekly count AND folder noteCount atomically
    const User = require("../models/User");
    await User.findByIdAndUpdate(req.user.id, { $inc: { notesCreatedThisWeek: 1 } });

    if (folder) {
      await Folder.findByIdAndUpdate(folder, { $inc: { noteCount: 1 } });
    }

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ UPDATE NOTE
const updateNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ message: "Note not found" });

    const { title, content, plainText, folder, tags, isStarred } = req.body;

    // FIX: track folder change to keep noteCount in sync
    const oldFolder = note.folder ? note.folder.toString() : null;
    const newFolder = folder !== undefined ? (folder || null) : oldFolder;

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (plainText !== undefined) note.plainText = plainText;
    if (folder !== undefined) note.folder = folder;
    if (tags !== undefined) note.tags = tags;
    if (isStarred !== undefined) note.isStarred = isStarred;
    await note.save();

    // Update folder counts if folder changed
    if (oldFolder !== newFolder) {
      if (oldFolder) await Folder.findByIdAndUpdate(oldFolder, { $inc: { noteCount: -1 } });
      if (newFolder) await Folder.findByIdAndUpdate(newFolder, { $inc: { noteCount: 1 } });
    }

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ STAR / UNSTAR NOTE
const toggleStar = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ message: "Note not found" });
    note.isStarred = !note.isStarred;
    await note.save();
    res.status(200).json({ message: note.isStarred ? "Note starred!" : "Note unstarred!", isStarred: note.isStarred });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ PIN / UNPIN NOTE
const togglePin = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ message: "Note not found" });
    note.isPinned = !note.isPinned;
    await note.save();
    res.status(200).json({ message: note.isPinned ? "Note pinned!" : "Note unpinned!", isPinned: note.isPinned });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ TRASH NOTE
const trashNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ message: "Note not found" });
    note.isTrashed = true;
    note.trashedAt = new Date();
    await note.save();

    // FIX: decrement folder noteCount when trashed
    if (note.folder) {
      await Folder.findByIdAndUpdate(note.folder, { $inc: { noteCount: -1 } });
    }

    res.status(200).json({ message: "Note moved to trash" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ RESTORE FROM TRASH
const restoreNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ message: "Note not found" });
    note.isTrashed = false;
    note.trashedAt = null;
    await note.save();

    // FIX: increment folder noteCount when restored
    if (note.folder) {
      await Folder.findByIdAndUpdate(note.folder, { $inc: { noteCount: 1 } });
    }

    res.status(200).json({ message: "Note restored!" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ PERMANENT DELETE
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ message: "Note not found" });
    await note.deleteOne();
    res.status(200).json({ message: "Note permanently deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ SEARCH NOTES
const searchNotes = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "Search query required" });
    const notes = await Note.find(
      { user: req.user.id, isTrashed: false, $text: { $search: q } },
      { score: { $meta: "textScore" } }
    )
      .populate("folder", "name color icon")
      .sort({ score: { $meta: "textScore" } })
      .limit(20);
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ AUTO-DELETE TRASHED NOTES OLDER THAN 30 DAYS
const cleanupTrashedNotes = async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await Note.deleteMany({
      isTrashed: true,
      trashedAt: { $lt: thirtyDaysAgo }
    });
    if (result.deletedCount > 0) {
      console.log(`🗑️  Auto-cleanup: ${result.deletedCount} trashed notes deleted`);
    }
  } catch (error) {
    console.error('Trash cleanup error:', error);
  }
};

// ✅ GENERATE / REVOKE SHARE LINK
const generateShareLink = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ message: "Note not found" });

    const { action, permission } = req.body;

    if (action === "revoke") {
      note.shareToken = null;
      note.sharePermission = "view";
      await note.save();
      return res.status(200).json({ message: "Share link revoked!" });
    }

    const crypto = require("crypto");
    note.shareToken = crypto.randomBytes(24).toString("hex");
    note.sharePermission = permission || "view";
    await note.save();

    const shareUrl = `${process.env.FRONTEND_URL || "http://localhost:3001"}/shared/${note.shareToken}`;
    res.status(200).json({ shareUrl, shareToken: note.shareToken, permission: note.sharePermission });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET SHARED NOTE (public)
const getSharedNote = async (req, res) => {
  try {
    const note = await Note.findOne({ shareToken: req.params.token, isTrashed: false })
      .populate("user", "name")
      .populate("folder", "name color icon");
    if (!note) return res.status(404).json({ message: "Shared note not found or link revoked" });
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
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getNotes, getNote, createNote, updateNote,
  toggleStar, togglePin, trashNote, restoreNote,
  deleteNote, searchNotes, generateShareLink,
  getSharedNote, cleanupTrashedNotes,
};
