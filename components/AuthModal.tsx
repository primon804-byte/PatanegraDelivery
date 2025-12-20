
import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, Loader2, KeyRound, AlertCircle, CheckCircle2, User, Phone, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from './Button';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
  initialView?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess, initialView = 'login' }) => {
  const { loginAsAdminDemo } = useAuth();
  const [isLogin, setIsLogin] = useState(initialView === 'login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [address, setAddress] = useState('');
  const [bairro, setBairro] = useState('');
  const [city, setCity] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIsLogin(initialView === 'login');
      setError('');
    }
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const finalEmail = email.trim();
    const finalPassword = password.trim();

    // Atalho Admin Master (Demo Bypass)
    if (isLogin && finalEmail.toLowerCase() === 'admin' && finalPassword.toLowerCase() === 'admin') {
      loginAsAdminDemo();
      setLoading(false);
      onLoginSuccess ? onLoginSuccess() : onClose();
      return;
    }

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ 
          email: finalEmail, 
          password: finalPassword 
        });
        if (signInError) throw signInError;
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({ 
            email: finalEmail, 
            password: finalPassword,
            options: {
              data: {
                  full_name: fullName,
                  phone: phone,
              }
            }
        });

        if (signUpError) throw signUpError;

        if (data.user) {
            const { error: profileError } = await supabase.from('profiles').upsert({
                id: data.user.id,
                email: finalEmail,
                full_name: fullName,
                phone: phone,
                role: 'user',
                cpf: cpf,
                rg: rg,
                address: address,
                bairro: bairro,
                city: city
            });
            if (profileError) console.error("Erro ao salvar perfil:", profileError);
        }
      }
      
      onLoginSuccess ? onLoginSuccess() : onClose();
      
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'Email ou senha incorretos.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-zinc-950 rounded-3xl border border-zinc-800 shadow-2xl p-6 md:p-8 animate-slide-up max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={20} /></button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-serif text-white mb-2">{isLogin ? 'Entrar' : 'Cadastro'}</h2>
          <p className="text-zinc-400 text-[10px] uppercase font-black tracking-widest">Patanegra Premium Draft</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase font-black">Email ou Usuário</label>
                <input type="text" required className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-sm focus:border-amber-500 outline-none" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase font-black">Senha</label>
                <input type="password" required className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-sm focus:border-amber-500 outline-none" placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-4 pt-4 border-t border-zinc-900 animate-fade-in">
                <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase font-black">Nome Completo</label>
                    <input type="text" required className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-sm focus:border-amber-500 outline-none" value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 uppercase font-black">CPF</label>
                        <input type="text" required className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-sm focus:border-amber-500 outline-none" value={cpf} onChange={e => setCpf(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 uppercase font-black">WhatsApp</label>
                        <input type="tel" required className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-sm focus:border-amber-500 outline-none" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase font-black">RG</label>
                      <input type="text" required className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-sm focus:border-amber-500 outline-none" value={rg} onChange={e => setRg(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase font-black">Cidade</label>
                      <input type="text" required className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-sm focus:border-amber-500 outline-none" value={city} onChange={e => setCity(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase font-black">Rua e Número</label>
                      <input type="text" required className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-sm focus:border-amber-500 outline-none" value={address} onChange={e => setAddress(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase font-black">Bairro</label>
                      <input type="text" required className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-sm focus:border-amber-500 outline-none" value={bairro} onChange={e => setBairro(e.target.value)} />
                  </div>
                </div>
            </div>
          )}

          {error && <div className="text-red-500 text-[10px] font-bold uppercase text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">{error}</div>}

          <Button fullWidth type="submit" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Acessar' : 'Concluir Cadastro')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-amber-500 transition-colors">
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
          </button>
        </div>
      </div>
    </div>
  );
};
