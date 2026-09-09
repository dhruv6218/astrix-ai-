'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';

const MOCK_USER: User = {
  id: 'mock-user-123',
  app_metadata: {},
  user_metadata: { full_name: 'Alex Rivera' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'alex@company.com',
};

const MOCK_SESSION: Session = {
  access_token: 'mock-access-token',
  token_type: 'bearer',
  expires_in: 3600,
  refresh_token: 'mock-refresh-token',
  user: MOCK_USER,
};

const ADMIN_STORAGE_KEY = 'astrix_admin_session';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isInitializing: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  sendMagicLink: (email: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<void>;
  signInAsAdmin: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, method?: string) => Promise<{ error: string | null }>;
  signUp: (email: string, method?: string, name?: string) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType>({
  session: MOCK_SESSION,
  user: MOCK_USER,
  isInitializing: false,
  isAdmin: false,
  signOut: async () => {},
  sendMagicLink: async () => ({ error: null }),
  signInWithGoogle: async () => {},
  signInAsAdmin: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null, needsConfirmation: false }),
  resetPassword: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(MOCK_SESSION);
  const [user, setUser] = useState<User | null>(MOCK_USER);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const adminSession = typeof window !== 'undefined' ? localStorage.getItem(ADMIN_STORAGE_KEY) : null;
    if (adminSession === 'true') {
      setIsAdmin(true);
    }
    setIsInitializing(false);
  }, []);

  const sendMagicLink = async (email: string): Promise<{ error: string | null }> => {
    setUser({
      ...MOCK_USER,
      email,
    });
    setSession(MOCK_SESSION);
    return { error: null };
  };

  const signIn = async (email: string): Promise<{ error: string | null }> => {
    return sendMagicLink(email);
  };

  const signUp = async (email: string, _method?: string, name?: string): Promise<{ error: string | null; needsConfirmation?: boolean }> => {
    setUser({
      ...MOCK_USER,
      email,
      user_metadata: { full_name: name || 'Demo User' },
    });
    setSession(MOCK_SESSION);
    return { error: null, needsConfirmation: false };
  };

  const resetPassword = async (_email: string): Promise<{ error: string | null }> => {
    return { error: null };
  };

  const updatePassword = async (_password: string): Promise<{ error: string | null }> => {
    return { error: null };
  };

  const signInWithGoogle = async () => {
    setUser(MOCK_USER);
    setSession(MOCK_SESSION);
  };

  const signInAsAdmin = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!email || !password) {
      return { error: 'Please enter both admin email and password' };
    }
    // Allow demo admin credentials (admin@astrix.ai / admin123) or any valid input in mock mode
    setIsAdmin(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
    }
    return { error: null };
  };

  const signOut = async () => {
    setIsAdmin(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    }
  };

  return (
    <AuthContext.Provider value={{
      session, user, isInitializing, isAdmin,
      signOut, sendMagicLink, signInWithGoogle, signInAsAdmin,
      signIn, signUp, resetPassword, updatePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
