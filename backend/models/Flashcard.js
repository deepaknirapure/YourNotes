// Flashcard model — AI generated flashcards store karta hai
// SM-2 spaced repetition algorithm use karta hai
const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema(
  {
    // Flashcard ka question
    question: {
      type: String,
      required: true,
    },
    // Flashcard ka answer
    answer: {
      type: String,
      required: true,
    },
    // Yeh flashcard kis user ka hai
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Yeh flashcard kis note se generate hua hai
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
      required: true,
    },
    // SM-2 Algorithm ke fields —————————————————
    // Kitne din baad dobara review karna hai
    interval: {
      type: Number,
      default: 1,
    },
    // Kitna aasaan lagta hai (2.5 = average)
    easeFactor: {
      type: Number,
      default: 2.5,
    },
    // Kitni baar successfully review kiya
    repetitions: {
      type: Number,
      default: 0,
    },
    // Agla review kab hona chahiye
    nextReviewDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index: ek note ke saare flashcards fast dhundne ke liye
flashcardSchema.index({ note: 1, user: 1 });
// Index: due flashcards dhundne ke liye
flashcardSchema.index({ user: 1, nextReviewDate: 1 });

module.exports = mongoose.model('Flashcard', flashcardSchema);
