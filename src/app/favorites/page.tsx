'use client';

import React, { useState, useEffect } from 'react';
import TrackCard from '@/components/TrackCard';
import PlaylistModal from '@/components/PlaylistModal';
import { Track } from '@/types';
import { usePlayer } from '@/contexts/PlayerContext';
import { IoHeart, IoPlaySharp, IoShuffle } from 'react-icons/io5';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Track[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTrack, setModalTrack] = useState<Track | null>(null);
  const { playTrack } = usePlayer();

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem('edmusic_favorites') || '[]';
        setFavorites(JSON.parse(raw));
      } catch { setFavorites([]); }
    };
    load();
    window.addEventListener('storage', load);
    const interval = setInterval(load, 2000);
    return () => { window.removeEventListener('storage', load); clearInterval(interval); };
  }, []);

  const playAll = () => {
    if (favorites.length > 0) playTrack(favorites[0], favorites);
  };

  const playShuffle = () => {
    if (favorites.length > 0) {
      const idx = Math.floor(Math.random() * favorites.length);
      playTrack(favorites[idx], favorites);
    }
  };

  return (
    <>
      <div className="playlist-header">
        <div className="playlist-cover" style={{ background: 'linear-gradient(135deg, #4c1d95, #1DB954)' }}>
          <IoHeart size={80} color="rgba(255,255,255,0.8)" />
        </div>
        <div className="playlist-meta">
          <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Playlist</p>
          <h1>Músicas Curtidas</h1>
          <p>{favorites.length} música{favorites.length !== 1 ? 's' : ''}</p>
          {favorites.length > 0 && (
            <div className="playlist-actions">
              <button className="btn-play-large" onClick={playAll}>
                <IoPlaySharp size={20} /> Tocar
              </button>
              <button className="btn-outline" onClick={playShuffle}>
                <IoShuffle size={18} /> Aleatório
              </button>
            </div>
          )}
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><IoHeart /></div>
          <h3 className="empty-title">Nenhuma música curtida</h3>
          <p className="empty-text">Curta músicas para vê-las aqui</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {favorites.map((track, i) => (
            <TrackCard key={track.id} track={track} index={i} trackList={favorites} showIndex
              onAddToPlaylist={(t) => { setModalTrack(t); setModalOpen(true); }} />
          ))}
        </div>
      )}

      <PlaylistModal isOpen={modalOpen} onClose={() => setModalOpen(false)} track={modalTrack} />
    </>
  );
}
