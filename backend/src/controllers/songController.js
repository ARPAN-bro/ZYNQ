// backend/src/controllers/songController.js
const Song = require('../models/Song');
const fileHandler = require('../utils/fileHandler');

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
  } catch {
    res.status(500).json({ error: 'Failed to fetch song' });
  }
};

exports.streamSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // increment plays (fire-and-forget style)
    song.plays += 1;
    song.save();

    /**
     * fileHandler must return:
     * {
     *   size: number,
     *   stream: ReadableStream
     * }
     */
    const { size, stream } = await fileHandler.getRawStream(
      song.fileUrl,
      req.headers.range
    );

    const range = req.headers.range;

    if (range) {
      res.status(206);
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Length', size);

    stream.pipe(res);
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

    song.downloads += 1;
    song.save();

    // RAW file download (simple version)
    const stream = await fileHandler.getRawDownloadStream(song.fileUrl);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${song.title}.mp3"`
    );

    stream.pipe(res);
  } catch (error) {
    console.error('Download song error:', error);
    res.status(500).json({ error: 'Failed to download song' });
  }
};
