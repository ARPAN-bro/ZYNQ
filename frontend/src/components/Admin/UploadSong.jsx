// frontend/src/components/Admin/UploadSong.jsx
import { useState } from 'react';
import { adminAPI } from '../../services/api';
import { Upload } from 'lucide-react';

export default function UploadSong({ onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    duration: ''
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'audio/mpeg') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select an MP3 file');
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select an audio file');
      return;
    }

    if (!formData.title || !formData.artist) {
      setError('Title and artist are required');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('audio', file);
      data.append('title', formData.title);
      data.append('artist', formData.artist);
      data.append('album', formData.album || 'Unknown Album');
      data.append('duration', formData.duration || '0');

      await adminAPI.uploadSong(data);

      // Reset form
      setFormData({ title: '', artist: '', album: '', duration: '' });
      setFile(null);
      alert('Song uploaded successfully!');
      
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.fileInputContainer}>
          <label style={styles.fileLabel}>
            <Upload size={24} />
            <span>{file ? file.name : 'Choose MP3 file (max 20MB)'}</span>
            <input
              type="file"
              accept="audio/mpeg"
              onChange={handleFileChange}
              style={styles.fileInput}
            />
          </label>
        </div>

        <div style={styles.inputGrid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Artist *</label>
            <input
              type="text"
              name="artist"
              value={formData.artist}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Album</label>
            <input
              type="text"
              name="album"
              value={formData.album}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Duration (seconds)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
        </div>

        <button type="submit" style={styles.submitBtn} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload Song'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#181818',
    padding: '24px',
    borderRadius: '12px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  error: {
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#E22134',
    color: '#FFFFFF',
    fontSize: '14px'
  },
  fileInputContainer: {
    marginBottom: '8px'
  },
  fileLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '32px',
    border: '2px dashed #282828',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
    backgroundColor: '#121212',
    color: '#B3B3B3'
  },
  fileInput: {
    display: 'none'
  },
  inputGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#FFFFFF'
  },
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #282828',
    backgroundColor: '#121212',
    color: '#FFFFFF',
    fontSize: '14px',
    outline: 'none'
  },
  submitBtn: {
    padding: '14px',
    borderRadius: '24px',
    backgroundColor: '#1DB954',
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '8px',
    transition: 'transform 0.2s'
  }
};