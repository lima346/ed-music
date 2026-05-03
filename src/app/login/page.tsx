'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { IoMusicalNotes, IoLogoGoogle, IoMail, IoLockClosed, IoPerson } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, user, loading } = useAuth();
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  React.useEffect(() => {
    if (user && !loading) router.push('/');
  }, [user, loading, router]);

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setAuthLoading(true);
      await signInWithGoogle();
    } catch (err: any) {
      setError('Falha ao entrar com Google');
      console.error(err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAuthLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro na autenticação');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-glow" />
      
      <motion.div
        className="login-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="login-header">
          <div className="login-logo">
            <IoMusicalNotes />
          </div>
          <h1 className="login-title">ED MUSIC</h1>
          <p className="login-subtitle">Onde a música ganha vida</p>
        </div>

        <div className="login-tabs">
          <button 
            className={`login-tab ${!isSignUp ? 'active' : ''}`}
            onClick={() => setIsSignUp(false)}
          >
            Entrar
          </button>
          <button 
            className={`login-tab ${isSignUp ? 'active' : ''}`}
            onClick={() => setIsSignUp(true)}
          >
            Criar Conta
          </button>
        </div>

        <form className="login-form" onSubmit={handleEmailAuth}>
          <AnimatePresence mode="wait">
            {isSignUp && (
              <motion.div
                key="name"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="input-group"
              >
                <IoPerson className="input-icon" />
                <input 
                  type="text" 
                  placeholder="Seu Nome" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="input-group">
            <IoMail className="input-icon" />
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <IoLockClosed className="input-icon" />
            <input 
              type="password" 
              placeholder="Senha" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-submit-btn" disabled={authLoading}>
            {authLoading ? 'Processando...' : (isSignUp ? 'Criar Minha Conta' : 'Entrar Agora')}
          </button>
        </form>

        <div className="login-divider">
          <span>ou</span>
        </div>

        <button className="login-google-btn" onClick={handleGoogleLogin} disabled={authLoading}>
          <IoLogoGoogle size={20} />
          Entrar com Google
        </button>

        <button className="login-skip-btn" onClick={() => router.push('/')}>
          Continuar como Convidado
        </button>
      </motion.div>
    </div>
  );
}
