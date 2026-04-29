const mongoose = require('mongoose');

/**
 * Hindi Comment:
 * Ye final production model hai. Isme tumhara purana AI Summary, Trash system, 
 * aur Search Indexing barkarar hai, aur naye Community/Privacy features add kiye gaye hain.
 */

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // Note ka content (HTML format - Rich Text Editor)
    content: {
      type: String,
      default: '',
    },
    // Search performance ke liye plain text version
    plainText: {
      type: String,
      default: '',
    },
    // Relationship: Note kis user ka hai
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Folder Management
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null,
    },
    // NEW: Privacy Control (Public/Private)
    isPublic: {
      type: Boolean,
      default: false,
    },
    // Tags for categorization
    tags: [{ type: String, trim: true }],
    // UI/UX Features
    isPinned: {
      type: Boolean,
      default: false,
    },
    isStarred: {
      type: Boolean,
      default: false,
    },
    // Trash Management (30 days auto-delete logic)
    isTrashed: {
      type: Boolean,
      default: false,
    },
    trashedAt: {
      type: Date,
      default: null,
    },
    // AI Integration
    aiSummary: {
      type: String,
      default: '',
    },
    summaryGeneratedAt: {
      type: Date,
      default: null,
    },
    // NEW: Community Interactivity (Likes & Comments)
    likes: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }],
    // NEW: Bookmark/Save (Community)
    saves: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    // NEW: Download tracking (Community)
    downloads: {
      type: Number,
      default: 0
    },
    // NEW: Subject for Community Section (Subject-wise display)
    subject: {
      type: String,
      default: 'General',
    },
    // Sharing Logic
    shareToken: {
      type: String,
      default: null,
    },
    sharePermission: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view',
    },
  },
  { timestamps: true }
);

// Hindi Comment: Indexing se heavy data mein bhi search super fast chalti hai.
// Index: Basic fetching ke liye
noteSchema.index({ user: 1, isTrashed: 1, updatedAt: -1 });
// Full-text search index: Title aur content dono search karne ke liye
noteSchema.index({ title: 'text', plainText: 'text' });

module.exports = mongoose.model('Note', noteSchema);