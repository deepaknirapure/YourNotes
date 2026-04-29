const mongoose = require('mongoose');

/**
 * Hindi Comment:
 * Ye model Community page ke liye hai jahan users apni notes/files publicly share karte hain.
 * Isme likes, comments, aur ranking (downloads ke base par) ka full setup hai.
 */

// Comment sub-schema - Individual comment ke liye
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

const communityNoteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    // Category: Physics, Coding, Electrical, etc.
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    // Filter ke liye exams
    exam: {
      type: String,
      enum: ['JEE', 'NEET', 'GATE', 'UPSC', 'CA', 'Class 10', 'Class 12', 'Polytechnic', 'Other'],
      default: 'Other',
    },
    course: {
      type: String,
      default: 'Other',
      trim: true,
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    
    /**
     * File Management (Cloudinary):
     * Yahan file ka URL aur public ID store hota hai.
     */
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    filePublicId: {
      type: String,
      default: '',
    },
    fileType: {
      type: String,
      enum: ['pdf', 'image', 'other'],
      default: 'pdf',
    },
    fileName: {
      type: String,
      default: '',
    },

    // User details
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    /**
     * Social/Community Features:
     * Likes aur Saves se ranking decide hogi.
     */
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    saves: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downloads: {
      type: Number,
      default: 0,
    },
    comments: [commentSchema],
    
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Hindi Comment: Search index taaki Title, Subject aur Tags par fast search ho sake.
communityNoteSchema.index({ title: 'text', subject: 'text', tags: 'text' });
communityNoteSchema.index({ uploadedBy: 1 });
communityNoteSchema.index({ exam: 1 });
communityNoteSchema.index({ createdAt: -1 });

module.exports = mongoose.model('CommunityNote', communityNoteSchema);