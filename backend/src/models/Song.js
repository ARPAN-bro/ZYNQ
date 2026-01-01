// backend/src/models/Song.js
const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    trim: true
  },
  album: {
    type: String,
    trim: true,
    default: 'Unknown Album'
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  fileUrl: {
    type: String,
    required: true
  },
  publicId: {
    type: String // Cloudinary public_id for deletion
  },
  artworkUrl: {
    type: String,
    default: 'https://via.placeholder.com/300x300.png?text=No+Artwork'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plays: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  isEncrypted: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for search
songSchema.index({ title: 'text', artist: 'text', album: 'text' });

module.exports = mongoose.model('Song', songSchema);