const multer = require("multer");

// Use memory storage — file buffer goes directly to Cloudinary (no disk write)
const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const allowed = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Sirf PDF aur images (JPG, PNG, WEBP) allowed hain"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max
  },
});

module.exports = upload;
