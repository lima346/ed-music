'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { UserProfile } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const createOrUpdateProfile = useCallback(async (firebaseUser: User) => {
    if (!db) return;
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    const profileData: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || 'User',
      photoURL: firebaseUser.photoURL || '',
      createdAt: userSnap.exists() ? userSnap.data().createdAt : Date.now(),
      lastLogin: Date.now(),
    };

    await setDoc(userRef, profileData, { merge: true });
    setProfile(profileData);
  }, []);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          await createOrUpdateProfile(firebaseUser);
        } catch (error) {
          console.error('Error creating profile:', error);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [createOrUpdateProfile]);

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      alert("Configuração de login incompleta. Verifique as chaves do Firebase.");
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (!auth) return;
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    if (!auth) return;
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      const profileData: UserProfile = {
        uid: res.user.uid,
        email: res.user.email || '',
        displayName: name,
        photoURL: '',
        createdAt: Date.now(),
        lastLogin: Date.now(),
      };
      if (db) {
        await setDoc(doc(db, 'users', res.user.uid), profileData);
      }
      setProfile(profileData);
    }
  };

  const signOut = async () => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
      setProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
