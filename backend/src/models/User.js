// backend/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  songs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  }],
  coverImage: {
    type: String,
    default: 'https://via.placeholder.com/300x300/1DB954/ffffff?text=Playlist'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  donations: [{
    amount: Number,
    orderId: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  totalDonated: {
    type: Number,
    default: 0
  },
  playlists: [playlistSchema],
  playHistory: [{
    songId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Song'
    },
    playedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likedSongs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Add song to play history (keep last 30)
userSchema.methods.addToPlayHistory = function(songId) {
  // Remove if already exists
  this.playHistory = this.playHistory.filter(
    item => item.songId.toString() !== songId.toString()
  );
  
  // Add to beginning
  this.playHistory.unshift({ songId, playedAt: new Date() });
  
  // Keep only last 30
  if (this.playHistory.length > 30) {
    this.playHistory = this.playHistory.slice(0, 30);
  }
};

// Don't return password in JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);