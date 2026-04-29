const mongoose = require('mongoose');

/**
 * Hindi Comment:
 * AI chat sessions ko database mein save karne ke liye model.
 * Isse user refresh ke baad bhi apni chat history dekh sakta hai.
 */
const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      default: '',
    },
    fileName: {
      type: String,
      default: '',
    },
  },
  { _id: false, timestamps: true }
);

const chatHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New Chat',
      trim: true,
      maxlength: 80,
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

chatHistorySchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
