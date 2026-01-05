// frontend/src/components/Library/Library.jsx
import { useState, useEffect } from 'react';
import { libraryAPI } from '../../services/libraryAPI';
import PlaylistCard from './PlaylistCard';
import SongCard from './SongCard';
import CreatePlaylistModal from './CreatePlaylistModal';
import { Plus, Music2, TrendingUp, Clock, Heart } from 'lucide-react';

export default function Library() {
  const [library, setLibrary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchLibrary();
  }, []);

  const fetchLibrary = async () => {
    try {
      const response = await libraryAPI.getLibrary();
      setLibrary(response.data);
      console.log('Library data:', response.data);
    } catch (error) {
      console.error('Error fetching library:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <Music2 size={48} color="#1DB954" />
        <p style={{ marginTop: '16px' }}>Loading your library...</p>
      </div>
    );
  }

  const hasContent = library && (
    library.playlists.length > 0 || 
    library.playHistory.length > 0 || 
    library.trending.length > 0
  );

  // Calculate if we need to show "All Playlists" link
  const playlistRows = Math.ceil(library?.playlists.length / 5);
  const shouldShowAllPlaylists = playlistRows > 2;
  const displayedPlaylists = shouldShowAllPlaylists 
    ? library.playlists.slice(0, 10) 
    : library.playlists;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Your Library</h1>
      </div>

      {!hasContent ? (
        <div style={styles.empty}>
          <Music2 size={80} color="#282828" />
          <h2 style={styles.emptyTitle}>Your library is empty</h2>
          <p style={styles.emptyText}>
            Start by creating a playlist or browse songs to add to your library
          </p>
          <button 
            style={styles.createBtn}
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={20} />
            <span>Create Playlist</span>
          </button>
        </div>
      ) : (
        <>
          {/* Playlists Section (First 2 rows max) */}
          {library.playlists.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionTitleRow}>
                  <Music2 size={24} color="#1DB954" />
                  <h2 style={styles.sectionTitle}>Your Playlists</h2>
                </div>
                <button 
                  style={styles.createSmallBtn}
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus size={18} />
                  <span>Create</span>
                </button>
              </div>
              <div style={styles.grid}>
                {displayedPlaylists.map(playlist => (
                  <PlaylistCard 
                    key={playlist._id} 
                    playlist={playlist}
                    onUpdate={fetchLibrary}
                  />
                ))}
              </div>
              {shouldShowAllPlaylists && (
                <button style={styles.showAllBtn}>
                  Show all {library.playlists.length} playlists
                </button>
              )}
            </div>
          )}

          {/* Trending Songs */}
          {library.trending && library.trending.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionTitleRow}>
                <TrendingUp size={24} color="#1DB954" />
                <h2 style={styles.sectionTitle}>Trending Now</h2>
              </div>
              <div style={styles.grid}>
                {library.trending.slice(0, 10).map(song => (
                  <SongCard key={song._id} song={song} />
                ))}
              </div>
            </div>
          )}

          {/* Play History */}
          {library.playHistory && library.playHistory.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionTitleRow}>
                <Clock size={24} color="#1DB954" />
                <h2 style={styles.sectionTitle}>Recently Played</h2>
              </div>
              <div style={styles.grid}>
                {library.playHistory.slice(0, 10).map(song => (
                  <SongCard key={song._id} song={song} />
                ))}
              </div>
            </div>
          )}

          {/* Liked Songs (if any) */}
          {library.likedSongs && library.likedSongs.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionTitleRow}>
                <Heart size={24} color="#1DB954" fill="#1DB954" />
                <h2 style={styles.sectionTitle}>Liked Songs</h2>
              </div>
              <div style={styles.grid}>
                {library.likedSongs.slice(0, 10).map(song => (
                  <SongCard key={song._id} song={song} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {showCreateModal && (
        <CreatePlaylistModal 
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchLibrary}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '32px 32px 120px',
    maxWidth: '1955px',
    margin: '0 auto',
    minHeight: 'calc(100vh - 90px)'
  },
  header: {
    marginBottom: '32px'
  },
  title: {
    fontSize: '48px',
    fontWeight: '900',
    letterSpacing: '-0.04em'
  },
  loading: {
    textAlign: 'center',
    padding: '100px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 200px)',
    color: '#B3B3B3'
  },
  empty: {
    textAlign: 'center',
    padding: '80px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '500px'
  },
  emptyTitle: {
    fontSize: '32px',
    fontWeight: '700',
    marginTop: '24px',
    marginBottom: '12px'
  },
  emptyText: {
    fontSize: '16px',
    color: '#B3B3B3',
    marginBottom: '32px',
    maxWidth: '400px'
  },
  createBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 32px',
    borderRadius: '500px',
    backgroundColor: '#1DB954',
    color: '#000000',
    fontSize: '16px',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  },
  section: {
    marginBottom: '48px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  sectionTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px'
  },
  sectionTitle: {
    fontSize: '28px',
    fontWeight: '700'
  },
  createSmallBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    borderRadius: '500px',
    backgroundColor: 'transparent',
    border: '1px solid #B3B3B3',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '24px'
  },
  showAllBtn: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#B3B3B3',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'color 0.2s'
  }
};