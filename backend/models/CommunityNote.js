// CommunityNote model — publicly shared notes/files store karta hai
const mongoose = require('mongoose');

// Comment sub-schema — ek comment ka structure
const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
  },
  { timestamps: true }
);

// Main community note schema
const communityNoteSchema = new mongoose.Schema(
  {
    // Note ka title
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    // Note ki description
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    // Kaun sa subject hai (Physics, Math, etc.)
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    // Kaun sa exam ke liye hai
    exam: {
      type: String,
      enum: ['JEE', 'NEET', 'GATE', 'UPSC', 'CA', 'Class 10', 'Class 12', 'Other'],
      default: 'Other',
    },
    // Course ka naam
    course: {
      type: String,
      default: 'Other',
      trim: true,
    },
    // Tags (search mein help karte hain)
    tags: [{ type: String, trim: true, lowercase: true }],
    // Cloudinary file URL
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    // Cloudinary public ID (delete karne ke liye)
    filePublicId: {
      type: String,
      default: '',
    },
    // File ka type
    fileType: {
      type: String,
      enum: ['pdf', 'image', 'other'],
      default: 'pdf',
    },
    // Original file ka naam
    fileName: {
      type: String,
      default: '',
    },
    // Kisne upload kiya
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Likes — list of user IDs jo ne like kiya
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Saves — list of user IDs jo ne save kiya
    saves: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Total download count
    downloads: {
      type: Number,
      default: 0,
    },
    // Comments list
    comments: [commentSchema],
    // Note active hai ya delete hui
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes: search aur filter fast karne ke liye
communityNoteSchema.index({ title: 'text', subject: 'text', tags: 'text' });
communityNoteSchema.index({ uploadedBy: 1 });
communityNoteSchema.index({ exam: 1 });
communityNoteSchema.index({ course: 1 });
communityNoteSchema.index({ createdAt: -1 });

module.exports = mongoose.model('CommunityNote', communityNoteSchema);
