
import React, { useEffect, useState } from 'react';
import { X, TrendingUp, DollarSign, Package, MapPin, Loader2, AlertTriangle, Lock, Eye, CheckCircle2, Truck, Clock, AlertCircle, ShoppingBag, Phone, User, Calendar, XCircle, Bike, RefreshCw, UploadCloud } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { supabase } from '../lib/supabase';
import { Order, OrderItem } from '../types';
import { PRODUCTS } from '../constants'; // Import local products to upload

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
    'Concluído': { color: 'text-green-500 bg-green-500/10 border-green-500/20', icon: CheckCircle2, label: 'Concluído' },
    'Entregue': { color: 'text-green-500 bg-green-500/10 border-green-500/20', icon: CheckCircle2, label: 'Entregue' },
    'Cancelado': { color: 'text-red-500 bg-red-500/10 border-red-500/20', icon: XCircle, label: 'Cancelado' }
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [metrics, setMetrics] = useState<DashboardMetrics>({
    revenue: 0,
    orderCount: 0,
    salesData: [],
    topProducts: [],
    locationStats: []
  });

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen]);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Orders with Items Nested
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      const fetchedOrders = ordersData as Order[];
      setOrders(fetchedOrders);

      // --- Process Data for Charts ---
      const items: OrderItem[] = fetchedOrders.flatMap(o => o.order_items || []);

      // A. Total Revenue & Count
      const revenue = fetchedOrders.reduce((acc, order) => {
        return order.status !== 'Cancelado' ? acc + Number(order.total) : acc;
      }, 0);
      const orderCount = fetchedOrders.filter(o => o.status !== 'Cancelado').length;

      // B. Chart Data (Last 7 Days)
      const salesMap = new Map<string, number>();
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      // Initialize last 7 days keys
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

      // C. Top Products
      const productCount: Record<string, number> = {};
      items.forEach(item => {
        productCount[item.product_name] = (productCount[item.product_name] || 0) + item.quantity;
      });

      const topProducts = Object.entries(productCount)
        .map(([name, qtd]) => ({ name, qtd }))
        .sort((a, b) => b.qtd - a.qtd)
        .slice(0, 3);

      // D. Location Heatmap
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

      setMetrics({
        revenue,
        orderCount,
        salesData,
        topProducts,
        locationStats
      });

    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      if (err.code === '42501' || err.message?.includes('violates row level security')) {
        setError('Acesso Negado: Sua conta não tem permissão de Administrador.');
      } else {
        setError('Erro ao carregar dados. Verifique sua conexão.');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);
            
        if (error) throw error;
        
        // Update local state
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrder && selectedOrder.id === orderId) {
            setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
    } catch (err) {
        console.error("Failed to update status", err);
        alert("Erro ao atualizar status");
    }
  };

  // --- SYNC FUNCTION ---
  const handleSyncProducts = async () => {
    if (!confirm("Isso enviará todos os produtos do código (constants.ts) para o banco de dados. Deseja continuar?")) return;
    
    setSyncing(true);
    try {
        // Map local products to DB structure (snake_case columns)
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

  const getStatusStyle = (status: string) => {
      return STATUS_CONFIG[status] || STATUS_CONFIG['Em Andamento'];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col animate-fade-in overflow-hidden">
      
      {/* --- Detail Modal Overlay --- */}
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
                    
                    {/* Status Display */}
                    <div className={`flex items-center justify-between p-4 rounded-xl border ${getStatusStyle(selectedOrder.status).color}`}>
                        <div className="flex items-center gap-3">
                             {React.createElement(getStatusStyle(selectedOrder.status).icon, { size: 24 })}
                             <div>
                                <span className="block text-xs uppercase font-bold tracking-wider opacity-70">Status Atual</span>
                                <span className="font-bold text-lg">
                                    {selectedOrder.status}
                                </span>
                             </div>
                        </div>
                    </div>

                    {/* Status Actions */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Alterar Status</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {selectedOrder.status !== 'Concluído' && selectedOrder.status !== 'Cancelado' && (
                                <>
                                    {selectedOrder.status !== 'A Caminho' && (
                                        <button 
                                            onClick={() => updateOrderStatus(selectedOrder.id, 'A Caminho')}
                                            className="p-3 bg-zinc-800 hover:bg-blue-500/20 hover:border-blue-500/50 border border-zinc-700 rounded-xl flex flex-col items-center justify-center gap-1 transition-all group"
                                        >
                                            <Bike size={20} className="text-zinc-400 group-hover:text-blue-500"/>
                                            <span className="text-xs font-bold text-zinc-300 group-hover:text-blue-500">Enviar / A Caminho</span>
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => updateOrderStatus(selectedOrder.id, 'Concluído')}
                                        className="p-3 bg-zinc-800 hover:bg-green-500/20 hover:border-green-500/50 border border-zinc-700 rounded-xl flex flex-col items-center justify-center gap-1 transition-all group"
                                    >
                                        <CheckCircle2 size={20} className="text-zinc-400 group-hover:text-green-500"/>
                                        <span className="text-xs font-bold text-zinc-300 group-hover:text-green-500">Concluir Entrega</span>
                                    </button>
                                </>
                            )}
                            
                            {selectedOrder.status !== 'Cancelado' && selectedOrder.status !== 'Concluído' && (
                                <button 
                                    onClick={() => updateOrderStatus(selectedOrder.id, 'Cancelado')}
                                    className="p-3 bg-zinc-800 hover:bg-red-500/20 hover:border-red-500/50 border border-zinc-700 rounded-xl flex flex-col items-center justify-center gap-1 transition-all group col-span-2"
                                >
                                    <XCircle size={20} className="text-zinc-400 group-hover:text-red-500"/>
                                    <span className="text-xs font-bold text-zinc-300 group-hover:text-red-500">Cancelar Pedido</span>
                                </button>
                            )}

                             {(selectedOrder.status === 'Cancelado' || selectedOrder.status === 'Concluído' || selectedOrder.status === 'Entregue') && (
                                <button 
                                    onClick={() => updateOrderStatus(selectedOrder.id, 'Em Andamento')}
                                    className="p-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl flex flex-col items-center justify-center gap-1 transition-all col-span-2"
                                >
                                    <RefreshCw size={20} className="text-zinc-400"/>
                                    <span className="text-xs font-bold text-zinc-300">Reabrir Pedido</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Cliente</h4>
                        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
                            <div className="flex items-center gap-3">
                                <User className="text-zinc-600" size={18} />
                                <span className="text-zinc-200">{selectedOrder.customer_name || 'Nome não informado'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="text-zinc-600" size={18} />
                                <span className="text-zinc-200">{selectedOrder.customer_phone || 'Telefone não informado'}</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="text-zinc-600 mt-0.5" size={18} />
                                <span className="text-zinc-200 text-sm">{selectedOrder.delivery_address || 'Endereço não informado'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                     <div className="space-y-3">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Itens</h4>
                        <div className="bg-zinc-950 rounded-xl border border-zinc-800 divide-y divide-zinc-800">
                            {selectedOrder.order_items?.map((item, idx) => (
                                <div key={idx} className="p-3 flex justify-between items-start">
                                    <div>
                                        <p className="text-zinc-200 font-medium text-sm">
                                            <span className="text-amber-500 font-bold">{item.quantity}x</span> {item.product_name}
                                        </p>
                                        {(item.extras && (item.extras.rentTables || item.extras.rentUmbrellas || item.extras.cupsQuantity)) && (
                                            <div className="text-[10px] text-zinc-500 mt-1 pl-4 border-l-2 border-zinc-800">
                                                {item.extras.rentTables && <p>+ Mesas</p>}
                                                {item.extras.rentUmbrellas && <p>+ Ombrelones</p>}
                                                {item.extras.cupsQuantity && <p>+ {item.extras.cupsQuantity} Copos</p>}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-white font-bold text-sm">
                                        R$ {(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                            <div className="p-3 flex justify-between items-center bg-zinc-900">
                                <span className="text-zinc-400 text-sm">Total</span>
                                <span className="text-amber-500 font-bold text-lg">R$ {selectedOrder.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-xs text-zinc-500 pt-4 border-t border-zinc-800">
                        <div className="flex items-center gap-1">
                            <MapPin size={12}/> {selectedOrder.branch_location}
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar size={12}/> {new Date(selectedOrder.created_at).toLocaleString('pt-BR')}
                        </div>
                    </div>
                </div>
             </div>
          </div>
      )}

      {/* --- Main Dashboard Header --- */}
      <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-950">
        <div>
           <h2 className="text-2xl font-serif text-amber-500">Painel Administrativo</h2>
           <p className="text-zinc-500 text-xs">Visão geral em tempo real</p>
        </div>
        <div className="flex items-center gap-3">
             <button
                onClick={handleSyncProducts}
                disabled={syncing}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
             >
                {syncing ? <Loader2 className="animate-spin" size={14}/> : <UploadCloud size={14}/>}
                Sincronizar Catálogo
             </button>
            <button 
                onClick={onClose}
                className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors"
            >
                <X size={24} />
            </button>
        </div>
      </div>

      {/* --- Content --- */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {loading ? (
            <div className="h-64 flex items-center justify-center flex-col gap-4">
                <Loader2 className="animate-spin text-amber-500" size={32} />
                <span className="text-zinc-500 text-sm">Carregando métricas...</span>
            </div>
        ) : error ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                    <Lock size={32} />
                </div>
                <h3 className="text-white font-bold text-lg">Acesso Restrito</h3>
                <p className="text-zinc-400 max-w-xs">{error}</p>
                <button 
                    onClick={fetchAdminData} 
                    className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 text-sm font-semibold"
                >
                    Tentar Novamente
                </button>
            </div>
        ) : (
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
                    <div className="text-green-500 text-xs flex items-center mt-1">
                    <TrendingUp size={12} className="mr-1" /> Total Vitalício
                    </div>
                </div>
                </div>

                {/* --- Recent Orders List --- */}
                <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                    <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                        <h3 className="text-white font-bold">Pedidos Recentes</h3>
                        <button onClick={fetchAdminData} className="text-amber-500 text-xs hover:underline">Atualizar</button>
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

                {/* Sales Chart */}
                <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                    <h3 className="text-white font-bold mb-6">Gráfico de Vendas</h3>
                    <div className="h-48 w-full">
                        {metrics.salesData.length > 0 && metrics.salesData.some(d => d.vendas > 0) ? (
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
                        ) : (
                            <div className="h-full flex items-center justify-center text-zinc-500 text-sm flex-col">
                                <AlertTriangle size={24} className="mb-2 opacity-50"/>
                                Sem vendas recentes para o gráfico.
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                    <h3 className="text-white font-bold mb-4">Top Produtos</h3>
                    <div className="space-y-4">
                        {metrics.topProducts.map((prod, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-amber-500 font-bold text-sm">
                                #{idx + 1}
                                </div>
                                <span className="text-zinc-300 text-sm">{prod.name}</span>
                            </div>
                            <span className="text-white font-bold">{prod.qtd} un.</span>
                        </div>
                        ))}
                    </div>
                </div>

                {/* Heatmap */}
                <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-2 mb-4">
                    <MapPin className="text-amber-500" size={20} />
                    <h3 className="text-white font-bold">Distribuição Regional</h3>
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
            </>
        )}

      </div>
    </div>
  );
};
