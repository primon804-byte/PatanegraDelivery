
import React, { useEffect, useState } from 'react';
import { X, User, ShoppingBag, LogOut, ShieldCheck, MapPin, Phone, Loader2, Crown, Edit2, Save, CreditCard, FileText, AlertTriangle, CheckCircle2, Award, Target, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './Button';
import { OrderHistoryItem } from '../types';
import { supabase } from '../lib/supabase';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmin: () => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ isOpen, onClose, onOpenAdmin }) => {
  const { user, signOut, isAdmin, refreshUser } = useAuth();
  const [history, setHistory] = useState<OrderHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    bairro: '',
    city: '',
    cpf: '',
    rg: ''
  });

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        address: user.address || '',
        bairro: user.bairro || '',
        city: user.city || '',
        cpf: user.cpf || '',
        rg: user.rg || ''
      });
      fetchHistory();
    }
  }, [user, isOpen]);

  const fetchHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    const { data } = await supabase
      .from('orders')
      .select('id, created_at, total, status, order_items(product_name, quantity)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setHistory(data.map((o: any) => ({
        id: `#${o.id.slice(0, 5).toUpperCase()}`,
        date: new Date(o.created_at).toLocaleDateString('pt-BR'),
        total: o.total,
        status: o.status,
        itemsSummary: o.order_items.map((i: any) => `${i.quantity}x ${i.product_name}`).join(', ')
      })));
    }
    setLoadingHistory(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setErrorMsg(null);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id);

      if (error) throw error;
      
      await refreshUser();
      setIsEditing(false);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col animate-slide-left">
        <div className="flex items-center justify-between p-6 border-b border-zinc-900 bg-zinc-950 pt-12">
           <h2 className="text-xl font-serif text-white">Minha Conta</h2>
           <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white transition-colors"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* User Info Card */}
          <div className="flex items-center gap-4 bg-zinc-900/40 p-5 rounded-3xl border border-zinc-900">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold border ${isAdmin ? 'bg-amber-500 border-amber-400 text-black' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
              {user?.full_name ? user.full_name.substring(0,2).toUpperCase() : <User size={24} />}
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold leading-tight">{user?.full_name || 'Usuário'}</h3>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-0.5">{user?.role}</p>
            </div>
            <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={isSaving}
                className={`p-3 rounded-2xl border transition-all ${isEditing ? 'bg-green-500 text-black border-green-500 shadow-lg shadow-green-500/20' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}
            >
                {isSaving ? <Loader2 size={18} className="animate-spin"/> : isEditing ? <Save size={18}/> : <Edit2 size={18}/>}
            </button>
          </div>

          {/* Missions Quick View */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h4 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Conquistas Patanegra</h4>
                <div className="flex items-center gap-1.5 text-amber-500 font-bold text-[10px] uppercase">
                    <Target size={12} /> 1/5 Ativas
                </div>
            </div>
            <div className="bg-zinc-900/50 rounded-2xl p-5 border border-amber-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 blur-3xl rounded-full" />
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-amber-500/30 flex items-center justify-center text-amber-500">
                        <Award size={20} />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-white text-xs font-bold">Mestre dos Estilos</span>
                            <span className="text-amber-500 text-[9px] font-black uppercase">15% OFF</span>
                        </div>
                        <div className="h-1.5 w-full bg-black rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 w-[20%] shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* Cadastro Data */}
          <div className="space-y-4">
            <h4 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] px-1">Dados Cadastrais</h4>
            <div className="grid grid-cols-1 gap-3">
               <div className="bg-zinc-900/30 p-4 rounded-2xl border border-zinc-900">
                  <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Nome Completo</label>
                  {isEditing ? <input className="w-full bg-transparent outline-none text-white text-sm mt-1 focus:text-amber-500 transition-colors" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} /> : <span className="block text-zinc-200 text-sm mt-1 font-medium">{user?.full_name || '-'}</span>}
               </div>
               
               <div className="grid grid-cols-2 gap-3">
                 <div className="bg-zinc-900/30 p-4 rounded-2xl border border-zinc-900">
                    <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">CPF</label>
                    {isEditing ? <input className="w-full bg-transparent outline-none text-white text-sm mt-1 focus:text-amber-500 transition-colors" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} /> : <span className="block text-zinc-200 text-sm mt-1 font-medium">{user?.cpf || '-'}</span>}
                 </div>
                 <div className="bg-zinc-900/30 p-4 rounded-2xl border border-zinc-900">
                    <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">RG</label>
                    {isEditing ? <input className="w-full bg-transparent outline-none text-white text-sm mt-1 focus:text-amber-500 transition-colors" value={formData.rg} onChange={e => setFormData({...formData, rg: e.target.value})} /> : <span className="block text-zinc-200 text-sm mt-1 font-medium">{user?.rg || '-'}</span>}
                 </div>
               </div>

               <div className="bg-zinc-900/30 p-4 rounded-2xl border border-zinc-900">
                  <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">WhatsApp</label>
                  {isEditing ? <input className="w-full bg-transparent outline-none text-white text-sm mt-1 focus:text-amber-500 transition-colors" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /> : <span className="block text-zinc-200 text-sm mt-1 font-medium">{user?.phone || '-'}</span>}
               </div>

               <div className="bg-zinc-900/30 p-4 rounded-2xl border border-zinc-900">
                  <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Endereço de Entrega</label>
                  {isEditing ? (
                    <div className="space-y-3 mt-3">
                       <input className="w-full bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs text-white focus:border-amber-500 outline-none" placeholder="Rua e Número" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                       <div className="grid grid-cols-2 gap-3">
                          <input className="w-full bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs text-white focus:border-amber-500 outline-none" placeholder="Bairro" value={formData.bairro} onChange={e => setFormData({...formData, bairro: e.target.value})} />
                          <input className="w-full bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs text-white focus:border-amber-500 outline-none" placeholder="Cidade" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                       </div>
                    </div>
                  ) : <span className="block text-zinc-200 text-sm mt-1 font-medium leading-relaxed">{user?.address || '-'}, {user?.bairro} • {user?.city}</span>}
               </div>
            </div>
          </div>

          {isAdmin && (
            <div className="pt-2">
              <Button fullWidth onClick={onOpenAdmin} variant="secondary" className="border border-amber-500/20 py-4 shadow-xl">
                <ShieldCheck size={18} className="mr-3 text-amber-500" /> PAINEL ADMINISTRATIVO
              </Button>
            </div>
          )}

          <div className="space-y-4">
            <h4 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] px-1">Histórico</h4>
            {loadingHistory ? <div className="flex justify-center py-4"><Loader2 className="animate-spin text-amber-500" /></div> : history.length === 0 ? <p className="text-zinc-600 text-xs text-center py-4">Nenhum pedido realizado ainda.</p> : (
              <div className="space-y-3">
                {history.map(o => (
                  <div key={o.id} className="bg-zinc-900/20 border border-zinc-900 p-4 rounded-2xl flex justify-between items-center group hover:border-zinc-700 transition-colors">
                    <div>
                      <div className="text-[11px] font-black text-white">{o.id}</div>
                      <div className="text-[9px] text-zinc-500 uppercase mt-0.5">{o.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-500 font-bold text-sm">R$ {o.total.toFixed(2)}</div>
                      <div className="text-[8px] uppercase font-black text-zinc-600">{o.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-zinc-900 bg-zinc-950">
          <button onClick={signOut} className="w-full flex items-center justify-center gap-2 text-zinc-600 hover:text-red-500 transition-colors uppercase text-[10px] font-black tracking-[0.3em]">
            <LogOut size={16} /> Encerrar Sessão
          </button>
        </div>
      </div>
    </div>
  );
};
