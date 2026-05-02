'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { IoMusicalNotes } from 'react-icons/io5';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { signInWithGoogle, user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (user && !loading) router.push('/');
  }, [user, loading, router]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="login-page">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="login-logo"><IoMusicalNotes /></div>
        <h1 className="login-title">ED MUSIC</h1>
        <p className="login-subtitle">
          Milhões de músicas grátis.<br />Descubra, ouça e compartilhe.
        </p>
        <button className="login-btn" onClick={handleLogin}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
          Entrar com Google
        </button>
        <button className="login-skip" onClick={() => router.push('/')}>
          Continuar sem conta
        </button>
      </motion.div>
    </div>
  );
}
