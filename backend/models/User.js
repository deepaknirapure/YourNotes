const mongoose = require('mongoose');

/**
 * Hindi Comment:
 * Ye final User Model hai. Isme authentication, forgot password logic, 
 * gamification (streaks), aur community features (saved notes) sab integrated hain.
 */

const userSchema = new mongoose.Schema(
  {
    // User ka pura naam
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    // Login ke liye unique email
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Hashed password (min 6 characters)
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    // Profile image URL
    avatar: {
      type: String,
      default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png', // Default profile icon
    },
    /**
     * Gamification Section:
     * Study streaks aur weekly goals students ko engage rakhte hain.
     */
    streak: {
      count: { type: Number, default: 0 },
      lastStudied: { type: Date, default: null },
    },
    weeklyGoal: {
      type: Number,
      default: 5,
    },
    notesCreatedThisWeek: {
      type: Number,
      default: 0,
    },
    /**
     * AI & Security:
     * AI rate limiting taaki API costs control mein rahein.
     */
    isVerified: {
      type: Boolean,
      default: true,
    },
    aiCallsThisHour: {
      type: Number,
      default: 0,
    },
    aiCallsResetAt: {
      type: Date,
      default: Date.now,
    },
    /**
     * Community Integration:
     * User ne kitni notes public ki hain aur doosron ki kaunsi notes save ki hain.
     */
    totalPublicUploads: {
      type: Number,
      default: 0,
    },
    savedCommunityNotes: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Note' } // 'Note' model se hi link kiya hai
    ],
    /**
     * NEW: Forgot Password Security
     * In fields ka use token-based password reset ke liye hoga.
     */
    resetPasswordToken: {
      type: String,
      default: undefined
    },
    resetPasswordExpire: {
      type: Date,
      default: undefined
    }
  },
  { timestamps: true } // createdAt aur updatedAt fields auto-manage hongi
);

// Search Index: Email par search fast karne ke liye
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);