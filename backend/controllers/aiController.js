const Note = require('../models/Note');
const User = require('../models/User');
const Flashcard = require('../models/Flashcard');
const ChatHistory = require('../models/ChatHistory');
const mongoose = require('mongoose');

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const splitSentences = (text = '') =>
  text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

const generateSimpleSummary = (text) => {
  const lines = splitSentences(text).slice(0, 5);
  if (!lines.length) return 'No enough content available for summary.';
  return lines.map((line, idx) => `${idx + 1}. ${line}`).join('\n');
};

exports.checkAIRateLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const now = Date.now();
    if (!user.aiCallsResetAt || now - new Date(user.aiCallsResetAt).getTime() >= 60 * 60 * 1000) {
      user.aiCallsThisHour = 0;
      user.aiCallsResetAt = new Date(now);
    }

    if (user.aiCallsThisHour >= 60) {
      return res.status(429).json({ message: 'AI request limit reached for this hour' });
    }

    user.aiCallsThisHour += 1;
    await user.save();
    next();
  } catch (error) {
    res.status(500).json({ message: 'Rate limit validation failed' });
  }
};

exports.summarizeNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const source = note.plainText || note.content || '';
    const summary = generateSimpleSummary(source);
    note.aiSummary = summary;
    note.summaryGeneratedAt = new Date();
    await note.save();

    res.status(200).json({ summary });
  } catch (error) {
    res.status(500).json({ message: 'Summary generation failed' });
  }
};

exports.generateFlashcards = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const chunks = splitSentences(note.plainText || note.content).slice(0, 8);
    const cards = chunks.map((line, idx) => ({
      question: `Key point ${idx + 1}: Explain this idea`,
      answer: line,
      user: req.user.id,
      note: note._id,
      subject: note.subject || 'General',
    }));

    if (!cards.length) {
      return res.status(200).json({ flashcards: [] });
    }

    await Flashcard.deleteMany({ user: req.user.id, note: note._id });
    const inserted = await Flashcard.insertMany(cards);
    res.status(200).json({ flashcards: inserted });
  } catch (error) {
    res.status(500).json({ message: 'Flashcard generation failed' });
  }
};

exports.generateQuiz = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const lines = splitSentences(note.plainText || note.content).slice(0, 5);
    const questions = lines.map((line) => ({
      question: `Which statement best matches this note point?`,
      options: [line, 'This is unrelated', 'No idea', 'Need more context'],
      correct: 0,
      explanation: 'Option 1 is copied from your note content.',
    }));

    res.status(200).json({ questions });
  } catch (error) {
    res.status(500).json({ message: 'Quiz generation failed' });
  }
};

exports.getFlashcards = async (req, res) => {
  try {
    const cards = await Flashcard.find({ note: req.params.id, user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(cards);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load flashcards' });
  }
};

exports.getDueFlashcards = async (req, res) => {
  try {
    const cards = await Flashcard.find({
      user: req.user.id,
      nextReviewDate: { $lte: new Date() },
    }).sort({ nextReviewDate: 1 });
    res.status(200).json(cards);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load due flashcards' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// NEW: Flashcard notes list
// - User ki sabhi notes jinke paas flashcards hain
// - Aur due count bhi (nextReviewDate <= now)
// ─────────────────────────────────────────────────────────────────────────────
exports.getFlashcardNotes = async (req, res) => {
  try {
    const now = new Date();
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const pipeline = [
      { $match: { user: userId } },
      {
        $group: {
          _id: '$note',
          totalCount: { $sum: 1 },
          dueCount: {
            $sum: {
              $cond: [{ $lte: ['$nextReviewDate', now] }, 1, 0],
            },
          },
        },
      },
      { $lookup: { from: 'notes', localField: '_id', foreignField: '_id', as: 'noteDoc' } },
      { $unwind: { path: '$noteDoc', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          noteId: '$_id',
          totalCount: 1,
          dueCount: 1,
          title: '$noteDoc.title',
          subject: '$noteDoc.subject',
          updatedAt: '$noteDoc.updatedAt',
        },
      },
      { $sort: { dueCount: -1, updatedAt: -1 } },
    ];

    const notes = await Flashcard.aggregate(pipeline);
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load flashcard notes' });
  }
};

exports.reviewFlashcard = async (req, res) => {
  try {
    const { quality = 3 } = req.body;
    const card = await Flashcard.findOne({ _id: req.params.id, user: req.user.id });
    if (!card) return res.status(404).json({ message: 'Flashcard not found' });

    const q = clamp(Number(quality), 0, 5);
    if (q < 3) {
      card.repetitions = 0;
      card.interval = 1;
    } else {
      card.repetitions += 1;
      if (card.repetitions === 1) card.interval = 1;
      else if (card.repetitions === 2) card.interval = 3;
      else card.interval = Math.round(card.interval * card.easeFactor);
      card.easeFactor = Math.max(1.3, card.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
    }

    card.lastQuality = q;
    card.nextReviewDate = new Date(Date.now() + card.interval * 24 * 60 * 60 * 1000);
    card.isMastered = card.repetitions >= 5 && card.easeFactor >= 2.2;
    await card.save();
    res.status(200).json(card);
  } catch (error) {
    res.status(500).json({ message: 'Failed to review flashcard' });
  }
};

exports.askAI = async (req, res) => {
  try {
    const prompt = req.body.prompt || req.body.question;
    if (!prompt?.trim()) return res.status(400).json({ message: 'Question is required' });
    res.status(200).json({
      answer: `I understood your question: "${prompt.trim()}". AI provider is not configured, so this is a local fallback response.`,
    });
  } catch (error) {
    res.status(500).json({ message: 'AI query failed' });
  }
};

exports.askAIWithFile = async (req, res) => {
  try {
    const prompt = req.body.question || req.body.prompt || '';
    if (!prompt.trim() && !req.file) {
      return res.status(400).json({ message: 'Question or file is required' });
    }

    const fileNote = req.file?.originalname ? ` I also received your file "${req.file.originalname}".` : '';
    res.status(200).json({
      answer: `I understood your question: "${prompt.trim() || 'Please review this file'}".${fileNote} AI provider is not configured, so this is a local fallback response.`,
    });
  } catch (error) {
    res.status(500).json({ message: 'File AI query failed' });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const chats = await ChatHistory.find({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .limit(30)
      .lean();
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load chat history' });
  }
};

exports.saveChatHistory = async (req, res) => {
  try {
    const { id, title, messages = [] } = req.body;
    const safeMessages = Array.isArray(messages)
      ? messages
          .filter((m) => ['user', 'assistant'].includes(m.role))
          .map((m) => ({
            role: m.role,
            content: String(m.content || '').slice(0, 8000),
            fileName: String(m.fileName || '').slice(0, 180),
          }))
      : [];

    const fallbackTitle = safeMessages.find((m) => m.role === 'user')?.content?.slice(0, 60) || 'New Chat';
    const payload = {
      title: (title || fallbackTitle).trim() || 'New Chat',
      messages: safeMessages,
    };

    // Hindi: Existing chat update karo, warna nayi chat create karo.
    const chat = id
      ? await ChatHistory.findOneAndUpdate({ _id: id, user: req.user.id }, payload, { new: true, upsert: false })
      : await ChatHistory.create({ ...payload, user: req.user.id });

    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Failed to save chat history' });
  }
};

exports.deleteChatHistory = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === 'all') {
      await ChatHistory.deleteMany({ user: req.user.id });
      return res.status(200).json({ message: 'All chat history deleted' });
    }

    const chat = await ChatHistory.findOneAndDelete({ _id: id, user: req.user.id });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    res.status(200).json({ message: 'Chat deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete chat history' });
  }
};

exports.importNotes = async (req, res) => {
  try {
    if (!req.file?.buffer) return res.status(400).json({ message: 'No file uploaded' });
    const fileData = req.file.buffer.toString('utf-8');
    const importedData = JSON.parse(fileData);
    const notesArray = Array.isArray(importedData) ? importedData : [importedData];

    const notesToImport = notesArray
      .filter((note) => typeof note === 'object' && note)
      .map((note) => ({
        title: note.title || 'Imported Note',
        content: note.content || '',
        plainText: note.plainText || note.content || '',
        tags: Array.isArray(note.tags) ? note.tags : [],
        subject: note.subject || 'General',
        isPublic: false,
        user: req.user.id,
      }));

    if (!notesToImport.length) return res.status(400).json({ message: 'No valid notes found in file' });
    const result = await Note.insertMany(notesToImport);
    res.status(200).json({ message: `${result.length} notes imported successfully`, notes: result });
  } catch (error) {
    res.status(500).json({ message: 'Import failed. Use valid JSON format.' });
  }
};
