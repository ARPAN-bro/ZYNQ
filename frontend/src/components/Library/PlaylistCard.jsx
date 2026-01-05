// frontend/src/components/Library/PlaylistCard.jsx
import { useState } from 'react';
import { Play, Pause, MoreVertical } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

export default function PlaylistCard({ playlist, onUpdate }) {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handlePlay = (e) => {
    e.stopPropagation();
    if (playlist.songs && playlist.songs.length > 0) {
      playSong(playlist.songs[0]);
    }
  };

  const isPlayingThisPlaylist = playlist.songs?.some(
    song => song._id === currentSong?._id
  );

  return (
    <div 
      style={{
        ...styles.card,
        ...(isPlayingThisPlaylist && isPlaying ? styles.cardPlaying : {}),
        ...(isHovered ? styles.cardHovered : {})
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.imageContainer}>
        <img 
          src={playlist.coverImage} 
          alt={playlist.name}
          style={styles.image}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x300/1DB954/ffffff?text=Playlist';
          }}
        />
        <button
          onClick={handlePlay}
          style={{
            ...styles.playBtn,
            ...(isHovered || (isPlayingThisPlaylist && isPlaying) ? styles.playBtnVisible : {})
          }}
          disabled={!playlist.songs || playlist.songs.length === 0}
        >
          {isPlayingThisPlaylist && isPlaying ? (
            <Pause size={24} fill="#000000" />
          ) : (
            <Play size={24} fill="#000000" style={{ marginLeft: '2px' }} />
          )}
        </button>
      </div>

      <div style={styles.info}>
        <h3 style={styles.playlistName}>{playlist.name}</h3>
        <p style={styles.description}>
          {playlist.description || `${playlist.songs?.length || 0} songs`}
        </p>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#181818',
    borderRadius: '8px',
    padding: '16px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  cardHovered: {
    backgroundColor: '#282828'
  },
  cardPlaying: {
    backgroundColor: '#282828',
    boxShadow: '0 4px 12px rgba(29, 185, 84, 0.3)'
  },
  imageContainer: {
    position: 'relative',
    paddingBottom: '100%',
    overflow: 'hidden',
    borderRadius: '4px',
    backgroundColor: '#282828'
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  playBtn: {
    position: 'absolute',
    bottom: '8px',
    right: '8px',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#1DB954',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transform: 'translateY(8px)',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    border: 'none',
    cursor: 'pointer'
  },
  playBtnVisible: {
    opacity: 1,
    transform: 'translateY(0)'
  },
  info: {
    minHeight: '62px'
  },
  playlistName: {
    fontSize: '16px',
    fontWeight: '700',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: '#FFFFFF'
  },
  description: {
    fontSize: '14px',
    color: '#B3B3B3',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: '400'
  }
};