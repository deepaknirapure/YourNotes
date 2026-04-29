const multer = require('multer');

/**
 * Hindi Comment:
 * Ye middleware files (PDFs/Images) handle karta hai.
 * Hum memoryStorage use kar rahe hain taaki file temporary RAM mein rahe 
 * aur wahan se seedha Cloudinary pe chali jaye. Disk pe kachra jama nahi hoga.
 */

// Memory storage setup
const storage = multer.memoryStorage();

// File filter logic
const fileFilter = (req, file, cb) => {
  const allowedMimetypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ];

  if (allowedMimetypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Hindi: Agar format galat hai toh error message bhej do
    cb(new Error('Invalid file type. Only PDFs and Images (JPG, PNG, WEBP) are allowed!'), false);
  }
};

// Multer Instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    // Hindi: 10MB limit (Students ki badi files ke liye kafi hai)
    fileSize: 10 * 1024 * 1024, 
  },
});

module.exports = upload;