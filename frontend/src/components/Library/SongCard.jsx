// frontend/src/components/Library/SongCard.jsx
import { useState, useEffect } from 'react';
import { Play, Download, Check } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import audioService from '../../services/audioService';

export default function SongCard({ song }) {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const isCurrentSong = currentSong?._id === song._id;

  useEffect(() => {
    checkDownloadStatus();
  }, [song._id]);

  const checkDownloadStatus = async () => {
    const downloaded = await audioService.isDownloaded(song._id);
    setIsDownloaded(downloaded);
  };

  const handlePlay = () => {
    playSong(song);
  };

  const handleDownload = async () => {
    if (isDownloaded) return;
    
    setDownloading(true);
    const success = await audioService.downloadSong(song._id, {
      title: song.title,
      artist: getArtistDisplay(),
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

  // Display artists properly
  const getArtistDisplay = () => {
    if (song.artists && song.artists.length > 0) {
      return song.artists.join(', ');
    }
    return song.artist;
  };

  return (
    <div style={{
      ...styles.card,
      ...(isCurrentSong && isPlaying ? styles.cardPlaying : {})
    }}>
      <div style={styles.imageContainer}>
        <img 
          src={song.artworkUrl} 
          alt={song.title}
          style={styles.image}
        />
        <button
          onClick={handlePlay}
          style={styles.playBtn}
        >
          <Play size={24} fill="#FFFFFF" />
        </button>
      </div>

      <div style={styles.info}>
        <h3 style={styles.songTitle}>{song.title}</h3>
        <p style={styles.artist}>{getArtistDisplay()}</p>
        <p style={styles.album}>
          {song.album}
          {song.year && ` • ${song.year}`}
        </p>
      </div>

      <button
        onClick={handleDownload}
        disabled={downloading || isDownloaded}
        style={{
          ...styles.downloadBtn,
          ...(isDownloaded ? styles.downloadedBtn : {})
        }}
      >
        {downloading ? '...' : isDownloaded ? <Check size={20} /> : <Download size={20} />}
      </button>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#181818',
    borderRadius: '8px',
    padding: '16px',
    transition: 'background-color 0.3s',
    cursor: 'pointer',
    position: 'relative'
  },
  cardPlaying: {
    backgroundColor: '#282828',
    boxShadow: '0 4px 12px rgba(29, 185, 84, 0.3)'
  },
  imageContainer: {
    position: 'relative',
    paddingBottom: '100%',
    marginBottom: '16px',
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
    transition: 'all 0.3s',
    boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
  },
  info: {
    marginBottom: '12px'
  },
  songTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  artist: {
    fontSize: '14px',
    color: '#B3B3B3',
    marginBottom: '2px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  album: {
    fontSize: '12px',
    color: '#6A6A6A',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  downloadBtn: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    backgroundColor: '#282828',
    color: '#FFFFFF',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s'
  },
  downloadedBtn: {
    backgroundColor: '#1DB954',
    cursor: 'default'
  }
};