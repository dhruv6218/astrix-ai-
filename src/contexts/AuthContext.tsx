import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name: string;
  };
}

interface AuthContextType {
  session: any;
  user: User | null;
  isInitializing: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isInitializing: true,
  signOut: async () => {},
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null, needsConfirmation: false }),
  signInWithGoogle: async () => {},
  resetPassword: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
});

const STORAGE_KEY = 'astrix_demo_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsInitializing(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    // Demo: Accept any email/password combination
    if (!email || !password) {
      return { error: 'Email and password are required' };
    }
    
    const newUser: User = {
      id: 'demo-user-' + Math.random().toString(36).substring(7),
      email: email,
      user_metadata: {
        full_name: email.split('@')[0]
      }
    };
    
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return { error: null };
  };

  const signUp = async (email: string, password: string, name: string): Promise<{ error: string | null; needsConfirmation: boolean }> => {
    if (!email || !password || !name) {
      return { error: 'All fields are required' };
    }
    
    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters' };
    }
    
    const newUser: User = {
      id: 'demo-user-' + Math.random().toString(36).substring(7),
      email: email,
      user_metadata: {
        full_name: name
      }
    };
    
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return { error: null, needsConfirmation: false };
  };

  const signInWithGoogle = async () => {
    // Demo: Simulate Google sign-in
    const newUser: User = {
      id: 'demo-google-user',
      email: 'demo@example.com',
      user_metadata: {
        full_name: 'Demo User'
      }
    };
    
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const resetPassword = async (email: string): Promise<{ error: string | null }> => {
    // Demo: Always succeed
    return { error: null };
  };

  const updatePassword = async (password: string): Promise<{ error: string | null }> => {
    // Demo: Always succeed
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{ 
      session: user ? { user } : null, 
      user, 
      isInitializing, 
      signOut, 
      signIn, 
      signUp, 
      signInWithGoogle,
      resetPassword,
      updatePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
