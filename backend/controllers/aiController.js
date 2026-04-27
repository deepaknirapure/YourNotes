// AI controller — Groq API se AI features handle karta hai
// Features: Summary, Flashcards, Quiz, Ask AI
const Groq = require('groq-sdk');
const Note = require('../models/Note');
const Flashcard = require('../models/Flashcard');

// Groq client initialize karo
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Har user ke liye hourly AI call limit
const AI_HOURLY_LIMIT = 30;

// ─────────────────────────────────────────────────────────────────────────────
// RATE LIMIT CHECK — 30 AI calls/hour per user
// Yeh middleware har AI route pe use hota hai
// ─────────────────────────────────────────────────────────────────────────────
const checkAIRateLimit = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const now = new Date();
    const resetAt = user.aiCallsResetAt ? new Date(user.aiCallsResetAt) : null;

    // Agar 1 ghanta guzar gaya — reset karo
    if (!resetAt || now - resetAt >= 60 * 60 * 1000) {
      user.aiCallsThisHour = 0;
      user.aiCallsResetAt = now;
    }

    // Limit check karo
    if (user.aiCallsThisHour >= AI_HOURLY_LIMIT) {
      const waitMins = Math.ceil(
        (60 * 60 * 1000 - (now - user.aiCallsResetAt)) / 60000
      );
      return res.status(429).json({
        message: `AI limit reached (${AI_HOURLY_LIMIT}/hour). Please try again in ${waitMins} minute(s).`,
        limit: AI_HOURLY_LIMIT,
      });
    }
// Save count only AFTER the response succeeds
    user.aiCallsThisHour += 1;
    const savedUser = await user.save();

    next();
    
  } catch (error) {
    console.error('AI rate limit check error:', error);
    // Error pe request rok do — security ke liye
    return res.status(500).json({ message: 'Server error checking rate limit' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARIZE NOTE — note ka AI summary generate karo
// ─────────────────────────────────────────────────────────────────────────────
const summarizeNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Plain text use karo, agar nahi toh HTML tags remove karo
    const noteText = note.plainText || note.content?.replace(/<[^>]*>/g, '') || '';

    if (!noteText || noteText.trim().length < 50) {
      return res.status(400).json({ message: 'Note must have at least 50 characters' });
    }

    // Groq API call karo
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'You are a smart study assistant. Always respond in the same language as the note content. If the note is in English, respond in English. If in Hindi, respond in Hindi. Never mix languages.',
        },
        {
          role: 'user',
          content: `Summarize the following student notes clearly and concisely.\n\nNote Title: ${note.title}\nNote Content: ${noteText}\n\nRules:\n- Use bullet points\n- Maximum 150 words\n- Highlight key concepts\n- Match the language of the note content exactly\n- Be helpful for a student`,
        },
      ],
      max_tokens: 500,
    });

    const summary = completion.choices[0].message.content;

    // Summary note mein save karo
    note.aiSummary = summary;
    note.summaryGeneratedAt = new Date();
    await note.save();

    res.status(200).json({ summary, generatedAt: note.summaryGeneratedAt });
  } catch (error) {
    console.error('Summarize error:', error);
    res.status(500).json({ message: 'AI service error. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GENERATE FLASHCARDS — note se AI flashcards banao
// ─────────────────────────────────────────────────────────────────────────────
const generateFlashcards = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const noteText = note.plainText || note.content?.replace(/<[^>]*>/g, '') || '';

    if (!noteText || noteText.trim().length < 50) {
      return res.status(400).json({ message: 'Note must have at least 50 characters' });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'You are a flashcard generator. Always write questions and answers in the same language as the note content. Return only valid JSON.',
        },
        {
          role: 'user',
          content: `Generate exactly 5 flashcards from the following notes.\n\nNote Title: ${note.title}\nNote Content: ${noteText}\n\nRules:\n- Each flashcard must have a clear question and a short answer\n- Match the language of the note content exactly\n- Focus on important concepts\n- Return ONLY a JSON array, no extra text, no markdown\n\nFormat:\n[{"question": "...", "answer": "..."}]`,
        },
      ],
      max_tokens: 800,
    });

    // Response se JSON nikalo (markdown fences hata ke)
    let text = completion.choices[0].message.content;
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const flashcardsData = JSON.parse(text);

    // Purane flashcards delete karo phir naye save karo
    await Flashcard.deleteMany({ note: note._id, user: req.user.id });

    const flashcards = await Flashcard.insertMany(
      flashcardsData.map((fc) => ({
        question: fc.question,
        answer: fc.answer,
        user: req.user.id,
        note: note._id,
      }))
    );

    res.status(201).json({
      message: `${flashcards.length} flashcards generated!`,
      flashcards,
    });
  } catch (error) {
    console.error('GenerateFlashcards error:', error);
    res.status(500).json({ message: 'AI service error. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET FLASHCARDS — ek note ke flashcards fetch karo
// ─────────────────────────────────────────────────────────────────────────────
const getFlashcards = async (req, res) => {
  try {
    const flashcards = await Flashcard.find({
      note: req.params.id,
      user: req.user.id,
    });
    res.status(200).json(flashcards);
  } catch (error) {
    console.error('GetFlashcards error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// REVIEW FLASHCARD — SM-2 algorithm se flashcard review karo
// quality: 0-5 (0=bilkul nahi pata, 5=perfect pata tha)
// ─────────────────────────────────────────────────────────────────────────────
const reviewFlashcard = async (req, res) => {
  try {
    const { quality } = req.body;
    const flashcard = await Flashcard.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard not found' });
    }

    let { easeFactor, interval, repetitions } = flashcard;

    // SM-2 Algorithm logic
    if (quality >= 3) {
      // Sahi jawab — interval badhao
      if (repetitions === 0)      interval = 1;
      else if (repetitions === 1) interval = 6;
      else                        interval = Math.round(interval * easeFactor);
      repetitions += 1;
    } else {
      // Galat jawab — kal dobara dikhao
      repetitions = 0;
      interval = 1;
    }

    // Ease factor update karo (min 1.3 rakhna)
    easeFactor = Math.max(
      1.3,
      easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
    );

    // Agla review date calculate karo
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    // Updated values save karo
    flashcard.easeFactor = easeFactor;
    flashcard.interval = interval;
    flashcard.repetitions = repetitions;
    flashcard.nextReviewDate = nextReviewDate;
    await flashcard.save();

    res.status(200).json({ message: 'Review saved!', nextReviewDate, interval });
  } catch (error) {
    console.error('ReviewFlashcard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET DUE FLASHCARDS — aaj review karne wale flashcards fetch karo
// ─────────────────────────────────────────────────────────────────────────────
const getDueFlashcards = async (req, res) => {
  try {
    const flashcards = await Flashcard.find({
      user: req.user.id,
      nextReviewDate: { $lte: new Date() }, // Aaj ya pehle due
    }).populate('note', 'title');

    res.status(200).json(flashcards);
  } catch (error) {
    console.error('GetDueFlashcards error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GENERATE QUIZ — note se MCQ quiz generate karo
// ─────────────────────────────────────────────────────────────────────────────
const generateQuiz = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const noteText = note.plainText || note.content?.replace(/<[^>]*>/g, '') || '';

    if (!noteText || noteText.trim().length < 50) {
      return res.status(400).json({
        message: 'Note must have at least 50 characters to generate a quiz',
      });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'You are a quiz generator. Always write questions and options in the same language as the note content. Return only valid JSON, no markdown, no extra text.',
        },
        {
          role: 'user',
          content: `Generate exactly 5 multiple choice questions from the following notes.\n\nNote Title: ${note.title}\nNote Content: ${noteText}\n\nRules:\n- Each question must have exactly 4 options\n- "correct" must be the 0-based index of the correct option (0, 1, 2, or 3)\n- Include a short "explanation" for the correct answer\n- Match the language of the note content exactly\n- Return ONLY a JSON array, no extra text, no markdown\n\nFormat:\n[{"question":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}]`,
        },
      ],
      max_tokens: 1200,
    });

    let text = completion.choices[0].message.content;
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const questions = JSON.parse(text);

    res.status(200).json({ questions });
  } catch (error) {
    console.error('GenerateQuiz error:', error);
    res.status(500).json({ message: 'AI quiz generation failed. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ASK AI — general AI chatbot (note context optional)
// ─────────────────────────────────────────────────────────────────────────────
const askAI = async (req, res) => {
  try {
    const { question, messages: history, noteId } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'Question is required' });
    }

    // Base system prompt
    let systemPrompt =
      'You are a helpful study assistant for students. Answer questions clearly and concisely. Match the language of the user\'s question (English or Hindi).';

    // Agar noteId diya — us note ka content context mein add karo
    if (noteId) {
      const note = await Note.findOne({ _id: noteId, user: req.user.id });
      if (note) {
        const noteText = note.plainText || note.content?.replace(/<[^>]*>/g, '') || '';
        if (noteText.trim().length > 0) {
          systemPrompt += `\n\nThe user has provided the following note as context:\nTitle: ${note.title}\nContent: ${noteText.slice(0, 3000)}`;
        }
      }
    }

    // Chat history build karo (max last 10 messages — token limit ke liye)
    const chatMessages = [];
    if (Array.isArray(history)) {
      const recent = history.slice(-10);
      recent.forEach((m) => {
        if ((m.role === 'user' || m.role === 'assistant') && m.content) {
          chatMessages.push({ role: m.role, content: m.content });
        }
      });
    }
    chatMessages.push({ role: 'user', content: question });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: systemPrompt }, ...chatMessages],
      max_tokens: 1000,
    });

    const answer = completion.choices[0].message.content;
    res.status(200).json({ answer });
  } catch (error) {
    console.error('AskAI error:', error);
    res.status(500).json({ message: 'AI service error. Please try again.' });
  }
};

module.exports = {
  summarizeNote,
  generateFlashcards,
  getFlashcards,
  reviewFlashcard,
  getDueFlashcards,
  checkAIRateLimit,
  generateQuiz,
  askAI,
};
