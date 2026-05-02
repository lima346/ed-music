'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import TrackCard from '@/components/TrackCard';
import PlaylistModal from '@/components/PlaylistModal';
import { searchYouTube } from '@/lib/youtube';
import { Track } from '@/types';
import { IoSearch, IoTime, IoClose } from 'react-icons/io5';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTrack, setModalTrack] = useState<Track | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('edmusic_search_history') || '[]';
      setSearchHistory(JSON.parse(raw));
    } catch { /* empty */ }
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setShowSuggestions(false);
    try {
      const data = await searchYouTube(q);
      setResults(data.tracks);

      const hist = [q, ...searchHistory.filter(h => h !== q)].slice(0, 10);
      setSearchHistory(hist);
      localStorage.setItem('edmusic_search_history', JSON.stringify(hist));
    } catch (err) {
      console.error('Search error:', err);
    }
    setLoading(false);
  }, [searchHistory]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setShowSuggestions(val.length === 0);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length >= 3) {
      debounceRef.current = setTimeout(() => doSearch(val), 600);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    doSearch(query);
  };

  const removeHistory = (item: string) => {
    const updated = searchHistory.filter(h => h !== item);
    setSearchHistory(updated);
    localStorage.setItem('edmusic_search_history', JSON.stringify(updated));
  };

  const categories = [
    { label: 'Pop', query: 'pop music hits 2025' },
    { label: 'Hip Hop', query: 'hip hop rap hits' },
    { label: 'Rock', query: 'rock music best' },
    { label: 'R&B', query: 'r&b soul music' },
    { label: 'Eletrônica', query: 'electronic dance music' },
    { label: 'Lo-Fi', query: 'lofi hip hop beats' },
    { label: 'Funk', query: 'funk brasileiro hits' },
    { label: 'Sertanejo', query: 'sertanejo universitario' },
  ];

  return (
    <>
      <div className="page-header">
        <h1>Buscar</h1>
        <p>Encontre suas músicas favoritas</p>
      </div>

      <div className="search-container">
        <form onSubmit={handleSubmit}>
          <div className="search-input-wrap">
            <IoSearch size={20} className="search-icon" />
            <input
              ref={inputRef}
              type="text"
              className="search-input"
              placeholder="O que você quer ouvir?"
              value={query}
              onChange={handleInputChange}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
          </div>
        </form>

        {showSuggestions && searchHistory.length > 0 && (
          <div className="search-suggestions">
            <div className="search-history-label">Buscas recentes</div>
            {searchHistory.map(item => (
              <div
                key={item}
                className="search-suggestion-item"
                onClick={() => { setQuery(item); doSearch(item); }}
              >
                <IoTime size={16} style={{ color: 'var(--text-subdued)', flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{item}</span>
                <button onClick={(e) => { e.stopPropagation(); removeHistory(item); }}>
                  <IoClose size={16} style={{ color: 'var(--text-subdued)' }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick categories */}
      {results.length === 0 && !loading && (
        <section style={{ marginBottom: 32 }}>
          <h2 className="section-title">Explorar</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {categories.map(cat => (
              <button
                key={cat.label}
                onClick={() => { setQuery(cat.query); doSearch(cat.query); }}
                style={{
                  padding: '10px 20px', borderRadius: 50, fontSize: 14, fontWeight: 600,
                  background: 'rgba(255,255,255,0.06)', color: 'var(--text-primary)',
                  transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.08)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent)', e.currentTarget.style.color = '#000')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)', e.currentTarget.style.color = 'var(--text-primary)')}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Results */}
      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : results.length > 0 ? (
        <section>
          <h2 className="section-title">Resultados</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {results.map((track, i) => (
              <TrackCard
                key={track.id}
                track={track}
                index={i}
                trackList={results}
                showIndex
                onAddToPlaylist={(t) => { setModalTrack(t); setModalOpen(true); }}
              />
            ))}
          </div>
        </section>
      ) : null}

      <PlaylistModal isOpen={modalOpen} onClose={() => setModalOpen(false)} track={modalTrack} />
    </>
  );
}
