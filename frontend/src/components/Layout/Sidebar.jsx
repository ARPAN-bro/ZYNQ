// frontend/src/components/Layout/Sidebar.jsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Library, Plus, Heart, List, ArrowRight } from 'lucide-react';

export default function Sidebar({ playlists = [], onCreatePlaylist }) {
  const [expanded, setExpanded] = useState(true);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{...styles.sidebar, width: expanded ? '320px' : '72px'}}>
      {/* Top Navigation - Always visible */}
      <div style={styles.topSection}>
        <Link to="/" style={{...styles.navItem, ...(isActive('/') ? styles.navItemActive : {})}}>
          <div style={styles.iconWrapper}>
            <Home size={24} />
          </div>
          {expanded && <span style={styles.navText}>Home</span>}
        </Link>
        
        <Link to="/search" style={{...styles.navItem, ...(isActive('/search') ? styles.navItemActive : {})}}>
          <div style={styles.iconWrapper}>
            <Search size={24} />
          </div>
          {expanded && <span style={styles.navText}>Search</span>}
        </Link>
      </div>

      {/* Library Section - Expandable */}
      <div style={styles.librarySection}>
        <div 
          style={styles.libraryHeader}
          onClick={() => setExpanded(!expanded)}
        >
          <div style={styles.libraryTitleWrapper}>
            <div style={styles.iconWrapper}>
              <Library size={24} />
            </div>
            {expanded && <span style={styles.navText}>Your Library</span>}
          </div>
          {expanded && (
            <div style={styles.headerActions}>
              <button onClick={(e) => { e.stopPropagation(); onCreatePlaylist(); }} style={styles.iconBtn}>
                <Plus size={20} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setExpanded(false); }} style={styles.iconBtn}>
                <ArrowRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Playlists Container - Scrollable */}
        <div style={styles.playlistsContainer}>
          {/* Liked Songs */}
          <div style={styles.playlistItem}>
            <div style={expanded ? styles.likedSongsIcon : styles.likedSongsIconSmall}>
              <Heart size={expanded ? 16 : 20} fill="#FFFFFF" />
            </div>
            {expanded && (
              <div style={styles.playlistTextWrapper}>
                <div style={styles.playlistName}>Liked Songs</div>
                <div style={styles.playlistMeta}>Playlist • 0 songs</div>
              </div>
            )}
          </div>

          {/* User Playlists */}
          {playlists.map(playlist => (
            <div key={playlist.id} style={styles.playlistItem}>
              <div style={expanded ? styles.playlistCover : styles.playlistCoverSmall}>
                {playlist.cover ? (
                  <img src={playlist.cover} alt={playlist.name} style={styles.playlistCoverImg} />
                ) : (
                  <div style={styles.playlistPlaceholder}>
                    <List size={expanded ? 20 : 24} color="#B3B3B3" />
                  </div>
                )}
              </div>
              {expanded && (
                <div style={styles.playlistTextWrapper}>
                  <div style={styles.playlistName}>{playlist.name}</div>
                  <div style={styles.playlistMeta}>Playlist • {playlist.songCount || 0} songs</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    backgroundColor: '#000000',
    height: 'calc(100vh - 64px - 90px)',
    position: 'sticky',
    top: '64px',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.3s cubic-bezier(0.3, 0, 0, 1)',
    flexShrink: 0,
    gap: '8px',
    padding: '8px'
  },
  topSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    paddingBottom: '8px'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '12px 16px',
    borderRadius: '8px',
    color: '#B3B3B3',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '700',
    transition: 'all 0.2s',
    cursor: 'pointer',
    height: '48px'
  },
  navItemActive: {
    color: '#FFFFFF'
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    flexShrink: 0
  },
  navText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  librarySection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#121212',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  libraryHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    cursor: 'pointer',
    flexShrink: 0,
    height: '48px'
  },
  libraryTitleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    color: '#B3B3B3',
    fontSize: '16px',
    fontWeight: '700'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  iconBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    color: '#B3B3B3',
    transition: 'all 0.2s',
    cursor: 'pointer',
    border: 'none'
  },
  playlistsContainer: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '8px'
  },
  playlistItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginBottom: '4px',
    minHeight: '64px'
  },
  likedSongsIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '4px',
    background: 'linear-gradient(135deg, #450af5, #c4efd9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  likedSongsIconSmall: {
    width: '40px',
    height: '40px',
    borderRadius: '6px',
    background: 'linear-gradient(135deg, #450af5, #c4efd9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    margin: '0 auto'
  },
  playlistCover: {
    width: '48px',
    height: '48px',
    borderRadius: '4px',
    backgroundColor: '#282828',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden'
  },
  playlistCoverSmall: {
    width: '40px',
    height: '40px',
    borderRadius: '6px',
    backgroundColor: '#282828',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    margin: '0 auto',
    overflow: 'hidden'
  },
  playlistCoverImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  playlistPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  playlistTextWrapper: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  playlistName: {
    fontSize: '16px',
    fontWeight: '400',
    color: '#FFFFFF',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  playlistMeta: {
    fontSize: '14px',
    color: '#B3B3B3',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  }
};