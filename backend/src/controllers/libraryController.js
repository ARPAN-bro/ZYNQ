// backend/src/controllers/libraryController.js
const User = require('../models/User');
const Song = require('../models/Song');

exports.getLibrary = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Populate playlists with songs
    await user.populate('playlists.songs');
    
    // Get trending songs (most played)
    const trendingSongs = await Song.find()
      .sort({ plays: -1 })
      .limit(20);

    // Get play history songs (last 30)
    const historyIds = user.playHistory
      .slice(0, 30)
      .map(item => item.songId);
    
    const playHistorySongs = await Song.find({
      _id: { $in: historyIds }
    });

    // Get liked songs
    const likedSongs = await Song.find({
      _id: { $in: user.likedSongs }
    });

    res.json({
      playlists: user.playlists,
      likedSongs,
      playHistory: playHistorySongs,
      trending: trendingSongs,
      hasPlaylists: user.playlists.length > 0,
      hasHistory: user.playHistory.length > 0
    });
  } catch (error) {
    console.error('Get library error:', error);
    res.status(500).json({ error: 'Failed to fetch library' });
  }
};

exports.createPlaylist = async (req, res) => {
  try {
    const { name, description, coverImage } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Playlist name is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newPlaylist = {
      name,
      description: description || '',
      coverImage: coverImage || 'https://via.placeholder.com/300x300/1DB954/ffffff?text=Playlist',
      songs: [],
      isPublic: true
    };

    user.playlists.push(newPlaylist);
    await user.save();

    const createdPlaylist = user.playlists[user.playlists.length - 1];

    res.status(201).json({
      message: 'Playlist created successfully',
      playlist: createdPlaylist
    });
  } catch (error) {
    console.error('Create playlist error:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
};

exports.updatePlaylist = async (req, res) => {
  try {
    const { name, description, coverImage } = req.body;
    const playlistId = req.params.id;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const playlist = user.playlists.id(playlistId);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    if (name) playlist.name = name;
    if (description !== undefined) playlist.description = description;
    if (coverImage) playlist.coverImage = coverImage;

    await user.save();

    res.json({
      message: 'Playlist updated successfully',
      playlist
    });
  } catch (error) {
    console.error('Update playlist error:', error);
    res.status(500).json({ error: 'Failed to update playlist' });
  }
};

exports.deletePlaylist = async (req, res) => {
  try {
    const playlistId = req.params.id;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const playlist = user.playlists.id(playlistId);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    playlist.remove();
    await user.save();

    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    console.error('Delete playlist error:', error);
    res.status(500).json({ error: 'Failed to delete playlist' });
  }
};

exports.addSongToPlaylist = async (req, res) => {
  try {
    const { songId } = req.body;
    const playlistId = req.params.id;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const playlist = user.playlists.id(playlistId);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Check if song already in playlist
    if (playlist.songs.includes(songId)) {
      return res.status(400).json({ error: 'Song already in playlist' });
    }

    playlist.songs.push(songId);
    await user.save();

    res.json({
      message: 'Song added to playlist',
      playlist
    });
  } catch (error) {
    console.error('Add song to playlist error:', error);
    res.status(500).json({ error: 'Failed to add song to playlist' });
  }
};

exports.removeSongFromPlaylist = async (req, res) => {
  try {
    const { id: playlistId, songId } = req.params;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const playlist = user.playlists.id(playlistId);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    playlist.songs = playlist.songs.filter(
      id => id.toString() !== songId
    );

    await user.save();

    res.json({
      message: 'Song removed from playlist',
      playlist
    });
  } catch (error) {
    console.error('Remove song from playlist error:', error);
    res.status(500).json({ error: 'Failed to remove song from playlist' });
  }
};

exports.likeSong = async (req, res) => {
  try {
    const { songId } = req.params;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    if (!user.likedSongs.includes(songId)) {
      user.likedSongs.push(songId);
      await user.save();
    }

    res.json({ message: 'Song liked successfully' });
  } catch (error) {
    console.error('Like song error:', error);
    res.status(500).json({ error: 'Failed to like song' });
  }
};

exports.unlikeSong = async (req, res) => {
  try {
    const { songId } = req.params;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.likedSongs = user.likedSongs.filter(
      id => id.toString() !== songId
    );

    await user.save();

    res.json({ message: 'Song unliked successfully' });
  } catch (error) {
    console.error('Unlike song error:', error);
    res.status(500).json({ error: 'Failed to unlike song' });
  }
};

exports.getPlayHistory = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('playHistory.songId');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const history = user.playHistory
      .filter(item => item.songId)
      .slice(0, 30);

    res.json({ history });
  } catch (error) {
    console.error('Get play history error:', error);
    res.status(500).json({ error: 'Failed to fetch play history' });
  }
};