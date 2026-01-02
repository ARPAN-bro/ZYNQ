// frontend/src/services/offlineStorage.js
import localforage from 'localforage';
import { DB_NAME, STORE_NAME } from '../utils/constants';

class OfflineStorage {
  constructor() {
    this.store = localforage.createInstance({
      name: DB_NAME,
      storeName: STORE_NAME,
      driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE]
    });
  }

  async saveSong(songId, songData) {
    try {
      await this.store.setItem(songId, {
        ...songData,
        downloadedAt: new Date().toISOString()
      });
      console.log('Song saved to offline storage:', songId);
      return true;
    } catch (error) {
      console.error('Error saving song:', error);
      return false;
    }
  }

  async getSong(songId) {
    try {
      const song = await this.store.getItem(songId);
      return song;
    } catch (error) {
      console.error('Error getting song:', error);
      return null;
    }
  }

  async removeSong(songId) {
    try {
      await this.store.removeItem(songId);
      console.log('Song removed from offline storage:', songId);
      return true;
    } catch (error) {
      console.error('Error removing song:', error);
      return false;
    }
  }

  async getAllSongs() {
    try {
      const songs = [];
      await this.store.iterate((value, key) => {
        songs.push({ id: key, ...value });
      });
      return songs;
    } catch (error) {
      console.error('Error getting all songs:', error);
      return [];
    }
  }

  async hasSong(songId) {
    try {
      const song = await this.store.getItem(songId);
      return !!song;
    } catch (error) {
      return false;
    }
  }

  async clearAll() {
    try {
      await this.store.clear();
      console.log('All offline songs cleared');
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  async getStorageSize() {
    try {
      let totalSize = 0;
      await this.store.iterate((value) => {
        if (value.audioData) {
          totalSize += value.audioData.byteLength || 0;
        }
      });
      return totalSize;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  }
}

export default new OfflineStorage();