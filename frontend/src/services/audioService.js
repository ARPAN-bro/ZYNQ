// frontend/src/services/audioService.js
import { API_URL } from '../utils/constants';
import offlineStorage from './offlineStorage';
import axios from 'axios';

class AudioService {
  async playSong(songId) {
    try {
      console.log('🎵 AudioService: Playing song', songId);
      
      // Try offline first
      const offlineSong = await offlineStorage.getSong(songId);
      
      if (offlineSong && offlineSong.audioData) {
        console.log('📱 Playing from offline storage');
        return this.playOfflineSong(offlineSong.audioData);
      }
      
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

  playOfflineSong(audioData) {
    try {
      console.log('📦 Creating blob from offline data, size:', audioData.byteLength);
      const blob = new Blob([audioData], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      console.log('✅ Offline blob URL created:', url);
      return url;
    } catch (error) {
      console.error('❌ Error playing offline song:', error);
      throw error;
    }
  }

  async downloadSong(songId, songDetails) {
    try {
      console.log('⬇️ Downloading song:', songId);
      
      const token = localStorage.getItem('token');
      const downloadUrl = `${API_URL}/songs/${songId}/download`;
      
      console.log('🔗 Download URL:', downloadUrl);
      
      const response = await axios.get(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'arraybuffer',
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`📥 Download progress: ${percentCompleted}%`);
        }
      });

      console.log('✅ Download complete, size:', response.data.byteLength);
      console.log('💾 Saving to offline storage...');
      
      await offlineStorage.saveSong(songId, {
        ...songDetails,
        audioData: response.data
      });
      
      console.log('✅ Song saved to offline storage');
      return true;
    } catch (error) {
      console.error('❌ Error downloading song:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return false;
    }
  }

  async removeSong(songId) {
    return await offlineStorage.removeSong(songId);
  }

  async isDownloaded(songId) {
    return await offlineStorage.hasSong(songId);
  }
}

export default new AudioService();