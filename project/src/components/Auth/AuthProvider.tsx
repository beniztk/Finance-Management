import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { useFinanceStore } from '../../store/useFinanceStore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (person: 'yuval' | 'benny') => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const syncWithDatabase = useFinanceStore(state => state.syncWithDatabase);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        syncWithDatabase();
      }
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await syncWithDatabase();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [syncWithDatabase]);

  const signIn = async (person: 'yuval' | 'benny') => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${person}@example.com`,
        password: `${person}123456`
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user data returned');

      await syncWithDatabase();
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      localStorage.clear();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      setUser(null);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};