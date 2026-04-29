const mongoose = require('mongoose');

/**
 * Hindi Comment:
 * Ye updated Folder Model hai jo notes ko organize karne ke kaam aata hai.
 * Isme humne "isPublic" ka option bhi diya hai taaki poora folder hi community page par share kiya ja sake (optional feature).
 */

const folderSchema = new mongoose.Schema(
  {
    // Folder ka naam (Jaise: "College Notes", "MERN Project")
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Relationship: Yeh folder kis user ka hai
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // UI/UX: Folder ka color (Hex code) - Glassmorphism design mein kaam aayega
    color: {
      type: String,
      default: '#4F46E5', // Default Indigo color
    },
    // UI/UX: Folder ka icon ya emoji
    icon: {
      type: String,
      default: '📁',
    },
    // Description: Folder ke baare mein thodi info
    description: {
      type: String,
      default: '',
    },
    /** 
     * NEW: Privacy Control 
     * Agar user poore folder ko public karta hai toh uske saare notes community section mein 
     * ek saath dikh sakte hain.
     */
    isPublic: {
      type: Boolean,
      default: false,
    },
    // Performance: Kitni notes is folder mein hain (Cache count)
    noteCount: {
      type: Number,
      default: 0,
    },
    /**
     * Parent Folder (Optional): 
     * Agar tumhe "Sub-folders" ka feature chahiye toh ye kaam aayega.
     */
    parentFolder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null,
    }
  },
  { timestamps: true }
);

// Indexing: User ke folders jaldi load karne ke liye
folderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Folder', folderSchema);