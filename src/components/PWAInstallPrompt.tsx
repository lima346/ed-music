'use client';

import React, { useEffect, useState } from 'react';
import { IoDownloadOutline, IoClose } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, throw it away
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
            <span>Ouça suas músicas offline e em tela cheia</span>
          </div>
          <button className="pwa-install-btn" onClick={handleInstallClick}>
            Instalar
          </button>
          <button className="pwa-close-btn" onClick={() => setShowPrompt(false)}>
            <IoClose size={20} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
