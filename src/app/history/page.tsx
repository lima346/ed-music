'use client';

import React, { useState, useEffect } from 'react';
import TrackCard from '@/components/TrackCard';
import PlaylistModal from '@/components/PlaylistModal';
import { Track, HistoryEntry } from '@/types';
import { IoTime, IoTrash } from 'react-icons/io5';

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTrack, setModalTrack] = useState<Track | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('edmusic_history') || '[]';
      setHistory(JSON.parse(raw));
    } catch { setHistory([]); }
  }, []);

  const clearHistory = () => {
    localStorage.setItem('edmusic_history', '[]');
    setHistory([]);
  };

  const tracks = history.map(h => h.track);

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min atrás`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`;
    return d.toLocaleDateString('pt-BR');
  };

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Histórico</h1><p>Suas reproduções recentes</p></div>
        {history.length > 0 && (
          <button className="btn-outline" onClick={clearHistory} style={{ color: '#ff4444', borderColor: 'rgba(255,68,68,0.3)' }}>
            <IoTrash size={16} /> Limpar
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><IoTime /></div>
          <h3 className="empty-title">Nenhuma reprodução</h3>
          <p className="empty-text">As músicas que você ouvir aparecerão aqui</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {history.map((entry, i) => (
            <div key={`${entry.track.id}-${entry.playedAt}`} style={{ position: 'relative' }}>
              <TrackCard track={entry.track} index={i} trackList={tracks} showIndex
                onAddToPlaylist={(t) => { setModalTrack(t); setModalOpen(true); }} />
              <span style={{ position: 'absolute', right: 80, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--text-subdued)' }}>
                {formatDate(entry.playedAt)}
              </span>
            </div>
          ))}
        </div>
      )}

      <PlaylistModal isOpen={modalOpen} onClose={() => setModalOpen(false)} track={modalTrack} />
    </>
  );
}
