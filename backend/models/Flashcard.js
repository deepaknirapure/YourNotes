const mongoose = require('mongoose');

/**
 * Hindi Comment:
 * Ye final Flashcard Model hai jo SM-2 Spaced Repetition algorithm par based hai.
 * Iska use karke system khud decide karega ki agla revision kab hona chahiye.
 */

const flashcardSchema = new mongoose.Schema(
  {
    // Flashcard ka Question (Front side)
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
    },
    // Flashcard ka Answer (Back side)
    answer: {
      type: String,
      required: [true, "Answer is required"],
      trim: true,
    },
    // Relationship: Ye card kis user ka hai
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Relationship: Kis note se ye card generate hua (Context ke liye)
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
      required: true,
    },
    // NEW: Subject/Folder linkage taaki specific category ki practice ho sake
    subject: {
      type: String,
      default: 'General',
    },

    /**
     * SM-2 Algorithm Fields:
     * In fields ka use karke Spaced Repetition calculate hota hai.
     */
    
    // Interval: Kitne din baad dobara card dikhana hai
    interval: {
      type: Number,
      default: 0, // 0 matlab naya card hai
    },
    // Ease Factor: Card kitna easy hai (2.5 default value hai algorithm ki)
    easeFactor: {
      type: Number,
      default: 2.5,
    },
    // Repetitions: Lagatar kitni baar sahi answer diya
    repetitions: {
      type: Number,
      default: 0,
    },
    // Agla revision kab hona chahiye (Calculation ke baad set hoga)
    nextReviewDate: {
      type: Date,
      default: Date.now,
    },
    // Last quality score (0 to 5) jo user ne pichli baar diya tha
    lastQuality: {
      type: Number,
      default: 0,
    },
    // Mastery: Kya user ne ye card master kar liya hai?
    isMastered: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/**
 * Hindi Comment: 
 * Database performance ke liye indexes. 
 * 'nextReviewDate' par index isliye hai kyunki hum aksar 'Due' cards search karenge.
 */
flashcardSchema.index({ note: 1, user: 1 });
flashcardSchema.index({ user: 1, nextReviewDate: 1 });
flashcardSchema.index({ subject: 1 });

module.exports = mongoose.model('Flashcard', flashcardSchema);