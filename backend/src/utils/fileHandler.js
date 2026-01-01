// backend/src/utils/fileHandler.js
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const encryptionService = require('./encryption');

// Configure Cloudinary if credentials exist
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

class FileHandler {
  constructor() {
    this.useCloudinary = !!process.env.CLOUDINARY_CLOUD_NAME;
    this.uploadDir = path.join(__dirname, '../../uploads');
    
    // Create uploads directory if using local storage
    if (!this.useCloudinary && !fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadEncryptedFile(file, songId) {
    const encryptedBuffer = encryptionService.encrypt(file.buffer);
    
    if (this.useCloudinary) {
      return await this.uploadToCloudinary(encryptedBuffer, songId);
    } else {
      return await this.saveLocally(encryptedBuffer, songId);
    }
  }

  async uploadToCloudinary(buffer, songId) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          public_id: `music/${songId}`,
          format: 'enc'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      );

      uploadStream.end(buffer);
    });
  }

  async saveLocally(buffer, songId) {
    const filename = `${songId}.enc`;
    const filepath = path.join(this.uploadDir, filename);
    
    await fs.promises.writeFile(filepath, buffer);
    
    return {
      url: `/uploads/${filename}`,
      publicId: null
    };
  }

  async deleteFile(publicId, fileUrl) {
    if (this.useCloudinary && publicId) {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    } else if (fileUrl && fileUrl.startsWith('/uploads/')) {
      const filepath = path.join(__dirname, '../../', fileUrl);
      if (fs.existsSync(filepath)) {
        await fs.promises.unlink(filepath);
      }
    }
  }

  async getEncryptedFile(fileUrl) {
    if (this.useCloudinary) {
      // Fetch from Cloudinary
      const response = await fetch(fileUrl);
      return Buffer.from(await response.arrayBuffer());
    } else {
      // Read from local storage
      const filepath = path.join(__dirname, '../../', fileUrl);
      return await fs.promises.readFile(filepath);
    }
  }
}

module.exports = new FileHandler();