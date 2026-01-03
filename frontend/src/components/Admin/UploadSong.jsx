// frontend/src/components/Admin/UploadSong.jsx
import { useState } from 'react';
import { adminAPI } from '../../services/api';
import { Upload, Music } from 'lucide-react';

export default function UploadSong({ onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    artists: '', // Changed from 'artist' to 'artists'
    album: '',
    duration: '',
    year: ''
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'audio/mpeg') {
      setFile(selectedFile);
      setError('');
      
      // Extract metadata
      await extractMetadata(selectedFile);
    } else {
      setError('Please select an MP3 file');
      setFile(null);
    }
  };

  const extractMetadata = async (audioFile) => {
    try {
      setExtracting(true);
      
      // Create FormData for metadata extraction
      const data = new FormData();
      data.append('audio', audioFile);
      
      // Call backend to extract metadata
      const response = await adminAPI.extractMetadata(data);
      const metadata = response.data.metadata;
      
      console.log('Extracted metadata:', metadata);
      
      // Auto-fill form with extracted metadata
      setFormData({
        title: metadata.title || '',
        artists: metadata.artists || '', // Already comma-separated from backend
        album: metadata.album || '',
        duration: metadata.duration || '',
        year: metadata.year || ''
      });
      
      setError('');
    } catch (err) {
      console.error('Metadata extraction error:', err);
      setError('Could not extract metadata. Please fill manually.');
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select an audio file');
      return;
    }

    if (!formData.title || !formData.artists) {
      setError('Title and at least one artist are required');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('audio', file);
      data.append('title', formData.title);
      data.append('artists', formData.artists); // Send comma-separated artists
      data.append('album', formData.album || 'Unknown Album');
      data.append('duration', formData.duration || '0');
      data.append('year', formData.year || '');

      await adminAPI.uploadSong(data);

      // Reset form
      setFormData({ title: '', artists: '', album: '', duration: '', year: '' });
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
            {extracting && <span style={styles.extractingText}>Extracting metadata...</span>}
            <input
              type="file"
              accept="audio/mpeg"
              onChange={handleFileChange}
              style={styles.fileInput}
              disabled={uploading || extracting}
            />
          </label>
        </div>

        {extracting && (
          <div style={styles.infoBox}>
            <Music size={20} />
            <span>Analyzing audio file and extracting metadata...</span>
          </div>
        )}

        <div style={styles.inputGrid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Title * 
              {file && !formData.title && <span style={styles.autoFillNote}> (not found in metadata)</span>}
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              style={styles.input}
              placeholder="Enter song title"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Artist(s) * 
              {file && !formData.artists && <span style={styles.autoFillNote}> (not found in metadata)</span>}
            </label>
            <input
              type="text"
              name="artists"
              value={formData.artists}
              onChange={handleChange}
              style={styles.input}
              placeholder="Artist 1, Artist 2, Artist 3"
              required
            />
            <small style={styles.hint}>Separate multiple artists with commas</small>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Album
              {file && !formData.album && <span style={styles.autoFillNote}> (optional)</span>}
            </label>
            <input
              type="text"
              name="album"
              value={formData.album}
              onChange={handleChange}
              style={styles.input}
              placeholder="Album name (optional)"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Duration (seconds)
              {file && !formData.duration && <span style={styles.autoFillNote}> (optional)</span>}
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              style={styles.input}
              placeholder="Auto-detected"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Release Year
              {file && !formData.year && <span style={styles.autoFillNote}> (optional)</span>}
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              style={styles.input}
              placeholder="e.g., 2024"
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>
        </div>

        <button 
          type="submit" 
          style={styles.submitBtn} 
          disabled={uploading || extracting}
        >
          {uploading ? 'Uploading...' : extracting ? 'Extracting metadata...' : 'Upload Song'}
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
  infoBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#1DB954',
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
  extractingText: {
    fontSize: '12px',
    color: '#1DB954',
    fontStyle: 'italic'
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
  autoFillNote: {
    fontSize: '12px',
    color: '#B3B3B3',
    fontWeight: '400',
    fontStyle: 'italic'
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
  hint: {
    fontSize: '12px',
    color: '#B3B3B3',
    marginTop: '-4px'
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