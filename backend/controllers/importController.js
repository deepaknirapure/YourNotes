const Note = require('../models/Note');

// Top-level require — production mein runtime error avoid karo
let pdfParse = null;
let mammoth  = null;

try {
  const pdfParseModule = require('pdf-parse');
  // pdf-parse v2.x exports { PDFParse, ... } (object), v1.x exports a function directly
  if (typeof pdfParseModule === 'function') {
    pdfParse = pdfParseModule;
  } else if (pdfParseModule && typeof pdfParseModule.PDFParse === 'function') {
    // v2.x: wrap PDFParse class into a function compatible with v1 API
    const PDFParse = pdfParseModule.PDFParse;
    pdfParse = async (buffer, options) => {
      const parser = new PDFParse();
      return parser.parse(buffer, options);
    };
  }
} catch (e) { console.warn('pdf-parse not available:', e.message); }
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

      // Double newlines = paragraph break; single = space
      content = plainText
        .split(/\n{2,}/)
        .map(para => {
          const p = para.replace(/\n/g, ' ').trim();
          if (!p) return '';
          return `<p>${escHtml(p)}</p>`;
        })
        .filter(Boolean)
        .join('');
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
phspdhfphpdhblbsbpbsdpbpcbppppbpcbsbcpbbpbpbdpbpsbpvdbbspbdjpbpsodbcbabscdboqbfba'ob'obdfob'sdbclbosbeehpihpwhbbbjbojwgffowbbobb'aAjdpwpffonnblvbldbowe. wbouhfaxb,zcbz/lznclnlehjaht is your namew is nd what h]you tell me 