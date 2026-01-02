// backend/src/controllers/adminController.js
const Song = require('../models/Song');
const fileHandler = require('../utils/fileHandler');

exports.uploadSong = async (req, res) => {
  try {
    const { title, artist, album, duration } = req.body;
    const file = req.file;

    if (!title || !artist || !file) {
      return res.status(400).json({
        error: 'Title, artist, and audio file are required'
      });
    }

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

    // Upload RAW mp3 file (no encryption)
    const uploadResult = await fileHandler.uploadRawFile(
      file,
      song._id.toString()
    );

    // Update song with file URL
    song.fileUrl = uploadResult.url;
    song.publicId = uploadResult.publicId;
    await song.save();

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

    // Delete file from storage
    await fileHandler.deleteFile(song.publicId, song.fileUrl);

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
