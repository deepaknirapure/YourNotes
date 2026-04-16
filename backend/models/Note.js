const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    // ... (Aapka purana schema code same rahega)
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isTrashed: { type: Boolean, default: false },
    isStarred: { type: Boolean, default: false },
    // ...
  },
  { timestamps: true },
);

// INDEXING: Ye website ko fast banayega
noteSchema.index({ user: 1, isTrashed: 1, updatedAt: -1 });
noteSchema.index({ title: "text", content: "text" });

module.exports = mongoose.model("Note", noteSchema);
