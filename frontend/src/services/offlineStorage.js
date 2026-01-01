// frontend/src/services/offlineStorage.js
import localforage from 'localforage';
import { DB_NAME, STORE_NAME } from '../utils/constants';

class OfflineStorage {
  constructor() {
    this.store = localforage.createInstance({
      name: DB_NAME,
      storeName: STORE_NAME
    });
  }

  async saveSong(songId, songData) {
    try {
      await this.store.setItem(songId, {
        ...songData,
        downloadedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error saving song:', error);
      return false;
    }
  }

  async getSong(songId) {
    try {
      return await this.store.getItem(songId);
    } catch (error) {
      console.error('Error getting song:', error);
      return null;
    }
  }

  async removeSong(songId) {
    try {
      await this.store.removeItem(songId);
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
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }
}

export default new OfflineStorage();