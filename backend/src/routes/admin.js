// backend/src/routes/admin.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 20 * 1024 * 1024 // 20MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/mp3'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only MP3 files are allowed'));
    }
  }
});

// All admin routes require authentication and admin privileges
router.use(auth, admin);

// New endpoint for metadata extraction
router.post('/extract-metadata', upload.single('audio'), adminController.extractMetadata);

router.post('/songs', upload.single('audio'), adminController.uploadSong);
router.delete('/songs/:id', adminController.deleteSong);
router.put('/songs/:id', adminController.updateSong);
router.get('/stats', adminController.getStats);

module.exports = router;