import React, { useEffect, useState } from 'react';
import { X, TrendingUp, DollarSign, Package, MapPin, Loader2, Lock, CheckCircle2, Clock, ShoppingBag, User, XCircle, Bike, UploadCloud, Users, FileText, Search, Download, CreditCard, Home, Phone, RefreshCw, AlertTriangle, Database, Check } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { supabase } from '../lib/supabase';
import { Order, OrderItem, UserProfile } from '../types';
import { PRODUCTS } from '../constants';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DashboardMetrics {
  revenue: number;
  orderCount: number;
  salesData: { name: string; vendas: number }[];
  topProducts: { name: string; qtd: number }[];
  locationStats: { name: string; percent: number; color: string }[];
}

const STATUS_CONFIG: Record<string, { color: string, icon: any, label: string }> = {
    'Em Andamento': { color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: Clock, label: 'Pendente' },
    'A Caminho': { color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', icon: Bike, label: 'A Caminho' },
    'Entregue': { color: 'text-green-500 bg-green-500/10 border-green-500/20', icon: CheckCircle2, label: 'Entregue' },
    'Concluído': { color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20', icon: CheckCircle2, label: 'Finalizado' },
    'Cancelado': { color: 'text-red-500 bg-red-500/10 border-red-500/20', icon: XCircle, label: 'Cancelado' }
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profiles'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncingProfiles, setSyncingProfiles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'official' | 'derived'>('official');
  
  // Dashboard Data
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    revenue: 0,
    orderCount: 0,
    salesData: [],
    topProducts: [],
    locationStats: []
  });

  // Profiles Data
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'dashboard') {
        fetchDashboardData();
      } else {
        fetchProfilesData();
      }
    }
  }, [isOpen, activeTab]);

  const fetchProfilesData = async () => {
    setLoading(true);
    setError(null);
    try {
        // TENTATIVA 1: Buscar da tabela oficial de perfis
        const { data, error } = await supabase
            .from('profiles')
            .select('*');
        
        if (error) throw error;
        
        const sortedData = (data as UserProfile[] || []).sort((a, b) => {
             const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
             const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
             return dateB - dateA;
        });

        setProfiles(sortedData);
        setDataSource('official');

    } catch (err: any) {
        console.warn('Falha ao acessar tabela profiles (RLS), tentando fallback via pedidos...', err);
        
        // TENTATIVA 2 (FALLBACK): Derivar clientes a partir dos pedidos
        // Isso funciona porque o admin geralmente tem acesso à tabela de pedidos
        await deriveProfilesFromOrders();
    } finally {
        setLoading(false);
    }
  };

  const deriveProfilesFromOrders = async () => {
      try {
          const { data: ordersData, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
              throw new Error(`Erro fatal: ${error.message}`);
          }

          const uniqueUsers = new Map<string, UserProfile>();

          ordersData.forEach((order: Order) => {
             // Usa telefone ou nome como chave única se o ID do usuário não for confiável ou repetido
             const key = order.customer_phone || order.customer_name || 'unknown';
             
             if (!uniqueUsers.has(key)) {
                 uniqueUsers.set(key, {
                     id: order.user_id || `temp-${Math.random()}`,
                     full_name: order.customer_name || 'Cliente Sem Nome',
                     phone: order.customer_phone,
                     address: order.delivery_address || order.event_address,
                     role: 'user',
                     city: order.branch_location,
                     email: 'Email não registrado (Via Pedido)', 
                     created_at: order.created_at,
                     // Dados que não temos no pedido ficam vazios
                     cpf: undefined,
                     rg: undefined,
                     cnh_url: undefined,
                     address_proof_url: undefined
                 });
             }
          });
          
          setProfiles(Array.from(uniqueUsers.values()));
          setDataSource('derived');
          // Limpamos o erro pois o fallback funcionou
          setError(null); 
      } catch (err: any) {
          setError(`Não foi possível carregar a lista de clientes: ${err.message}`);
      }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      const fetchedOrders = ordersData as Order[];
      setOrders(fetchedOrders);

      // --- Process Metrics ---
      const items: OrderItem[] = fetchedOrders.flatMap(o => o.order_items || []);

      const revenue = fetchedOrders.reduce((acc, order) => {
        return order.status !== 'Cancelado' ? acc + Number(order.total) : acc;
      }, 0);
      const orderCount = fetchedOrders.filter(o => o.status !== 'Cancelado').length;

      // Chart Data (Last 7 Days)
      const salesMap = new Map<string, number>();
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo);
        d.setDate(d.getDate() + i);
        const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' });
        const formattedName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
        salesMap.set(formattedName, 0);
      }

      fetchedOrders.forEach(order => {
        if (order.status === 'Cancelado') return;
        const orderDate = new Date(order.created_at);
        if (isNaN(orderDate.getTime())) return;

        if (orderDate >= sevenDaysAgo) {
          const dayName = orderDate.toLocaleDateString('pt-BR', { weekday: 'short' });
          const formattedName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
          if (salesMap.has(formattedName)) {
            salesMap.set(formattedName, (salesMap.get(formattedName) || 0) + Number(order.total));
          }
        }
      });

      const salesData = Array.from(salesMap).map(([name, vendas]) => ({ name, vendas }));

      // Top Products
      const productCount: Record<string, number> = {};
      items.forEach(item => {
        productCount[item.product_name] = (productCount[item.product_name] || 0) + item.quantity;
      });

      const topProducts = Object.entries(productCount)
        .map(([name, qtd]) => ({ name, qtd }))
        .sort((a, b) => b.qtd - a.qtd)
        .slice(0, 3);

      // Location Stats
      const locationCount: Record<string, number> = {};
      fetchedOrders.forEach(order => {
        if (order.branch_location) {
          locationCount[order.branch_location] = (locationCount[order.branch_location] || 0) + 1;
        }
      });
      
      const totalLoc = Object.values(locationCount).reduce((a, b) => a + b, 0) || 1;
      const locationStats = [
        { 
            name: 'Marechal Cândido Rondon', 
            percent: Math.round(((locationCount['Marechal Cândido Rondon'] || 0) / totalLoc) * 100),
            color: 'bg-amber-500'
        },
        { 
            name: 'Foz do Iguaçu', 
            percent: Math.round(((locationCount['Foz do Iguaçu'] || 0) / totalLoc) * 100),
            color: 'bg-blue-500'
        }
      ];

      setMetrics({ revenue, orderCount, salesData, topProducts, locationStats });

    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      if (err.code === '42501' || err.message?.includes('violates row level security')) {
        setError('Acesso Negado: Sua conta não possui privilégios de Administrador no banco de dados.');
      } else {
        setError(`Erro ao carregar dados: ${err.message || 'Erro desconhecido'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
        const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
        
        if (error) throw error;

        // Optimistic Update
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrder && selectedOrder.id === orderId) {
            setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
    } catch (err: any) {
        console.error("Failed to update status", err);
        alert(`Erro ao atualizar status: ${err.message}`);
    }
  };

  const handleSyncProducts = async () => {
    if (!confirm("Isso enviará todos os produtos do código (constants.ts) para o banco de dados. Deseja continuar?")) return;
    setSyncing(true);
    try {
        const productsToUpload = PRODUCTS.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            image: p.image,
            category: p.category,
            type: p.type,
            volume_liters: p.volumeLiters,
            is_popular: p.isPopular,
            abv: p.abv,
            ibu: p.ibu,
            pairing: p.pairing
        }));
        const { error } = await supabase.from('products').upsert(productsToUpload);
        if (error) throw error;
        alert(`${productsToUpload.length} produtos sincronizados com sucesso!`);
    } catch (err: any) {
        console.error("Sync error:", err);
        alert(`Erro ao sincronizar: ${err.message}`);
    } finally {
        setSyncing(false);
    }
  };

  const handleSyncProfiles = async () => {
    // Only works if RPC is available, otherwise re-fetches
    setSyncingProfiles(true);
    try {
        const { error } = await supabase.rpc('sync_users_metadata');
        if (error) console.warn("RPC Sync failed, maybe missing function", error);
        
        // Always re-fetch
        await fetchProfilesData();
        if (!error) alert('Sincronização concluída!');
    } catch (err) {
        await fetchProfilesData();
    } finally {
        setSyncingProfiles(false);
    }
  };

  const getStatusStyle = (status: string) => STATUS_CONFIG[status] || STATUS_CONFIG['Em Andamento'];

  // Filter profiles
  const filteredProfiles = profiles.filter(p => 
     p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     p.cpf?.includes(searchTerm) ||
     p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col animate-fade-in overflow-hidden">
      
      {/* --- Detail Modal Overlay (Orders) --- */}
      {selectedOrder && (
          <div className="absolute inset-0 z-[210] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
             <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
                    <div>
                        <h3 className="text-white font-serif text-lg">Detalhes do Pedido</h3>
                        <p className="text-zinc-500 text-xs uppercase font-bold tracking-wider">#{selectedOrder.id.slice(0,8)}</p>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className={`flex items-center justify-between p-4 rounded-xl border ${getStatusStyle(selectedOrder.status).color}`}>
                        <div className="flex items-center gap-3">
                             {React.createElement(getStatusStyle(selectedOrder.status).icon, { size: 24 })}
                             <div>
                                <span className="block text-xs uppercase font-bold tracking-wider opacity-70">Status Atual</span>
                                <span className="font-bold text-lg">{selectedOrder.status}</span>
                             </div>
                        </div>
                    </div>
                    
                    {/* Render order items inside detail view for quick reference */}
                    <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Itens do Pedido</h4>
                        <ul className="space-y-2">
                            {selectedOrder.order_items?.map((item, idx) => (
                                <li key={idx} className="flex justify-between text-sm text-zinc-300">
                                    <span>{item.quantity}x {item.product_name}</span>
                                    <span className="text-zinc-500">R$ {item.price.toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Alterar Status</h4>
                        {/* FULL GRID OF OPTIONS - NO RESTRICTIONS */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {Object.entries(STATUS_CONFIG).map(([statusKey, config]) => {
                                const isActive = selectedOrder.status === statusKey;
                                return (
                                    <button 
                                        key={statusKey}
                                        onClick={() => updateOrderStatus(selectedOrder.id, statusKey)}
                                        disabled={isActive}
                                        className={`
                                            p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all
                                            ${isActive 
                                                ? 'bg-zinc-800 border-zinc-700 opacity-70 cursor-default ring-1 ring-zinc-600' 
                                                : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-amber-500 hover:scale-[1.02]'
                                            }
                                        `}
                                    >
                                        <div className="relative">
                                            {React.createElement(config.icon, { 
                                                size: 20, 
                                                className: isActive ? 'text-zinc-400' : config.color.split(' ')[0].replace('text-', 'text-') 
                                            })}
                                            {isActive && (
                                                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                                                    <Check size={8} className="text-black" strokeWidth={4} />
                                                </div>
                                            )}
                                        </div>
                                        <span className={`text-[10px] font-bold ${isActive ? 'text-zinc-400' : 'text-zinc-300'}`}>
                                            {config.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
             </div>
          </div>
      )}

      {/* --- Main Dashboard Header & Tabs --- */}
      <div className="bg-zinc-950 border-b border-zinc-800">
          <div className="flex items-center justify-between p-6 pb-2">
            <div>
            <h2 className="text-2xl font-serif text-amber-500">Painel Administrativo</h2>
            <p className="text-zinc-500 text-xs">Gestão Completa</p>
            </div>
            <div className="flex items-center gap-3">
                {activeTab === 'dashboard' && (
                    <button
                        onClick={handleSyncProducts}
                        disabled={syncing}
                        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                        {syncing ? <Loader2 className="animate-spin" size={14}/> : <UploadCloud size={14}/>}
                        <span className="hidden sm:inline">Sincronizar Catálogo</span>
                    </button>
                )}
                <button 
                    onClick={onClose}
                    className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex px-6 gap-6">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'dashboard' ? 'text-white border-amber-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
              >
                 <TrendingUp size={16} /> Visão Geral
              </button>
              <button 
                onClick={() => setActiveTab('profiles')}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'profiles' ? 'text-white border-amber-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
              >
                 <Users size={16} /> Gerenciar Clientes
              </button>
          </div>
      </div>

      {/* --- Content Body --- */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-950">
        
        {loading ? (
            <div className="h-64 flex items-center justify-center flex-col gap-4">
                <Loader2 className="animate-spin text-amber-500" size={32} />
                <span className="text-zinc-500 text-sm">Carregando dados...</span>
            </div>
        ) : error ? (
             <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                    <Lock size={32} />
                </div>
                <h3 className="text-white font-bold text-lg">Acesso Negado ou Erro</h3>
                <p className="text-zinc-400 max-w-sm">{error}</p>
                <button 
                    onClick={activeTab === 'dashboard' ? fetchDashboardData : fetchProfilesData} 
                    className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 text-sm font-semibold mt-4"
                >
                    Tentar Novamente
                </button>
            </div>
        ) : (
            <>
                {/* === DASHBOARD VIEW === */}
                {activeTab === 'dashboard' && (
                    <>
                         {/* KPI Cards */}
                        <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                            <div className="flex items-center gap-2 text-zinc-400 mb-2">
                            <DollarSign size={16} />
                            <span className="text-xs font-bold uppercase">Faturamento</span>
                            </div>
                            <div className="text-2xl font-bold text-white">
                                R$ {metrics.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-green-500 text-xs flex items-center mt-1">
                            <TrendingUp size={12} className="mr-1" /> Total Vitalício
                            </div>
                        </div>
                        
                        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                            <div className="flex items-center gap-2 text-zinc-400 mb-2">
                            <Package size={16} />
                            <span className="text-xs font-bold uppercase">Pedidos</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{metrics.orderCount}</div>
                        </div>
                        </div>

                        {/* Recent Orders List */}
                        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                                <h3 className="text-white font-bold">Pedidos Recentes</h3>
                                <button onClick={fetchDashboardData} className="text-amber-500 text-xs hover:underline">Atualizar</button>
                            </div>
                            
                            <div className="divide-y divide-zinc-800 max-h-80 overflow-y-auto">
                                {orders.length === 0 ? (
                                    <div className="p-8 text-center text-zinc-500 text-sm">Nenhum pedido encontrado.</div>
                                ) : (
                                    orders.map(order => (
                                        <button 
                                            key={order.id} 
                                            onClick={() => setSelectedOrder(order)}
                                            className="w-full p-4 flex items-center justify-between hover:bg-zinc-800 transition-colors text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${getStatusStyle(order.status).color.split(' ')[0]} bg-zinc-950 border border-zinc-800`}>
                                                    <ShoppingBag size={18} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white font-bold text-sm">
                                                            {order.customer_name || 'Cliente'}
                                                        </span>
                                                        <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">
                                                            #{order.id.slice(0,4)}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-zinc-500">
                                                        {new Date(order.created_at).toLocaleDateString('pt-BR')} • {order.branch_location}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-white font-bold text-sm">R$ {order.total.toFixed(2)}</div>
                                                <span className={`text-[10px] font-bold ${getStatusStyle(order.status).color.split(' ')[0]}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                         {/* Charts & Heatmap */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                                <h3 className="text-white font-bold mb-6">Gráfico de Vendas</h3>
                                <div className="h-48 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={metrics.salesData}>
                                        <defs>
                                        <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                        </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                        <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value/1000}k`} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                                            itemStyle={{ color: '#f59e0b' }}
                                            formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Vendas']}
                                        />
                                        <Area type="monotone" dataKey="vendas" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorVendas)" />
                                    </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                             <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                                <div className="flex items-center gap-2 mb-4">
                                    <MapPin className="text-amber-500" size={20} />
                                    <h3 className="text-white font-bold">Distribuição</h3>
                                </div>
                                <div className="space-y-3">
                                    {metrics.locationStats.map((loc, idx) => (
                                        <div key={idx}>
                                            <div className="flex justify-between text-xs text-zinc-400 mb-1">
                                                <span>{loc.name}</span>
                                                <span>{loc.percent}%</span>
                                            </div>
                                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full ${loc.color} rounded-full transition-all duration-1000`} 
                                                    style={{ width: `${loc.percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             </div>
                         </div>
                    </>
                )}

                {/* === PROFILES VIEW === */}
                {activeTab === 'profiles' && (
                    <div className="space-y-4">
                        {/* Status Message for Source */}
                        <div className={`p-3 rounded-lg flex items-start gap-3 border ${dataSource === 'official' ? 'bg-green-500/10 border-green-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                            {dataSource === 'official' ? (
                                <Database size={18} className="text-green-500 shrink-0 mt-0.5" />
                            ) : (
                                <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                            )}
                            <div>
                                <h4 className={`text-sm font-bold ${dataSource === 'official' ? 'text-green-500' : 'text-amber-500'}`}>
                                    {dataSource === 'official' ? 'Base de Dados Oficial' : 'Visualização de Histórico'}
                                </h4>
                                <p className="text-xs text-zinc-400 mt-1">
                                    {dataSource === 'official' 
                                        ? 'Exibindo registros diretos da tabela de perfis.' 
                                        : 'Acesso direto restrito. Exibindo clientes únicos baseados no histórico de pedidos realizados.'}
                                </p>
                            </div>
                        </div>

                        {/* Header Actions */}
                        <div className="flex gap-2">
                             <div className="bg-zinc-900 p-2 rounded-xl border border-zinc-800 flex items-center gap-2 flex-1">
                                <Search className="text-zinc-500 ml-2" size={20} />
                                <input 
                                    type="text"
                                    placeholder="Buscar por Nome ou Telefone..."
                                    className="bg-transparent border-none outline-none text-white w-full p-2 placeholder-zinc-600"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            
                            {/* Sync button only works if official access is available or to try again */}
                            <button 
                                onClick={handleSyncProfiles}
                                disabled={syncingProfiles}
                                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/50 text-zinc-300 hover:text-white px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                title="Tentar sincronizar dados"
                            >
                                {syncingProfiles ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
                            </button>
                        </div>

                        {/* Profiles List */}
                        <div className="grid grid-cols-1 gap-4">
                            {filteredProfiles.length === 0 ? (
                                <div className="text-center py-12 text-zinc-500">Nenhum cliente encontrado.</div>
                            ) : (
                                filteredProfiles.map(profile => (
                                    <div key={profile.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all">
                                        
                                        {/* Header: Name and Role */}
                                        <div className="flex justify-between items-start mb-4 border-b border-zinc-800 pb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 font-bold text-lg border border-zinc-700">
                                                    {profile.full_name ? profile.full_name.substring(0,2).toUpperCase() : <User size={20}/>}
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-bold text-lg">{profile.full_name || 'Sem Nome'}</h3>
                                                    <div className="flex items-center gap-2 text-zinc-500 text-xs">
                                                        <span className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 border border-zinc-700">{profile.role === 'admin' ? 'ADMINISTRADOR' : 'CLIENTE'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div className="space-y-3">
                                                {/* Only show if data exists or if it's the official source */}
                                                {(profile.cpf || dataSource === 'official') && (
                                                    <div className="flex items-center gap-2 text-sm text-zinc-300">
                                                        <CreditCard size={16} className="text-amber-500 shrink-0" />
                                                        <span className="text-zinc-500 w-16 text-xs font-bold uppercase">CPF:</span>
                                                        <span>{profile.cpf || 'Não informado'}</span>
                                                    </div>
                                                )}
                                                
                                                <div className="flex items-center gap-2 text-sm text-zinc-300">
                                                    <Phone size={16} className="text-amber-500 shrink-0" />
                                                    <span className="text-zinc-500 w-16 text-xs font-bold uppercase">Fone:</span>
                                                    <span>{profile.phone || 'Não informado'}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-start gap-2 text-sm text-zinc-300">
                                                    <Home size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                                    <div>
                                                        <span className="text-zinc-500 text-xs font-bold uppercase mr-2">Endereço:</span>
                                                        <span className="block">{profile.address || 'Não registrado'}</span>
                                                        {profile.city && <span className="block text-xs text-zinc-500">{profile.city}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Downloads Section - Only if official source or URLs exist */}
                                        {(profile.cnh_url || profile.address_proof_url) && (
                                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-800">
                                                {profile.cnh_url ? (
                                                    <a 
                                                        href={profile.cnh_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold transition-colors border border-zinc-700"
                                                    >
                                                        <Download size={16} /> CNH Digital
                                                    </a>
                                                ) : null}

                                                {profile.address_proof_url ? (
                                                    <a 
                                                        href={profile.address_proof_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold transition-colors border border-zinc-700"
                                                    >
                                                        <Download size={16} /> Comp. Residência
                                                    </a>
                                                ) : null}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </>
        )}

      </div>
    </div>
  );
};