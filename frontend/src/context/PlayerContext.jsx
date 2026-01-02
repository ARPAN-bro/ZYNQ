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
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const playSong = async (song) => {
    try {
      const audioUrl = await audioService.playSong(song._id);
      const audio = audioRef.current;

      audio.pause();
      audio.src = audioUrl;
      audio.load();

      setCurrentSong(song);
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing song:', error);
      alert('Failed to play song');
    }
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio.src) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      await audio.play();
      setIsPlaying(true);
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