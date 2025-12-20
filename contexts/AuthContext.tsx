
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
  loginAsAdminDemo: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileAndSetUser = async (session: Session) => {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (profile && !error) {
            setUser(profile as UserProfile);
        } else {
            mapSessionToUser(session);
        }
    } catch (err) {
        mapSessionToUser(session);
    } finally {
        setLoading(false);
    }
  };

  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await fetchProfileAndSetUser(session);
    }
  };

  const mapSessionToUser = (session: Session) => {
    const email = session.user.email || '';
    const metadata = session.user.user_metadata || {};
    const isAdminUser = email.toLowerCase() === 'admin@patanegra.com' || metadata.role === 'admin';

    setUser({
      id: session.user.id,
      email: email,
      full_name: metadata.full_name || 'Usuário Patanegra',
      phone: metadata.phone || '',
      role: isAdminUser ? 'admin' : 'user'
    });
  };

  const loginAsAdminDemo = () => {
    setUser({
      id: 'demo-admin-id',
      email: 'admin@patanegra.com',
      full_name: 'Administrador Demo',
      phone: '(45) 99999-9999',
      role: 'admin'
    });
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchProfileAndSetUser(session);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchProfileAndSetUser(session);
      else {
        // Só limpa se não for o admin demo (que não tem sessão no supabase)
        setUser(prev => prev?.id === 'demo-admin-id' ? prev : null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) console.error("Login failed:", error);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signInWithGoogle, 
      signOut, 
      isAdmin: user?.role === 'admin' || user?.email === 'admin@patanegra.com',
      refreshUser,
      loginAsAdminDemo
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
