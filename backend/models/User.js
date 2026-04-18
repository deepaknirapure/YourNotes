const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    avatar: {
      type: String,
      default: "",
    },
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
    isVerified: {
      type: Boolean,
      default: true,
    },
    plan: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },
    aiCallsThisHour: {
      type: Number,
      default: 0,
    },
    aiCallsResetAt: {
      type: Date,
      default: Date.now,
    },
    totalPublicUploads: { type: Number, default: 0 },
    savedCommunityNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "CommunityNote" }],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
