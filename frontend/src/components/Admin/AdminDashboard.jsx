// frontend/src/components/Admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import UploadSong from './UploadSong';
import { adminAPI, songAPI } from '../../services/api';
import { Trash2, TrendingUp, Music } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, songsRes] = await Promise.all([
        adminAPI.getStats(),
        songAPI.getAll()
      ]);
      setStats(statsRes.data.stats);
      setSongs(songsRes.data.songs);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (songId) => {
    if (!confirm('Are you sure you want to delete this song?')) return;

    try {
      await adminAPI.deleteSong(songId);
      setSongs(songs.filter(s => s._id !== songId));
      alert('Song deleted successfully');
    } catch (error) {
      alert('Failed to delete song');
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Admin Dashboard</h1>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <Music size={32} color="#1DB954" />
          <div style={styles.statValue}>{stats?.totalSongs || 0}</div>
          <div style={styles.statLabel}>Total Songs</div>
        </div>
        <div style={styles.statCard}>
          <TrendingUp size={32} color="#1DB954" />
          <div style={styles.statValue}>{stats?.totalPlays || 0}</div>
          <div style={styles.statLabel}>Total Plays</div>
        </div>
      </div>

      {/* Upload Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Upload New Song</h2>
        <UploadSong onSuccess={fetchData} />
      </div>

      {/* Songs List */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>All Songs ({songs.length})</h2>
        <div style={styles.songsList}>
          {songs.map(song => (
            <div key={song._id} style={styles.songItem}>
              <img src={song.artworkUrl} alt={song.title} style={styles.songImage} />
              <div style={styles.songInfo}>
                <div style={styles.songTitle}>{song.title}</div>
                <div style={styles.songArtist}>{song.artist} • {song.album}</div>
                <div style={styles.songStats}>
                  {song.plays} plays
                </div>
              </div>
              <button
                onClick={() => handleDelete(song._id)}
                style={styles.deleteBtn}
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '24px'
  },
  loading: {
    textAlign: 'center',
    padding: '100px 20px',
    fontSize: '18px',
    color: '#B3B3B3'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '40px'
  },
  statCard: {
    backgroundColor: '#181818',
    padding: '24px',
    borderRadius: '12px',
    textAlign: 'center'
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '12px 0 4px'
  },
  statLabel: {
    fontSize: '14px',
    color: '#B3B3B3'
  },
  section: {
    marginBottom: '40px'
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '16px'
  },
  songsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  songItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px',
    backgroundColor: '#181818',
    borderRadius: '8px',
    transition: 'background-color 0.2s'
  },
  songImage: {
    width: '60px',
    height: '60px',
    borderRadius: '4px',
    objectFit: 'cover'
  },
  songInfo: {
    flex: 1
  },
  songTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '4px'
  },
  songArtist: {
    fontSize: '14px',
    color: '#B3B3B3',
    marginBottom: '4px'
  },
  songStats: {
    fontSize: '12px',
    color: '#6A6A6A'
  },
  deleteBtn: {
    padding: '8px',
    borderRadius: '4px',
    backgroundColor: '#E22134',
    color: '#FFFFFF',
    transition: 'background-color 0.2s'
  }
};