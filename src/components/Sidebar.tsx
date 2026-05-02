'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  IoHomeSharp,
  IoSearch,
  IoLibrary,
  IoHeart,
  IoTime,
  IoAdd,
  IoMusicalNotes,
  IoLogOutOutline,
  IoMenu,
  IoClose,
} from 'react-icons/io5';

const navItems = [
  { href: '/', icon: IoHomeSharp, label: 'Início' },
  { href: '/search', icon: IoSearch, label: 'Buscar' },
  { href: '/library', icon: IoLibrary, label: 'Biblioteca' },
];

const libraryItems = [
  { href: '/favorites', icon: IoHeart, label: 'Músicas Curtidas' },
  { href: '/history', icon: IoTime, label: 'Histórico' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="sidebar-logo">
        <IoMusicalNotes className="sidebar-logo-icon" />
        <span className="sidebar-logo-text">ED MUSIC</span>
      </div>

      {/* Main Nav */}
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <item.icon size={24} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Divider */}
      <div className="sidebar-divider" />

      {/* Library */}
      <div className="sidebar-section">
        <div className="sidebar-section-header">
          <span>SUA BIBLIOTECA</span>
          <Link href="/library" className="sidebar-add-btn" title="Criar Playlist">
            <IoAdd size={20} />
          </Link>
        </div>
        {libraryItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* User */}
      {profile && (
        <div className="sidebar-user">
          <img
            src={profile.photoURL || '/default-avatar.png'}
            alt={profile.displayName}
            className="sidebar-avatar"
          />
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{profile.displayName}</span>
            <span className="sidebar-user-email">{profile.email}</span>
          </div>
          <button onClick={signOut} className="sidebar-logout" title="Sair">
            <IoLogOutOutline size={20} />
          </button>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <IoClose size={24} /> : <IoMenu size={24} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        {sidebarContent}
      </aside>

      {/* Bottom mobile nav */}
      <nav className="mobile-bottom-nav">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav-item ${isActive(item.href) ? 'active' : ''}`}
          >
            <item.icon size={22} />
            <span>{item.label}</span>
          </Link>
        ))}
        <Link
          href="/favorites"
          className={`mobile-nav-item ${isActive('/favorites') ? 'active' : ''}`}
        >
          <IoHeart size={22} />
          <span>Curtidas</span>
        </Link>
      </nav>
    </>
  );
}
