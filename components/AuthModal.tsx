
import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, Loader2, KeyRound, AlertCircle, CheckCircle2, RefreshCw, Terminal, User, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from './Button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  
  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showResend, setShowResend] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessMsg('');
      setShowResend(false);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getCredentials = () => {
    let finalEmail = email.trim();
    let finalPassword = password.trim();

    // --- LÓGICA DE ALIAS DE ADMIN ---
    if (finalEmail === 'admin' && finalPassword === 'admin') {
      finalEmail = 'admin@patanegra.com';
      finalPassword = 'patanegra123';
    }
    // -------------------------------
    return { finalEmail, finalPassword };
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    setShowResend(false);

    const { finalEmail, finalPassword } = getCredentials();

    try {
      if (isLogin) {
        // TENTATIVA DE LOGIN
        const { error } = await supabase.auth.signInWithPassword({ 
          email: finalEmail, 
          password: finalPassword 
        });
        
        if (error) {
            if (error.message.includes('Invalid login') && finalEmail === 'admin@patanegra.com') {
               await performSignUp(finalEmail, finalPassword);
               return; 
            }
            throw error;
        }
      } else {
        // TENTATIVA DE CADASTRO
        await performSignUp(finalEmail, finalPassword);
        return; 
      }
      
      // Se chegou aqui, login bem sucedido
      finishAuth();
      
    } catch (err: any) {
      console.error(err);
      handleAuthError(err, finalEmail);
      setLoading(false);
    }
  };

  const handleAuthError = (err: any, currentEmail: string) => {
    const msg = err.message || '';
    
    if (msg.includes('Invalid login')) {
        setError('Email ou senha incorretos.');
    } else if (msg.includes('Email not confirmed')) {
        // Caso o usuário ainda não tenha desativado no painel, mostramos o erro
        setError('Email não confirmado.');
        setShowResend(true);
    } else if (msg.includes('rate limit')) {
        setError('Muitas tentativas. Aguarde um momento.');
    } else if (msg.includes('User already registered')) {
        setError('Este email já está cadastrado.');
    } else {
        setError(msg || 'Ocorreu um erro ao conectar.');
    }
  };

  const performSignUp = async (emailStr: string, passStr: string) => {
    // Validação básica
    if (!isLogin && !emailStr.includes('admin')) {
        if (fullName.length < 3) {
            setError('Por favor, digite seu nome completo.');
            setLoading(false);
            return;
        }
    }

    const { data, error } = await supabase.auth.signUp({ 
        email: emailStr, 
        password: passStr,
        options: {
          data: {
              full_name: emailStr.includes('admin') ? 'Administrador Patanegra' : fullName,
              phone: phone, 
              role: emailStr.includes('admin') ? 'admin' : 'user'
          }
        }
    });

    if (error) {
        if (emailStr.includes('admin') && (error.message.includes('User already registered') || error.code === 'user_already_exists')) {
            const { error: loginError } = await supabase.auth.signInWithPassword({ 
                email: emailStr, 
                password: passStr 
            });
            if (!loginError) {
                finishAuth();
                return;
            }
        }
        throw error;
    }

    // Com "Confirm Email" desativado no Supabase, data.session virá preenchido.
    if (data.session) {
        finishAuth();
    } else if (data.user) {
        // Se cair aqui, é porque a configuração "Confirm Email" AINDA ESTÁ ATIVADA no Supabase.
        setSuccessMsg('Conta criada! Se o login não for automático, verifique se a confirmação de email está desativada no Supabase.');
        setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    const { finalEmail } = getCredentials();
    const { error } = await supabase.auth.resend({
        type: 'signup',
        email: finalEmail
    });
    
    setLoading(false);
    if (error) {
        setError(error.message);
    } else {
        setSuccessMsg(`Email enviado para ${finalEmail}!`);
        setError('');
        setShowResend(false);
    }
  };

  const finishAuth = () => {
    setLoading(false);
    if (onLoginSuccess) {
        onLoginSuccess();
    } else {
        onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-sm bg-zinc-950 rounded-3xl border border-zinc-800 shadow-2xl p-8 animate-slide-up max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-serif text-white mb-2">
            {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h2>
          <p className="text-zinc-400 text-sm">
            {email === 'admin' ? 'Acesso Administrativo Detectado' : (isLogin ? 'Acesse seus pedidos e agilize sua entrega.' : 'Preencha seus dados para começar.')}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          
          {/* Campos Extras Apenas no Cadastro */}
          {!isLogin && (
            <>
                <div className="space-y-1 animate-fade-in">
                    <label className="text-xs text-zinc-500 uppercase font-bold">Nome Completo</label>
                    <div className="relative">
                    <input 
                        type="text" 
                        required
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 pl-10 text-white focus:border-amber-500 focus:outline-none placeholder-zinc-600"
                        placeholder="Seu nome"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                    />
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    </div>
                </div>

                <div className="space-y-1 animate-fade-in">
                    <label className="text-xs text-zinc-500 uppercase font-bold">Telefone / WhatsApp</label>
                    <div className="relative">
                    <input 
                        type="tel" 
                        required
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 pl-10 text-white focus:border-amber-500 focus:outline-none placeholder-zinc-600"
                        placeholder="(00) 00000-0000"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                    />
                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    </div>
                </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs text-zinc-500 uppercase font-bold">Email ou Usuário</label>
            <div className="relative">
              <input 
                type="text" 
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 pl-10 text-white focus:border-amber-500 focus:outline-none placeholder-zinc-600"
                placeholder="Ex: admin ou seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-500 uppercase font-bold">Senha</label>
            <div className="relative">
              <input 
                type="password" 
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 pl-10 text-white focus:border-amber-500 focus:outline-none placeholder-zinc-600"
                placeholder="••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            </div>
          </div>

          {email === 'admin' && (
            <div className="flex items-center gap-2 p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 animate-fade-in">
                <KeyRound size={14} className="text-amber-500"/>
                <span className="text-xs text-amber-200">Modo Admin. Senha: admin</span>
            </div>
          )}

          {error && (
            <div className="flex flex-col gap-2 text-red-400 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{error}</span>
                </div>
                
                {showResend && (
                    <button 
                        type="button" 
                        onClick={handleResendEmail}
                        className="text-xs text-white bg-red-500/20 hover:bg-red-500/30 py-1.5 px-3 rounded-md transition-colors flex items-center justify-center gap-2 mt-1"
                    >
                        <RefreshCw size={12} />
                        Reenviar confirmação
                    </button>
                )}
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 text-green-400 text-xs bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{successMsg}</span>
            </div>
          )}

          <Button fullWidth type="submit" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Entrar' : 'Cadastrar e Entrar')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccessMsg('');
                setShowResend(false);
            }}
            className="text-sm text-zinc-400 hover:text-amber-500 transition-colors"
          >
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
          </button>
        </div>
      </div>
    </div>
  );
};
