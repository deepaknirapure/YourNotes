const Groq = require('groq-sdk');
const Note = require('../models/Note');
const Flashcard = require('../models/Flashcard');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ✅ SUMMARIZE NOTE
const summarizeNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const noteText = note.plainText || note.content?.replace(/<[^>]*>/g, '') || '';

    if (!noteText || noteText.trim().length < 50) {
      return res.status(400).json({ message: 'Note must have at least 50 characters' });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a smart study assistant. Always respond in the same language as the note content. If the note is in English, respond in English. If in Hindi, respond in Hindi. Never mix languages.'
        },
        {
          role: 'user',
          content: `Summarize the following student notes clearly and concisely.

Note Title: ${note.title}
Note Content: ${noteText}

Rules:
- Use bullet points
- Maximum 150 words
- Highlight key concepts
- Match the language of the note content exactly
- Be helpful for a student`
        }
      ],
      max_tokens: 500,
    });

    const summary = completion.choices[0].message.content;
    note.aiSummary = summary;
    note.summaryGeneratedAt = new Date();
    await note.save();

    res.status(200).json({ summary, generatedAt: note.summaryGeneratedAt });

  } catch (error) {
    console.error('Groq Error:', error);
    res.status(500).json({ message: 'AI error', error: error.message });
  }
};

// ✅ GENERATE FLASHCARDS
const generateFlashcards = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const noteText = note.plainText || note.content?.replace(/<[^>]*>/g, '') || '';

    if (!noteText || noteText.trim().length < 50) {
      return res.status(400).json({ message: 'Note must have at least 50 characters' });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a flashcard generator. Always write questions and answers in the same language as the note content. If the note is in English, write in English only. Never mix languages. Return only valid JSON.'
        },
        {
          role: 'user',
          content: `Generate exactly 5 flashcards from the following notes.

Note Title: ${note.title}
Note Content: ${noteText}

Rules:
- Each flashcard must have a clear question and a short answer
- Match the language of the note content exactly
- Focus on important concepts
- Return ONLY a JSON array, no extra text, no markdown

Format:
[{"question": "...", "answer": "..."},{"question": "...", "answer": "..."}]`
        }
      ],
      max_tokens: 800,
    });

    let text = completion.choices[0].message.content;
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const flashcardsData = JSON.parse(text);

    await Flashcard.deleteMany({ note: note._id, user: req.user.id });

    const flashcards = await Flashcard.insertMany(
      flashcardsData.map(fc => ({
        question: fc.question,
        answer: fc.answer,
        user: req.user.id,
        note: note._id
      }))
    );

    res.status(201).json({ message: `${flashcards.length} flashcards generated!`, flashcards });

  } catch (error) {
    console.error('Groq Error:', error);
    res.status(500).json({ message: 'AI error', error: error.message });
  }
};

// ✅ GET FLASHCARDS FOR A NOTE
const getFlashcards = async (req, res) => {
  try {
    const flashcards = await Flashcard.find({ note: req.params.id, user: req.user.id });
    res.status(200).json(flashcards);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ SM-2 SPACED REPETITION REVIEW
const reviewFlashcard = async (req, res) => {
  try {
    const { quality } = req.body;
    const flashcard = await Flashcard.findOne({ _id: req.params.id, user: req.user.id });

    if (!flashcard) return res.status(404).json({ message: 'Flashcard not found' });

    let { easeFactor, interval, repetitions } = flashcard;

    if (quality >= 3) {
      if (repetitions === 0) interval = 1;
      else if (repetitions === 1) interval = 6;
      else interval = Math.round(interval * easeFactor);
      repetitions += 1;
    } else {
      repetitions = 0;
      interval = 1;
    }

    easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    flashcard.easeFactor = easeFactor;
    flashcard.interval = interval;
    flashcard.repetitions = repetitions;
    flashcard.nextReviewDate = nextReviewDate;
    await flashcard.save();

    res.status(200).json({ message: 'Review saved!', nextReviewDate, interval });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ GET DUE FLASHCARDS
const getDueFlashcards = async (req, res) => {
  try {
    const flashcards = await Flashcard.find({
      user: req.user.id,
      nextReviewDate: { $lte: new Date() }
    }).populate('note', 'title');

    res.status(200).json(flashcards);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { summarizeNote, generateFlashcards, getFlashcards, reviewFlashcard, getDueFlashcards };
