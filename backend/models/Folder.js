// Folder model — notes ko organize karne ke liye folders
const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema(
  {
    // Folder ka naam
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Yeh folder kis user ka hai
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Folder ka color (hex code)
    color: {
      type: String,
      default: '#4F46E5',
    },
    // Folder ka emoji icon
    icon: {
      type: String,
      default: '📁',
    },
    // Folder ka description
    description: {
      type: String,
      default: '',
    },
    // Is folder mein kitni notes hain (cached count)
    noteCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Folder', folderSchema);
