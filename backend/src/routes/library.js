// backend/src/routes/library.js
const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/libraryController');
const auth = require('../middleware/auth');

// Get user's complete library
router.get('/', auth, libraryController.getLibrary);

// Playlist management
router.post('/playlists', auth, libraryController.createPlaylist);
router.put('/playlists/:id', auth, libraryController.updatePlaylist);
router.delete('/playlists/:id', auth, libraryController.deletePlaylist);
router.post('/playlists/:id/songs', auth, libraryController.addSongToPlaylist);
router.delete('/playlists/:id/songs/:songId', auth, libraryController.removeSongFromPlaylist);

// Liked songs
router.post('/liked/:songId', auth, libraryController.likeSong);
router.delete('/liked/:songId', auth, libraryController.unlikeSong);

// Play history
router.get('/history', auth, libraryController.getPlayHistory);

module.exports = router;