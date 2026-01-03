// backend/src/controllers/songController.js
const Song = require('../models/Song');
const path = require('path');
const fs = require('fs');

exports.getAllSongs = async (req, res) => {
  try {
    const { search, artist, album } = req.query;
    let query = {};

    if (search) query.$text = { $search: search };
    if (artist) query.artist = new RegExp(artist, 'i');
    if (album) query.album = new RegExp(album, 'i');

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
    console.error('Get song by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch song' });
  }
};

exports.streamSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Increment plays
    song.plays += 1;
    song.save().catch(err => console.error('Error updating plays:', err));

    // Get file path
    const filepath = path.join(__dirname, '../../', song.fileUrl);
    
    console.log('Streaming file:', filepath);

    if (!fs.existsSync(filepath)) {
      console.error('File not found:', filepath);
      return res.status(404).json({ error: 'Audio file not found' });
    }

    const stat = fs.statSync(filepath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filepath, { start, end });

      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'audio/mpeg',
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'audio/mpeg',
      };
      res.writeHead(200, head);
      fs.createReadStream(filepath).pipe(res);
    }
  } catch (error) {
    console.error('Stream song error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to stream song' });
    }
  }
};