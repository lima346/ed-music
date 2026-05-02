'use client';

import React from 'react';
import { Track } from '@/types';
import { usePlayer } from '@/contexts/PlayerContext';
import {
  IoPlaySharp,
  IoPauseSharp,
  IoHeart,
  IoHeartOutline,
  IoEllipsisVertical,
  IoMusicalNotes,
} from 'react-icons/io5';
import { motion } from 'framer-motion';

interface TrackCardProps {
  track: Track;
  index?: number;
  trackList?: Track[];
  showIndex?: boolean;
  compact?: boolean;
  onAddToPlaylist?: (track: Track) => void;
}

export default function TrackCard({
  track,
  index = 0,
  trackList,
  showIndex = false,
  compact = false,
  onAddToPlaylist,
}: TrackCardProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();
  const isCurrentTrack = currentTrack?.id === track.id;
  const [liked, setLiked] = React.useState(false);

  React.useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('edmusic_favorites') || '[]');
      setLiked(favs.some((f: any) => f.id === track.id));
    } catch { setLiked(false); }
  }, [track.id]);

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const favs = JSON.parse(localStorage.getItem('edmusic_favorites') || '[]');
      if (liked) {
        const filtered = favs.filter((f: any) => f.id !== track.id);
        localStorage.setItem('edmusic_favorites', JSON.stringify(filtered));
      } else {
        favs.unshift(track);
        localStorage.setItem('edmusic_favorites', JSON.stringify(favs));
      }
      setLiked(!liked);
    } catch (e2) { console.error(e2); }
  };

  const handlePlay = () => {
    if (isCurrentTrack) {
      togglePlay();
    } else {
      playTrack(track, trackList || [track]);
    }
  };

  return (
    <motion.div
      className={`track-card ${isCurrentTrack ? 'track-active' : ''} ${compact ? 'track-compact' : ''}`}
      onClick={handlePlay}
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
      whileTap={{ scale: 0.99 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      {showIndex && (
        <div className="track-index">
          {isCurrentTrack && isPlaying ? (
            <div className="playing-bars">
              <span /><span /><span /><span />
            </div>
          ) : (
            <span className={isCurrentTrack ? 'text-green' : ''}>{index + 1}</span>
          )}
        </div>
      )}

      <div className="track-thumbnail-wrapper">
        <div className="track-thumbnail">
          {track.thumbnail ? (
            <img src={track.thumbnail} alt={track.title} loading="lazy" />
          ) : (
            <div className="track-thumb-placeholder">
              <IoMusicalNotes size={18} />
            </div>
          )}
          <div className="track-play-overlay">
            {isCurrentTrack && isPlaying ? (
              <IoPauseSharp size={18} />
            ) : (
              <IoPlaySharp size={18} />
            )}
          </div>
        </div>
      </div>

      <div className="track-info">
        <span className={`track-title ${isCurrentTrack ? 'text-green' : ''}`}>
          {track.title}
        </span>
        <span className="track-artist">{track.artist}</span>
      </div>

      <span className="track-duration">{track.duration}</span>

      <div className="track-actions">
        <button onClick={toggleLike} className={`track-action-btn ${liked ? 'liked' : ''}`}>
          {liked ? <IoHeart size={18} /> : <IoHeartOutline size={18} />}
        </button>
        {onAddToPlaylist && (
          <button
            onClick={(e) => { e.stopPropagation(); onAddToPlaylist(track); }}
            className="track-action-btn"
          >
            <IoEllipsisVertical size={18} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
