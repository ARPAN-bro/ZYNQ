// frontend/src/services/audioService.js
import { API_URL } from '../utils/constants';
import offlineStorage from './offlineStorage';
import axios from 'axios';

class AudioService {
  async playSong(songId) {
    try {
      console.log('Playing song:', songId);
      
      // Try offline first
      const offlineSong = await offlineStorage.getSong(songId);
      
      if (offlineSong && offlineSong.audioData) {
        console.log('Playing from offline storage');
        return this.playOfflineSong(offlineSong.audioData);
      }
      
      // Stream from server
      console.log('Streaming from server');
      return this.streamSong(songId);
    } catch (error) {
      console.error('Error playing song:', error);
      throw error;
    }
  }

  streamSong(songId) {
    const token = localStorage.getItem('token');
    const streamUrl = `${API_URL}/songs/${songId}/stream?token=${token}`;
    console.log('Stream URL:', streamUrl);
    return streamUrl;
  }

  playOfflineSong(audioData) {
    try {
      const blob = new Blob([audioData], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      return url;
    } catch (error) {
      console.error('Error playing offline song:', error);
      throw error;
    }
  }

  async downloadSong(songId, songDetails) {
    try {
      console.log('Downloading song:', songId);
      
      const token = localStorage.getItem('token');
      const downloadUrl = `${API_URL}/songs/${songId}/download`;
      
      const response = await axios.get(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'arraybuffer'
      });

      console.log('Download complete, saving to storage...');
      
      await offlineStorage.saveSong(songId, {
        ...songDetails,
        audioData: response.data
      });
      
      console.log('Song saved to offline storage');
      return true;
    } catch (error) {
      console.error('Error downloading song:', error);
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