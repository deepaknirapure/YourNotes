// Community controller — publicly shared notes/files manage karta hai
const CommunityNote = require('../models/CommunityNote');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Cloudinary configure karo (.env se keys padhe)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Helper: buffer ko Cloudinary pe upload karo ───────────────────────────────
const uploadToCloudinary = (buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    // PDF ke liye "raw", images ke liye "image"
    const resourceType = mimetype === 'application/pdf' ? 'raw' : 'image';

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'yournotes/community',
        resource_type: resourceType,
        allowed_formats: ['pdf', 'jpg', 'jpeg', 'png', 'webp'],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    // Buffer ko stream mein convert karke Cloudinary ko bhejo
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD NOTE — file Cloudinary pe upload karo aur DB mein save karo
// POST /api/community/upload
// ─────────────────────────────────────────────────────────────────────────────
exports.uploadNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    const { title, description, subject, exam, course, tags } = req.body;

    if (!title?.trim() || !subject?.trim()) {
      return res.status(400).json({ message: 'Title and subject are required' });
    }

    // File Cloudinary pe upload karo
    const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);

    // File type determine karo
    let fileType = 'other';
    if (req.file.mimetype === 'application/pdf')       fileType = 'pdf';
    else if (req.file.mimetype.startsWith('image/'))   fileType = 'image';

    // Tags parse karo (comma separated string se array)
    let parsedTags = [];
    if (tags) {
      parsedTags = tags
        .split(',')
        .map((t) => t.trim().toLowerCase().replace(/^#/, '')) // # hata do
        .filter(Boolean)
        .slice(0, 10); // Max 10 tags
    }

    // Community note DB mein save karo
    const note = await CommunityNote.create({
      title: title.trim(),
      description: description?.trim() || '',
      subject: subject.trim(),
      exam: exam || 'Other',
      course: course || 'Other',
      tags: parsedTags,
      fileUrl: result.secure_url,
      filePublicId: result.public_id,
      fileType,
      fileName: req.file.originalname,
      uploadedBy: req.user._id,
    });

    // User ka upload count badhao
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalPublicUploads: 1 },
    });

    // Uploader ki info populate karke response bhejo
    await note.populate('uploadedBy', 'name avatar totalPublicUploads');

    res.status(201).json({ message: 'Note uploaded successfully!', note });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Upload failed. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET FEED — community notes list (filter + pagination ke saath)
// GET /api/community/feed?page=1&exam=JEE&search=physics&sort=latest
// ─────────────────────────────────────────────────────────────────────────────
exports.getFeed = async (req, res) => {
  try {
    const { page = 1, exam, search, sort = 'latest', subject, course } = req.query;
    const limit = 12; // Ek page pe 12 notes
    const skip = (Number(page) - 1) * limit;

    // Filter build karo
    const filter = { isActive: true };
    if (exam && exam !== 'All')              filter.exam = exam;
    if (subject)                             filter.subject = new RegExp(subject, 'i');
    if (course && course !== 'All Courses')  filter.course = new RegExp(course, 'i');
    if (search) {
      // Search multiple fields mein
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { subject: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }

    // Sort order decide karo
    let sortObj = { createdAt: -1 };         // Default: latest
    if (sort === 'popular') sortObj = { downloads: -1, createdAt: -1 };
//  Sort by the actual array field size
if (sort === 'liked') {
  // Use MongoDB aggregation to add a computed likes count, OR:
  sortObj = { likes: -1, createdAt: -1 }; // sorts by array length in Mongo 5.x+
}
    // Notes aur total count simultaneously fetch karo
    const [notes, total] = await Promise.all([
      CommunityNote.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .populate('uploadedBy', 'name avatar totalPublicUploads')
        .select('-comments -__v'),
      CommunityNote.countDocuments(filter),
    ]);

    // Current user ne like/save kiya hai ya nahi — flag add karo
    const userId = req.user?._id?.toString();
    const notesWithFlags = notes.map((n) => {
      const obj = n.toObject();
      obj.likedByMe  = userId ? n.likes.some((id) => id.toString() === userId) : false;
      obj.savedByMe  = userId ? n.saves.some((id) => id.toString() === userId) : false;
      obj.likesCount = n.likes.length;
      obj.savesCount = n.saves.length;
      return obj;
    });

    res.json({
      notes: notesWithFlags,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (err) {
    console.error('Feed error:', err);
    res.status(500).json({ message: 'Failed to load feed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// TOGGLE LIKE — note like/unlike karo
// POST /api/community/:id/like
// ─────────────────────────────────────────────────────────────────────────────
exports.toggleLike = async (req, res) => {
  try {
    const note = await CommunityNote.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const userId = req.user._id;
    const idx = note.likes.findIndex((id) => id.toString() === userId.toString());

    if (idx === -1) {
      note.likes.push(userId);   // Like karo
    } else {
      note.likes.splice(idx, 1); // Unlike karo
    }

    await note.save();
    res.json({ liked: idx === -1, likesCount: note.likes.length });
  } catch (err) {
    console.error('ToggleLike error:', err);
    res.status(500).json({ message: 'Like action failed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// TOGGLE SAVE — note save/unsave karo
// POST /api/community/:id/save
// ─────────────────────────────────────────────────────────────────────────────
exports.toggleSave = async (req, res) => {
  try {
    const note = await CommunityNote.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const userId = req.user._id;
    const noteIdx = note.saves.findIndex((id) => id.toString() === userId.toString());

    if (noteIdx === -1) {
      // Save karo
      note.saves.push(userId);
      await User.findByIdAndUpdate(userId, {
        $addToSet: { savedCommunityNotes: note._id },
      });
    } else {
      // Unsave karo
      note.saves.splice(noteIdx, 1);
      await User.findByIdAndUpdate(userId, {
        $pull: { savedCommunityNotes: note._id },
      });
    }

    await note.save();
    res.json({ saved: noteIdx === -1, savesCount: note.saves.length });
  } catch (err) {
    console.error('ToggleSave error:', err);
    res.status(500).json({ message: 'Save action failed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DOWNLOAD NOTE — download count badhao aur file URL return karo
// POST /api/community/:id/download
// ─────────────────────────────────────────────────────────────────────────────
exports.downloadNote = async (req, res) => {
  try {
    const note = await CommunityNote.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ fileUrl: note.fileUrl, downloads: note.downloads });
  } catch (err) {
    console.error('DownloadNote error:', err);
    res.status(500).json({ message: 'Download failed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADD COMMENT — note pe comment karo
// POST /api/community/:id/comment
// ─────────────────────────────────────────────────────────────────────────────
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }

    const note = await CommunityNote.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Comment add karo
    note.comments.push({ user: req.user._id, text: text.trim() });
    await note.save();

    // User info populate karo
    await note.populate('comments.user', 'name avatar');

    const newComment = note.comments[note.comments.length - 1];
    res.status(201).json({
      comment: newComment,
      totalComments: note.comments.length,
    });
  } catch (err) {
    console.error('AddComment error:', err);
    res.status(500).json({ message: 'Comment failed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET NOTE BY ID — single community note with comments
// GET /api/community/:id
// ─────────────────────────────────────────────────────────────────────────────
exports.getNoteById = async (req, res) => {
  try {
    const note = await CommunityNote.findById(req.params.id)
      .populate('uploadedBy', 'name avatar totalPublicUploads createdAt')
      .populate('comments.user', 'name avatar');

    if (!note || !note.isActive) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Like/Save flags add karo
    const userId = req.user?._id?.toString();
    const obj = note.toObject();
    obj.likedByMe  = userId ? note.likes.some((id) => id.toString() === userId) : false;
    obj.savedByMe  = userId ? note.saves.some((id) => id.toString() === userId) : false;
    obj.likesCount = note.likes.length;
    obj.savesCount = note.saves.length;

    res.json(obj);
  } catch (err) {
    console.error('GetNoteById error:', err);
    res.status(500).json({ message: 'Failed to load note' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET USER NOTES — kisi bhi user ki public notes
// GET /api/community/user/:userId
// ─────────────────────────────────────────────────────────────────────────────
exports.getUserNotes = async (req, res) => {
  try {
    const notes = await CommunityNote.find({
      uploadedBy: req.params.userId,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name avatar totalPublicUploads')
      .select('-comments -__v');

    res.json({ notes, total: notes.length });
  } catch (err) {
    console.error('GetUserNotes error:', err);
    res.status(500).json({ message: 'Failed to load user notes' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE NOTE — sirf uploader delete kar sakta hai
// DELETE /api/community/:id
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteNote = async (req, res) => {
  try {
    const note = await CommunityNote.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Authorization check — sirf owner delete kar sakta hai
    if (note.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the uploader can delete this note' });
    }

    // Cloudinary se file delete karo
    if (note.filePublicId) {
      const resourceType = note.fileType === 'pdf' ? 'raw' : 'image';
      await cloudinary.uploader.destroy(note.filePublicId, {
        resource_type: resourceType,
      });
    }

    // DB se note delete karo
    await note.deleteOne();

    // User ka upload count kam karo
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalPublicUploads: -1 },
    });

    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error('DeleteNote error:', err);
    res.status(500).json({ message: 'Delete failed' });
  }
};
