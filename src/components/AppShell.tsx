'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Player from '@/components/Player';
import YouTubeEmbed from '@/components/YouTubeEmbed';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="main-scroll">{children}</div>
      </main>
      <Player />
      <YouTubeEmbed />
    </div>
  );
}
