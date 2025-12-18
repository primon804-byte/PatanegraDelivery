
import React, { useEffect, useState } from 'react';
import { X, User, ShoppingBag, LogOut, ShieldCheck, MapPin, Phone, Loader2, Crown, Edit2, Save, CreditCard, FileText, Home } from 'lucide-react';
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
  const { user, signOut, isAdmin } = useAuth();
  const [history, setHistory] = useState<OrderHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
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
    if (isOpen && user) {
      fetchHistory();
      // Initialize form with user data
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        address: user.address || '',
        bairro: user.bairro || '',
        city: user.city || '',
        cpf: user.cpf || '',
        rg: user.rg || ''
      });
      setIsEditing(false);
    }
  }, [isOpen, user]);

  const fetchHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        total,
        status,
        order_items (
           product_name,
           quantity
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const formattedHistory: OrderHistoryItem[] = data.map((order: any) => {
        const summary = order.order_items
          .map((item: any) => `${item.quantity}x ${item.product_name}`)
          .join(', ');
          
        return {
          id: `#${order.id.slice(0, 5).toUpperCase()}`,
          date: new Date(order.created_at).toLocaleDateString('pt-BR'),
          total: order.total,
          status: order.status,
          itemsSummary: summary || 'Pedido sem itens'
        };
      });
      setHistory(formattedHistory);
    }
    setLoadingHistory(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    
    try {
        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: formData.full_name,
                phone: formData.phone,
                address: formData.address,
                bairro: formData.bairro,
                city: formData.city,
                cpf: formData.cpf,
                rg: formData.rg
            })
            .eq('id', user.id);

        if (error) throw error;
        
        setIsEditing(false);
        // Em um app real, idealmente atualizariamos o contexto de Auth aqui
        // mas o supabase lida com sessão. Para refletir na UI imediata, o form já está atualizado.
        
    } catch (err) {
        console.error("Erro ao salvar:", err);
        alert("Erro ao atualizar perfil. Tente novamente.");
    } finally {
        setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-[85vw] sm:max-w-md h-full bg-zinc-950 border-l border-zinc-800 shadow-2xl animate-slide-left flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
           <h2 className="text-xl font-serif text-white">Menu do Cliente</h2>
           <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white">
             <X size={24} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* User Info Header */}
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-2 shadow-lg ${isAdmin ? 'bg-amber-500 text-black border-white' : 'bg-zinc-800 border-zinc-700 text-zinc-200'}`}>
              {formData.full_name ? formData.full_name.substring(0,2).toUpperCase() : <User size={24} />}
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg leading-tight mb-1">{formData.full_name || 'Usuário'}</h3>
              <p className="text-zinc-500 text-xs">{user?.email}</p>
              {isAdmin && (
                <div className="flex items-center gap-1 mt-1 text-amber-500">
                    <Crown size={12} fill="currentColor"/>
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                    Administrador
                    </span>
                </div>
              )}
            </div>
            
            {/* Edit Toggle Button */}
            <button 
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                disabled={isSaving}
                className={`p-2 rounded-full border transition-all ${isEditing 
                    ? 'bg-green-500 text-black border-green-500 hover:bg-green-400' 
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-600'}`}
            >
                {isSaving ? <Loader2 size={18} className="animate-spin"/> : isEditing ? <Save size={18}/> : <Edit2 size={18}/>}
            </button>
          </div>

          {/* User Details Form/Display */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Meus Dados</h4>
                {isEditing && <span className="text-[10px] text-amber-500 animate-pulse">Editando...</span>}
            </div>
            
            <div className="space-y-3">
               {/* Nome */}
               <div className={`p-3 rounded-lg border flex items-center gap-3 transition-colors ${isEditing ? 'bg-zinc-900 border-zinc-700 focus-within:border-amber-500' : 'bg-zinc-900/50 border-zinc-800/50'}`}>
                  <User size={18} className="text-zinc-600 shrink-0" />
                  <div className="flex-1">
                      {isEditing ? (
                          <input 
                            className="w-full bg-transparent border-none outline-none text-white text-sm placeholder-zinc-600"
                            placeholder="Nome Completo"
                            value={formData.full_name}
                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                          />
                      ) : (
                          <span className="text-zinc-300 text-sm block">{formData.full_name || 'Sem nome'}</span>
                      )}
                  </div>
               </div>

               {/* CPF & RG */}
               <div className="grid grid-cols-2 gap-3">
                   <div className={`p-3 rounded-lg border flex items-center gap-2 transition-colors ${isEditing ? 'bg-zinc-900 border-zinc-700 focus-within:border-amber-500' : 'bg-zinc-900/50 border-zinc-800/50'}`}>
                      <CreditCard size={16} className="text-zinc-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                          {isEditing ? (
                              <input 
                                className="w-full bg-transparent border-none outline-none text-white text-sm placeholder-zinc-600"
                                placeholder="CPF"
                                value={formData.cpf}
                                onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                              />
                          ) : (
                              <div className="flex flex-col">
                                <span className="text-[10px] text-zinc-500 uppercase">CPF</span>
                                <span className="text-zinc-300 text-sm truncate">{formData.cpf || '-'}</span>
                              </div>
                          )}
                      </div>
                   </div>
                   <div className={`p-3 rounded-lg border flex items-center gap-2 transition-colors ${isEditing ? 'bg-zinc-900 border-zinc-700 focus-within:border-amber-500' : 'bg-zinc-900/50 border-zinc-800/50'}`}>
                      <FileText size={16} className="text-zinc-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                          {isEditing ? (
                              <input 
                                className="w-full bg-transparent border-none outline-none text-white text-sm placeholder-zinc-600"
                                placeholder="RG"
                                value={formData.rg}
                                onChange={(e) => setFormData({...formData, rg: e.target.value})}
                              />
                          ) : (
                              <div className="flex flex-col">
                                <span className="text-[10px] text-zinc-500 uppercase">RG</span>
                                <span className="text-zinc-300 text-sm truncate">{formData.rg || '-'}</span>
                              </div>
                          )}
                      </div>
                   </div>
               </div>

               {/* Phone */}
               <div className={`p-3 rounded-lg border flex items-center gap-3 transition-colors ${isEditing ? 'bg-zinc-900 border-zinc-700 focus-within:border-amber-500' : 'bg-zinc-900/50 border-zinc-800/50'}`}>
                  <Phone size={18} className="text-zinc-600 shrink-0" />
                  <div className="flex-1">
                      {isEditing ? (
                          <input 
                            className="w-full bg-transparent border-none outline-none text-white text-sm placeholder-zinc-600"
                            placeholder="Telefone"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          />
                      ) : (
                          <span className="text-zinc-300 text-sm block">{formData.phone || 'Sem telefone'}</span>
                      )}
                  </div>
               </div>

               {/* Address */}
               <div className={`p-3 rounded-lg border flex items-start gap-3 transition-colors ${isEditing ? 'bg-zinc-900 border-zinc-700 focus-within:border-amber-500' : 'bg-zinc-900/50 border-zinc-800/50'}`}>
                  <MapPin size={18} className="text-zinc-600 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2">
                      {isEditing ? (
                          <>
                            <input 
                                className="w-full bg-transparent border-none outline-none text-white text-sm placeholder-zinc-600 border-b border-zinc-800 pb-1 mb-1"
                                placeholder="Endereço Completo"
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input 
                                    className="w-full bg-transparent border-none outline-none text-white text-xs placeholder-zinc-600"
                                    placeholder="Bairro"
                                    value={formData.bairro}
                                    onChange={(e) => setFormData({...formData, bairro: e.target.value})}
                                />
                                <input 
                                    className="w-full bg-transparent border-none outline-none text-white text-xs placeholder-zinc-600"
                                    placeholder="Cidade"
                                    value={formData.city}
                                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                                />
                            </div>
                          </>
                      ) : (
                          <div className="flex flex-col">
                             <span className="text-zinc-300 text-sm block">{formData.address || 'Endereço não cadastrado'}</span>
                             {(formData.bairro || formData.city) && (
                                 <span className="text-zinc-500 text-xs">{formData.bairro} - {formData.city}</span>
                             )}
                          </div>
                      )}
                  </div>
               </div>
            </div>
            {isEditing && (
                <Button fullWidth onClick={handleSaveProfile} disabled={isSaving} className="mt-2 h-10 text-sm">
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            )}
          </div>

          {/* Admin Action */}
          {isAdmin && (
            <div className="bg-gradient-to-r from-amber-950 to-zinc-900 border border-amber-500/50 p-5 rounded-2xl shadow-lg relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <ShieldCheck size={80} />
               </div>
               <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 text-amber-500">
                        <ShieldCheck size={20} />
                        <span className="font-bold text-sm uppercase tracking-wide">Área Restrita</span>
                    </div>
                    <p className="text-zinc-300 text-sm mb-4 max-w-[80%]">Gerencie pedidos, acompanhe vendas e métricas em tempo real.</p>
                    <Button fullWidth onClick={onOpenAdmin} className="shadow-amber-900/50">Abrir Painel Admin</Button>
               </div>
            </div>
          )}

          {/* Order History */}
          <div className="space-y-4">
            <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Histórico de Pedidos</h4>
            
            {loadingHistory ? (
                <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-amber-500" size={24} />
                </div>
            ) : history.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-zinc-900 rounded-xl">
                    <ShoppingBag className="mx-auto text-zinc-700 mb-2" size={32}/>
                    <p className="text-zinc-500 text-sm">Você ainda não tem pedidos.</p>
                </div>
            ) : (
                history.map(order => (
                <div key={order.id} className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50 flex justify-between items-center hover:border-zinc-700 transition-colors">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                        <span className="text-amber-500 font-bold text-sm">{order.id}</span>
                        <span className="text-zinc-600 text-xs">• {order.date}</span>
                        </div>
                        <p className="text-zinc-300 text-xs line-clamp-1 max-w-[150px]">{order.itemsSummary}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-white font-bold text-sm">R$ {order.total.toFixed(2)}</div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${order.status === 'Cancelado' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                            {order.status}
                        </span>
                    </div>
                </div>
                ))
            )}
          </div>

        </div>

        <div className="p-6 border-t border-zinc-900 bg-zinc-950 pb-safe">
          <button 
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 text-zinc-500 hover:text-red-500 transition-colors p-3 rounded-xl hover:bg-zinc-900"
          >
            <LogOut size={18} />
            <span className="font-semibold text-sm">Sair da Conta</span>
          </button>
        </div>

      </div>
    </div>
  );
};
