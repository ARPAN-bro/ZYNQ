// backend/src/controllers/adminController.js
const Song = require('../models/Song');
const path = require('path');
const fs = require('fs');
const musicMetadata = require('music-metadata');

exports.uploadSong = async (req, res) => {
  try {
    const { title, artist, album, duration } = req.body;
    const file = req.file;

    if (!title || !artist || !file) {
      return res.status(400).json({
        error: 'Title, artist, and audio file are required'
      });
    }

    console.log('Uploading song:', title, 'by', artist);

    // Create song document first to get ID
    const song = new Song({
      title,
      artist,
      album: album || 'Unknown Album',
      duration: Number(duration) || 0,
      fileUrl: 'temp',
      uploadedBy: req.userId
    });

    await song.save();

    // Save file to uploads folder
    const filename = `${song._id}.mp3`;
    const uploadDir = path.join(__dirname, '../../uploads');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);
    await fs.promises.writeFile(filepath, file.buffer);

    console.log('File saved to:', filepath);

    // Extract metadata and album art
    let extractedDuration = 0;
    let artworkUrl = 'https://via.placeholder.com/300x300.png?text=No+Artwork';

    try {
      const metadata = await musicMetadata.parseBuffer(file.buffer, {
        mimeType: 'audio/mpeg'
      });

      // Get duration
      if (metadata.format.duration) {
        extractedDuration = Math.floor(metadata.format.duration);
      }

      // Extract album art
      if (metadata.common.picture && metadata.common.picture.length > 0) {
        const picture = metadata.common.picture[0];
        const artFilename = `${song._id}_art.${picture.format.split('/')[1] || 'jpg'}`;
        const artPath = path.join(uploadDir, artFilename);
        
        await fs.promises.writeFile(artPath, picture.data);
        artworkUrl = `/uploads/${artFilename}`;
        
        console.log('Album art extracted:', artPath);
      }
    } catch (metadataError) {
      console.error('Error extracting metadata:', metadataError);
      // Continue without metadata
    }

    // Update song with file info
    song.fileUrl = `/uploads/${filename}`;
    song.duration = duration || extractedDuration;
    song.artworkUrl = artworkUrl;
    await song.save();

    console.log('Song uploaded successfully:', song._id);

    res.status(201).json({
      message: 'Song uploaded successfully',
      song
    });
  } catch (error) {
    console.error('Upload song error:', error);
    res.status(500).json({ error: 'Failed to upload song' });
  }
};

exports.deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Delete audio file
    const filepath = path.join(__dirname, '../../', song.fileUrl);
    if (fs.existsSync(filepath)) {
      await fs.promises.unlink(filepath);
      console.log('Deleted audio file:', filepath);
    }

    // Delete artwork file if exists
    if (song.artworkUrl && song.artworkUrl.startsWith('/uploads/')) {
      const artPath = path.join(__dirname, '../../', song.artworkUrl);
      if (fs.existsSync(artPath)) {
        await fs.promises.unlink(artPath);
        console.log('Deleted artwork:', artPath);
      }
    }

    // Delete from database
    await song.deleteOne();

    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Delete song error:', error);
    res.status(500).json({ error: 'Failed to delete song' });
  }
};

exports.updateSong = async (req, res) => {
  try {
    const { title, artist, album, artworkUrl } = req.body;
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    if (title) song.title = title;
    if (artist) song.artist = artist;
    if (album) song.album = album;
    if (artworkUrl) song.artworkUrl = artworkUrl;

    await song.save();

    res.json({
      message: 'Song updated successfully',
      song
    });
  } catch (error) {
    console.error('Update song error:', error);
    res.status(500).json({ error: 'Failed to update song' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalSongs = await Song.countDocuments();

    const totalPlays = await Song.aggregate([
      { $group: { _id: null, total: { $sum: '$plays' } } }
    ]);

    const totalDownloads = await Song.aggregate([
      { $group: { _id: null, total: { $sum: '$downloads' } } }
    ]);

    const topSongs = await Song.find()
      .sort({ plays: -1 })
      .limit(10)
      .select('title artist plays');

    res.json({
      stats: {
        totalSongs,
        totalPlays: totalPlays[0]?.total || 0,
        totalDownloads: totalDownloads[0]?.total || 0
      },
      topSongs
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};