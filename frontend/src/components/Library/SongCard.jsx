// frontend/src/components/Library/SongCard.jsx
import { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

export default function SongCard({ song }) {
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayer();
  const [isHovered, setIsHovered] = useState(false);
  const isCurrentSong = currentSong?._id === song._id;

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (isCurrentSong) {
      togglePlay();
    } else {
      playSong(song);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      style={{
        ...styles.card,
        ...(isHovered ? styles.cardHovered : {})
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePlayClick}
    >
      <div style={styles.imageContainer}>
        <img 
          src={song.artworkUrl} 
          alt={song.title}
          style={styles.image}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x300/282828/B3B3B3?text=♪';
          }}
        />
        <div
          style={{
            ...styles.playBtnOverlay,
            opacity: (isHovered || (isCurrentSong && isPlaying)) ? 1 : 0
          }}
        >
          <button
            onClick={handlePlayClick}
            style={styles.playBtn}
          >
            {isCurrentSong && isPlaying ? (
              <Pause size={24} fill="#000000" />
            ) : (
              <Play size={24} fill="#000000" style={{ marginLeft: '2px' }} />
            )}
          </button>
        </div>
      </div>

      <div style={styles.info}>
        <h3 style={styles.title}>{song.title}</h3>
        <p style={styles.artist}>
          {song.artist}
          {formatDuration(song.duration) && (
            <span style={styles.duration}> • {formatDuration(song.duration)}</span>
          )}
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
    transition: 'background-color 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    height: '100%'
  },
  cardHovered: {
    backgroundColor: '#282828'
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    paddingBottom: '100%',
    overflow: 'hidden',
    borderRadius: '4px',
    backgroundColor: '#282828',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  playBtnOverlay: {
    position: 'absolute',
    bottom: '8px',
    right: '8px',
    transition: 'opacity 0.3s ease'
  },
  playBtn: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#1DB954',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    transition: 'all 0.2s ease',
    transform: 'scale(1)'
  },
  info: {
    minHeight: '62px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  title: {
    fontSize: '16px',
    fontWeight: '700',
    marginBottom: '0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: '#FFFFFF',
    lineHeight: '1.5'
  },
  artist: {
    fontSize: '14px',
    color: '#B3B3B3',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: '400',
    lineHeight: '1.5',
    margin: 0
  },
  duration: {
    fontSize: '14px',
    color: '#6A6A6A'
  }
};