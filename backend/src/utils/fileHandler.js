// backend/src/utils/fileHandler.js
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

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

  /**
   * Upload RAW mp3 file (no encryption)
   */
  async uploadRawFile(file, songId) {
    if (this.useCloudinary) {
      return this.uploadRawToCloudinary(file.buffer, songId);
    }

    const filename = `${songId}.mp3`;
    const filepath = path.join(this.uploadDir, filename);

    await fs.promises.writeFile(filepath, file.buffer);

    return {
      url: `/uploads/${filename}`,
      publicId: null
    };
  }

  /**
   * Upload RAW mp3 to Cloudinary
   */
  uploadRawToCloudinary(buffer, songId) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          public_id: `music/${songId}`,
          format: 'mp3'
        },
        (error, result) => {
          if (error) return reject(error);

          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      );

      uploadStream.end(buffer);
    });
  }

  /**
   * Delete stored file
   */
  async deleteFile(publicId, fileUrl) {
    if (this.useCloudinary && publicId) {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
      return;
    }

    if (fileUrl && fileUrl.startsWith('/uploads/')) {
      const filepath = path.join(__dirname, '../../', fileUrl);
      if (fs.existsSync(filepath)) {
        await fs.promises.unlink(filepath);
      }
    }
  }

  /**
   * Stream RAW mp3 with range support (local storage)
   */
  async getRawStream(fileUrl, range) {
    const filepath = path.join(__dirname, '../../', fileUrl);
    
    // Check if file exists
    if (!fs.existsSync(filepath)) {
      throw new Error('File not found');
    }

    const stat = await fs.promises.stat(filepath);
    const fileSize = stat.size;

    // No range request - send full file
    if (!range) {
      return {
        size: fileSize,
        stream: fs.createReadStream(filepath),
        start: 0,
        end: fileSize - 1,
        fileSize
      };
    }

    // Parse range request
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    return {
      size: chunkSize,
      stream: fs.createReadStream(filepath, { start, end }),
      start,
      end,
      fileSize
    };
  }

  /**
   * Full file stream (used for downloads)
   */
  async getRawDownloadStream(fileUrl) {
    const filepath = path.join(__dirname, '../../', fileUrl);
    
    if (!fs.existsSync(filepath)) {
      throw new Error('File not found');
    }
    
    return fs.createReadStream(filepath);
  }
}

module.exports = new FileHandler();