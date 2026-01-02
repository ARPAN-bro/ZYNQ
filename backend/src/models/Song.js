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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for search
songSchema.index({ title: 'text', artist: 'text', album: 'text' });

// Transform artworkUrl to full URL when sending to client
songSchema.methods.toJSON = function() {
  const obj = this.toObject();
  
  // Convert relative artwork URL to absolute URL
  if (obj.artworkUrl && obj.artworkUrl.startsWith('/uploads/')) {
    // In production, use your actual domain
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    obj.artworkUrl = baseUrl + obj.artworkUrl;
  }
  
  return obj;
};

module.exports = mongoose.model('Song', songSchema);