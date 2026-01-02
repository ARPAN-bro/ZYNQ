// frontend/src/components/Library/SongList.jsx
import { useState, useEffect } from 'react';
import { songAPI } from '../../services/api';
import SongCard from './SongCard';
import { Search, Heart, Music2 } from 'lucide-react';
import DonationModal from '../Premium/DonationModal';

export default function SongList() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDonationModal, setShowDonationModal] = useState(false);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const response = await songAPI.getAll();
      setSongs(response.data.songs);
      console.log('Fetched songs:', response.data.songs);
    } catch (error) {
      console.error('Error fetching songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(search.toLowerCase()) ||
    song.artist.toLowerCase().includes(search.toLowerCase()) ||
    song.album.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={styles.loading}>
        <Music2 size={48} color="#1DB954" />
        <p style={{ marginTop: '16px' }}>Loading your music...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Your Library</h1>
          <p style={styles.subtitle}>{songs.length} songs available</p>
        </div>
        <button 
          style={styles.donateBtn}
          onClick={() => setShowDonationModal(true)}
        >
          <Heart size={20} />
          <span>Support Us</span>
        </button>
      </div>

      <div style={styles.searchBar}>
        <Search size={20} color="#B3B3B3" />
        <input
          type="text"
          placeholder="Search songs, artists, or albums..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {filteredSongs.length === 0 ? (
        <div style={styles.empty}>
          <Music2 size={64} color="#282828" />
          <h3 style={styles.emptyTitle}>
            {search ? 'No results found' : 'No songs yet'}
          </h3>
          <p style={styles.emptyText}>
            {search ? 'Try a different search term' : 'Songs will appear here once uploaded'}
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredSongs.map(song => (
            <SongCard key={song._id} song={song} />
          ))}
        </div>
      )}

      {showDonationModal && (
        <DonationModal onClose={() => setShowDonationModal(false)} />
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '32px 32px 120px', // Extra bottom padding for player
    maxWidth: '1955px',
    margin: '0 auto',
    minHeight: 'calc(100vh - 90px)' // Account for player height
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  title: {
    fontSize: '48px',
    fontWeight: '900',
    marginBottom: '8px',
    letterSpacing: '-0.04em'
  },
  subtitle: {
    fontSize: '14px',
    color: '#B3B3B3',
    fontWeight: '400'
  },
  donateBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 32px',
    borderRadius: '500px',
    backgroundColor: '#1DB954',
    color: '#000000',
    fontSize: '14px',
    fontWeight: '700',
    transition: 'all 0.3s',
    border: 'none',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.1em'
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#242424',
    borderRadius: '500px',
    marginBottom: '32px',
    maxWidth: '364px',
    transition: 'background-color 0.3s'
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: '400'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '24px',
    marginTop: '16px'
  },
  loading: {
    textAlign: 'center',
    padding: '100px 20px',
    fontSize: '16px',
    color: '#B3B3B3',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 200px)'
  },
  empty: {
    textAlign: 'center',
    padding: '80px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px'
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: '700',
    marginTop: '24px',
    marginBottom: '8px',
    color: '#FFFFFF'
  },
  emptyText: {
    fontSize: '14px',
    color: '#B3B3B3'
  }
};