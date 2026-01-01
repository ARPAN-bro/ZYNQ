// backend/src/utils/encryption.js
const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

class EncryptionService {
  encrypt(buffer) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    
    // Prepend IV to encrypted data
    return Buffer.concat([iv, encrypted]);
  }

  decrypt(buffer) {
    // Extract IV from the first 16 bytes
    const iv = buffer.slice(0, 16);
    const encryptedData = buffer.slice(16);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
  }

  encryptStream(inputStream, outputStream) {
    return new Promise((resolve, reject) => {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
      
      // Write IV first
      outputStream.write(iv);
      
      inputStream
        .pipe(cipher)
        .pipe(outputStream)
        .on('finish', resolve)
        .on('error', reject);
    });
  }

  createDecryptStream() {
    let iv = null;
    let ivCollected = false;
    let ivBuffer = Buffer.alloc(0);

    const transform = new (require('stream').Transform)({
      transform(chunk, encoding, callback) {
        if (!ivCollected) {
          ivBuffer = Buffer.concat([ivBuffer, chunk]);
          
          if (ivBuffer.length >= 16) {
            iv = ivBuffer.slice(0, 16);
            const remainingData = ivBuffer.slice(16);
            ivCollected = true;
            
            const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
            
            // Store decipher for subsequent chunks
            this.decipher = decipher;
            
            if (remainingData.length > 0) {
              this.push(decipher.update(remainingData));
            }
          }
          callback();
        } else {
          this.push(this.decipher.update(chunk));
          callback();
        }
      },
      flush(callback) {
        if (this.decipher) {
          this.push(this.decipher.final());
        }
        callback();
      }
    });

    return transform;
  }
}

module.exports = new EncryptionService();