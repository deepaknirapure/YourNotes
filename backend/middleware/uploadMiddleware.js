// File upload middleware — multer use karta hai
// Files directly memory mein store hoti hain, disk pe nahi
const multer = require('multer');

// Memory storage use karo — buffer seedha Cloudinary ko jayega
const storage = multer.memoryStorage();

// File type filter — sirf allowed formats ko accept karo
const fileFilter = (_req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // File accept karo
  } else {
    cb(new Error('Only PDF and images (JPG, PNG, WEBP) are allowed'), false);
  }
};

// Multer instance banao
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Max 10 MB
  },
});

module.exports = upload;
