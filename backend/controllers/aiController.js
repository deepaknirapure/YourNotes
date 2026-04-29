const Note = require('../models/Note');
const Folder = require('../models/Folder');
const fs = require('fs');

/**
 * Hindi Comment:
 * Ye controller "YOURNOTES" ka engine hai. 
 * Isme notes create karne se lekar, unhe folders mein daalne aur 
 * community privacy set karne tak ka saara logic functional hai.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. CREATE NOTE (With Folder & Privacy Logic)
// ─────────────────────────────────────────────────────────────────────────────
exports.createNote = async (req, res) => {
  try {
    const { title, content, plainText, folderId, isPublic, tags, subject } = req.body;

    const newNote = new Note({
      title,
      content,
      plainText,
      user: req.user.id,
      folder: folderId || null,
      isPublic: isPublic || false,
      tags: tags || [],
      subject: subject || 'General'
    });

    const savedNote = await newNote.save();

    // Agar folderId hai, toh folder ka noteCount badhao
    if (folderId) {
      await Folder.findByIdAndUpdate(folderId, { $inc: { noteCount: 1 } });
    }

    res.status(201).json(savedNote);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create note' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET ALL USER NOTES (Grid/Row Display ke liye)
// ─────────────────────────────────────────────────────────────────────────────
exports.getUserNotes = async (req, res) => {
  try {
    // Hindi: Trashed notes ko hata kar baaki saari notes fetch karna
    const notes = await Note.find({ user: req.user.id, isTrashed: false })
      .sort({ updatedAt: -1 })
      .populate('folder', 'name color');
    
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notes' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. TOGGLE STAR/BOOKMARK
// ─────────────────────────────────────────────────────────────────────────────
exports.toggleStar = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    note.isStarred = !note.isStarred;
    await note.save();

    res.status(200).json({ message: note.isStarred ? 'Added to Starred' : 'Removed from Starred', isStarred: note.isStarred });
  } catch (error) {
    res.status(500).json({ message: 'Failed to star note' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. PRIVACY CONTROL (Toggle Public/Private)
// ─────────────────────────────────────────────────────────────────────────────
exports.togglePrivacy = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    note.isPublic = !note.isPublic;
    await note.save();

    res.status(200).json({ message: `Note is now ${note.isPublic ? 'Public' : 'Private'}`, isPublic: note.isPublic });
  } catch (error) {
    res.status(500).json({ message: 'Privacy update failed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. IMPORT NOTES (From JSON/File)
// ─────────────────────────────────────────────────────────────────────────────
exports.importNotes = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const fileData = fs.readFileSync(req.file.path, 'utf-8');
    const importedData = JSON.parse(fileData); // Hindi: File JSON format mein honi chahiye

    // Multiple notes insert karna
    const notesToImport = importedData.map(note => ({
      ...note,
      user: req.user.id,
      isPublic: false // Safety: Imported notes default private rahengi
    }));

    const result = await Note.insertMany(notesToImport);
    
    // Temp file delete karo
    fs.unlinkSync(req.file.path);

    res.status(200).json({ message: `${result.length} notes imported successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Import failed. Check file format.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. DELETE/TRASH NOTE
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    
    if (note.isTrashed) {
      // Permanent delete
      await Note.findByIdAndDelete(req.params.id);
      // Folder count kam karo
      if (note.folder) await Folder.findByIdAndUpdate(note.folder, { $inc: { noteCount: -1 } });
    } else {
      // Soft delete (Move to Trash)
      note.isTrashed = true;
      note.trashedAt = new Date();
      await note.save();
    }

    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed' });
  }
};