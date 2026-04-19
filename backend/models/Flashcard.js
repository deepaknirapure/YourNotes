const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  note: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', required: true },
  // SM-2 Spaced Repetition fields
  interval: { type: Number, default: 1 },
  easeFactor: { type: Number, default: 2.5 },
  repetitions: { type: Number, default: 0 },
  nextReviewDate: { type: Date, default: Date.now }
}, { timestamps: true });

// FIX: added compound index for common query (note + user)
flashcardSchema.index({ note: 1, user: 1 });
flashcardSchema.index({ user: 1, nextReviewDate: 1 });

module.exports = mongoose.model('Flashcard', flashcardSchema);
