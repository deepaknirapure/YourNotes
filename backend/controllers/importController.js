"use strict";

const Note = require("../models/Note");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Optional: text-based parsers
let mammoth = null;
try {
  mammoth = require("mammoth");
} catch (e) {
  console.warn("mammoth not available:", e.message);
}

let Tesseract = null;
try {
  Tesseract = require("tesseract.js");
} catch (e) {
  console.warn("tesseract.js not available — image OCR disabled");
}

// Helper: Buffer → Cloudinary
const uploadToCloudinary = (
  buffer,
  resourceType = "raw",
  folder = "yournotes/imports",
  opts = {},
) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType, ...opts },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * POST /api/import
 * Supported: PDF, DOCX/DOC, TXT/MD, JPG/PNG (with OCR)
 */
exports.importNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { originalname, mimetype, buffer } = req.file;
    const rawTitle = originalname
      .replace(/\.(txt|md|pdf|docx|doc|jpg|jpeg|png|webp)$/i, "")
      .trim();
    const title = rawTitle || "Imported Note";

    let plainText = "";
    let content = "";

    const isTxt =
      mimetype === "text/plain" ||
      mimetype === "text/markdown" ||
      /\.(txt|md)$/i.test(originalname);
    const isPdf =
      mimetype === "application/pdf" || /\.pdf$/i.test(originalname);
    const isDocx =
      mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimetype === "application/msword" ||
      /\.docx?$/i.test(originalname);
    const isImage =
      /^image\/(jpeg|jpg|png|webp)$/i.test(mimetype) ||
      /\.(jpg|jpeg|png|webp)$/i.test(originalname);

    // ── PDF ───────────────────────────────────────────────────────────────────
    if (isPdf) {
      let pdfUrl = null;
      try {
        const uploadResult = await uploadToCloudinary(
          buffer,
          "raw",
          "yournotes/imports",
        );
        pdfUrl = uploadResult.secure_url;
      } catch (uploadErr) {
        console.error("Cloudinary upload error:", uploadErr.message);
        return res.status(500).json({
          message:
            "Could not upload PDF. Please check Cloudinary configuration.",
        });
      }

      try {
        const pdfParse = require("pdf-parse");
        const parsed = await pdfParse(buffer, { max: 0 });
        plainText = (parsed.text || "").replace(/\s+/g, " ").trim();
      } catch (_) {
        plainText = `PDF imported: ${title}`;
      }

      content = `
<div class="imported-file-header" style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.2);border-radius:10px;margin-bottom:16px;">
  <span style="font-size:24px;">📄</span>
  <div>
    <div style="font-weight:800;color:var(--text,#fff);font-size:14px;">${escHtml(title)}.pdf</div>
    <div style="font-size:12px;color:#888;margin-top:2px;">PDF Document • Imported</div>
  </div>
  <a href="${escHtml(pdfUrl)}" target="_blank" rel="noopener noreferrer" style="margin-left:auto;font-size:12px;color:var(--accent,#f97316);font-weight:700;text-decoration:none;">Open ↗</a>
</div>
<div style="width:100%;margin:0 0 16px 0;">
  <iframe src="${escHtml(pdfUrl)}" style="width:100%;height:85vh;min-height:500px;border:none;border-radius:8px;" title="${escHtml(title)}"></iframe>
</div>
${plainText ? `<div class="extracted-text" style="margin-top:16px;padding:16px;background:var(--bg,#111);border:1px solid var(--border,#333);border-radius:10px;"><h3 style="font-size:13px;font-weight:800;color:var(--text,#fff);margin:0 0 10px 0;letter-spacing:-0.3px;">📝 Extracted Text (for AI)</h3><p style="font-size:13px;color:var(--text-muted,#888);line-height:1.7;white-space:pre-wrap;">${escHtml(plainText.slice(0, 3000))}${plainText.length > 3000 ? "…" : ""}</p></div>` : ""}`;
    }

    // ── DOCX ─────────────────────────────────────────────────────────────────
    else if (isDocx) {
      if (!mammoth) {
        return res.status(500).json({
          message:
            "DOCX parsing not available. Run: npm install mammoth in backend.",
        });
      }
      let result;
      try {
        result = await mammoth.convertToHtml({ buffer });
      } catch (docxErr) {
        console.error("mammoth error:", docxErr.message);
        return res
          .status(422)
          .json({ message: `Could not read DOCX: ${docxErr.message}` });
      }
      const docxHtml = result.value || "";
      plainText = docxHtml
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (!docxHtml.trim()) {
        return res
          .status(422)
          .json({ message: "DOCX file appears to be empty." });
      }
      content = `
<div class="imported-file-header" style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.2);border-radius:10px;margin-bottom:16px;">
  <span style="font-size:24px;">📝</span>
  <div>
    <div style="font-weight:800;color:var(--text,#fff);font-size:14px;">${escHtml(title)}.docx</div>
    <div style="font-size:12px;color:#888;margin-top:2px;">Word Document • Imported</div>
  </div>
</div>
<div class="docx-content" style="line-height:1.75;color:var(--text,#fff);">${docxHtml}</div>`;
    }

    // ── TXT / MD ─────────────────────────────────────────────────────────────
    else if (isTxt) {
      plainText = buffer.toString("utf-8");
      const htmlLines = plainText
        .split("\n")
        .map((line) => {
          const t = line.trim();
          if (!t) return "<p><br></p>";
          if (t.startsWith("### ")) return `<h3>${escHtml(t.slice(4))}</h3>`;
          if (t.startsWith("## ")) return `<h2>${escHtml(t.slice(3))}</h2>`;
          if (t.startsWith("# ")) return `<h1>${escHtml(t.slice(2))}</h1>`;
          if (t.startsWith("**") && t.endsWith("**"))
            return `<p><strong>${escHtml(t.slice(2, -2))}</strong></p>`;
          if (t.startsWith("- ") || t.startsWith("* "))
            return `<li>${escHtml(t.slice(2))}</li>`;
          return `<p>${escHtml(t)}</p>`;
        })
        .join("");
      const ext = /\.md$/i.test(originalname) ? "md" : "txt";
      content = `
<div class="imported-file-header" style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);border-radius:10px;margin-bottom:16px;">
  <span style="font-size:24px;">${ext === "md" ? "📋" : "📄"}</span>
  <div>
    <div style="font-weight:800;color:var(--text,#fff);font-size:14px;">${escHtml(originalname)}</div>
    <div style="font-size:12px;color:#888;margin-top:2px;">${ext.toUpperCase()} File • Imported</div>
  </div>
</div>
${htmlLines}`;
    }

    // ── IMAGE (JPG, PNG, WEBP) ────────────────────────────────────────────────
    else if (isImage) {
      let imageUrl = null;
      try {
        const uploadResult = await uploadToCloudinary(
          buffer,
          "image",
          "yournotes/imports",
          {
            transformation: [{ quality: "auto", fetch_format: "auto" }],
          },
        );
        imageUrl = uploadResult.secure_url;
      } catch (uploadErr) {
        console.error("Cloudinary image upload error:", uploadErr.message);
        return res.status(500).json({
          message:
            "Could not upload image. Please check Cloudinary configuration.",
        });
      }

      // OCR: extract text from image if tesseract is available
      let ocrText = "";
      if (Tesseract) {
        try {
          const {
            data: { text },
          } = await Tesseract.recognize(buffer, "eng", { logger: () => {} });
          ocrText = (text || "").replace(/\s+/g, " ").trim();
        } catch (ocrErr) {
          console.warn("OCR failed:", ocrErr.message);
        }
      }

      plainText = ocrText || `Image imported: ${title}`;
      const ext =
        originalname.match(/\.(jpg|jpeg|png|webp)$/i)?.[1]?.toUpperCase() ||
        "IMAGE";
      content = `
<div class="imported-file-header" style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.2);border-radius:10px;margin-bottom:16px;">
  <span style="font-size:24px;">🖼️</span>
  <div>
    <div style="font-weight:800;color:var(--text,#fff);font-size:14px;">${escHtml(originalname)}</div>
    <div style="font-size:12px;color:#888;margin-top:2px;">${ext} Image • Imported</div>
  </div>
  <a href="${escHtml(imageUrl)}" target="_blank" rel="noopener noreferrer" style="margin-left:auto;font-size:12px;color:var(--accent,#f97316);font-weight:700;text-decoration:none;">Full Size ↗</a>
</div>
<div style="text-align:center;margin-bottom:16px;">
  <img src="${escHtml(imageUrl)}" alt="${escHtml(title)}" style="max-width:100%;max-height:70vh;border-radius:10px;border:1px solid var(--border,#333);object-fit:contain;" />
</div>
${ocrText ? `<div class="extracted-text" style="margin-top:16px;padding:16px;background:var(--bg,#111);border:1px solid var(--border,#333);border-radius:10px;"><h3 style="font-size:13px;font-weight:800;color:var(--text,#fff);margin:0 0 10px 0;letter-spacing:-0.3px;">🔍 Extracted Text (OCR)</h3><p style="font-size:13px;color:var(--text-muted,#888);line-height:1.7;white-space:pre-wrap;">${escHtml(ocrText)}</p></div>` : '<p style="font-size:13px;color:#888;text-align:center;margin-top:8px;font-style:italic;">No text detected in image</p>'}`;
    } else {
      return res.status(400).json({
        message:
          "Unsupported file type. Supported: PDF, DOCX, DOC, TXT, MD, JPG, PNG, WEBP.",
      });
    }

    const MAX = 200000;
    if (content.length > MAX) {
      content = content.slice(0, MAX) + "<p><em>[Content truncated]</em></p>";
      plainText = plainText.slice(0, MAX);
    }

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
    console.error("Import error:", error);
    res
      .status(500)
      .json({ message: error.message || "Import failed. Please try again." });
  }
};
