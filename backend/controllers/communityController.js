const CommunityNote = require('../models/CommunityNote');
const User = require('../models/User');
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
// 2. GET FEED — Subject-wise aur Ranking based list
// ─────────────────────────────────────────────────────────────────────────────
exports.getFeed = async (req, res) => {
  try {
    const { page = 1, exam, search, sort = 'popular', subject } = req.query;
    const limit = 12;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };
    if (exam && exam !== 'All') filter.exam = exam;
    if (subject) filter.subject = new RegExp(subject, 'i');
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }

    // Hindi: Popularity ranking logic (Likes + Downloads)
    let sortObj = { createdAt: -1 };
    if (sort === 'popular') sortObj = { downloads: -1, 'likes.length': -1 };

    const notes = await CommunityNote.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .populate('uploadedBy', 'name avatar');

    const total = await CommunityNote.countDocuments(filter);

    res.json({
      notes,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load community feed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. TOGGLE LIKE — Like/Unlike counter
// ─────────────────────────────────────────────────────────────────────────────
exports.toggleLike = async (req, res) => {
  try {
    const note = await CommunityNote.findById(req.params.id);
    const index = note.likes.indexOf(req.user.id);

    if (index === -1) {
      note.likes.push(req.user.id);
    } else {
      note.likes.splice(index, 1);
    }

    await note.save();
    res.json({ liked: index === -1, likesCount: note.likes.length });
  } catch (err) {
    res.status(500).json({ message: 'Action failed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. ADD COMMENT — Live comment interaction
// ─────────────────────────────────────────────────────────────────────────────
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const note = await CommunityNote.findById(req.params.id);
    
    note.comments.push({ user: req.user.id, text });
    await note.save();

    const updatedNote = await CommunityNote.findById(req.params.id).populate('comments.user', 'name avatar');
    res.status(201).json(updatedNote.comments[updatedNote.comments.length - 1]);
  } catch (err) {
    res.status(500).json({ message: 'Comment failed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. DOWNLOAD & TRACK — Download count tracker
// ─────────────────────────────────────────────────────────────────────────────
exports.downloadNote = async (req, res) => {
  try {
    const note = await CommunityNote.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } }, { new: true });
    res.json({ fileUrl: note.fileUrl });
  } catch (err) {
    res.status(500).json({ message: 'Download tracker error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. TOGGLE SAVE — Bookmark doosron ki notes
// ─────────────────────────────────────────────────────────────────────────────
exports.toggleSave = async (req, res) => {
  try {
    const note = await CommunityNote.findById(req.params.id);
    const isSaved = note.saves.includes(req.user.id);

    if (!isSaved) {
      note.saves.push(req.user.id);
      await User.findByIdAndUpdate(req.user.id, { $addToSet: { savedCommunityNotes: note._id } });
    } else {
      note.saves.pull(req.user.id);
      await User.findByIdAndUpdate(req.user.id, { $pull: { savedCommunityNotes: note._id } });
    }

    await note.save();
    res.json({ saved: !isSaved, savesCount: note.saves.length });
  } catch (err) {
    res.status(500).json({ message: 'Save action failed' });
  }
};

module.exports = exports;