// frontend/src/components/Player/AudioPlayer.jsx
import { useState, useEffect } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Repeat, Shuffle } from 'lucide-react';

export default function AudioPlayer() {
  const { currentSong, isPlaying, progress, duration, togglePlay, seek, setVolume } = usePlayer();
  const [volume, setVolumeState] = useState(1);
  const [muted, setMuted] = useState(false);
  const [liked, setLiked] = useState(false);

  if (!currentSong) return null;

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === 0) return '0:00';
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

  const handleProgressClick = (e) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    seek(newTime);
  };

  const progressPercentage = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div style={styles.player}>
      <div style={styles.container}>
        {/* Left: Song Info */}
        <div style={styles.songInfo}>
          <img 
            src={currentSong.artworkUrl} 
            alt={currentSong.title}
            style={styles.artwork}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/56x56/1DB954/ffffff?text=♪';
            }}
          />
          <div style={styles.details}>
            <div style={styles.title}>{currentSong.title}</div>
            <div style={styles.artist}>{currentSong.artist}</div>
          </div>
          <button 
            onClick={() => setLiked(!liked)} 
            style={{...styles.iconBtn, ...(liked ? styles.liked : {})}}
          >
            <Heart size={20} fill={liked ? '#1DB954' : 'none'} />
          </button>
        </div>

        {/* Center: Controls */}
        <div style={styles.controls}>
          <div style={styles.buttons}>
            <button style={styles.iconBtn}>
              <Shuffle size={20} />
            </button>
            <button style={styles.iconBtn}>
              <SkipBack size={20} fill="#FFFFFF" />
            </button>
            <button onClick={togglePlay} style={styles.playButton}>
              {isPlaying ? <Pause size={20} fill="#000000" /> : <Play size={20} fill="#000000" />}
            </button>
            <button style={styles.iconBtn}>
              <SkipForward size={20} fill="#FFFFFF" />
            </button>
            <button style={styles.iconBtn}>
              <Repeat size={20} />
            </button>
          </div>

          <div style={styles.progressContainer}>
            <span style={styles.time}>{formatTime(progress)}</span>
            <div 
              style={styles.progressBarContainer}
              onClick={handleProgressClick}
            >
              <div style={styles.progressBarBg}>
                <div 
                  style={{
                    ...styles.progressBarFill,
                    width: `${progressPercentage}%`
                  }}
                >
                  <div style={styles.progressDot} />
                </div>
              </div>
            </div>
            <span style={styles.time}>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Volume */}
        <div style={styles.volumeContainer}>
          <button onClick={toggleMute} style={styles.volumeBtn}>
            {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <div style={styles.volumeBarContainer}>
            <div style={styles.volumeBarBg}>
              <div 
                style={{
                  ...styles.volumeBarFill,
                  width: `${(muted ? 0 : volume) * 100}%`
                }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              style={styles.volumeInput}
            />
          </div>
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
    zIndex: 1000,
    height: '90px'
  },
  container: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr 1fr',
    alignItems: 'center',
    padding: '0 16px',
    height: '100%',
    gap: '16px'
  },
  
  // Song Info (Left)
  songInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: '180px'
  },
  artwork: {
    width: '56px',
    height: '56px',
    borderRadius: '4px',
    objectFit: 'cover',
    backgroundColor: '#282828'
  },
  details: {
    flex: 1,
    minWidth: 0,
    marginRight: '8px'
  },
  title: {
    fontSize: '14px',
    fontWeight: '500',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: '#FFFFFF',
    marginBottom: '4px'
  },
  artist: {
    fontSize: '12px',
    color: '#B3B3B3',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  
  // Controls (Center)
  controls: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    maxWidth: '722px',
    margin: '0 auto'
  },
  buttons: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  iconBtn: {
    color: '#B3B3B3',
    padding: '8px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s',
    cursor: 'pointer'
  },
  playButton: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    color: '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.1s',
    cursor: 'pointer'
  },
  liked: {
    color: '#1DB954'
  },
  
  // Progress Bar
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%'
  },
  time: {
    fontSize: '11px',
    color: '#B3B3B3',
    minWidth: '40px',
    textAlign: 'center',
    fontVariantNumeric: 'tabular-nums'
  },
  progressBarContainer: {
    flex: 1,
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    position: 'relative'
  },
  progressBarBg: {
    width: '100%',
    height: '4px',
    backgroundColor: '#4D4D4D',
    borderRadius: '2px',
    position: 'relative',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1DB954',
    borderRadius: '2px',
    position: 'relative',
    transition: 'width 0.1s linear'
  },
  progressDot: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: '12px',
    height: '12px',
    backgroundColor: '#FFFFFF',
    borderRadius: '50%',
    opacity: 0,
    transition: 'opacity 0.2s'
  },
  
  // Volume (Right)
  volumeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'flex-end',
    minWidth: '125px'
  },
  volumeBtn: {
    color: '#B3B3B3',
    padding: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  },
  volumeBarContainer: {
    width: '93px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    cursor: 'pointer'
  },
  volumeBarBg: {
    width: '100%',
    height: '4px',
    backgroundColor: '#4D4D4D',
    borderRadius: '2px',
    position: 'absolute',
    overflow: 'hidden'
  },
  volumeBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: '2px',
    transition: 'width 0.1s'
  },
  volumeInput: {
    position: 'absolute',
    width: '100%',
    height: '24px',
    opacity: 0,
    cursor: 'pointer',
    margin: 0
  }
};