const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { importNote } = require('../controllers/importController');

const storage = multer.memoryStorage();

const importUpload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB (images can be bigger)
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'text/plain',
      'text/markdown',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];
    const ext = file.originalname.match(/\.(txt|md|pdf|docx|doc|jpg|jpeg|png|webp)$/i);
    if (allowed.includes(file.mimetype) || ext) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Use PDF, DOCX, TXT, MD, JPG, or PNG.'), false);
    }
  },
});

router.post('/', protect, importUpload.single('importFile'), importNote);

module.exports = router;
