const Note = require('../models/Note');

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
    const title = originalname.replace(/\.(txt|md|pdf|docx|doc)$/i, '').trim() || 'Imported Note';

    let plainText = '';
    let content   = '';

    // ── TXT / MD — seedha read karo ──
    if (
      mimetype === 'text/plain' ||
      mimetype === 'text/markdown' ||
      originalname.match(/\.(txt|md)$/i)
    ) {
      plainText = buffer.toString('utf-8');
      // Plain text ko basic HTML mein convert karo (line breaks preserve karo)
      content = plainText
        .split('\n')
        .map(line => {
          const trimmed = line.trim();
          if (!trimmed) return '<p><br></p>';
          // Markdown headings ko bold text banao (basic support)
          if (trimmed.startsWith('### ')) return `<p><strong>${trimmed.slice(4)}</strong></p>`;
          if (trimmed.startsWith('## '))  return `<p><strong>${trimmed.slice(3)}</strong></p>`;
          if (trimmed.startsWith('# '))   return `<p><strong>${trimmed.slice(2)}</strong></p>`;
          return `<p>${trimmed}</p>`;
        })
        .join('');
    }

    // ── PDF — text extract karo ──
    else if (mimetype === 'application/pdf' || originalname.match(/\.pdf$/i)) {
      try {
        // pdf-parse try karo — agar installed hai toh
        const pdfParse = require('pdf-parse');
        const parsed   = await pdfParse(buffer);
        plainText = parsed.text || '';
        content = plainText
          .split('\n')
          .map(l => l.trim() ? `<p>${l.trim()}</p>` : '<p><br></p>')
          .join('');
      } catch (pdfErr) {
        // pdf-parse nahi mila — basic fallback
        plainText = `[PDF imported: ${originalname}]\n\nPDF content extraction requires pdf-parse package.\nInstall it with: npm install pdf-parse`;
        content = `<p>[PDF imported: ${originalname}]</p><p>PDF content extraction requires pdf-parse package.</p>`;
      }
    }

    // ── DOCX — text extract karo ──
    else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimetype === 'application/msword' ||
      originalname.match(/\.docx?$/i)
    ) {
      try {
        const mammoth = require('mammoth');
        const result  = await mammoth.convertToHtml({ buffer });
        content   = result.value || '';
        // HTML se plain text banao
        plainText = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      } catch (docxErr) {
        // mammoth nahi mila — basic fallback
        plainText = `[DOCX imported: ${originalname}]\n\nDOCX content extraction requires mammoth package.\nInstall it with: npm install mammoth`;
        content = `<p>[DOCX imported: ${originalname}]</p><p>DOCX content extraction requires mammoth package.</p>`;
      }
    }

    // Content too large — trim karo
    const MAX_CONTENT = 200000; // ~200KB
    if (content.length > MAX_CONTENT) {
      content   = content.slice(0, MAX_CONTENT) + '<p><em>[Content truncated — file too large]</em></p>';
      plainText = plainText.slice(0, MAX_CONTENT);
    }

    // Note create karo
    const note = await Note.create({
      title,
      content,
      plainText,
      user: req.user.id,
      folder: null,
      tags: [],
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