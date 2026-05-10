'use strict';

const Note        = require('../models/Note');
const cloudinary  = require('cloudinary').v2;
const streamifier = require('streamifier');
const path        = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

let mammoth  = null;
try { mammoth = require('mammoth'); } catch (e) { console.warn('mammoth not available'); }

let Tesseract = null;
try { Tesseract = require('tesseract.js'); } catch (e) { console.warn('tesseract.js not available'); }

// ─── Cloudinary upload ────────────────────────────────────────────────────────
const uploadToCloudinary = (buffer, resourceType = 'raw', folder = 'yournotes/imports', opts = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType, ...opts },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── PDF: extract text preserving real line structure via pdfjs-dist ──────────
async function extractPdfLines(buffer) {
  try {
    // Dynamic import so CJS backend can use ESM pdfjs-dist
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const workerPath = path.resolve(
      __dirname, '../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs'
    );
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'file://' + workerPath;

    const uint8 = new Uint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({ data: uint8, disableFontFace: true, verbosity: 0 });
    const pdfDoc = await loadingTask.promise;

    const allLines = [];

    for (let pageNum = 1; pageNum <= Math.min(pdfDoc.numPages, 300); pageNum++) {
      const page    = await pdfDoc.getPage(pageNum);
      const content = await page.getTextContent();

      // Group text items by Y position (rounded to 2pt grid to merge sub-pixel items on same visual line)
      const lineMap = new Map();
      for (const item of content.items) {
        const str = item.str;
        if (!str) continue;
        const y = Math.round(item.transform[5] / 2) * 2;
        if (!lineMap.has(y)) lineMap.set(y, []);
        lineMap.get(y).push({ x: item.transform[4], text: str });
      }

      // Sort lines top→bottom (higher Y = higher on page in PDF coordinate space)
      const sortedYs = [...lineMap.keys()].sort((a, b) => b - a);

      for (const y of sortedYs) {
        const items   = lineMap.get(y).sort((a, b) => a.x - b.x);
        const lineText = items.map(i => i.text).join('').replace(/[ \t]+/g, ' ').trim();
        if (lineText) allLines.push(lineText);
      }
      // Blank line between pages
      if (pageNum < pdfDoc.numPages) allLines.push('');
    }

    return allLines;
  } catch (err) {
    console.error('pdfjs extraction failed, falling back to pdf-parse:', err.message);
    // Fallback to pdf-parse (less structure but always works)
    const pdfParse = require('pdf-parse');
    const parsed   = await pdfParse(buffer, { max: 0 });
    return (parsed.text || '').split('\n');
  }
}

// ─── Convert extracted lines → structured HTML ─────────────────────────────────
function linesToHtml(lines) {
  const html = [];
  let inOl = false, inUl = false;

  const closeList = () => {
    if (inOl) { html.push('</ol>'); inOl = false; }
    if (inUl) { html.push('</ul>'); inUl = false; }
  };

  // Patterns
  const reChapter  = /^(chapter\s+[ivxlcdm\d]+[a-z]?)\b/i;
  const reAllCaps  = /^[A-Z][A-Z\s\-,&().]{5,}$/;
  const reNumbered = /^(\d+[A-Z]?\.)\s+\S/;   // "1. Title"  "7A. Something"
  const reLetter   = /^[a-z]\)\s+\S/;          // "a) text"

  for (const raw of lines) {
    const trimmed = raw.trim();

    if (!trimmed) {
      closeList();
      html.push('<p style="margin:8px 0;">&nbsp;</p>');
      continue;
    }

    // CHAPTER heading
    if (reChapter.test(trimmed)) {
      closeList();
      html.push(
        '<h2 style="margin:28px 0 8px;font-size:15px;font-weight:900;letter-spacing:0.4px;' +
        'text-transform:uppercase;color:var(--accent,#f97316);border-bottom:2px solid var(--accent,#f97316);' +
        'padding-bottom:6px;">' + escHtml(trimmed) + '</h2>'
      );
      continue;
    }

    // All-caps sub-heading (e.g. "ARRANGEMENT OF SECTIONS", "PRELIMINARY")
    if (reAllCaps.test(trimmed) && trimmed.length < 80) {
      closeList();
      html.push(
        '<h3 style="margin:20px 0 5px;font-size:13px;font-weight:800;color:var(--text,#fff);' +
        'letter-spacing:0.2px;">' + escHtml(trimmed) + '</h3>'
      );
      continue;
    }

    // Numbered list item — "1.", "7A.", "31A."
    if (reNumbered.test(trimmed)) {
      if (inUl) { html.push('</ul>'); inUl = false; }
      if (!inOl) { html.push('<ol style="margin:8px 0 8px 22px;padding:0;color:var(--text,#fff);">'); inOl = true; }
      html.push('<li style="margin:4px 0;font-size:13px;line-height:1.75;">' + escHtml(trimmed) + '</li>');
      continue;
    }

    // Lettered sub-item — "a) text"
    if (reLetter.test(trimmed)) {
      if (inOl) { html.push('</ol>'); inOl = false; }
      if (!inUl) { html.push('<ul style="margin:4px 0 4px 36px;padding:0;list-style:disc;color:var(--text-muted,#aaa);">'); inUl = true; }
      html.push('<li style="margin:3px 0;font-size:13px;line-height:1.65;">' + escHtml(trimmed) + '</li>');
      continue;
    }

    // Normal paragraph
    closeList();
    html.push('<p style="margin:5px 0;font-size:13px;line-height:1.8;color:var(--text,#fff);">' + escHtml(trimmed) + '</p>');
  }

  closeList();
  return html.join('\n');
}

// ─── Main controller ──────────────────────────────────────────────────────────
exports.importNote = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { originalname, mimetype, buffer } = req.file;
    const rawTitle = originalname.replace(/\.(txt|md|pdf|docx|doc|jpg|jpeg|png|webp)$/i, '').trim();
    const title    = rawTitle || 'Imported Note';

    let plainText = '';
    let content   = '';

    const isTxt   = mimetype === 'text/plain' || mimetype === 'text/markdown' || /\.(txt|md)$/i.test(originalname);
    const isPdf   = mimetype === 'application/pdf' || /\.pdf$/i.test(originalname);
    const isDocx  = /wordprocessingml|msword/i.test(mimetype) || /\.docx?$/i.test(originalname);
    const isImage = /^image\/(jpeg|jpg|png|webp)$/i.test(mimetype) || /\.(jpg|jpeg|png|webp)$/i.test(originalname);

    // ── PDF ───────────────────────────────────────────────────────────────────
    if (isPdf) {
      let pdfUrl = null;
      try {
        const uploadResult = await uploadToCloudinary(buffer, 'raw', 'yournotes/imports');
        pdfUrl = uploadResult.secure_url;
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr.message);
        return res.status(500).json({ message: 'Could not upload PDF. Check Cloudinary config.' });
      }

      let structuredHtml = '';
      try {
        const lines    = await extractPdfLines(buffer);
        plainText      = lines.join('\n').replace(/[ \t]+/g, ' ').trim();
        structuredHtml = linesToHtml(lines);
      } catch (_) {
        plainText      = 'PDF imported: ' + title;
        structuredHtml = '<p style="color:#888;">Could not extract text from this PDF.</p>';
      }

      content =
        '<div style="display:flex;align-items:center;gap:10px;padding:12px 16px;' +
        'background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.2);' +
        'border-radius:10px;margin-bottom:20px;">' +
        '<span style="font-size:22px;">📄</span>' +
        '<div><div style="font-weight:800;color:var(--text,#fff);font-size:14px;">' + escHtml(title) + '.pdf</div>' +
        '<div style="font-size:12px;color:#888;margin-top:2px;">PDF Document • Imported</div></div>' +
        '<a href="' + escHtml(pdfUrl) + '" target="_blank" rel="noopener noreferrer" ' +
        'style="margin-left:auto;font-size:12px;color:var(--accent,#f97316);font-weight:700;text-decoration:none;">Open PDF ↗</a>' +
        '</div>' +
        '<div style="font-family:inherit;">' + structuredHtml + '</div>';
    }

    // ── DOCX ─────────────────────────────────────────────────────────────────
    else if (isDocx) {
      if (!mammoth) return res.status(500).json({ message: 'DOCX parsing unavailable. Run: npm install mammoth' });
      let result;
      try { result = await mammoth.convertToHtml({ buffer }); }
      catch (e) { return res.status(422).json({ message: 'Could not read DOCX: ' + e.message }); }

      const docxHtml = result.value || '';
      plainText = docxHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (!docxHtml.trim()) return res.status(422).json({ message: 'DOCX appears empty.' });

      content =
        '<div style="display:flex;align-items:center;gap:10px;padding:12px 16px;' +
        'background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.2);' +
        'border-radius:10px;margin-bottom:16px;">' +
        '<span style="font-size:22px;">📝</span><div>' +
        '<div style="font-weight:800;color:var(--text,#fff);font-size:14px;">' + escHtml(title) + '.docx</div>' +
        '<div style="font-size:12px;color:#888;margin-top:2px;">Word Document • Imported</div>' +
        '</div></div>' +
        '<div style="line-height:1.75;color:var(--text,#fff);">' + docxHtml + '</div>';
    }

    // ── TXT / MD ─────────────────────────────────────────────────────────────
    else if (isTxt) {
      plainText = buffer.toString('utf-8');
      const htmlLines = plainText.split('\n').map(line => {
        const t = line.trim();
        if (!t) return '<p><br></p>';
        if (t.startsWith('### ')) return '<h3>' + escHtml(t.slice(4)) + '</h3>';
        if (t.startsWith('## '))  return '<h2>' + escHtml(t.slice(3)) + '</h2>';
        if (t.startsWith('# '))   return '<h1>' + escHtml(t.slice(2)) + '</h1>';
        if (t.startsWith('**') && t.endsWith('**')) return '<p><strong>' + escHtml(t.slice(2,-2)) + '</strong></p>';
        if (t.startsWith('- ') || t.startsWith('* ')) return '<li>' + escHtml(t.slice(2)) + '</li>';
        return '<p>' + escHtml(t) + '</p>';
      }).join('');
      const ext = /\.md$/i.test(originalname) ? 'MD' : 'TXT';
      content =
        '<div style="display:flex;align-items:center;gap:10px;padding:12px 16px;' +
        'background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);' +
        'border-radius:10px;margin-bottom:16px;">' +
        '<span style="font-size:22px;">📋</span><div>' +
        '<div style="font-weight:800;color:var(--text,#fff);font-size:14px;">' + escHtml(originalname) + '</div>' +
        '<div style="font-size:12px;color:#888;margin-top:2px;">' + ext + ' File • Imported</div>' +
        '</div></div>' + htmlLines;
    }

    // ── IMAGE ─────────────────────────────────────────────────────────────────
    else if (isImage) {
      let imageUrl = null;
      try {
        const uploadResult = await uploadToCloudinary(buffer, 'image', 'yournotes/imports', {
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        });
        imageUrl = uploadResult.secure_url;
      } catch (_) {
        return res.status(500).json({ message: 'Could not upload image. Check Cloudinary config.' });
      }

      let ocrText = '';
      if (Tesseract) {
        try {
          const { data: { text } } = await Tesseract.recognize(buffer, 'eng', { logger: () => {} });
          ocrText = (text || '').replace(/\s+/g, ' ').trim();
        } catch (_) {}
      }

      plainText = ocrText || 'Image imported: ' + title;
      const ext = (originalname.match(/\.(jpg|jpeg|png|webp)$/i) || [])[1]?.toUpperCase() || 'IMAGE';
      content =
        '<div style="display:flex;align-items:center;gap:10px;padding:12px 16px;' +
        'background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.2);' +
        'border-radius:10px;margin-bottom:16px;">' +
        '<span style="font-size:22px;">🖼️</span><div>' +
        '<div style="font-weight:800;color:var(--text,#fff);font-size:14px;">' + escHtml(originalname) + '</div>' +
        '<div style="font-size:12px;color:#888;margin-top:2px;">' + ext + ' Image • Imported</div>' +
        '</div>' +
        '<a href="' + escHtml(imageUrl) + '" target="_blank" rel="noopener noreferrer" ' +
        'style="margin-left:auto;font-size:12px;color:var(--accent,#f97316);font-weight:700;text-decoration:none;">Full Size ↗</a>' +
        '</div>' +
        '<div style="text-align:center;margin-bottom:16px;">' +
        '<img src="' + escHtml(imageUrl) + '" alt="' + escHtml(title) + '" ' +
        'style="max-width:100%;max-height:70vh;border-radius:10px;border:1px solid var(--border,#333);object-fit:contain;" /></div>' +
        (ocrText
          ? '<div style="margin-top:16px;padding:16px;background:var(--bg,#111);border:1px solid var(--border,#333);border-radius:10px;">' +
            '<h3 style="font-size:13px;font-weight:800;color:var(--text,#fff);margin:0 0 10px 0;">🔍 Extracted Text (OCR)</h3>' +
            '<p style="font-size:13px;color:var(--text-muted,#888);line-height:1.7;white-space:pre-wrap;">' + escHtml(ocrText) + '</p></div>'
          : '<p style="font-size:13px;color:#888;text-align:center;font-style:italic;">No text detected in image</p>');
    }

    else {
      return res.status(400).json({ message: 'Unsupported file. Use PDF, DOCX, TXT, MD, JPG, or PNG.' });
    }

    const MAX = 200000;
    if (content.length > MAX)  { content   = content.slice(0, MAX)   + '<p><em>[Content truncated]</em></p>'; }
    if (plainText.length > MAX) { plainText = plainText.slice(0, MAX); }

    const note = await Note.create({
      title, content, plainText,
      user: req.user.id, folder: null, tags: [], isPublic: false,
    });

    res.status(201).json({ message: '"' + title + '" imported successfully!', note });

  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ message: error.message || 'Import failed. Please try again.' });
  }
};