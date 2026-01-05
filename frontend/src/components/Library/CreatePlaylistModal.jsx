// frontend/src/components/Library/CreatePlaylistModal.jsx
import { useState } from 'react';
import { X } from 'lucide-react';
import { libraryAPI } from '../../services/libraryAPI';

export default function CreatePlaylistModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Playlist name is required');
      return;
    }

    setCreating(true);
    setError('');

    try {
      await libraryAPI.createPlaylist({
        name: name.trim(),
        description: description.trim()
      });
      
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create playlist');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={styles.closeBtn}>
          <X size={24} />
        </button>

        <h2 style={styles.title}>Create Playlist</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Playlist Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Playlist"
              style={styles.input}
              maxLength={100}
              autoFocus
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for your playlist"
              style={styles.textarea}
              maxLength={300}
              rows={4}
            />
          </div>

          <button 
            type="submit" 
            style={styles.createBtn}
            disabled={creating || !name.trim()}
          >
            {creating ? 'Creating...' : 'Create Playlist'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
    padding: '20px'
  },
  modal: {
    backgroundColor: '#181818',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '500px',
    width: '100%',
    position: 'relative'
  },
  closeBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    padding: '8px',
    borderRadius: '50%',
    backgroundColor: '#282828',
    color: '#FFFFFF',
    border: 'none',
    cursor: 'pointer'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '24px'
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
  textarea: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #282828',
    backgroundColor: '#121212',
    color: '#FFFFFF',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  createBtn: {
    padding: '14px',
    borderRadius: '24px',
    backgroundColor: '#1DB954',
    color: '#000000',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'transform 0.2s'
  }
};