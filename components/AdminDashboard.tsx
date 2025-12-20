
import React, { useEffect, useState } from 'react';
import { X, TrendingUp, DollarSign, Package, MapPin, Loader2, Clock, CheckCircle2, XCircle, Bike, Search, CreditCard, Phone, Mail, ShoppingBag, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Order, UserProfile, OrderItem } from '../types';
import { Button } from './Button';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TopProduct {
  name: string;
  quantity: number;
}

const STATUS_CONFIG: Record<string, { color: string }> = {
    'Em Andamento': { color: 'text-amber-500 bg-amber-500/10' },
    'A Caminho': { color: 'text-blue-500 bg-blue-500/10' },
    'Entregue': { color: 'text-green-500 bg-green-500/10' },
    'Cancelado': { color: 'text-red-500 bg-red-500/10' }
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'customers' | 'metrics'>('orders');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'orders') fetchOrders();
      else if (activeTab === 'customers') fetchProfiles();
      else if (activeTab === 'metrics') fetchMetrics();
    }
  }, [isOpen, activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  };

  const fetchProfiles = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('full_name');
    if (data) setProfiles(data);
    setLoading(false);
  };

  const fetchMetrics = async () => {
    setLoading(true);
    const { data: orderItems } = await supabase.from('order_items').select('product_name, quantity');
    
    if (orderItems) {
      const counts: Record<string, number> = {};
      orderItems.forEach((item: any) => {
        counts[item.product_name] = (counts[item.product_name] || 0) + item.quantity;
      });
      
      const sorted = Object.entries(counts)
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
      
      setTopProducts(sorted);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (!error) fetchOrders();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-950 pt-12">
        <div>
          <h2 className="text-2xl font-serif text-amber-500">Gestão Patanegra</h2>
          <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">Painel de Controle Administrativo</p>
        </div>
        <button onClick={onClose} className="p-3 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors"><X size={24} /></button>
      </div>

      {/* Tabs */}
      <div className="flex px-6 border-b border-zinc-900 gap-8 bg-zinc-950">
        {[
          { id: 'orders', label: 'Pedidos' },
          { id: 'customers', label: 'Clientes' },
          { id: 'metrics', label: 'Métricas' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)} 
            className={`py-5 text-[11px] font-black uppercase tracking-[0.2em] border-b-2 transition-all ${activeTab === tab.id ? 'border-amber-500 text-white' : 'border-transparent text-zinc-600'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-amber-500" size={32} />
            <span className="text-[10px] text-zinc-500 uppercase font-black">Carregando dados...</span>
          </div>
        ) : activeTab === 'orders' ? (
          <div className="space-y-4 pb-10">
            {orders.map(o => (
              <div key={o.id} className="bg-zinc-900/40 border border-zinc-900 p-5 rounded-2xl">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col">
                    <span className="text-amber-500 font-black text-[10px] uppercase tracking-tighter">#{o.id.slice(0,8)}</span>
                    <h4 className="text-white font-bold text-base mt-1">{o.customer_name}</h4>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-full border border-zinc-800 ${STATUS_CONFIG[o.status]?.color || 'bg-zinc-800'}`}>{o.status}</span>
                </div>
                
                <div className="flex items-center gap-2 text-zinc-400 text-xs mb-4">
                  <MapPin size={12} className="text-zinc-600" />
                  <span className="line-clamp-1">{o.delivery_address || 'Endereço não informado'}</span>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {['Em Andamento', 'A Caminho', 'Entregue', 'Cancelado'].map(s => (
                    <button 
                      key={s} 
                      onClick={() => updateStatus(o.id, s)} 
                      className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-bold transition-all border ${o.status === s ? 'bg-amber-500 border-amber-500 text-black' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-white'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'customers' ? (
          <div className="space-y-4 pb-10">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input 
                placeholder="BUSCAR CLIENTE..." 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 pl-12 text-[11px] font-black uppercase tracking-widest text-white outline-none focus:border-amber-500" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
            </div>
            {profiles.filter(p => p.full_name?.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
              <div key={p.id} className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-2xl flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-white font-bold text-sm tracking-tight">{p.full_name || 'Sem Nome'}</h4>
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-black text-amber-500">
                    {p.full_name?.substring(0,1).toUpperCase()}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-3 text-zinc-400">
                    <Phone size={14} className="text-zinc-600" />
                    <span className="text-[11px] font-medium">{p.phone || 'Sem telefone'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-400">
                    <MapPin size={14} className="text-zinc-600" />
                    <span className="text-[11px] font-medium leading-relaxed">{p.address ? `${p.address}, ${p.bairro} - ${p.city}` : 'Endereço não cadastrado'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6 pb-10">
            <div className="bg-zinc-900/40 border border-zinc-900 p-6 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <Star className="text-amber-500" size={20} fill="#F59E0B" />
                <h3 className="text-white font-serif text-lg">Itens Mais Pedidos</h3>
              </div>
              <div className="space-y-4">
                {topProducts.map((prod, idx) => (
                  <div key={prod.name} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <span className="text-zinc-600 font-serif italic text-xl w-6">0{idx + 1}</span>
                      <span className="text-zinc-300 text-sm font-bold group-hover:text-amber-500 transition-colors">{prod.name}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-white font-black text-sm">{prod.quantity}</span>
                      <span className="text-[8px] text-zinc-600 uppercase font-black">Unidades</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-900 flex flex-col items-center justify-center text-center">
                  <ShoppingBag className="text-zinc-700 mb-2" size={20} />
                  <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Total Pedidos</span>
                  <span className="text-xl font-bold text-white mt-1">{orders.length}</span>
               </div>
               <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-900 flex flex-col items-center justify-center text-center">
                  <DollarSign className="text-zinc-700 mb-2" size={20} />
                  <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Faturamento</span>
                  <span className="text-xl font-bold text-amber-500 mt-1">R$ {orders.reduce((acc, o) => acc + (o.status !== 'Cancelado' ? o.total : 0), 0).toFixed(0)}</span>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
