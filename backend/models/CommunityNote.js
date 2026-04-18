const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 300 },
  },
  { timestamps: true }
);

const communityNoteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    exam: {
      type: String,
      enum: ["JEE", "NEET", "GATE", "UPSC", "CA", "Class 10", "Class 12", "Other"],
      default: "Other",
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    fileUrl: {
      type: String,
      required: [true, "File URL is required"],
    },
    filePublicId: { type: String, default: "" },
    fileType: {
      type: String,
      enum: ["pdf", "image", "other"],
      default: "pdf",
    },
    fileName: { type: String, default: "" },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    saves: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    downloads: { type: Number, default: 0 },
    comments: [commentSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

communityNoteSchema.index({ title: "text", subject: "text", tags: "text" });
communityNoteSchema.index({ uploadedBy: 1 });
communityNoteSchema.index({ exam: 1 });
communityNoteSchema.index({ createdAt: -1 });

module.exports = mongoose.model("CommunityNote", communityNoteSchema);
