import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'ED MUSIC - Stream Music Free',
  description: 'ED MUSIC é um streaming de música moderno e gratuito. Descubra, ouça e crie playlists das suas músicas favoritas.',
  manifest: '/manifest.json',
  icons: { icon: '/icons/icon.svg', apple: '/icons/icon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <Providers>
          <ServiceWorkerRegistrar />
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
