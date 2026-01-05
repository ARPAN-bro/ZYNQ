// frontend/src/services/libraryAPI.js
import axios from 'axios';
import { API_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const libraryAPI = {
  // Get complete library
  getLibrary: () => api.get('/library'),
  
  // Playlist management
  createPlaylist: (data) => api.post('/library/playlists', data),
  updatePlaylist: (id, data) => api.put(`/library/playlists/${id}`, data),
  deletePlaylist: (id) => api.delete(`/library/playlists/${id}`),
  addSongToPlaylist: (playlistId, songId) => 
    api.post(`/library/playlists/${playlistId}/songs`, { songId }),
  removeSongFromPlaylist: (playlistId, songId) => 
    api.delete(`/library/playlists/${playlistId}/songs/${songId}`),
  
  // Liked songs
  likeSong: (songId) => api.post(`/library/liked/${songId}`),
  unlikeSong: (songId) => api.delete(`/library/liked/${songId}`),
  
  // Play history
  getPlayHistory: () => api.get('/library/history')
};