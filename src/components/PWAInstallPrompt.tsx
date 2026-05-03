'use client';

import React, { useEffect, useState } from 'react';
import { IoDownloadOutline, IoClose } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if it's iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // If it's iOS and not already installed, show instructions
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isIOSDevice && !isStandalone) {
      setShowPrompt(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="pwa-prompt"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
      >
        <div className="pwa-prompt-content">
          <div className="pwa-prompt-icon">
            <img src="/icons/icon-128.png" alt="ED MUSIC" />
          </div>
          <div className="pwa-prompt-text">
            <strong>Instalar ED MUSIC</strong>
            {isIOS ? (
              <span>Toque em Compartilhar e depois em "Adicionar à Tela de Início"</span>
            ) : (
              <span>Ouça suas músicas offline e em tela cheia</span>
            )}
          </div>
          {!isIOS && (
            <button className="pwa-install-btn" onClick={handleInstallClick}>
              Instalar
            </button>
          )}
          <button className="pwa-close-btn" onClick={() => setShowPrompt(false)}>
            <IoClose size={20} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
