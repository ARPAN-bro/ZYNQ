// frontend/src/components/Dashboard/Dashboard.jsx
import { useState, useEffect, useRef } from 'react';
import { songAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import SongCard from '../Library/SongCard';
import { ChevronLeft, ChevronRight, Clock, Play, Heart, Shuffle, Repeat, Plus, Search } from 'lucide-react';
import DonationModal from '../Premium/DonationModal';

export default function Dashboard() {
  const { user } = useAuth();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDonationModal, setShowDonationModal] = useState(false);
  
  const trendingRef = useRef(null);
  const recentRef = useRef(null);

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

  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Mock data - in production, these would come from API
  const trendingSongs = songs.slice(0, 6);
  const recentlyPlayed = songs.slice(0, 8);
  const userPlaylists = [
    { id: 1, name: 'My Playlist #1', cover: null, songCount: 12 },
    { id: 2, name: 'Workout Mix', cover: null, songCount: 25 },
    { id: 3, name: 'Chill Vibes', cover: null, songCount: 18 }
  ];

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
        <p>Loading your music...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Top Action Bar */}
      <div style={styles.topBar}>
        <div style={styles.navButtons}>
          <button style={styles.navBtn}>
            <ChevronLeft size={20} />
          </button>
          <button style={styles.navBtn}>
            <ChevronRight size={20} />
          </button>
        </div>
        
        <div style={styles.rightActions}>
          <button style={styles.actionBtn}>Explore Premium</button>
          <button style={styles.actionBtn} onClick={() => setShowDonationModal(true)}>
            <Heart size={16} /> Support Us
          </button>
        </div>
      </div>

      {/* Welcome Section */}
      <div style={styles.welcomeSection}>
        <h1 style={styles.greeting}>{getTimeGreeting()}, {user?.username}!</h1>
      </div>

      {/* Quick Access / Recently Played Grid */}
      <div style={styles.quickAccessGrid}>
        {recentlyPlayed.slice(0, 6).map(song => (
          <div key={song._id} style={styles.quickAccessItem}>
            <img 
              src={song.artworkUrl} 
              alt={song.title}
              style={styles.quickAccessImg}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/80x80/282828/B3B3B3?text=♪';
              }}
            />
            <span style={styles.quickAccessTitle}>{song.title}</span>
            <button style={styles.quickAccessPlayBtn}>
              <Play size={16} fill="#000000" />
            </button>
          </div>
        ))}
      </div>

      {/* Trending Section */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Trending Now</h2>
          <div style={styles.scrollBtns}>
            <button onClick={() => scroll(trendingRef, 'left')} style={styles.scrollBtn}>
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => scroll(trendingRef, 'right')} style={styles.scrollBtn}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <div ref={trendingRef} style={styles.scrollContainer}>
          {trendingSongs.map(song => (
            <div key={song._id} style={styles.cardWrapper}>
              <SongCard song={song} />
            </div>
          ))}
        </div>
      </section>

      {/* User Playlists Section */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Your Playlists</h2>
          <button style={styles.showAllBtn}>Show all</button>
        </div>
        <div style={styles.playlistGrid}>
          {userPlaylists.map(playlist => (
            <div key={playlist.id} style={styles.playlistCard}>
              <div style={styles.playlistCover}>
                {playlist.cover ? (
                  <img src={playlist.cover} alt={playlist.name} style={styles.playlistCoverImg} />
                ) : (
                  <div style={styles.playlistPlaceholder}>
                    <Clock size={48} color="#B3B3B3" />
                  </div>
                )}
                <button style={styles.playlistPlayBtn}>
                  <Play size={24} fill="#000000" />
                </button>
              </div>
              <div style={styles.playlistInfo}>
                <h3 style={styles.playlistName}>{playlist.name}</h3>
                <p style={styles.playlistMeta}>{playlist.songCount} songs</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recently Played Section */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Recently Played</h2>
          <div style={styles.headerRight}>
            <button style={styles.showAllBtn}>Show all</button>
            <div style={styles.scrollBtns}>
              <button onClick={() => scroll(recentRef, 'left')} style={styles.scrollBtn}>
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => scroll(recentRef, 'right')} style={styles.scrollBtn}>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
        <div ref={recentRef} style={styles.scrollContainer}>
          {recentlyPlayed.map(song => (
            <div key={song._id} style={styles.cardWrapper}>
              <SongCard song={song} />
            </div>
          ))}
        </div>
      </section>

      {/* Made For You Section */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Made For You</h2>
          <button style={styles.showAllBtn}>Show all</button>
        </div>
        <div style={styles.madeForYouGrid}>
          {[1, 2, 3].map(i => (
            <div key={i} style={styles.madeForYouCard}>
              <div style={styles.madeForYouCover}>
                <div style={styles.madeForYouPlaceholder}>
                  <Shuffle size={48} color="#B3B3B3" />
                </div>
              </div>
              <h3 style={styles.madeForYouTitle}>Daily Mix {i}</h3>
              <p style={styles.madeForYouDesc}>Your favorite tracks and more</p>
            </div>
          ))}
        </div>
      </section>

      {showDonationModal && (
        <DonationModal onClose={() => setShowDonationModal(false)} />
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '0',
    maxWidth: '100%',
    minHeight: 'calc(100vh - 64px - 90px)',
    background: 'linear-gradient(180deg, #1f1f1f 0%, #121212 300px)',
    overflowY: 'auto'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 200px)',
    color: '#B3B3B3',
    gap: '16px'
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #282828',
    borderTop: '4px solid #1DB954',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    position: 'sticky',
    top: 0,
    backgroundColor: 'rgba(18, 18, 18, 0.9)',
    backdropFilter: 'blur(10px)',
    zIndex: 10
  },
  navButtons: {
    display: 'flex',
    gap: '8px'
  },
  navBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    border: 'none',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  rightActions: {
    display: 'flex',
    gap: '12px'
  },
  actionBtn: {
    padding: '8px 16px',
    borderRadius: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.2s'
  },
  welcomeSection: {
    padding: '24px 32px 16px'
  },
  greeting: {
    fontSize: '32px',
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: '0'
  },
  quickAccessGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '12px',
    padding: '0 32px 24px',
    maxWidth: '100%'
  },
  quickAccessItem: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    position: 'relative',
    height: '80px'
  },
  quickAccessImg: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    flexShrink: 0
  },
  quickAccessTitle: {
    flex: 1,
    padding: '0 16px',
    fontSize: '16px',
    fontWeight: '700',
    color: '#FFFFFF',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  quickAccessPlayBtn: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#1DB954',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '16px',
    opacity: 0,
    transition: 'opacity 0.2s, transform 0.2s',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
  },
  section: {
    padding: '0 32px',
    marginTop: '40px'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px'
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  scrollBtns: {
    display: 'flex',
    gap: '8px'
  },
  scrollBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    border: 'none',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  showAllBtn: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#B3B3B3',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 12px',
    borderRadius: '4px',
    transition: 'color 0.2s',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  scrollContainer: {
    display: 'flex',
    gap: '24px',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    paddingBottom: '8px'
  },
  cardWrapper: {
    minWidth: '180px',
    maxWidth: '180px'
  },
  playlistGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '24px'
  },
  playlistCard: {
    backgroundColor: '#181818',
    borderRadius: '8px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    position: 'relative'
  },
  playlistCover: {
    width: '100%',
    paddingBottom: '100%',
    position: 'relative',
    borderRadius: '4px',
    overflow: 'hidden',
    backgroundColor: '#282828'
  },
  playlistCoverImg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  playlistPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#282828'
  },
  playlistPlayBtn: {
    position: 'absolute',
    bottom: '8px',
    right: '8px',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#1DB954',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.2s, transform 0.2s',
    transform: 'translateY(8px)',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
  },
  playlistInfo: {
    minHeight: '62px'
  },
  playlistName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  playlistMeta: {
    fontSize: '14px',
    color: '#B3B3B3',
    fontWeight: '400'
  },
  madeForYouGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '24px',
    marginBottom: '40px'
  },
  madeForYouCard: {
    backgroundColor: '#181818',
    borderRadius: '8px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  madeForYouCover: {
    width: '100%',
    paddingBottom: '100%',
    position: 'relative',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '12px'
  },
  madeForYouPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#282828'
  },
  madeForYouTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: '4px'
  },
  madeForYouDesc: {
    fontSize: '14px',
    color: '#B3B3B3',
    fontWeight: '400'
  }
};