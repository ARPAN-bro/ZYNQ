// frontend/src/services/audioService.js
import { songAPI } from './api';
import offlineStorage from './offlineStorage';
import encryptionService from './encryption';

class AudioService {
  constructor() {
    this.audioContext = null;
    this.currentSource = null;
  }

  async playSong(songId) {
    try {
      // Try offline first
      const offlineSong = await offlineStorage.getSong(songId);
      
      if (offlineSong && offlineSong.encryptedData) {
        return await this.playOfflineSong(offlineSong.encryptedData);
      }
      
      // Stream from server
      return await this.streamSong(songId);
    } catch (error) {
      console.error('Error playing song:', error);
      throw error;
    }
  }

  async streamSong(songId) {
    const response = await songAPI.stream(songId);
    const blob = response.data;
    const url = URL.createObjectURL(blob);
    return url;
  }

  async playOfflineSong(encryptedData) {
    try {
      const decrypted = await encryptionService.decrypt(encryptedData);
      const blob = new Blob([decrypted], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      return url;
    } catch (error) {
      console.error('Error playing offline song:', error);
      throw error;
    }
  }

  async downloadSong(songId, songDetails) {
    try {
      const response = await songAPI.download(songId);
      const encryptedData = response.data;
      
      await offlineStorage.saveSong(songId, {
        ...songDetails,
        encryptedData
      });
      
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