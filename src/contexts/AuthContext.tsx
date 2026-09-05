import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  user_metadata: { full_name: string };
}

interface AuthContextType {
  session: { user: User } | null;
  user: User | null;
  isInitializing: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signInWithGoogle: () => Promise<void>;
  signInAsAdmin: (email: string, password: string) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType>({
  session: null, user: null, isInitializing: true, isAdmin: false,
  signOut: async () => {}, signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null, needsConfirmation: false }),
  signInWithGoogle: async () => {},
  signInAsAdmin: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
});

const STORAGE_KEY = 'astrix_demo_user';
const ADMIN_STORAGE_KEY = 'astrix_admin_session';

// Hardcoded admin credentials
const ADMIN_EMAIL = 'admin@astrix.ai';
const ADMIN_PASSWORD = 'admin123';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    const adminSession = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (adminSession) {
      try { setIsAdmin(JSON.parse(adminSession)); } catch { localStorage.removeItem(ADMIN_STORAGE_KEY); }
    }
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch { localStorage.removeItem(STORAGE_KEY); }
    }
    setIsInitializing(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!email || !password) return { error: 'Email and password are required' };
    const newUser: User = {
      id: 'demo-user-' + Math.random().toString(36).substring(7),
      email,
      user_metadata: { full_name: email.split('@')[0] },
    };
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return { error: null };
  };

  const signUp = async (email: string, password: string, name: string): Promise<{ error: string | null; needsConfirmation: boolean }> => {
    if (!email || !password || !name) return { error: 'All fields are required', needsConfirmation: false };
    if (password.length < 8) return { error: 'Password must be at least 8 characters', needsConfirmation: false };
    const newUser: User = {
      id: 'demo-user-' + Math.random().toString(36).substring(7),
      email,
      user_metadata: { full_name: name },
    };
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return { error: null, needsConfirmation: false };
  };

  const signInWithGoogle = async () => {
    const newUser: User = {
      id: 'demo-google-user-' + Math.random().toString(36).substring(7),
      email: 'demo@gmail.com',
      user_metadata: { full_name: 'Demo User' },
    };
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  };

  const signInAsAdmin = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return { error: 'Invalid admin credentials' };
    }
    const adminUser: User = {
      id: 'admin-user',
      email: ADMIN_EMAIL,
      user_metadata: { full_name: 'Admin' },
    };
    setUser(adminUser);
    setIsAdmin(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(adminUser));
    localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  };

  const resetPassword = async (_email: string) => ({ error: null });
  const updatePassword = async (_password: string) => ({ error: null });

  return (
    <AuthContext.Provider value={{
      session: user ? { user } : null, user, isInitializing, isAdmin,
      signOut, signIn, signUp, signInWithGoogle, signInAsAdmin,
      resetPassword, updatePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
