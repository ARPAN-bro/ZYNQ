// frontend/src/context/PlayerContext.jsx
import { createContext, useContext, useState, useRef, useEffect } from 'react';
import audioService from '../services/audioService';

const PlayerContext = createContext();

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
};

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      console.log('✅ Audio loaded, duration:', audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      console.log('🏁 Song ended');
    };

    const handleError = (e) => {
      console.error('❌ Audio error:', {
        error: e,
        code: audio.error?.code,
        message: audio.error?.message,
        src: audio.src
      });
      setIsPlaying(false);
      alert('Failed to play audio. Check console for details.');
    };

    const handleCanPlay = () => {
      console.log('✅ Audio can play');
    };

    const handleLoadStart = () => {
      console.log('🔄 Loading audio...');
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, []);

  const playSong = async (song) => {
    try {
      console.log('🎵 PlayerContext: Playing song', song.title);
      
      const audioUrl = await audioService.playSong(song._id);
      console.log('🔗 Audio URL:', audioUrl);

      const audio = audioRef.current;
      audio.pause();

      // If it's a streaming URL (not a blob), we need to fetch with auth
      if (audioUrl.startsWith('http')) {
        console.log('🌐 Fetching authenticated stream...');
        const token = localStorage.getItem('token');
        
        try {
          const response = await fetch(audioUrl, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          console.log('✅ Stream fetched, blob created:', blobUrl);
          
          audio.src = blobUrl;
        } catch (fetchError) {
          console.error('❌ Fetch error:', fetchError);
          throw new Error('Failed to fetch audio: ' + fetchError.message);
        }
      } else {
        // It's already a blob URL from offline storage
        audio.src = audioUrl;
      }

      audio.load();
      setCurrentSong(song);
      
      // Wait for audio to be ready
      const playPromise = new Promise((resolve, reject) => {
        const canplayHandler = async () => {
          try {
            await audio.play();
            setIsPlaying(true);
            console.log('▶️ Audio playing');
            resolve();
          } catch (playError) {
            console.error('❌ Play error:', playError);
            reject(playError);
          }
        };

        audio.addEventListener('canplay', canplayHandler, { once: true });

        // Timeout after 10 seconds
        setTimeout(() => {
          audio.removeEventListener('canplay', canplayHandler);
          reject(new Error('Audio loading timeout'));
        }, 10000);
      });

      await playPromise;

    } catch (error) {
      console.error('❌ Error in playSong:', error);
      alert('Failed to play song: ' + error.message);
    }
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio.src) {
      console.log('⚠️ No audio source');
      return;
    }
    
    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        console.log('⏸️ Audio paused');
      } else {
        await audio.play();
        setIsPlaying(true);
        console.log('▶️ Audio resumed');
      }
    } catch (error) {
      console.error('❌ Toggle play error:', error);
    }
  };

  const seek = (time) => {
    const audio = audioRef.current;
    audio.currentTime = time;
    setProgress(time);
    console.log('⏩ Seeked to:', time);
  };

  const setVolume = (volume) => {
    audioRef.current.volume = volume;
  };

  return (
    <PlayerContext.Provider value={{
      currentSong,
      isPlaying,
      progress,
      duration,
      playSong,
      togglePlay,
      seek,
      setVolume
    }}>
      {children}
    </PlayerContext.Provider>
  );
};