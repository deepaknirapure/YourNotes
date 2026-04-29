const CommunityNote = require('../models/CommunityNote');
const Note = require('../models/Note');
const User = require('../models/User');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

/**
 * Hindi Comment:
 * Ye controller Community section ki jaan hai.
 * Isme file upload (Cloudinary), subject-wise ranking, aur social features (Like, Comment, Save) 
 * ka complete logic functional hai.
 */

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function: Buffer ko Cloudinary pe stream karne ke liye
const uploadToCloudinary = (buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    const resourceType = mimetype === 'application/pdf' ? 'raw' : 'image';
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'yournotes/community', resource_type: resourceType },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. UPLOAD NOTE — Community mein note share karna
// ─────────────────────────────────────────────────────────────────────────────
exports.uploadNote = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File is required' });

    const { title, description, subject, exam, course, tags } = req.body;

    // Cloudinary upload
    const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);

    // File type detection
    const fileType = req.file.mimetype === 'application/pdf' ? 'pdf' : 'image';

    const note = await CommunityNote.create({
      title,
      description,
      subject,
      exam: exam || 'Other',
      course: course || 'Other',
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      fileUrl: result.secure_url,
      filePublicId: result.public_id,
      fileType,
      fileName: req.file.originalname,
      uploadedBy: req.user.id,
    });

    // User's total upload count update karna
    await User.findByIdAndUpdate(req.user.id, { $inc: { totalPublicUploads: 1 } });

    res.status(201).json({ message: 'Shared with community!', note });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET FEED — Public Notes (privacy ke through)
//    - Subject-wise filters
//    - Ranking: likesCount desc (top notes first)
// ─────────────────────────────────────────────────────────────────────────────
exports.getFeed = async (req, res) => {
  try {
    const { page = 1, search, sort = 'popular', subject } = req.query;
    const limit = 12;
    const skip = (page - 1) * limit;

    const uid = new mongoose.Types.ObjectId(req.user.id);
    const match = { isPublic: true, isTrashed: false };
    if (subject) match.subject = new RegExp(subject, 'i');
    if (search) {
      match.$or = [
        { title: new RegExp(search, 'i') },
        { plainText: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') },
      ];
    }

    const pipeline = [
      { $match: match },
      {
        $addFields: {
          likesCount: { $size: '$likes' },
          commentsCount: { $size: '$comments' },
          savesCount: { $size: '$saves' },
          liked: { $in: [uid, '$likes'] },
          saved: { $in: [uid, '$saves'] },
        },
      },
      ...(sort === 'recent'
        ? [{ $sort: { updatedAt: -1 } }]
        : [{ $sort: { likesCount: -1, downloads: -1, updatedAt: -1 } }]),
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          title: 1,
          plainText: 1,
          content: 1,
          tags: 1,
          subject: 1,
          user: { _id: 1, name: 1, avatar: 1 },
          likesCount: 1,
          commentsCount: 1,
          savesCount: 1,
          downloads: 1,
          isPublic: 1,
          liked: 1,
          saved: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];

    const notes = await Note.aggregate(pipeline);
    const total = await Note.countDocuments(match);

    res.json({
      notes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load community feed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. TOGGLE LIKE — Like/Unlike counter (public Note based)
// ─────────────────────────────────────────────────────────────────────────────
exports.toggleLike = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, isPublic: true, isTrashed: false });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const uid = req.user.id.toString();
    const index = note.likes.findIndex((id) => id.toString() === uid);
    const liked = index === -1;

    if (liked) note.likes.push(req.user.id);
    else note.likes.splice(index, 1);

    await note.save();
    res.json({ liked, likesCount: note.likes.length });
  } catch (err) {
    res.status(500).json({ message: 'Action failed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. ADD COMMENT — Comment system (public Note based)
// ─────────────────────────────────────────────────────────────────────────────
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Comment text is required' });

    const note = await Note.findOne({ _id: req.params.id, isPublic: true, isTrashed: false });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    note.comments.push({ user: req.user.id, text: text.trim() });
    await note.save();

    const lastComment = note.comments[note.comments.length - 1];
    const user = await User.findById(req.user.id).select('name avatar');
    res.status(201).json({
      user: { _id: user._id, name: user.name, avatar: user.avatar },
      text: lastComment.text,
      createdAt: lastComment.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: 'Comment failed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. DOWNLOAD & TRACK — Download count tracker
//    - Note ko text file ki tarah download karte hain
// ─────────────────────────────────────────────────────────────────────────────
exports.downloadNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, isPublic: true, isTrashed: false },
      { $inc: { downloads: 1 } },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const fileText = note.plainText || note.content || '';
    const fileNameSafe = (note.title || 'note').replace(/[^a-z0-9\-_ ]/gi, '').trim() || 'note';
    const fileName = `${fileNameSafe}.txt`;
    const fileUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(fileText)}`;

    res.json({ fileUrl, fileName });
  } catch (err) {
    res.status(500).json({ message: 'Download tracker error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. TOGGLE SAVE — Bookmark (public Note based)
// ─────────────────────────────────────────────────────────────────────────────
exports.toggleSave = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, isPublic: true, isTrashed: false });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const uid = req.user.id.toString();
    const index = note.saves.findIndex((id) => id.toString() === uid);
    const saved = index === -1;

    if (saved) note.saves.push(req.user.id);
    else note.saves.splice(index, 1);

    await note.save();
    res.json({ saved, savesCount: note.saves.length });
  } catch (err) {
    res.status(500).json({ message: 'Save action failed' });
  }
};

exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, isPublic: true, isTrashed: false })
      .populate('user', 'name avatar')
      .lean();
    if (note) return res.status(200).json(note);

    const cNote = await CommunityNote.findById(req.params.id).populate('uploadedBy', 'name avatar').lean();
    if (!cNote || !cNote.isActive) return res.status(404).json({ message: 'Note not found' });
    return res.status(200).json(cNote);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load note' });
  }
};

exports.getUserNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.params.userId, isPublic: true, isTrashed: false })
      .sort({ updatedAt: -1 })
      .populate('user', 'name avatar')
      .lean();
    return res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load user notes' });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (note) {
      if (note.user.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not allowed to delete this note' });
      }
      note.isPublic = false; // Community from Note model: hide from feed
      await note.save();
      return res.status(200).json({ message: 'Community note removed' });
    }

    const cNote = await CommunityNote.findById(req.params.id);
    if (!cNote) return res.status(404).json({ message: 'Note not found' });
    if (cNote.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not allowed to delete this note' });
    }
    cNote.isActive = false;
    await cNote.save();
    return res.status(200).json({ message: 'Community note deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed' });
  }
};

module.exports = exports;