'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TrackCard from '@/components/TrackCard';
import PlaylistModal from '@/components/PlaylistModal';
import { Playlist, Track } from '@/types';
import { usePlayer } from '@/contexts/PlayerContext';
import { IoPlaySharp, IoShuffle, IoMusicalNotes, IoTrash, IoArrowBack } from 'react-icons/io5';

export default function PlaylistPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTrack, setModalTrack] = useState<Track | null>(null);
  const { playTrack } = usePlayer();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('edmusic_playlists') || '[]';
      const pls: Playlist[] = JSON.parse(raw);
      const found = pls.find(p => p.id === id);
      setPlaylist(found || null);
    } catch { setPlaylist(null); }
  }, [id]);

  const removeTrack = (trackId: string) => {
    if (!playlist) return;
    const updated = { ...playlist, tracks: playlist.tracks.filter(t => t.id !== trackId), updatedAt: Date.now() };
    setPlaylist(updated);
    try {
      const raw = localStorage.getItem('edmusic_playlists') || '[]';
      const pls: Playlist[] = JSON.parse(raw);
      const updatedPls = pls.map(p => p.id === id ? updated : p);
      localStorage.setItem('edmusic_playlists', JSON.stringify(updatedPls));
    } catch { /* empty */ }
  };

  const playAll = () => {
    if (playlist && playlist.tracks.length > 0) playTrack(playlist.tracks[0], playlist.tracks);
  };

  const playShuffle = () => {
    if (playlist && playlist.tracks.length > 0) {
      const idx = Math.floor(Math.random() * playlist.tracks.length);
      playTrack(playlist.tracks[idx], playlist.tracks);
    }
  };

  if (!playlist) {
    return (
      <>
        <div className="empty-state">
          <h3 className="empty-title">Playlist não encontrada</h3>
          <button className="empty-btn" onClick={() => router.push('/library')}>
            <IoArrowBack size={16} /> Voltar à Biblioteca
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <button onClick={() => router.back()} style={{ color: 'var(--text-secondary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
        <IoArrowBack size={18} /> Voltar
      </button>

      <div className="playlist-header">
        <div className="playlist-cover">
          {playlist.coverImage ? (
            <img src={playlist.coverImage} alt={playlist.name} />
          ) : (
            <IoMusicalNotes size={60} color="rgba(255,255,255,0.5)" />
          )}
        </div>
        <div className="playlist-meta">
          <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Playlist</p>
          <h1>{playlist.name}</h1>
          <p>{playlist.tracks.length} música{playlist.tracks.length !== 1 ? 's' : ''}</p>
          {playlist.tracks.length > 0 && (
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

      {playlist.tracks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><IoMusicalNotes /></div>
          <h3 className="empty-title">Playlist vazia</h3>
          <p className="empty-text">Busque músicas e adicione à esta playlist</p>
          <button className="empty-btn" onClick={() => router.push('/search')}>Buscar Músicas</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {playlist.tracks.map((track, i) => (
            <div key={track.id} style={{ position: 'relative' }}>
              <TrackCard track={track} index={i} trackList={playlist.tracks} showIndex
                onAddToPlaylist={(t) => { setModalTrack(t); setModalOpen(true); }} />
              <button onClick={() => removeTrack(track.id)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subdued)', padding: 6, opacity: 0, transition: 'opacity 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}>
                <IoTrash size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <PlaylistModal isOpen={modalOpen} onClose={() => setModalOpen(false)} track={modalTrack} />
    </>
  );
}
