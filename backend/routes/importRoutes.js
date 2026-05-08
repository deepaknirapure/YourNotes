const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { importNote } = require('../controllers/importController');

// Import ke liye alag multer — txt, md, pdf, docx accept karo
const storage = multer.memoryStorage();
const importUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'text/plain',
      'text/markdown',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    const ext = file.originalname.match(/\.(txt|md|pdf|docx|doc)$/i);
    if (allowed.includes(file.mimetype) || ext) {
      cb(null, true);
    } else {
      cb(new Error('Only TXT, MD, PDF, DOCX files are allowed'), false);
    }
  },
});

router.post('/', protect, importUpload.single('importFile'), importNote);

module.exports = router;