// Folder routes — folders ke CRUD endpoints
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getFolders,
  createFolder,
  updateFolder,
  deleteFolder,
} = require('../controllers/folderController');

// Saare routes protected hain — login zaroori hai
router.use(protect);

router.get('/',      getFolders);
router.post('/',     createFolder);
router.put('/:id',   updateFolder);
router.delete('/:id', deleteFolder);

module.exports = router;
