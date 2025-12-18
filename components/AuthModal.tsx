
import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, Loader2, KeyRound, AlertCircle, CheckCircle2, RefreshCw, User, Phone, FileText, MapPin, Upload, CreditCard } from 'lucide-react';
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
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Signup Detailed State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [address, setAddress] = useState('');
  const [bairro, setBairro] = useState('');
  const [city, setCity] = useState('');
  
  // File Upload States (Simulated for this demo)
  const [addressProof, setAddressProof] = useState<File | null>(null);
  const [cnh, setCnh] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showResend, setShowResend] = useState(false);

  // Reset state when modal opens/closes or initialView changes
  useEffect(() => {
    if (isOpen) {
      setIsLogin(initialView === 'login');
      setError('');
      setSuccessMsg('');
      setShowResend(false);
      setLoading(false);
    }
  }, [isOpen, initialView]);

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
    const isAdmin = emailStr.includes('admin');

    // Validação básica de campos obrigatórios no cadastro
    if (!isLogin && !isAdmin) {
        if (!fullName || !phone || !cpf || !rg || !address || !bairro || !city) {
            setError('Por favor, preencha todos os campos obrigatórios.');
            setLoading(false);
            return;
        }
    }

    // 1. Criar usuário na autenticação (Auth)
    const { data, error } = await supabase.auth.signUp({ 
        email: emailStr, 
        password: passStr,
        options: {
          data: {
              full_name: isAdmin ? 'Administrador Patanegra' : fullName,
              phone: phone, 
              // Metadados extras para backup
              cpf: cpf,
              role: isAdmin ? 'admin' : 'user'
          }
        }
    });

    if (error) {
        if (isAdmin && (error.message.includes('User already registered') || error.code === 'user_already_exists')) {
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

    // 2. FORÇAR A GRAVAÇÃO NA TABELA 'profiles'
    if (data.user) {
        const profileData = {
            id: data.user.id,
            email: emailStr,
            full_name: isAdmin ? 'Administrador Patanegra' : fullName,
            phone: phone,
            role: isAdmin ? 'admin' : 'user',
            cpf: cpf,
            rg: rg,
            address: address,
            bairro: bairro,
            city: city,
            // Nota: Em produção real, você faria upload para o Storage e pegaria a URL pública.
            // Aqui estamos salvando o nome do arquivo para referência.
            address_proof_url: addressProof ? addressProof.name : null,
            cnh_url: cnh ? cnh.name : null,
        };

        const { error: profileError } = await supabase
            .from('profiles')
            .upsert(profileData);

        if (profileError) {
            console.error("Erro ao salvar perfil no banco:", profileError);
            // Não bloqueia o fluxo, mas loga o erro. 
            // O usuário foi criado no Auth, mas falhou no Profile.
        }
    }

    if (data.session) {
        finishAuth();
    } else if (data.user) {
        setSuccessMsg('Conta criada! Se o login não for automático, verifique seu email.');
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
      
      <div className="relative w-full max-w-lg bg-zinc-950 rounded-3xl border border-zinc-800 shadow-2xl p-6 md:p-8 animate-slide-up max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors z-20"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-serif text-white mb-2">
            {isLogin ? 'Bem-vindo de volta' : 'Cadastro Completo'}
          </h2>
          <p className="text-zinc-400 text-sm">
            {email === 'admin' ? 'Acesso Administrativo Detectado' : (isLogin ? 'Acesse sua conta para continuar.' : 'Precisamos de alguns dados para aprovar seu cadastro.')}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          
          {/* ==========================================================
              LOGIN FIELDS (Simplified)
             ========================================================== */}
          <div className="space-y-4">
            <div className="space-y-1">
                <label className="text-xs text-zinc-500 uppercase font-bold">Email</label>
                <div className="relative">
                <input 
                    type="text" 
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 pl-10 text-white focus:border-amber-500 focus:outline-none placeholder-zinc-600"
                    placeholder="seu@email.com"
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
          </div>

          {/* ==========================================================
              SIGNUP EXTRA FIELDS
             ========================================================== */}
          {!isLogin && (
            <div className="space-y-4 pt-2 border-t border-zinc-900 animate-fade-in">
                
                <div className="space-y-1">
                    <label className="text-xs text-zinc-500 uppercase font-bold">Nome Completo</label>
                    <div className="relative">
                    <input 
                        type="text" 
                        required={!isLogin}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 pl-10 text-white focus:border-amber-500 focus:outline-none"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                    />
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-500 uppercase font-bold">CPF</label>
                        <div className="relative">
                        <input 
                            type="text" 
                            required={!isLogin}
                            placeholder="000.000.000-00"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none"
                            value={cpf}
                            onChange={e => setCpf(e.target.value)}
                        />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-500 uppercase font-bold">RG</label>
                        <div className="relative">
                        <input 
                            type="text" 
                            required={!isLogin}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none"
                            value={rg}
                            onChange={e => setRg(e.target.value)}
                        />
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-zinc-500 uppercase font-bold">Celular / WhatsApp</label>
                    <div className="relative">
                    <input 
                        type="tel" 
                        required={!isLogin}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 pl-10 text-white focus:border-amber-500 focus:outline-none"
                        placeholder="(00) 00000-0000"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                    />
                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-zinc-500 uppercase font-bold">Endereço Residencial</label>
                    <div className="relative">
                    <input 
                        type="text" 
                        required={!isLogin}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 pl-10 text-white focus:border-amber-500 focus:outline-none"
                        placeholder="Rua, Número..."
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                    />
                    <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-1">
                        <label className="text-xs text-zinc-500 uppercase font-bold">Bairro</label>
                        <input 
                            type="text" 
                            required={!isLogin}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none"
                            value={bairro}
                            onChange={e => setBairro(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-500 uppercase font-bold">Cidade</label>
                        <input 
                            type="text" 
                            required={!isLogin}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none"
                            value={city}
                            onChange={e => setCity(e.target.value)}
                        />
                    </div>
                </div>

                {/* Upload Section - Simulated */}
                <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-500 uppercase font-bold">Foto Comprovante de Endereço</label>
                        <div className="relative border border-dashed border-zinc-700 bg-zinc-900/50 rounded-xl p-4 text-center hover:bg-zinc-900 hover:border-amber-500 transition-colors cursor-pointer">
                            <input 
                                type="file" 
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => setAddressProof(e.target.files?.[0] || null)}
                            />
                            <div className="flex flex-col items-center gap-1 text-zinc-400">
                                <Upload size={20} className={addressProof ? 'text-green-500' : 'text-zinc-500'}/>
                                <span className="text-xs">{addressProof ? addressProof.name : 'Toque para enviar foto'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-zinc-500 uppercase font-bold">Foto da CNH</label>
                        <div className="relative border border-dashed border-zinc-700 bg-zinc-900/50 rounded-xl p-4 text-center hover:bg-zinc-900 hover:border-amber-500 transition-colors cursor-pointer">
                            <input 
                                type="file" 
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => setCnh(e.target.files?.[0] || null)}
                            />
                            <div className="flex flex-col items-center gap-1 text-zinc-400">
                                <CreditCard size={20} className={cnh ? 'text-green-500' : 'text-zinc-500'}/>
                                <span className="text-xs">{cnh ? cnh.name : 'Toque para enviar foto'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          )}

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
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Entrar' : 'Cadastrar')}
          </Button>
        </form>

        <div className="mt-6 text-center pb-safe">
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
