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
    setDuration(event.target.getDuration());
    // Auto-play if a track was already waiting
    if (currentTrack) {
      event.target.playVideo();
    }
  }, [volume, setDuration, currentTrack]);

  useEffect(() => {
    if (!currentTrack) return;

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.loadVideoById(currentTrack.id);
        playerRef.current.setVolume(volume);
        return;
      }

      if (!containerRef.current) return;
      containerRef.current.innerHTML = '';
      const div = document.createElement('div');
      div.id = 'yt-player-element';
      containerRef.current.appendChild(div);

      playerRef.current = new window.YT.Player('yt-player-element', {
        height: '1',
        width: '1',
        videoId: currentTrack.id,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: (e) => console.error('YT Player Error:', e.data),
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      if (!document.getElementById('yt-iframe-api')) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentTrack?.id]);

  useEffect(() => {
    if (playerRef.current && isReadyRef.current) {
      try {
        playerRef.current.setVolume(volume);
      } catch (e) { /* player not ready */ }
    }
  }, [volume, playerRef]);

  useEffect(() => {
    if (playerRef.current && isReadyRef.current && currentTrack) {
      try {
        setDuration(playerRef.current.getDuration());
        // For iOS: explicitly call playVideo when track changes
        playerRef.current.playVideo();
      } catch (e) { /* player not ready */ }
    }
  }, [currentTrack?.id, setDuration, playerRef]);

  return (
    <div
      ref={containerRef}
      className="youtube-player-container"
      style={{
        position: 'fixed',
        bottom: '0',
        left: '0',
        width: '1px',
        height: '1px',
        opacity: '0.01', // Tiny opacity to keep it active on iOS
        pointerEvents: 'none',
        zIndex: -1
      }}
      aria-hidden="true"
    />
  );
}
