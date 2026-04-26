// User model — users ka data store karta hai
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // User ka naam
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // User ka email — unique hona chahiye
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Hashed password
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    // Profile picture URL
    avatar: {
      type: String,
      default: '',
    },
    // Study streak — kitne consecutive din study ki
    streak: {
      count: { type: Number, default: 0 },
      lastStudied: { type: Date, default: null },
    },
    // Is week kitni notes banani hain ka goal
    weeklyGoal: {
      type: Number,
      default: 5,
    },
    // Is week kitni notes bani hain
    notesCreatedThisWeek: {
      type: Number,
      default: 0,
    },
    // Account verify hua hai ya nahi
    isVerified: {
      type: Boolean,
      default: true,
    },
    // AI hourly rate limit track karne ke liye
    aiCallsThisHour: {
      type: Number,
      default: 0,
    },
    aiCallsResetAt: {
      type: Date,
      default: Date.now,
    },
    // Community mein kitni files upload ki hain
    totalPublicUploads: {
      type: Number,
      default: 0,
    },
    // User ne community mein kaun si notes save ki hain
    savedCommunityNotes: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityNote' }
    ],
    // Password reset ke liye temporary token
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true } // createdAt aur updatedAt auto-set hoga
);

module.exports = mongoose.model('User', userSchema);
