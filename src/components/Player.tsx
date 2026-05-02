'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IoPlaySharp,
  IoPauseSharp,
  IoPlaySkipForwardSharp,
  IoPlaySkipBackSharp,
  IoRepeat,
  IoShuffle,
  IoVolumeHigh,
  IoVolumeMedium,
  IoVolumeLow,
  IoVolumeMute,
  IoChevronUp,
  IoChevronDown,
  IoMusicalNotes,
  IoHeart,
  IoHeartOutline,
  IoShareSocial,
} from 'react-icons/io5';

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function Player() {
  const {
    currentTrack,
    isPlaying,
    volume,
    progress,
    duration,
    repeat,
    shuffle,
    togglePlay,
    nextTrack,
    prevTrack,
    setVolume,
    seekTo,
    toggleRepeat,
    toggleShuffle,
  } = usePlayer();

  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const progressRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!currentTrack) return;
    try {
      const favs = JSON.parse(localStorage.getItem('edmusic_favorites') || '[]');
      setLiked(favs.some((f: any) => f.id === currentTrack.id));
    } catch { setLiked(false); }
  }, [currentTrack]);

  const toggleLike = () => {
    if (!currentTrack) return;
    try {
      const favs = JSON.parse(localStorage.getItem('edmusic_favorites') || '[]');
      if (liked) {
        const filtered = favs.filter((f: any) => f.id !== currentTrack.id);
        localStorage.setItem('edmusic_favorites', JSON.stringify(filtered));
      } else {
        favs.unshift(currentTrack);
        localStorage.setItem('edmusic_favorites', JSON.stringify(favs));
      }
      setLiked(!liked);
    } catch (e) { console.error(e); }
  };

  const handleShare = async () => {
    if (!currentTrack) return;
    const url = `https://youtu.be/${currentTrack.id}`;
    if (navigator.share) {
      await navigator.share({ title: currentTrack.title, text: `${currentTrack.artist} - ${currentTrack.title}`, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  const VolumeIcon = volume === 0 ? IoVolumeMute : volume < 30 ? IoVolumeLow : volume < 70 ? IoVolumeMedium : IoVolumeHigh;
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  if (!currentTrack) return null;

  return (
    <>
      {/* Expanded Mobile Player */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="player-expanded"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <button className="player-collapse-btn" onClick={() => setExpanded(false)}>
              <IoChevronDown size={28} />
            </button>

            <div className="player-expanded-art">
              <img src={currentTrack.thumbnailHigh || currentTrack.thumbnail} alt={currentTrack.title} />
              <div className="player-expanded-glow" />
            </div>

            <div className="player-expanded-info">
              <h2>{currentTrack.title}</h2>
              <p>{currentTrack.artist}</p>
            </div>

            <div className="player-expanded-progress">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={progress}
                onChange={(e) => seekTo(Number(e.target.value))}
                className="player-progress-range expanded"
                style={{ '--progress': `${progressPercent}%` } as React.CSSProperties}
              />
              <div className="player-time-labels">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="player-expanded-controls">
              <button onClick={toggleShuffle} className={`player-btn ${shuffle ? 'active' : ''}`}>
                <IoShuffle size={24} />
              </button>
              <button onClick={prevTrack} className="player-btn">
                <IoPlaySkipBackSharp size={28} />
              </button>
              <button onClick={togglePlay} className="player-play-btn-large">
                {isPlaying ? <IoPauseSharp size={32} /> : <IoPlaySharp size={32} />}
              </button>
              <button onClick={nextTrack} className="player-btn">
                <IoPlaySkipForwardSharp size={28} />
              </button>
              <button onClick={toggleRepeat} className={`player-btn ${repeat !== 'off' ? 'active' : ''}`}>
                <IoRepeat size={24} />
                {repeat === 'one' && <span className="repeat-one-badge">1</span>}
              </button>
            </div>

            <div className="player-expanded-actions">
              <button onClick={toggleLike} className={`player-btn ${liked ? 'liked' : ''}`}>
                {liked ? <IoHeart size={26} /> : <IoHeartOutline size={26} />}
              </button>
              <button onClick={handleShare} className="player-btn">
                <IoShareSocial size={24} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Player Bar */}
      <div className={`player-bar ${expanded ? 'hidden' : ''}`}>
        {/* Mobile click to expand */}
        <button className="player-expand-touch" onClick={() => setExpanded(true)}>
          <IoChevronUp size={20} />
        </button>

        {/* Track Info */}
        <div className="player-track-info" onClick={() => setExpanded(true)}>
          <div className="player-thumbnail">
            {currentTrack.thumbnail ? (
              <img src={currentTrack.thumbnail} alt={currentTrack.title} />
            ) : (
              <div className="player-thumbnail-placeholder">
                <IoMusicalNotes size={20} />
              </div>
            )}
            {isPlaying && (
              <div className="player-thumbnail-playing">
                <div className="playing-bars">
                  <span /><span /><span /><span />
                </div>
              </div>
            )}
          </div>
          <div className="player-track-text">
            <span className="player-track-title">{currentTrack.title}</span>
            <span className="player-track-artist">{currentTrack.artist}</span>
          </div>
          <button onClick={(e) => { e.stopPropagation(); toggleLike(); }} className={`player-like-btn ${liked ? 'liked' : ''}`}>
            {liked ? <IoHeart size={18} /> : <IoHeartOutline size={18} />}
          </button>
        </div>

        {/* Desktop Controls */}
        <div className="player-controls">
          <div className="player-buttons">
            <button onClick={toggleShuffle} className={`player-btn-sm ${shuffle ? 'active' : ''}`}>
              <IoShuffle size={18} />
            </button>
            <button onClick={prevTrack} className="player-btn-sm">
              <IoPlaySkipBackSharp size={20} />
            </button>
            <button onClick={togglePlay} className="player-play-btn">
              {isPlaying ? <IoPauseSharp size={20} /> : <IoPlaySharp size={20} />}
            </button>
            <button onClick={nextTrack} className="player-btn-sm">
              <IoPlaySkipForwardSharp size={20} />
            </button>
            <button onClick={toggleRepeat} className={`player-btn-sm ${repeat !== 'off' ? 'active' : ''}`}>
              <IoRepeat size={18} />
              {repeat === 'one' && <span className="repeat-one-dot" />}
            </button>
          </div>
          <div className="player-progress">
            <span className="player-time">{formatTime(progress)}</span>
            <input
              ref={progressRef}
              type="range"
              min={0}
              max={duration || 100}
              value={progress}
              onChange={(e) => seekTo(Number(e.target.value))}
              className="player-progress-range"
              style={{ '--progress': `${progressPercent}%` } as React.CSSProperties}
            />
            <span className="player-time">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume (desktop only) */}
        <div className="player-volume">
          <button onClick={() => setVolume(volume === 0 ? 70 : 0)} className="player-btn-sm">
            <VolumeIcon size={20} />
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="player-volume-range"
            style={{ '--progress': `${volume}%` } as React.CSSProperties}
          />
        </div>
      </div>
    </>
  );
}
