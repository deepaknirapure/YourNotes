// Note model — user ki personal notes store karta hai
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    // Note ka title
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // Note ka content (HTML format mein hoga — rich text editor se)
    content: {
      type: String,
      default: '',
    },
    // Note ka plain text version (search ke liye)
    plainText: {
      type: String,
      default: '',
    },
    // Yeh note kis user ka hai
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Yeh note kis folder mein hai (optional)
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null,
    },
    // Note ke tags (categories)
    tags: [{ type: String, trim: true }],
    // Note pin hua hai ya nahi (top pe dikhta hai)
    isPinned: {
      type: Boolean,
      default: false,
    },
    // Note trash mein hai ya nahi
    isTrashed: {
      type: Boolean,
      default: false,
    },
    // Note star kiya hua hai ya nahi (favourite)
    isStarred: {
      type: Boolean,
      default: false,
    },
    // Kab trash mein dala (30 din baad auto-delete ke liye)
    trashedAt: {
      type: Date,
      default: null,
    },
    // AI se generate ki gayi summary
    aiSummary: {
      type: String,
      default: '',
    },
    // Summary kab generate hui
    summaryGeneratedAt: {
      type: Date,
      default: null,
    },
    // Note share karne ke liye unique token
    shareToken: {
      type: String,
      default: null,
    },
    // Share permission — sirf dekhne ya edit bhi kar sakte hain
    sharePermission: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view',
    },
  },
  { timestamps: true }
);

// Index: notes dhundhna fast karne ke liye
noteSchema.index({ user: 1, isTrashed: 1, updatedAt: -1 });
// Full-text search index: title aur content mein search ke liye
noteSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Note', noteSchema);
