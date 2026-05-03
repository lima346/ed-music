'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Track } from '@/types';

interface PlayerContextType {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  repeat: 'off' | 'one' | 'all';
  shuffle: boolean;
  isMiniPlayer: boolean;
  playTrack: (track: Track, trackList?: Track[]) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (vol: number) => void;
  seekTo: (time: number) => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  toggleMiniPlayer: () => void;
  addToQueue: (track: Track) => void;
  clearQueue: () => void;
  playerRef: React.MutableRefObject<YT.Player | null>;
  setProgress: (p: number) => void;
  setDuration: (d: number) => void;
  setIsPlaying: (p: boolean) => void;
}

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

const PlayerContext = createContext<PlayerContextType>({} as PlayerContextType);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(70);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [repeat, setRepeat] = useState<'off' | 'one' | 'all'>('off');
  const [shuffle, setShuffle] = useState(false);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const playerRef = useRef<YT.Player | null>(null);

  const updateMediaSession = useCallback((track: Track) => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: 'ED MUSIC',
        artwork: [
          { src: track.thumbnail, sizes: '320x180', type: 'image/jpeg' },
          { src: track.thumbnailHigh || track.thumbnail, sizes: '480x360', type: 'image/jpeg' },
          { src: track.thumbnailHigh || track.thumbnail, sizes: '512x512', type: 'image/jpeg' },
        ],
      });
      // Sincroniza o estado de reprodução com o sistema
      navigator.mediaSession.playbackState = 'playing';
    }
  }, []);

  const playTrack = useCallback((track: Track, trackList?: Track[]) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);

    if (trackList && trackList.length > 0) {
      setQueue(trackList);
      const idx = trackList.findIndex(t => t.id === track.id);
      setQueueIndex(idx >= 0 ? idx : 0);
    }

    updateMediaSession(track);

    // iOS Audio Bridge: Play a silent sound to "prime" the audio engine
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
      audio.play().catch(() => {});
    } catch (e) {}

    // iOS PWA Fix: Call playVideo directly in the click event stack
    if (playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById(track.id);
      playerRef.current.playVideo();
    }

    // Save to history in localStorage
    try {
      const historyRaw = localStorage.getItem('edmusic_history') || '[]';
      const history = JSON.parse(historyRaw);
      const entry = { track, playedAt: Date.now() };
      const filtered = history.filter((h: any) => h.track.id !== track.id);
      filtered.unshift(entry);
      localStorage.setItem('edmusic_history', JSON.stringify(filtered.slice(0, 100)));
    } catch (e) {
      console.error('Error saving history:', e);
    }
  }, [updateMediaSession]);

  const getNextIndex = useCallback((current: number, direction: 'next' | 'prev') => {
    if (queue.length === 0) return 0;

    if (shuffle) {
      let next = Math.floor(Math.random() * queue.length);
      while (next === current && queue.length > 1) {
        next = Math.floor(Math.random() * queue.length);
      }
      return next;
    }

    if (direction === 'next') {
      if (current >= queue.length - 1) {
        return repeat === 'all' ? 0 : current;
      }
      return current + 1;
    } else {
      if (current <= 0) {
        return repeat === 'all' ? queue.length - 1 : 0;
      }
      return current - 1;
    }
  }, [queue.length, shuffle, repeat]);

  const nextTrack = useCallback(() => {
    if (repeat === 'one') {
      playerRef.current?.seekTo(0, true);
      playerRef.current?.playVideo();
      return;
    }

    const nextIdx = getNextIndex(queueIndex, 'next');
    if (nextIdx !== queueIndex || repeat === 'all') {
      setQueueIndex(nextIdx);
      const track = queue[nextIdx];
      if (track) {
        setCurrentTrack(track);
        setIsPlaying(true);
        setProgress(0);
        updateMediaSession(track);
        // iOS PWA Fix
        if (playerRef.current && playerRef.current.loadVideoById) {
          playerRef.current.loadVideoById(track.id);
          playerRef.current.playVideo();
        }
      }
    }
  }, [queue, queueIndex, repeat, getNextIndex, updateMediaSession]);

  const prevTrack = useCallback(() => {
    if (progress > 3) {
      playerRef.current?.seekTo(0, true);
      setProgress(0);
      return;
    }

    const prevIdx = getNextIndex(queueIndex, 'prev');
    if (prevIdx !== queueIndex || repeat === 'all') {
      setQueueIndex(prevIdx);
      const track = queue[prevIdx];
      if (track) {
        setCurrentTrack(track);
        setIsPlaying(true);
        setProgress(0);
        updateMediaSession(track);
        // iOS PWA Fix
        if (playerRef.current && playerRef.current.loadVideoById) {
          playerRef.current.loadVideoById(track.id);
          playerRef.current.playVideo();
        }
      }
    }
  }, [queue, queueIndex, progress, repeat, getNextIndex, updateMediaSession]);

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
    } else {
      playerRef.current.playVideo();
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (playerRef.current) {
      playerRef.current.setVolume(vol);
    }
  }, []);

  const seekTo = useCallback((time: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time, true);
      setProgress(time);
    }
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeat(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle(prev => !prev);
  }, []);

  const toggleMiniPlayer = useCallback(() => {
    setIsMiniPlayer(prev => !prev);
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setQueue(prev => [...prev, track]);
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setQueueIndex(0);
  }, []);

  // Media Session action handlers
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.setActionHandler('play', () => {
      playerRef.current?.playVideo();
      setIsPlaying(true);
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      playerRef.current?.pauseVideo();
      setIsPlaying(false);
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => prevTrack());
    navigator.mediaSession.setActionHandler('nexttrack', () => nextTrack());
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) seekTo(details.seekTime);
    });
  }, [nextTrack, prevTrack, seekTo]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        queue,
        queueIndex,
        isPlaying,
        volume,
        progress,
        duration,
        repeat,
        shuffle,
        isMiniPlayer,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        setVolume,
        seekTo,
        toggleRepeat,
        toggleShuffle,
        toggleMiniPlayer,
        addToQueue,
        clearQueue,
        playerRef,
        setProgress,
        setDuration,
        setIsPlaying,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);
