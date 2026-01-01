// backend/src/controllers/songController.js
const Song = require('../models/Song');
const fileHandler = require('../utils/fileHandler');
const encryptionService = require('../utils/encryption');

exports.getAllSongs = async (req, res) => {
  try {
    const { search, artist, album } = req.query;
    let query = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (artist) {
      query.artist = new RegExp(artist, 'i');
    }
    if (album) {
      query.album = new RegExp(album, 'i');
    }

    const songs = await Song.find(query)
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 });

    res.json({ songs });
  } catch (error) {
    console.error('Get songs error:', error);
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
};

exports.getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate('uploadedBy', 'username');

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    res.json({ song });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch song' });
  }
};

exports.streamSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Increment play count
    song.plays += 1;
    await song.save();

    // Get encrypted file
    const encryptedBuffer = await fileHandler.getEncryptedFile(song.fileUrl);
    
    // Decrypt
    const decryptedBuffer = encryptionService.decrypt(encryptedBuffer);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', decryptedBuffer.length);
    res.setHeader('Accept-Ranges', 'bytes');
    res.send(decryptedBuffer);
  } catch (error) {
    console.error('Stream song error:', error);
    res.status(500).json({ error: 'Failed to stream song' });
  }
};

exports.downloadSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Increment download count
    song.downloads += 1;
    await song.save();

    // Get encrypted file
    const encryptedBuffer = await fileHandler.getEncryptedFile(song.fileUrl);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${song.title}.enc"`);
    res.send(encryptedBuffer);
  } catch (error) {
    console.error('Download song error:', error);
    res.status(500).json({ error: 'Failed to download song' });
  }
};