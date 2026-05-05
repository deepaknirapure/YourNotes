const CommunityNote = require('../models/CommunityNote');
const Note          = require('../models/Note');
const User          = require('../models/User');
const mongoose      = require('mongoose');
const cloudinary    = require('cloudinary').v2;
const streamifier   = require('streamifier');

// ─────────────────────────────────────────────────────────────────────────────
// Cloudinary config
// ─────────────────────────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper: Buffer → Cloudinary upload stream
const uploadToCloudinary = (buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    const resourceType = mimetype === 'application/pdf' ? 'raw' : 'image';
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'yournotes/community', resource_type: resourceType },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Helper: safely cast a string to ObjectId, return null on failure
const toObjectId = (id) => {
  try { return new mongoose.Types.ObjectId(id); }
  catch (_) { return null; }
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. GET FEED
//    - Reads from Note model (isPublic: true, isTrashed: false)
//    - Supports sort=popular|recent, subject filter, search, pagination
//    - Injects liked/saved booleans per the requesting user
// ─────────────────────────────────────────────────────────────────────────────
exports.getFeed = async (req, res) => {
  try {
    const { page = 1, search, sort = 'popular', subject } = req.query;
    const limit = 20;
    const skip  = (Number(page) - 1) * limit;
    const uid   = toObjectId(req.user.id);

    if (!uid) return res.status(401).json({ message: 'Invalid user' });

    // Build match filter
    const match = { isPublic: true, isTrashed: false };
    if (subject) match.subject = new RegExp(subject, 'i');
    if (search) {
      match.$or = [
        { title:     new RegExp(search, 'i') },
        { plainText: new RegExp(search, 'i') },
        { tags:      new RegExp(search, 'i') },
      ];
    }

    const sortStage =
      sort === 'recent'
        ? { $sort: { updatedAt: -1 } }
        : { $sort: { likesCount: -1, downloads: -1, updatedAt: -1 } };

    const pipeline = [
      { $match: match },
      {
        $addFields: {
          likesCount:    { $size: { $ifNull: ['$likes',    []] } },
          commentsCount: { $size: { $ifNull: ['$comments', []] } },
          savesCount:    { $size: { $ifNull: ['$saves',    []] } },
          liked:         { $in: [uid, { $ifNull: ['$likes', []] }] },
          saved:         { $in: [uid, { $ifNull: ['$saves', []] }] },
        },
      },
      sortStage,
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from:         'users',
          localField:   'user',
          foreignField: '_id',
          as:           'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1, title: 1, plainText: 1, tags: 1, subject: 1,
          user: { _id: 1, name: 1, avatar: 1 },
          likesCount: 1, commentsCount: 1, savesCount: 1,
          downloads: 1, isPublic: 1, liked: 1, saved: 1,
          createdAt: 1, updatedAt: 1,
        },
      },
    ];

    const [notes, total] = await Promise.all([
      Note.aggregate(pipeline),
      Note.countDocuments(match),
    ]);

    res.json({ notes, totalPages: Math.ceil(total / limit), currentPage: Number(page) });
  } catch (err) {
    console.error('getFeed error:', err);
    res.status(500).json({ message: 'Failed to load community feed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET NOTE BY ID  (includes populated comments for the modal)
// ─────────────────────────────────────────────────────────────────────────────
exports.getNoteById = async (req, res) => {
  try {
    // Try Note model first
    const note = await Note
      .findOne({ _id: req.params.id, isPublic: true, isTrashed: false })
      .populate('user', 'name avatar')
      .populate('comments.user', 'name avatar')
      .lean();

    if (note) return res.status(200).json(note);

    // Fallback to CommunityNote model
    const cNote = await CommunityNote
      .findById(req.params.id)
      .populate('uploadedBy', 'name avatar')
      .lean();

    if (!cNote || !cNote.isActive)
      return res.status(404).json({ message: 'Note not found' });

    return res.status(200).json(cNote);
  } catch (err) {
    console.error('getNoteById error:', err);
    res.status(500).json({ message: 'Failed to load note' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. TOGGLE LIKE
// ─────────────────────────────────────────────────────────────────────────────
exports.toggleLike = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id, isPublic: true, isTrashed: false,
    });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const uid   = req.user.id.toString();
    const index = note.likes.findIndex((id) => id.toString() === uid);
    const liked = index === -1;

    if (liked) note.likes.push(req.user.id);
    else       note.likes.splice(index, 1);

    await note.save();
    res.json({ liked, likesCount: note.likes.length });
  } catch (err) {
    console.error('toggleLike error:', err);
    res.status(500).json({ message: 'Action failed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. TOGGLE SAVE  (also mirrors to User.savedCommunityNotes)
// ─────────────────────────────────────────────────────────────────────────────
exports.toggleSave = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id, isPublic: true, isTrashed: false,
    });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const uid   = req.user.id.toString();
    const index = note.saves.findIndex((id) => id.toString() === uid);
    const saved = index === -1;

    if (saved) {
      note.saves.push(req.user.id);
      // Mirror to User collection for easy "my saved notes" retrieval
      await User.findByIdAndUpdate(req.user.id, {
        $addToSet: { savedCommunityNotes: note._id },
      });
    } else {
      note.saves.splice(index, 1);
      await User.findByIdAndUpdate(req.user.id, {
        $pull: { savedCommunityNotes: note._id },
      });
    }

    await note.save();
    res.json({ saved, savesCount: note.saves.length });
  } catch (err) {
    console.error('toggleSave error:', err);
    res.status(500).json({ message: 'Save action failed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. ADD COMMENT
// ─────────────────────────────────────────────────────────────────────────────
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim())
      return res.status(400).json({ message: 'Comment text is required' });

    const note = await Note.findOne({
      _id: req.params.id, isPublic: true, isTrashed: false,
    });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    note.comments.push({ user: req.user.id, text: text.trim() });
    await note.save();

    const lastComment = note.comments[note.comments.length - 1];
    const user        = await User.findById(req.user.id).select('name avatar');

    res.status(201).json({
      _id:       lastComment._id,
      user:      { _id: user._id, name: user.name, avatar: user.avatar },
      text:      lastComment.text,
      createdAt: lastComment.createdAt,
    });
  } catch (err) {
    console.error('addComment error:', err);
    res.status(500).json({ message: 'Comment failed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. DOWNLOAD — increment counter, return downloadable data-URI
// ─────────────────────────────────────────────────────────────────────────────
exports.downloadNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, isPublic: true, isTrashed: false },
      { $inc: { downloads: 1 } },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const fileText    = note.plainText || note.content || '';
    const fileNameRaw = (note.title || 'note').replace(/[^a-z0-9\-_ ]/gi, '').trim() || 'note';
    const fileName    = `${fileNameRaw}.txt`;
    const fileUrl     = `data:text/plain;charset=utf-8,${encodeURIComponent(fileText)}`;

    res.json({ fileUrl, fileName, downloads: note.downloads });
  } catch (err) {
    console.error('downloadNote error:', err);
    res.status(500).json({ message: 'Download tracker error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. UPLOAD FILE-BASED COMMUNITY NOTE  (Cloudinary → CommunityNote model)
// ─────────────────────────────────────────────────────────────────────────────
exports.uploadNote = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File is required' });

    const { title, description, subject, exam, course, tags } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: 'Title is required' });
    if (!subject?.trim()) return res.status(400).json({ message: 'Subject is required' });

    const result   = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    const fileType = req.file.mimetype === 'application/pdf' ? 'pdf' : 'image';

    const note = await CommunityNote.create({
      title:         title.trim(),
      description:   description?.trim() || '',
      subject:       subject.trim(),
      exam:          exam    || 'Other',
      course:        course  || 'Other',
      tags:          tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      fileUrl:       result.secure_url,
      filePublicId:  result.public_id,
      fileType,
      fileName:      req.file.originalname,
      uploadedBy:    req.user.id,
    });

    await User.findByIdAndUpdate(req.user.id, { $inc: { totalPublicUploads: 1 } });
    res.status(201).json({ message: 'Shared with community!', note });
  } catch (err) {
    console.error('uploadNote error:', err);
    res.status(500).json({ message: 'Upload failed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. GET USER'S PUBLIC NOTES
// ─────────────────────────────────────────────────────────────────────────────
exports.getUserNotes = async (req, res) => {
  try {
    const notes = await Note
      .find({ user: req.params.userId, isPublic: true, isTrashed: false })
      .sort({ updatedAt: -1 })
      .populate('user', 'name avatar')
      .lean();

    res.status(200).json(notes);
  } catch (err) {
    console.error('getUserNotes error:', err);
    res.status(500).json({ message: 'Failed to load user notes' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. DELETE / UN-PUBLISH  (owner only)
//    - Note model: flip isPublic to false
//    - CommunityNote model: flip isActive to false
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteNote = async (req, res) => {
  try {
    // Check Note model first
    const note = await Note.findById(req.params.id);
    if (note) {
      if (note.user.toString() !== req.user.id)
        return res.status(403).json({ message: 'Not allowed to delete this note' });

      note.isPublic = false;
      await note.save();

      // Remove from all users' savedCommunityNotes
      await User.updateMany(
        { savedCommunityNotes: note._id },
        { $pull: { savedCommunityNotes: note._id } }
      );

      return res.status(200).json({ message: 'Note removed from community' });
    }

    // Try CommunityNote model
    const cNote = await CommunityNote.findById(req.params.id);
    if (!cNote) return res.status(404).json({ message: 'Note not found' });

    if (cNote.uploadedBy.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not allowed to delete this note' });

    cNote.isActive = false;
    await cNote.save();

    return res.status(200).json({ message: 'Community note deleted' });
  } catch (err) {
    console.error('deleteNote error:', err);
    res.status(500).json({ message: 'Delete failed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 10. GET SAVED NOTES  (current user's bookmarked community notes)
// ─────────────────────────────────────────────────────────────────────────────
exports.getSavedNotes = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('savedCommunityNotes');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const uid   = toObjectId(req.user.id);
    const notes = await Note
      .aggregate([
        {
          $match: {
            _id:      { $in: user.savedCommunityNotes },
            isPublic: true,
            isTrashed: false,
          },
        },
        {
          $addFields: {
            likesCount:    { $size: { $ifNull: ['$likes',    []] } },
            commentsCount: { $size: { $ifNull: ['$comments', []] } },
            savesCount:    { $size: { $ifNull: ['$saves',    []] } },
            liked:         { $in: [uid, { $ifNull: ['$likes', []] }] },
            saved:         { $literal: true }, // already in saved list
          },
        },
        { $sort: { updatedAt: -1 } },
        {
          $lookup: {
            from: 'users', localField: 'user', foreignField: '_id', as: 'user',
          },
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1, title: 1, plainText: 1, tags: 1, subject: 1,
            user: { _id: 1, name: 1, avatar: 1 },
            likesCount: 1, commentsCount: 1, savesCount: 1,
            downloads: 1, liked: 1, saved: 1, createdAt: 1, updatedAt: 1,
          },
        },
      ]);

    res.json({ notes });
  } catch (err) {
    console.error('getSavedNotes error:', err);
    res.status(500).json({ message: 'Failed to load saved notes' });
  }
};

module.exports = exports;