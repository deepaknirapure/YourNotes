'use strict';

const Note        = require('../models/Note');
const User        = require('../models/User');
const Flashcard   = require('../models/Flashcard');
const ChatHistory = require('../models/ChatHistory');
const mongoose    = require('mongoose');
const Groq        = require('groq-sdk');

// ── Groq client (lazy-init so server still boots without the key in dev) ──────
let groq = null;
const getGroq = () => {
  if (!groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set in environment variables');
    }
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
};

const MODEL = 'llama3-8b-8192';

// ── Helpers ───────────────────────────────────────────────────────────────────
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const splitSentences = (text = '') =>
  text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

const groqChat = async (messages, opts = {}) => {
  const completion = await getGroq().chat.completions.create({
    model:       opts.model       || MODEL,
    max_tokens:  opts.max_tokens  || 1024,
    temperature: opts.temperature ?? 0.7,
    messages,
  });
  return completion.choices[0]?.message?.content?.trim() || '';
};

const parseJSON = (text) => {
  const clean = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
  return JSON.parse(clean);
};

// ── Rate-limit middleware ─────────────────────────────────────────────────────
exports.checkAIRateLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const now = Date.now();
    if (!user.aiCallsResetAt || now - new Date(user.aiCallsResetAt).getTime() >= 60 * 60 * 1000) {
      user.aiCallsThisHour  = 0;
      user.aiCallsResetAt   = new Date(now);
    }

    if (user.aiCallsThisHour >= 60) {
      return res.status(429).json({ message: 'AI request limit reached for this hour. Please wait.' });
    }

    user.aiCallsThisHour += 1;
    await user.save();
    next();
  } catch (error) {
    res.status(500).json({ message: 'Rate limit validation failed' });
  }
};

// ── Summarize note ────────────────────────────────────────────────────────────
exports.summarizeNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const source = (note.plainText || note.content || '').trim();
    if (!source) return res.status(400).json({ message: 'Note has no content to summarize' });

    let summary;
    try {
      summary = await groqChat([
        {
          role: 'system',
          content:
            'You are a concise study assistant. Summarize the given note content in clear bullet points. ' +
            'Use 5-8 bullet points. Each point should be a key insight or fact. ' +
            'Format: start each point with "• ". Do not add headers.',
        },
        {
          role: 'user',
          content: `Summarize this note:\n\n${source.slice(0, 6000)}`,
        },
      ], { max_tokens: 512 });
    } catch (groqErr) {
      console.error('Groq summarize error:', groqErr.message);
      const lines = splitSentences(source).slice(0, 5);
      summary = lines.map((l, i) => `${i + 1}. ${l}`).join('\n');
    }

    note.aiSummary          = summary;
    note.summaryGeneratedAt = new Date();
    await note.save();

    res.status(200).json({ summary });
  } catch (error) {
    console.error('summarizeNote:', error);
    res.status(500).json({ message: 'Summary generation failed' });
  }
};

// ── Generate flashcards ───────────────────────────────────────────────────────
exports.generateFlashcards = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const source = (note.plainText || note.content || '').trim();
    if (!source) return res.status(200).json({ flashcards: [] });

    let cards = [];

    try {
      const raw = await groqChat([
        {
          role: 'system',
          content:
            'You are a flashcard generator. Given note content, generate 6-10 question-answer flashcards. ' +
            'Return ONLY a valid JSON array, no markdown, no extra text. ' +
            'Format: [{"question": "...", "answer": "..."}, ...]',
        },
        {
          role: 'user',
          content: `Generate flashcards from this note:\n\n${source.slice(0, 6000)}`,
        },
      ], { max_tokens: 1024, temperature: 0.5 });

      const parsed = parseJSON(raw);
      if (Array.isArray(parsed)) {
        cards = parsed.slice(0, 10).map((c) => ({
          question: String(c.question || '').trim(),
          answer:   String(c.answer   || '').trim(),
          user:     req.user.id,
          note:     note._id,
          subject:  note.subject || 'General',
        })).filter((c) => c.question && c.answer);
      }
    } catch (groqErr) {
      console.error('Groq flashcard error:', groqErr.message);
      const chunks = splitSentences(source).slice(0, 8);
      cards = chunks.map((line, idx) => ({
        question: `Key point ${idx + 1}: What does this statement mean?`,
        answer:   line,
        user:     req.user.id,
        note:     note._id,
        subject:  note.subject || 'General',
      }));
    }

    if (!cards.length) return res.status(200).json({ flashcards: [] });

    await Flashcard.deleteMany({ user: req.user.id, note: note._id });
    const inserted = await Flashcard.insertMany(cards);
    res.status(200).json({ flashcards: inserted });
  } catch (error) {
    console.error('generateFlashcards:', error);
    res.status(500).json({ message: 'Flashcard generation failed' });
  }
};

// ── Generate quiz ─────────────────────────────────────────────────────────────
exports.generateQuiz = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const source = (note.plainText || note.content || '').trim();
    if (!source) return res.status(200).json({ questions: [] });

    let questions = [];

    try {
      const raw = await groqChat([
        {
          role: 'system',
          content:
            'You are a quiz generator. Generate 5 multiple-choice questions from the given note. ' +
            'Return ONLY a valid JSON array. No markdown, no extra text. ' +
            'Format: [{"question":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}] ' +
            'where "correct" is the 0-based index of the correct option.',
        },
        {
          role: 'user',
          content: `Generate a quiz from this note:\n\n${source.slice(0, 6000)}`,
        },
      ], { max_tokens: 1024, temperature: 0.5 });

      const parsed = parseJSON(raw);
      if (Array.isArray(parsed)) {
        questions = parsed.slice(0, 5).map((q) => ({
          question:    String(q.question    || '').trim(),
          options:     Array.isArray(q.options) ? q.options.map(String) : [],
          correct:     typeof q.correct === 'number' ? q.correct : 0,
          explanation: String(q.explanation || '').trim(),
        })).filter((q) => q.question && q.options.length >= 2);
      }
    } catch (groqErr) {
      console.error('Groq quiz error:', groqErr.message);
      const lines = splitSentences(source).slice(0, 5);
      questions = lines.map((line) => ({
        question:    'Which statement best matches this note point?',
        options:     [line, 'This is unrelated', 'None of the above', 'Needs more context'],
        correct:     0,
        explanation: 'The first option is taken directly from your note.',
      }));
    }

    res.status(200).json({ questions });
  } catch (error) {
    console.error('generateQuiz:', error);
    res.status(500).json({ message: 'Quiz generation failed' });
  }
};

// ── Get flashcards ────────────────────────────────────────────────────────────
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
      user:           req.user.id,
      nextReviewDate: { $lte: new Date() },
    }).sort({ nextReviewDate: 1 });
    res.status(200).json(cards);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load due flashcards' });
  }
};

exports.getFlashcardNotes = async (req, res) => {
  try {
    const now    = new Date();
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const pipeline = [
      { $match: { user: userId } },
      {
        $group: {
          _id:        '$note',
          totalCount: { $sum: 1 },
          dueCount: {
            $sum: { $cond: [{ $lte: ['$nextReviewDate', now] }, 1, 0] },
          },
        },
      },
      { $lookup: { from: 'notes', localField: '_id', foreignField: '_id', as: 'noteDoc' } },
      { $unwind: { path: '$noteDoc', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id:        0,
          noteId:     '$_id',
          totalCount: 1,
          dueCount:   1,
          title:      '$noteDoc.title',
          subject:    '$noteDoc.subject',
          updatedAt:  '$noteDoc.updatedAt',
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
      card.interval    = 1;
    } else {
      card.repetitions += 1;
      if      (card.repetitions === 1) card.interval = 1;
      else if (card.repetitions === 2) card.interval = 3;
      else card.interval = Math.round(card.interval * card.easeFactor);
      card.easeFactor = Math.max(1.3, card.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
    }
    card.lastQuality    = q;
    card.nextReviewDate = new Date(Date.now() + card.interval * 24 * 60 * 60 * 1000);
    card.isMastered     = card.repetitions >= 5 && card.easeFactor >= 2.2;
    await card.save();
    res.status(200).json(card);
  } catch (error) {
    res.status(500).json({ message: 'Failed to review flashcard' });
  }
};

// ── Ask AI (chat with history) ────────────────────────────────────────────────
exports.askAI = async (req, res) => {
  try {
    const prompt  = (req.body.prompt || req.body.question || '').trim();
    const history = Array.isArray(req.body.history) ? req.body.history : [];

    if (!prompt) return res.status(400).json({ message: 'Question is required' });

    const systemMsg = {
      role:    'system',
      content:
        'You are YourNotes AI, a helpful study assistant. ' +
        'Answer questions clearly and concisely. ' +
        'When helping with notes, be structured and educational. ' +
        'Use bullet points or numbered lists when it improves clarity.',
    };

    const safeHistory = history
      .filter((m) => ['user', 'assistant'].includes(m.role) && m.content)
      .slice(-10)
      .map((m) => ({ role: m.role, content: String(m.content).slice(0, 4000) }));

    const messages = [systemMsg, ...safeHistory, { role: 'user', content: prompt }];

    let answer;
    try {
      answer = await groqChat(messages, { max_tokens: 1024, temperature: 0.7 });
    } catch (groqErr) {
      console.error('Groq askAI error:', groqErr.message);
      const isAuthError = groqErr.message?.includes('API key') || groqErr.message?.includes('authentication') || groqErr.status === 401;
      return res.status(503).json({
        message: isAuthError
          ? 'AI service not configured. Please add your GROQ_API_KEY to the backend .env file.'
          : 'AI service temporarily unavailable. Please try again.',
      });
    }

    res.status(200).json({ answer });
  } catch (error) {
    console.error('askAI:', error);
    res.status(500).json({ message: 'AI query failed' });
  }
};

// ── Ask AI with file attachment ───────────────────────────────────────────────
exports.askAIWithFile = async (req, res) => {
  try {
    const prompt  = (req.body.question || req.body.prompt || '').trim();
    const history = (() => { try { return JSON.parse(req.body.history || '[]'); } catch { return []; } })();

    if (!prompt && !req.file) {
      return res.status(400).json({ message: 'Question or file is required' });
    }

    let fileContext = '';
    if (req.file) {
      if (req.file.mimetype === 'application/pdf') {
        try {
          const pdfParse = require('pdf-parse');
          const pdfData  = await pdfParse(req.file.buffer);
          fileContext    = pdfData.text?.slice(0, 4000) || '';
        } catch {
          fileContext = `[PDF file received: ${req.file.originalname}. Could not extract text — pdf-parse package may not be installed.]`;
        }
      } else if (req.file.mimetype.startsWith('image/')) {
        fileContext = `[Image file uploaded: ${req.file.originalname}. Image analysis requires a vision model and is not supported in this configuration.]`;
      } else {
        try {
          fileContext = req.file.buffer.toString('utf-8').slice(0, 4000);
        } catch {
          fileContext = `[File: ${req.file.originalname}]`;
        }
      }
    }

    const userContent = [
      fileContext ? `File content:\n${fileContext}` : '',
      prompt || 'Please summarize or explain the file content.',
    ].filter(Boolean).join('\n\n');

    const systemMsg = {
      role:    'system',
      content:
        'You are YourNotes AI, a helpful study assistant. ' +
        'When a file is provided, analyze it and answer the user\'s question about it. ' +
        'Be concise, structured, and educational.',
    };

    const safeHistory = Array.isArray(history)
      ? history
          .filter((m) => ['user', 'assistant'].includes(m.role) && m.content)
          .slice(-6)
          .map((m) => ({ role: m.role, content: String(m.content).slice(0, 3000) }))
      : [];

    const messages = [systemMsg, ...safeHistory, { role: 'user', content: userContent }];

    let answer;
    try {
      answer = await groqChat(messages, { max_tokens: 1024, temperature: 0.7 });
    } catch (groqErr) {
      console.error('Groq askAIWithFile error:', groqErr.message);
      const isAuthError = groqErr.message?.includes('API key') || groqErr.message?.includes('authentication') || groqErr.status === 401;
      return res.status(503).json({
        message: isAuthError
          ? 'AI service not configured. Please add your GROQ_API_KEY to the backend .env file.'
          : 'AI service temporarily unavailable. Please try again.',
      });
    }

    res.status(200).json({ answer });
  } catch (error) {
    console.error('askAIWithFile:', error);
    res.status(500).json({ message: 'File AI query failed' });
  }
};

// ── Chat history ──────────────────────────────────────────────────────────────
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
            role:     m.role,
            content:  String(m.content  || '').slice(0, 8000),
            fileName: String(m.fileName || '').slice(0, 180),
          }))
      : [];

    const fallbackTitle = safeMessages.find((m) => m.role === 'user')?.content?.slice(0, 60) || 'New Chat';
    const payload = {
      title:    (title || fallbackTitle).trim() || 'New Chat',
      messages: safeMessages,
    };

    const chat = id
      ? await ChatHistory.findOneAndUpdate(
          { _id: id, user: req.user.id },
          payload,
          { new: true, upsert: false },
        )
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

// ── Import notes ──────────────────────────────────────────────────────────────
exports.importNotes = async (req, res) => {
  try {
    if (!req.file?.buffer) return res.status(400).json({ message: 'No file uploaded' });

    const fileData     = req.file.buffer.toString('utf-8');
    const importedData = JSON.parse(fileData);
    const notesArray   = Array.isArray(importedData) ? importedData : [importedData];

    const notesToImport = notesArray
      .filter((note) => typeof note === 'object' && note)
      .map((note) => ({
        title:     note.title   || 'Imported Note',
        content:   note.content || '',
        plainText: note.plainText || note.content || '',
        tags:      Array.isArray(note.tags) ? note.tags : [],
        subject:   note.subject || 'General',
        isPublic:  false,
        user:      req.user.id,
      }));

    if (!notesToImport.length) {
      return res.status(400).json({ message: 'No valid notes found in file' });
    }

    const result = await Note.insertMany(notesToImport);
    res.status(200).json({ message: `${result.length} notes imported successfully`, notes: result });
  } catch (error) {
    res.status(500).json({ message: 'Import failed. Use valid JSON format.' });
  }
};
