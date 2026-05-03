'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';

export default function YouTubeEmbed() {
  const {
    currentTrack,
    playerRef,
    volume,
    setProgress,
    setDuration,
    setIsPlaying,
    nextTrack,
    repeat,
  } = usePlayer();
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isReadyRef = useRef(false);
  const isInitializedRef = useRef(false);

  const onPlayerStateChange = useCallback((event: YT.OnStateChangeEvent) => {
    if (event.data === YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        if (playerRef.current) {
          setProgress(playerRef.current.getCurrentTime());
        }
      }, 500);
    } else if (event.data === YT.PlayerState.PAUSED) {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else if (event.data === YT.PlayerState.ENDED) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (repeat === 'one') {
        playerRef.current?.seekTo(0, true);
        playerRef.current?.playVideo();
      } else {
        nextTrack();
      }
    }
  }, [setIsPlaying, setProgress, playerRef, nextTrack, repeat]);

  const onPlayerReady = useCallback((event: YT.PlayerEvent) => {
    isReadyRef.current = true;
    event.target.setVolume(volume);
    if (currentTrack) {
      event.target.loadVideoById(currentTrack.id);
      event.target.playVideo();
    }
  }, [volume, currentTrack]);

  // Initial load of the YouTube API
  useEffect(() => {
    if (isInitializedRef.current) return;
    
    const initAPI = () => {
      if (!containerRef.current) return;
      
      const playerDiv = document.createElement('div');
      playerDiv.id = 'yt-player-element';
      containerRef.current.appendChild(playerDiv);

      playerRef.current = new window.YT.Player('yt-player-element', {
        height: '1',
        width: '1',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: (e) => console.error('YT Player Error:', e.data),
        },
      });
      isInitializedRef.current = true;
    };

    if (window.YT && window.YT.Player) {
      initAPI();
    } else {
      if (!document.getElementById('yt-iframe-api')) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = initAPI;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []); // Run only once on mount

  // Handle track changes without re-initializing the player
  useEffect(() => {
    if (playerRef.current && isReadyRef.current && currentTrack) {
      try {
        playerRef.current.loadVideoById(currentTrack.id);
        playerRef.current.playVideo();
        setDuration(playerRef.current.getDuration());
      } catch (e) {
        console.error('Error loading video:', e);
      }
    }
  }, [currentTrack?.id, playerRef, isReadyRef.current]);

  // Handle volume changes
  useEffect(() => {
    if (playerRef.current && isReadyRef.current) {
      try {
        playerRef.current.setVolume(volume);
      } catch (e) {}
    }
  }, [volume]);

  return (
    <div
      ref={containerRef}
      className="youtube-player-container"
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '20px',
        width: '10px',
        height: '10px',
        opacity: '0.1', // Slightly more visible for iOS to trust it
        pointerEvents: 'none',
        zIndex: 1000
      }}
      aria-hidden="true"
    />
  );
}
