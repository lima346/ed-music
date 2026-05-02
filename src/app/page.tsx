'use client';

import React, { useEffect, useState } from 'react';
import TrackCard from '@/components/TrackCard';
import PlaylistModal from '@/components/PlaylistModal';
import { usePlayer } from '@/contexts/PlayerContext';
import { getTrendingMusic } from '@/lib/youtube';
import { Track, Playlist } from '@/types';
import { IoPlaySharp, IoMusicalNotes } from 'react-icons/io5';
import Link from 'next/link';

export default function HomePage() {
  const [trending, setTrending] = useState<Track[]>([]);
  const [recent, setRecent] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTrack, setModalTrack] = useState<Track | null>(null);
  const { playTrack } = usePlayer();

  useEffect(() => {
    const loadData = async () => {
      try {
        const tracks = await getTrendingMusic();
        setTrending(tracks);
      } catch (err) {
        console.error('Error loading trending:', err);
      }
      setLoading(false);
    };
    loadData();

    try {
      const historyRaw = localStorage.getItem('edmusic_history') || '[]';
      const history = JSON.parse(historyRaw);
      setRecent(history.slice(0, 10).map((h: any) => h.track));
    } catch { /* empty */ }

    try {
      const plRaw = localStorage.getItem('edmusic_playlists') || '[]';
      setPlaylists(JSON.parse(plRaw));
    } catch { /* empty */ }
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <>
      <h1 className="greeting">{getGreeting()} 🎵</h1>

      {/* Recently Played */}
      {recent.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <h2 className="section-title">Tocadas Recentemente</h2>
          <div className="track-grid">
            {recent.slice(0, 6).map((track, i) => (
              <div key={track.id} className="grid-card" onClick={() => playTrack(track, recent)}>
                <div className="grid-card-img">
                  <img src={track.thumbnail} alt={track.title} loading="lazy" />
                  <div className="grid-card-play"><IoPlaySharp size={20} /></div>
                </div>
                <div className="grid-card-title">{track.title}</div>
                <div className="grid-card-sub">{track.artist}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Playlists */}
      {playlists.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <h2 className="section-title">Suas Playlists</h2>
          <div className="track-grid">
            {playlists.map(pl => (
              <Link key={pl.id} href={`/playlist/${pl.id}`} className="grid-card">
                <div className="grid-card-img">
                  {pl.coverImage ? (
                    <img src={pl.coverImage} alt={pl.name} loading="lazy" />
                  ) : (
                    <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#1DB954,#191414)' }}>
                      <IoMusicalNotes size={40} color="rgba(255,255,255,0.6)" />
                    </div>
                  )}
                  <div className="grid-card-play"><IoPlaySharp size={20} /></div>
                </div>
                <div className="grid-card-title">{pl.name}</div>
                <div className="grid-card-sub">{pl.tracks.length} música{pl.tracks.length !== 1 ? 's' : ''}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Trending */}
      <section>
        <h2 className="section-title">Em Alta 🔥</h2>
        <p className="section-subtitle">As músicas mais ouvidas do momento</p>
        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {trending.map((track, i) => (
              <TrackCard
                key={track.id}
                track={track}
                index={i}
                trackList={trending}
                showIndex
                onAddToPlaylist={(t) => { setModalTrack(t); setModalOpen(true); }}
              />
            ))}
          </div>
        )}
      </section>

      <PlaylistModal isOpen={modalOpen} onClose={() => setModalOpen(false)} track={modalTrack} />
    </>
  );
}
