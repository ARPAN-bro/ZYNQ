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
      console.log('Audio loaded, duration:', audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    const handleError = (e) => {
      console.error('Audio error:', e);
      setIsPlaying(false);
    };

    const handleCanPlay = () => {
      console.log('Audio can play');
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  const playSong = async (song) => {
    try {
      console.log('PlayerContext: Playing song', song.title);
      
      const audioUrl = await audioService.playSong(song._id);
      const audio = audioRef.current;

      console.log('Audio URL:', audioUrl);

      audio.pause();
      audio.src = audioUrl;
      audio.load();

      setCurrentSong(song);
      
      // Wait for audio to be ready
      audio.addEventListener('canplay', async () => {
        try {
          await audio.play();
          setIsPlaying(true);
          console.log('Audio playing');
        } catch (playError) {
          console.error('Play error:', playError);
          alert('Failed to play audio. Check console for details.');
        }
      }, { once: true });

    } catch (error) {
      console.error('Error in playSong:', error);
      alert('Failed to play song: ' + error.message);
    }
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio.src) {
      console.log('No audio source');
      return;
    }
    
    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        console.log('Audio paused');
      } else {
        await audio.play();
        setIsPlaying(true);
        console.log('Audio resumed');
      }
    } catch (error) {
      console.error('Toggle play error:', error);
    }
  };

  const seek = (time) => {
    audioRef.current.currentTime = time;
    setProgress(time);
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