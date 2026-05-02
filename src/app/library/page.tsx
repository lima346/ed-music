'use client';

import React, { useState, useEffect } from 'react';
import { Playlist } from '@/types';
import { IoAdd, IoMusicalNotes, IoTrash, IoPlaySharp } from 'react-icons/io5';
import { usePlayer } from '@/contexts/PlayerContext';
import Link from 'next/link';

export default function LibraryPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const { playTrack } = usePlayer();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('edmusic_playlists') || '[]';
      setPlaylists(JSON.parse(raw));
    } catch { setPlaylists([]); }
  }, []);

  const createPlaylist = () => {
    if (!newName.trim()) return;
    const pl: Playlist = {
      id: `pl_${Date.now()}`, name: newName.trim(), description: '',
      tracks: [], coverImage: '', createdAt: Date.now(), updatedAt: Date.now(),
      userId: 'local', isPublic: false,
    };
    const updated = [...playlists, pl];
    setPlaylists(updated);
    localStorage.setItem('edmusic_playlists', JSON.stringify(updated));
    setNewName('');
    setShowCreate(false);
  };

  const deletePlaylist = (id: string) => {
    const updated = playlists.filter(p => p.id !== id);
    setPlaylists(updated);
    localStorage.setItem('edmusic_playlists', JSON.stringify(updated));
  };

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Sua Biblioteca</h1><p>Suas playlists e coleções</p></div>
        <button className="btn-outline" onClick={() => setShowCreate(!showCreate)}>
          <IoAdd size={18} /> Nova Playlist
        </button>
      </div>

      {showCreate && (
        <div className="modal-create-form" style={{ maxWidth: 400, marginBottom: 24 }}>
          <input type="text" placeholder="Nome da playlist" value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createPlaylist()} autoFocus />
          <button onClick={createPlaylist} disabled={!newName.trim()}>Criar</button>
        </div>
      )}

      {playlists.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><IoMusicalNotes /></div>
          <h3 className="empty-title">Crie sua primeira playlist</h3>
          <p className="empty-text">Organize suas músicas favoritas em playlists personalizadas</p>
          <button className="empty-btn" onClick={() => setShowCreate(true)}>
            <IoAdd size={18} /> Criar Playlist
          </button>
        </div>
      ) : (
        <div className="track-grid">
          {playlists.map(pl => (
            <div key={pl.id} className="grid-card" style={{ position: 'relative' }}>
              <Link href={`/playlist/${pl.id}`} style={{ display: 'block' }}>
                <div className="grid-card-img">
                  {pl.coverImage ? (
                    <img src={pl.coverImage} alt={pl.name} loading="lazy" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1DB954,#191414)' }}>
                      <IoMusicalNotes size={40} color="rgba(255,255,255,0.6)" />
                    </div>
                  )}
                  {pl.tracks.length > 0 && (
                    <div className="grid-card-play" onClick={(e) => { e.preventDefault(); playTrack(pl.tracks[0], pl.tracks); }}>
                      <IoPlaySharp size={20} />
                    </div>
                  )}
                </div>
                <div className="grid-card-title">{pl.name}</div>
                <div className="grid-card-sub">{pl.tracks.length} música{pl.tracks.length !== 1 ? 's' : ''}</div>
              </Link>
              <button onClick={() => deletePlaylist(pl.id)}
                style={{ position: 'absolute', top: 8, right: 8, color: 'var(--text-subdued)', padding: 6, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', opacity: 0, transition: 'opacity 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}>
                <IoTrash size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
