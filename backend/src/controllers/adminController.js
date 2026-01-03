// backend/src/controllers/adminController.js
const Song = require('../models/Song');
const path = require('path');
const fs = require('fs');
const musicMetadata = require('music-metadata');

// Extract metadata endpoint
exports.extractMetadata = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    console.log('Extracting metadata from file...');

    let metadata = {
      title: '',
      artists: '',
      album: '',
      duration: 0,
      year: ''
    };

    try {
      const parsed = await musicMetadata.parseBuffer(file.buffer, {
        mimeType: 'audio/mpeg'
      });

      console.log('Raw metadata:', parsed.common);

      // Extract title
      if (parsed.common.title) {
        metadata.title = parsed.common.title;
      }

      // Extract artists (can be multiple)
      if (parsed.common.artists && parsed.common.artists.length > 0) {
        metadata.artists = parsed.common.artists.join(', ');
      } else if (parsed.common.artist) {
        metadata.artists = parsed.common.artist;
      }

      // Extract album
      if (parsed.common.album) {
        metadata.album = parsed.common.album;
      }

      // Extract duration
      if (parsed.format.duration) {
        metadata.duration = Math.floor(parsed.format.duration);
      }

      // Extract year
      if (parsed.common.year) {
        metadata.year = parsed.common.year.toString();
      } else if (parsed.common.date) {
        // Try to extract year from date string
        const yearMatch = parsed.common.date.match(/\d{4}/);
        if (yearMatch) {
          metadata.year = yearMatch[0];
        }
      }

      console.log('Extracted metadata:', metadata);

      res.json({
        success: true,
        metadata
      });
    } catch (metadataError) {
      console.error('Metadata parsing error:', metadataError);
      res.json({
        success: false,
        metadata: {
          title: '',
          artists: '',
          album: '',
          duration: 0,
          year: ''
        },
        message: 'Could not extract metadata from file'
      });
    }
  } catch (error) {
    console.error('Extract metadata error:', error);
    res.status(500).json({ error: 'Failed to extract metadata' });
  }
};

exports.uploadSong = async (req, res) => {
  try {
    const { title, artists, album, duration, year } = req.body;
    const file = req.file;

    if (!title || !artists || !file) {
      return res.status(400).json({
        error: 'Title, artist(s), and audio file are required'
      });
    }

    console.log('Uploading song:', title, 'by', artists);

    // Parse artists string into array
    const artistsArray = artists.split(',').map(a => a.trim()).filter(a => a.length > 0);
    const primaryArtist = artistsArray[0]; // First artist is primary

    // Create song document first to get ID
    const song = new Song({
      title,
      artist: primaryArtist, // Keep for backward compatibility
      artists: artistsArray, // Store all artists
      album: album || 'Unknown Album',
      duration: Number(duration) || 0,
      year: year ? Number(year) : undefined,
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

      // Get duration if not provided
      if (!duration && metadata.format.duration) {
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
    const { title, artists, album, artworkUrl, year } = req.body;
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    if (title) song.title = title;
    if (album) song.album = album;
    if (artworkUrl) song.artworkUrl = artworkUrl;
    if (year) song.year = Number(year);
    
    if (artists) {
      const artistsArray = artists.split(',').map(a => a.trim()).filter(a => a.length > 0);
      song.artist = artistsArray[0]; // Update primary artist
      song.artists = artistsArray; // Update all artists
    }

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
      .select('title artist artists plays');

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