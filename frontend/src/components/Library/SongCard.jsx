// frontend/src/components/Library/SongCard.jsx
import { useState, useEffect } from 'react';
import { Play, Pause, Download, Check } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import audioService from '../../services/audioService';

export default function SongCard({ song }) {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isCurrentSong = currentSong?._id === song._id;

  useEffect(() => {
    checkDownloadStatus();
  }, [song._id]);

  const checkDownloadStatus = async () => {
    const downloaded = await audioService.isDownloaded(song._id);
    setIsDownloaded(downloaded);
  };

  const handlePlay = (e) => {
    e.stopPropagation();
    playSong(song);
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (isDownloaded) return;
    
    setDownloading(true);
    const success = await audioService.downloadSong(song._id, {
      title: song.title,
      artist: song.artist,
      album: song.album,
      artworkUrl: song.artworkUrl
    });
    
    if (success) {
      setIsDownloaded(true);
    } else {
      alert('Failed to download song');
    }
    setDownloading(false);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      style={{
        ...styles.card,
        ...(isCurrentSong && isPlaying ? styles.cardPlaying : {}),
        ...(isHovered ? styles.cardHovered : {})
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.imageContainer}>
        <img 
          src={song.artworkUrl} 
          alt={song.title}
          style={styles.image}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x300/1DB954/ffffff?text=♪';
          }}
        />
        <button
          onClick={handlePlay}
          style={{
            ...styles.playBtn,
            ...(isHovered || (isCurrentSong && isPlaying) ? styles.playBtnVisible : {})
          }}
        >
          {isCurrentSong && isPlaying ? (
            <Pause size={24} fill="#000000" />
          ) : (
            <Play size={24} fill="#000000" style={{ marginLeft: '2px' }} />
          )}
        </button>
      </div>

      <div style={styles.info}>
        <h3 style={styles.songTitle}>{song.title}</h3>
        <p style={styles.artist}>{song.artist}</p>
      </div>

      <div style={styles.meta}>
        <span style={styles.album}>{song.album}</span>
        <span style={styles.duration}>{formatDuration(song.duration)}</span>
      </div>

      <button
        onClick={handleDownload}
        disabled={downloading || isDownloaded}
        style={{
          ...styles.downloadBtn,
          ...(isDownloaded ? styles.downloadedBtn : {}),
          ...(isHovered ? styles.downloadBtnVisible : {})
        }}
        title={isDownloaded ? 'Downloaded' : 'Download for offline'}
      >
        {downloading ? '...' : isDownloaded ? <Check size={16} /> : <Download size={16} />}
      </button>
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
  songTitle: {
    fontSize: '16px',
    fontWeight: '700',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: '#FFFFFF'
  },
  artist: {
    fontSize: '14px',
    color: '#B3B3B3',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: '400'
  },
  meta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    color: '#6A6A6A',
    marginTop: 'auto'
  },
  album: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
    marginRight: '8px'
  },
  duration: {
    flexShrink: 0
  },
  downloadBtn: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#FFFFFF',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    border: 'none',
    cursor: 'pointer',
    opacity: 0
  },
  downloadBtnVisible: {
    opacity: 1
  },
  downloadedBtn: {
    backgroundColor: '#1DB954',
    cursor: 'default',
    opacity: 1
  }
};