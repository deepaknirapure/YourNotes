const CommunityNote = require("../models/CommunityNote");
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// ── Cloudinary config (reads from .env) ──────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper: upload buffer to Cloudinary
const uploadToCloudinary = (buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    const resourceType = mimetype === "application/pdf" ? "raw" : "image";
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "yournotes/community",
        resource_type: resourceType,
        allowed_formats: ["pdf", "jpg", "jpeg", "png", "webp"],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/community/upload
// ─────────────────────────────────────────────────────────────────────────────
exports.uploadNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File required hai" });
    }

    const { title, description, subject, exam, course, tags } = req.body;
    if (!title?.trim() || !subject?.trim()) {
      return res.status(400).json({ message: "Title aur subject required hain" });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);

    // Determine file type
    let fileType = "other";
    if (req.file.mimetype === "application/pdf") fileType = "pdf";
    else if (req.file.mimetype.startsWith("image/")) fileType = "image";

    // Parse tags
    let parsedTags = [];
    if (tags) {
      parsedTags = tags
        .split(",")
        .map((t) => t.trim().toLowerCase().replace(/^#/, ""))
        .filter(Boolean)
        .slice(0, 10);
    }

    // Save note to DB
    const note = await CommunityNote.create({
      title: title.trim(),
      description: description?.trim() || "",
      subject: subject.trim(),
      exam: exam || "Other",
      course: course || "Other",
      tags: parsedTags,
      fileUrl: result.secure_url,
      filePublicId: result.public_id,
      fileType,
      fileName: req.file.originalname,
      uploadedBy: req.user._id,
    });

    // Increment user's upload count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalPublicUploads: 1 },
    });

    // Populate uploader info before returning
    await note.populate("uploadedBy", "name avatar totalPublicUploads");

    res.status(201).json({ message: "Note upload ho gaya!", note });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: err.message || "Upload failed" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/community/feed?page=1&exam=JEE&search=physics&sort=latest
// ─────────────────────────────────────────────────────────────────────────────
exports.getFeed = async (req, res) => {
  try {
    const { page = 1, exam, search, sort = "latest", subject, course } = req.query;
    const limit = 12;
    const skip = (Number(page) - 1) * limit;

    // Build filter
    const filter = { isActive: true };
    if (exam && exam !== "All") filter.exam = exam;
    if (subject) filter.subject = new RegExp(subject, "i");
    if (course && course !== "All Courses") filter.course = new RegExp(course, "i");
    if (search) {
      filter.$or = [
        { title: new RegExp(search, "i") },
        { subject: new RegExp(search, "i") },
        { tags: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];
    }

    // Build sort
    let sortObj = { createdAt: -1 };
    if (sort === "popular") sortObj = { downloads: -1, createdAt: -1 };
    if (sort === "liked") sortObj = { likesCount: -1, createdAt: -1 };

    const [notes, total] = await Promise.all([
      CommunityNote.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .populate("uploadedBy", "name avatar totalPublicUploads")
        .select("-comments -__v"),
      CommunityNote.countDocuments(filter),
    ]);

    // Add likedByMe / savedByMe flags
    const userId = req.user?._id?.toString();
    const notesWithFlags = notes.map((n) => {
      const obj = n.toObject();
      obj.likedByMe = userId ? n.likes.some((id) => id.toString() === userId) : false;
      obj.savedByMe = userId ? n.saves.some((id) => id.toString() === userId) : false;
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
    console.error("Feed error:", err);
    res.status(500).json({ message: "Feed load nahi ho saka" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/community/:id/like  (toggle)
// ─────────────────────────────────────────────────────────────────────────────
exports.toggleLike = async (req, res) => {
  try {
    const note = await CommunityNote.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note nahi mila" });

    const userId = req.user._id;
    const idx = note.likes.findIndex((id) => id.toString() === userId.toString());

    if (idx === -1) {
      note.likes.push(userId);
    } else {
      note.likes.splice(idx, 1);
    }
    await note.save();

    res.json({ liked: idx === -1, likesCount: note.likes.length });
  } catch (err) {
    res.status(500).json({ message: "Like failed" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/community/:id/save  (toggle)
// ─────────────────────────────────────────────────────────────────────────────
exports.toggleSave = async (req, res) => {
  try {
    const note = await CommunityNote.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note nahi mila" });

    const userId = req.user._id;
    const noteIdx = note.saves.findIndex((id) => id.toString() === userId.toString());
    const userIdx = req.user.savedCommunityNotes?.findIndex(
      (id) => id.toString() === note._id.toString()
    );

    if (noteIdx === -1) {
      note.saves.push(userId);
      await User.findByIdAndUpdate(userId, {
        $addToSet: { savedCommunityNotes: note._id },
      });
    } else {
      note.saves.splice(noteIdx, 1);
      await User.findByIdAndUpdate(userId, {
        $pull: { savedCommunityNotes: note._id },
      });
    }
    await note.save();

    res.json({ saved: noteIdx === -1, savesCount: note.saves.length });
  } catch (err) {
    res.status(500).json({ message: "Save failed" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/community/:id/download  (increment counter + return URL)
// ─────────────────────────────────────────────────────────────────────────────
exports.downloadNote = async (req, res) => {
  try {
    const note = await CommunityNote.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: "Note nahi mila" });

    res.json({ fileUrl: note.fileUrl, downloads: note.downloads });
  } catch (err) {
    res.status(500).json({ message: "Download failed" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/community/:id/comment
// ─────────────────────────────────────────────────────────────────────────────
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "Comment empty nahi hona chahiye" });

    const note = await CommunityNote.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note nahi mila" });

    note.comments.push({ user: req.user._id, text: text.trim() });
    await note.save();

    await note.populate("comments.user", "name avatar");

    const newComment = note.comments[note.comments.length - 1];
    res.status(201).json({ comment: newComment, totalComments: note.comments.length });
  } catch (err) {
    res.status(500).json({ message: "Comment failed" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/community/:id  (single note with comments)
// ─────────────────────────────────────────────────────────────────────────────
exports.getNoteById = async (req, res) => {
  try {
    const note = await CommunityNote.findById(req.params.id)
      .populate("uploadedBy", "name avatar totalPublicUploads createdAt")
      .populate("comments.user", "name avatar");

    if (!note || !note.isActive) {
      return res.status(404).json({ message: "Note nahi mila" });
    }

    const userId = req.user?._id?.toString();
    const obj = note.toObject();
    obj.likedByMe = userId ? note.likes.some((id) => id.toString() === userId) : false;
    obj.savedByMe = userId ? note.saves.some((id) => id.toString() === userId) : false;
    obj.likesCount = note.likes.length;
    obj.savesCount = note.saves.length;

    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: "Note load nahi ho saka" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/community/user/:userId  (all notes by a user)
// ─────────────────────────────────────────────────────────────────────────────
exports.getUserNotes = async (req, res) => {
  try {
    const notes = await CommunityNote.find({
      uploadedBy: req.params.userId,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "name avatar totalPublicUploads")
      .select("-comments -__v");

    res.json({ notes, total: notes.length });
  } catch (err) {
    res.status(500).json({ message: "User notes load nahi ho sake" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/community/:id  (only uploader can delete)
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteNote = async (req, res) => {
  try {
    const note = await CommunityNote.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note nahi mila" });

    if (note.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Sirf uploader hi delete kar sakta hai" });
    }

    // Delete from Cloudinary if public_id exists
    if (note.filePublicId) {
      const resourceType = note.fileType === "pdf" ? "raw" : "image";
      await cloudinary.uploader.destroy(note.filePublicId, {
        resource_type: resourceType,
      });
    }

    await note.deleteOne();

    // Decrement user upload count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalPublicUploads: -1 },
    });

    res.json({ message: "Note delete ho gaya" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};
