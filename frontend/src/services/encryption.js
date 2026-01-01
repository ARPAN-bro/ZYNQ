// frontend/src/services/encryption.js
import { ENCRYPTION_KEY } from '../utils/constants';

class EncryptionService {
  constructor() {
    this.keyMaterial = null;
    this.initPromise = this.init();
  }

  async init() {
    const keyData = this.hexToBytes(ENCRYPTION_KEY);
    this.keyMaterial = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-CBC' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }

  async decrypt(encryptedData) {
    await this.initPromise;

    const dataArray = new Uint8Array(encryptedData);
    const iv = dataArray.slice(0, 16);
    const data = dataArray.slice(16);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv },
      this.keyMaterial,
      data
    );

    return new Uint8Array(decrypted);
  }
}

export default new EncryptionService();