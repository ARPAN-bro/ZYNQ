// frontend/src/components/Player/AudioPlayer.jsx
import { useState } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

export default function AudioPlayer() {
  const { currentSong, isPlaying, progress, duration, togglePlay, seek, setVolume } = usePlayer();
  const [volume, setVolumeState] = useState(1);
  const [muted, setMuted] = useState(false);

  if (!currentSong) return null;

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolumeState(newVolume);
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (muted) {
      setVolume(volume);
      setMuted(false);
    } else {
      setVolume(0);
      setMuted(true);
    }
  };

  return (
    <div style={styles.player}>
      <div style={styles.container}>
        {/* Song Info */}
        <div style={styles.songInfo}>
          <img 
            src={currentSong.artworkUrl} 
            alt={currentSong.title}
            style={styles.artwork}
          />
          <div style={styles.details}>
            <div style={styles.title}>{currentSong.title}</div>
            <div style={styles.artist}>{currentSong.artist}</div>
          </div>
        </div>

        {/* Controls */}
        <div style={styles.controls}>
          <button onClick={togglePlay} style={styles.playButton}>
            {isPlaying ? <Pause size={32} fill="#FFFFFF" /> : <Play size={32} fill="#FFFFFF" />}
          </button>

          <div style={styles.progressContainer}>
            <span style={styles.time}>{formatTime(progress)}</span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={progress}
              onChange={(e) => seek(parseFloat(e.target.value))}
              style={styles.progressBar}
            />
            <span style={styles.time}>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume */}
        <div style={styles.volumeContainer}>
          <button onClick={toggleMute} style={styles.volumeBtn}>
            {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={muted ? 0 : volume}
            onChange={handleVolumeChange}
            style={styles.volumeBar}
          />
        </div>
      </div>
    </div>
  );
}

const styles = {
  player: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#181818',
    borderTop: '1px solid #282828',
    zIndex: 1000
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    gap: '24px'
  },
  songInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: '0 1 30%',
    minWidth: '180px'
  },
  artwork: {
    width: '56px',
    height: '56px',
    borderRadius: '4px',
    objectFit: 'cover'
  },
  details: {
    flex: 1,
    minWidth: 0
  },
  title: {
    fontSize: '14px',
    fontWeight: 'bold',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  artist: {
    fontSize: '12px',
    color: '#B3B3B3',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  controls: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    maxWidth: '600px'
  },
  playButton: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    color: '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s'
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%'
  },
  time: {
    fontSize: '12px',
    color: '#B3B3B3',
    minWidth: '40px',
    textAlign: 'center'
  },
  progressBar: {
    flex: 1,
    height: '4px',
    borderRadius: '2px',
    outline: 'none',
    background: '#4D4D4D',
    cursor: 'pointer'
  },
  volumeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: '0 1 30%',
    justifyContent: 'flex-end',
    minWidth: '120px'
  },
  volumeBtn: {
    color: '#B3B3B3',
    padding: '8px'
  },
  volumeBar: {
    width: '100px',
    height: '4px',
    borderRadius: '2px',
    outline: 'none',
    background: '#4D4D4D',
    cursor: 'pointer'
  }
};