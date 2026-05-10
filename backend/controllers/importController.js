const Note = require('../models/Note');

// Top-level require
let pdfParse = null;
let mammoth  = null;

try { pdfParse = require('pdf-parse'); } catch (e) { console.warn('pdf-parse not available:', e.message); }
try { mammoth  = require('mammoth');   } catch (e) { console.warn('mammoth not available:', e.message); }

/**
 * POST /api/import
 * File se note import karo — TXT, MD, PDF, DOCX support
 */
exports.importNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { originalname, mimetype, buffer } = req.file;

    // File name se title banao (extension hataao)
    const rawTitle = originalname.replace(/\.(txt|md|pdf|docx|doc)$/i, '').trim();
    const title    = rawTitle || 'Imported Note';

    let plainText = '';
    let content   = '';

    const isTxt  = mimetype === 'text/plain'
                || mimetype === 'text/markdown'
                || /\.(txt|md)$/i.test(originalname);
    const isPdf  = mimetype === 'application/pdf'
                || /\.pdf$/i.test(originalname);
    const isDocx = mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                || mimetype === 'application/msword'
                || /\.docx?$/i.test(originalname);

    // ── TXT / MD ──────────────────────────────────────────
    if (isTxt) {
      plainText = buffer.toString('utf-8');
      content   = plainText
        .split('\n')
        .map(line => {
          const t = line.trim();
          if (!t) return '<p><br></p>';
          if (t.startsWith('### ')) return `<h3>${escHtml(t.slice(4))}</h3>`;
          if (t.startsWith('## '))  return `<h2>${escHtml(t.slice(3))}</h2>`;
          if (t.startsWith('# '))   return `<h1>${escHtml(t.slice(2))}</h1>`;
          if (t.startsWith('**') && t.endsWith('**'))
            return `<p><strong>${escHtml(t.slice(2, -2))}</strong></p>`;
          if (t.startsWith('- ') || t.startsWith('* '))
            return `<li>${escHtml(t.slice(2))}</li>`;
          return `<p>${escHtml(t)}</p>`;
        })
        .join('');
    }

    // ── PDF ───────────────────────────────────────────────
    else if (isPdf) {
      if (!pdfParse) {
        return res.status(500).json({
          message: 'PDF parsing not available. Run: npm install pdf-parse in backend.',
        });
      }

      let parsed;
      try {
        parsed = await pdfParse(buffer, { max: 0 });
      } catch (pdfErr) {
        console.error('pdf-parse error:', pdfErr.message);
        return res.status(422).json({
          message: `Could not read this PDF: ${pdfErr.message}`,
        });
      }

      plainText = (parsed.text || '').trim();

      if (!plainText) {
        return res.status(422).json({
          message:
            'This PDF appears to be scanned/image-based with no extractable text. Please use a text-based PDF.',
        });
      }

      // PDF text extraction improved:
      // - Lines ending with punctuation = paragraph end
      // - Short lines (< 60 chars) likely headings or standalone lines
      // - Double newlines = definitely new paragraph
      const lines = plainText.split('\n');
      const htmlParts = [];
      let currentPara = [];

      const flushPara = () => {
        if (currentPara.length === 0) return;
        const text = currentPara.join(' ').trim();
        if (!text) { currentPara = []; return; }
        htmlParts.push(`<p>${escHtml(text)}</p>`);
        currentPara = [];
      };

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) {
          // Empty line = paragraph break
          flushPara();
          continue;
        }
        // Short line that looks like a heading (all caps, or very short with next line empty)
        const nextLine = (lines[i + 1] || '').trim();
        const isHeading = line.length < 80 && (
          line === line.toUpperCase() && line.length > 3 ||
          (!nextLine && currentPara.length === 0)
        );
        if (isHeading && currentPara.length === 0) {
          htmlParts.push(`<h3>${escHtml(line)}</h3>`);
          continue;
        }
        currentPara.push(line);
        // Flush on sentence end if next line starts with capital (new paragraph signal)
        if (/[.!?]$/.test(line) && nextLine && /^[A-Z]/.test(nextLine)) {
          flushPara();
        }
      }
      flushPara();
      content = htmlParts.join('');
    }

    // ── DOCX ──────────────────────────────────────────────
    else if (isDocx) {
      if (!mammoth) {
        return res.status(500).json({
          message: 'DOCX parsing not available. Run: npm install mammoth in backend.',
        });
      }

      let result;
      try {
        result = await mammoth.convertToHtml({ buffer });
      } catch (docxErr) {
        console.error('mammoth error:', docxErr.message);
        return res.status(422).json({
          message: `Could not read DOCX: ${docxErr.message}`,
        });
      }

      content   = result.value || '';
      plainText = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

      if (!content.trim()) {
        return res.status(422).json({ message: 'DOCX file appears to be empty.' });
      }
    }

    else {
      return res.status(400).json({
        message: 'Unsupported file type. Please use TXT, MD, PDF, or DOCX.',
      });
    }

    // Content too large — trim
    const MAX = 200000;
    if (content.length > MAX) {
      content   = content.slice(0, MAX) + '<p><em>[Content truncated — file too large]</em></p>';
      plainText = plainText.slice(0, MAX);
    }

    const note = await Note.create({
      title,
      content,
      plainText,
      user:     req.user.id,
      folder:   null,
      tags:     [],
      isPublic: false,
    });

    res.status(201).json({
      message: `"${title}" imported successfully!`,
      note,
    });

  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ message: error.message || 'Import failed. Please try again.' });
  }
};

// HTML injection se bachao
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}