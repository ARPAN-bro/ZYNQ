// backend/src/routes/songs.js
const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');
const auth = require('../middleware/auth');

router.get('/', songController.getAllSongs);
router.get('/:id', songController.getSongById);
router.get('/:id/stream', auth, songController.streamSong);

module.exports = router;