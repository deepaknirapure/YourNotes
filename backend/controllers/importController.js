'use strict';

const Note        = require('../models/Note');
const cloudinary  = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Optional: text-based parsers
let mammoth = null;
try { mammoth = require('mammoth'); } catch (e) { console.warn('mammoth not available:', e.message); }

// Helper: Buffer → Cloudinary
const uploadToCloudinary = (buffer, resourceType = 'raw', folder = 'yournotes/imports') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

/**
 * POST /api/import
 * PDF → Cloudinary upload → iframe embed (exact original view)
 * DOCX → mammoth HTML conversion
 * TXT/MD → plain text with markdown-to-HTML
 */
exports.importNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { originalname, mimetype, buffer } = req.file;
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

    // ── PDF: Upload as-is to Cloudinary, embed as iframe ─────────────────────
    if (isPdf) {
      let pdfUrl = null;

      try {
        const uploadResult = await uploadToCloudinary(buffer, 'raw', 'yournotes/imports');
        pdfUrl = uploadResult.secure_url;
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr.message);
        return res.status(500).json({
          message: 'Could not upload PDF. Please check Cloudinary configuration.',
        });
      }

      // Extract plain text for AI features (best-effort)
      try {
        const pdfParse = require('pdf-parse');
        const parsed   = await pdfParse(buffer, { max: 0 });
        plainText      = (parsed.text || '').replace(/\s+/g, ' ').trim();
      } catch (_) {
        plainText = `PDF imported: ${title}`;
      }

      // Embed PDF exactly as-is via iframe
      content = `<div style="width:100%;margin:0 0 16px 0;"><iframe src="${escHtml(pdfUrl)}" style="width:100%;height:85vh;min-height:500px;border:none;border-radius:8px;" title="${escHtml(title)}"></iframe></div><p style="font-size:13px;color:#888;"><a href="${escHtml(pdfUrl)}" target="_blank" rel="noopener noreferrer">🔗 Open PDF in new tab</a></p>`;
    }

    // ── DOCX ─────────────────────────────────────────────────────────────────
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
        return res.status(422).json({ message: `Could not read DOCX: ${docxErr.message}` });
      }
      content   = result.value || '';
      plainText = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (!content.trim()) {
        return res.status(422).json({ message: 'DOCX file appears to be empty.' });
      }
    }

    // ── TXT / MD ─────────────────────────────────────────────────────────────
    else if (isTxt) {
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

    else {
      return res.status(400).json({
        message: 'Unsupported file type. Please use PDF, DOCX, TXT, or MD.',
      });
    }

    const MAX = 200000;
    if (content.length > MAX) {
      content   = content.slice(0, MAX) + '<p><em>[Content truncated]</em></p>';
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

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}