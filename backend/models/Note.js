const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    plainText: { type: String, default: "" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    folder: { type: mongoose.Schema.Types.ObjectId, ref: "Folder", default: null },
    tags: [{ type: String, trim: true }],
    isPinned: { type: Boolean, default: false },
    isTrashed: { type: Boolean, default: false },
    isStarred: { type: Boolean, default: false },
    trashedAt: { type: Date, default: null },
    aiSummary: { type: String, default: "" },
    shareToken: { type: String, default: null },
    sharePermission: { type: String, enum: ["view", "edit"], default: "view" },
  },
  { timestamps: true }
);

noteSchema.index({ user: 1, isTrashed: 1, updatedAt: -1 });
noteSchema.index({ title: "text", content: "text" });

module.exports = mongoose.model("Note", noteSchema);
