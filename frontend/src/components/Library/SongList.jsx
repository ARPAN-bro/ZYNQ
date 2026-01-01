// frontend/src/components/Library/SongList.jsx
import { useState, useEffect } from 'react';
import { songAPI } from '../../services/api';
import SongCard from './SongCard';
import { Search, Heart } from 'lucide-react';
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
    return <div style={styles.loading}>Loading songs...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Your Library</h1>
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
          {search ? 'No songs found' : 'No songs available yet'}
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
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold'
  },
  donateBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    borderRadius: '24px',
    backgroundColor: '#1DB954',
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'transform 0.2s'
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    backgroundColor: '#282828',
    borderRadius: '24px',
    marginBottom: '32px'
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    color: '#FFFFFF',
    fontSize: '14px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '24px'
  },
  loading: {
    textAlign: 'center',
    padding: '100px 20px',
    fontSize: '18px',
    color: '#B3B3B3'
  },
  empty: {
    textAlign: 'center',
    padding: '100px 20px',
    fontSize: '18px',
    color: '#B3B3B3'
  }
};