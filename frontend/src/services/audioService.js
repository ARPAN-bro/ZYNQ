// frontend/src/services/audioService.js
import { API_URL } from '../utils/constants';

class AudioService {
  async playSong(songId) {
    try {
      console.log('🎵 AudioService: Playing song', songId);
      
      // Stream from server
      console.log('🌐 Streaming from server');
      return this.streamSong(songId);
    } catch (error) {
      console.error('❌ Error playing song:', error);
      throw error;
    }
  }

  streamSong(songId) {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('❌ No authentication token found');
      throw new Error('Not authenticated');
    }
    
    // Create URL with token as query parameter
    const streamUrl = `${API_URL}/songs/${songId}/stream`;
    console.log('🔗 Stream URL:', streamUrl);
    console.log('🔑 Token:', token.substring(0, 20) + '...');
    
    // Return URL that will include auth header via fetch in PlayerContext
    return streamUrl;
  }
}

export default new AudioService();