
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

  useEffect(() => {
    // Check active session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session) {
            fetchProfileAndSetUser(session);
        } else {
            setLoading(false);
        }
      })
      .catch((err) => {
        console.warn("Session check failed (offline?):", err);
        setLoading(false);
      });

    // Listen for changes
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

  const fetchProfileAndSetUser = async (session: Session) => {
    try {
        // 1. Tenta buscar o perfil no banco
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (profile && !error) {
            // Perfil existe, usa ele
            setUser({
                id: profile.id,
                email: profile.email || session.user.email || '',
                full_name: profile.full_name,
                phone: profile.phone,
                address: profile.address,
                role: profile.role || 'user'
            });
        } else {
            // 2. Perfil NÃO existe no banco (primeiro login ou erro no trigger)
            // Cria o perfil agora mesmo (Client-Side Creation)
            console.log("Perfil não encontrado no banco. Criando agora...");
            await createProfileInDb(session);
        }
    } catch (err) {
        console.error("Erro ao buscar perfil:", err);
        // Fallback visual usando metadados da sessão
        mapSessionToUser(session);
    } finally {
        setLoading(false);
    }
  };

  const createProfileInDb = async (session: Session) => {
    const metadata = session.user.user_metadata || {};
    const email = session.user.email || '';
    const isAdmin = email.toLowerCase().includes('admin') || email === 'admin@patanegra.com';
    
    const newProfile = {
        id: session.user.id,
        email: email,
        full_name: metadata.full_name || '',
        phone: metadata.phone || '',
        role: isAdmin ? 'admin' : 'user'
    };

    // Insere no banco
    const { error } = await supabase.from('profiles').insert(newProfile);

    if (!error) {
        // Se deu certo, define o usuário com esses dados
        setUser(newProfile as UserProfile);
    } else {
        console.error("Falha ao criar perfil no banco:", error);
        // Se falhar (ex: erro de permissão), usa o fallback da sessão
        mapSessionToUser(session);
    }
  };

  const mapSessionToUser = (session: Session) => {
    const email = session.user.email || '';
    const isAdmin = email.toLowerCase().includes('admin') || email === 'admin@patanegra.com';
    const metadata = session.user.user_metadata || {};

    setUser({
      id: session.user.id,
      email: email,
      full_name: metadata.full_name,
      phone: metadata.phone,
      role: isAdmin ? 'admin' : 'user'
    });
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (error) {
      console.error("Login failed:", error);
      alert("Erro ao conectar com Google. Verifique a configuração do Supabase.");
    }
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
