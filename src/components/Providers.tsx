'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { PlayerProvider } from '@/contexts/PlayerContext';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PlayerProvider>
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#282828',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#1DB954', secondary: '#fff' },
            },
          }}
        />
      </PlayerProvider>
    </AuthProvider>
  );
}
