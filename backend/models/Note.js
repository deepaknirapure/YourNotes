const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    default: 'Untitled Note'
  },
  content: {
    type: String,
    default: ''
  },
  plainText: {
    type: String,
    default: ''
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null
  },
  tags: {
    type: [String],
    default: []
  },
  isStarred: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isTrashed: {
    type: Boolean,
    default: false
  },
  trashedAt: {
    type: Date,
    default: null
  },
  aiSummary: {
    type: String,
    default: ''
  },
  summaryGeneratedAt: {
    type: Date,
    default: null
  },
  shareToken: {
    type: String,
    default: null
  },
  sharePermission: {
    type: String,
    enum: ['view', 'edit'],
    default: 'view'
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

// This enables full-text search on title, content and tags
noteSchema.index({ title: 'text', plainText: 'text', tags: 'text' });

// Auto delete trashed notes after 30 days
noteSchema.index({ trashedAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('Note', noteSchema);