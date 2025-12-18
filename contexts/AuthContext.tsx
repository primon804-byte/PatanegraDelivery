
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
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileAndSetUser = async (session: Session) => {
    try {
        // Busca o perfil no banco com prioridade total
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (profile && !error) {
            setUser(profile as UserProfile);
        } else {
            // Se o perfil não existe, cria um baseado nos metadados da sessão
            await createProfileInDb(session);
        }
    } catch (err) {
        console.error("Erro ao buscar perfil:", err);
        mapSessionToUser(session);
    } finally {
        setLoading(false);
    }
  };

  const createProfileInDb = async (session: Session) => {
    const metadata = session.user.user_metadata || {};
    const email = session.user.email || '';
    const isAdminUser = email.toLowerCase() === 'admin@patanegra.com' || metadata.role === 'admin';
    
    const newProfile = {
        id: session.user.id,
        email: email,
        full_name: metadata.full_name || 'Usuário Patanegra',
        phone: metadata.phone || '',
        role: isAdminUser ? 'admin' : 'user'
    };

    const { data, error } = await supabase
        .from('profiles')
        .upsert(newProfile)
        .select()
        .single();

    if (!error && data) {
        setUser(data as UserProfile);
    } else {
        mapSessionToUser(session);
    }
  };

  const mapSessionToUser = (session: Session) => {
    const email = session.user.email || '';
    const metadata = session.user.user_metadata || {};
    const isAdminUser = email.toLowerCase() === 'admin@patanegra.com' || metadata.role === 'admin';

    setUser({
      id: session.user.id,
      email: email,
      full_name: metadata.full_name,
      phone: metadata.phone,
      role: isAdminUser ? 'admin' : 'user'
    });
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfileAndSetUser(session);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfileAndSetUser(session);
      } else {
        setUser(null);
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
      isAdmin: user?.role === 'admin' 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
