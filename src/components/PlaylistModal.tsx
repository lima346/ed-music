'use client';

import React, { useState, useEffect } from 'react';
import { Track, Playlist } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoAdd, IoMusicalNotes } from 'react-icons/io5';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
}

export default function PlaylistModal({ isOpen, onClose, track }: PlaylistModalProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (isOpen) {
      try {
        const raw = localStorage.getItem('edmusic_playlists') || '[]';
        setPlaylists(JSON.parse(raw));
      } catch { setPlaylists([]); }
    }
  }, [isOpen]);

  const createPlaylist = () => {
    if (!newName.trim()) return;
    const newPlaylist: Playlist = {
      id: `pl_${Date.now()}`,
      name: newName.trim(),
      description: '',
      tracks: track ? [track] : [],
      coverImage: track?.thumbnail || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      userId: 'local',
      isPublic: false,
    };
    const updated = [...playlists, newPlaylist];
    setPlaylists(updated);
    localStorage.setItem('edmusic_playlists', JSON.stringify(updated));
    setNewName('');
    setShowCreate(false);
    onClose();
  };

  const addToPlaylist = (playlistId: string) => {
    if (!track) return;
    const updated = playlists.map(p => {
      if (p.id === playlistId) {
        if (p.tracks.some(t => t.id === track.id)) return p;
        return {
          ...p,
          tracks: [...p.tracks, track],
          updatedAt: Date.now(),
          coverImage: p.coverImage || track.thumbnail,
        };
      }
      return p;
    });
    setPlaylists(updated);
    localStorage.setItem('edmusic_playlists', JSON.stringify(updated));
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-content"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Adicionar à Playlist</h3>
              <button onClick={onClose} className="modal-close-btn">
                <IoClose size={24} />
              </button>
            </div>

            {track && (
              <div className="modal-track-preview">
                <img src={track.thumbnail} alt={track.title} />
                <div>
                  <span className="modal-track-title">{track.title}</span>
                  <span className="modal-track-artist">{track.artist}</span>
                </div>
              </div>
            )}

            <button
              className="modal-create-btn"
              onClick={() => setShowCreate(!showCreate)}
            >
              <IoAdd size={22} />
              <span>Nova Playlist</span>
            </button>

            {showCreate && (
              <div className="modal-create-form">
                <input
                  type="text"
                  placeholder="Nome da playlist"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createPlaylist()}
                  autoFocus
                />
                <button onClick={createPlaylist} disabled={!newName.trim()}>
                  Criar
                </button>
              </div>
            )}

            <div className="modal-playlist-list">
              {playlists.map(p => (
                <button
                  key={p.id}
                  className="modal-playlist-item"
                  onClick={() => addToPlaylist(p.id)}
                >
                  <div className="modal-playlist-cover">
                    {p.coverImage ? (
                      <img src={p.coverImage} alt={p.name} />
                    ) : (
                      <IoMusicalNotes size={18} />
                    )}
                  </div>
                  <div className="modal-playlist-info">
                    <span>{p.name}</span>
                    <span>{p.tracks.length} música{p.tracks.length !== 1 ? 's' : ''}</span>
                  </div>
                </button>
              ))}
              {playlists.length === 0 && !showCreate && (
                <p className="modal-empty">Nenhuma playlist ainda. Crie uma!</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
