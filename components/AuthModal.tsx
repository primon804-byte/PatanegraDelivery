
import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, Loader2, KeyRound, AlertCircle, CheckCircle2, User, Phone, MapPin, Upload, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from './Button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
  initialView?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess, initialView = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialView === 'login');
  
  // States
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
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIsLogin(initialView === 'login');
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    let finalEmail = email.trim();
    let finalPassword = password.trim();

    // LÓGICA DE ATALHO ADMIN
    if (finalEmail.toLowerCase() === 'admin' && finalPassword.toLowerCase() === 'admin') {
      finalEmail = 'admin@patanegra.com';
      finalPassword = 'patanegra123';
    }

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ 
          email: finalEmail, 
          password: finalPassword 
        });
        
        if (signInError) {
          // Se for o admin e der erro, tenta cadastrar ele automaticamente
          if (finalEmail === 'admin@patanegra.com') {
             await performSignUp(finalEmail, finalPassword, true);
             return;
          }
          throw signInError;
        }
      } else {
        await performSignUp(finalEmail, finalPassword, false);
        return;
      }
      
      onLoginSuccess ? onLoginSuccess() : onClose();
      
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'Email ou senha incorretos.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  const performSignUp = async (emailStr: string, passStr: string, isAdmin: boolean) => {
    const { data, error: signUpError } = await supabase.auth.signUp({ 
        email: emailStr, 
        password: passStr,
        options: {
          data: {
              full_name: isAdmin ? 'Administrador Patanegra' : fullName,
              phone: phone,
              role: isAdmin ? 'admin' : 'user'
          }
        }
    });

    if (signUpError) throw signUpError;

    if (data.user) {
        // Garante a inserção manual no profile caso o trigger falhe ou não exista
        await supabase.from('profiles').upsert({
            id: data.user.id,
            email: emailStr,
            full_name: isAdmin ? 'Administrador Patanegra' : fullName,
            phone: phone,
            role: isAdmin ? 'admin' : 'user',
            cpf: cpf,
            rg: rg,
            address: address,
            bairro: bairro,
            city: city
        });
    }

    if (data.session) {
        onLoginSuccess ? onLoginSuccess() : onClose();
    } else {
        setSuccessMsg('Conta criada! Verifique seu email para confirmar.');
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-zinc-950 rounded-3xl border border-zinc-800 shadow-2xl p-6 md:p-8 animate-slide-up max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={20} /></button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-serif text-white mb-2">{isLogin ? 'Bem-vindo' : 'Criar Conta'}</h2>
          <p className="text-zinc-400 text-sm">{isLogin ? 'Acesse sua conta para continuar.' : 'Preencha seus dados para começar.'}</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-1">
                <label className="text-xs text-zinc-500 uppercase font-bold">Email ou Usuário</label>
                <div className="relative">
                  <input type="text" required className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 pl-10 text-white focus:border-amber-500 focus:outline-none" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs text-zinc-500 uppercase font-bold">Senha</label>
                <div className="relative">
                  <input type="password" required className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 pl-10 text-white focus:border-amber-500 focus:outline-none" placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} />
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                </div>
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-4 pt-2 border-t border-zinc-900 animate-fade-in">
                <div className="space-y-1">
                    <label className="text-xs text-zinc-500 uppercase font-bold">Nome Completo</label>
                    <input type="text" required className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none" value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-500 uppercase font-bold">CPF</label>
                        <input type="text" required className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none" value={cpf} onChange={e => setCpf(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-500 uppercase font-bold">Celular</label>
                        <input type="tel" required className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                </div>
            </div>
          )}

          {error && <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20"><AlertCircle size={16} /><span>{error}</span></div>}
          {successMsg && <div className="flex items-center gap-2 text-green-400 text-xs bg-green-500/10 p-3 rounded-lg border border-green-500/20"><CheckCircle2 size={16} /><span>{successMsg}</span></div>}

          <Button fullWidth type="submit" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Entrar' : 'Cadastrar')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-zinc-400 hover:text-amber-500 transition-colors">
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
          </button>
        </div>
      </div>
    </div>
  );
};
