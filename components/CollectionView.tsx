
import React, { useState } from 'react';
import { Trophy, Lock, Sparkles, CheckCircle2, Target, Award, Zap, Gift, Loader2, AlertCircle } from 'lucide-react';
import { PRODUCTS } from '../constants';
import { ProductCategory, Product } from '../types';
import { HologramModal } from './HologramModal';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from './Button';

interface CollectionViewProps {
  unlockedIds: string[];
}

interface Mission {
  id: number;
  title: string;
  description: string;
  progress: number;
  total: number;
  reward: string;
}

export const CollectionView: React.FC<CollectionViewProps> = ({ unlockedIds }) => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'stickers' | 'missions'>('stickers');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [redeemingId, setRedeemingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const growlers = PRODUCTS.filter(p => p.category === ProductCategory.GROWLER);
  
  const stats = {
    total: growlers.length,
    unlocked: growlers.filter(g => unlockedIds.includes(g.id)).length
  };

  const handleRedeemReward = async (missionId: number) => {
    if (!user) {
        setError("Você precisa estar logado para resgatar.");
        return;
    }
    setRedeemingId(missionId);
    setError(null);
    
    try {
      const currentRedeemed = user.redeemed_missions || [];
      if (currentRedeemed.includes(missionId)) {
          setRedeemingId(null);
          return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          redeemed_missions: Array.from(new Set([...currentRedeemed, missionId])) 
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      // Sincronizar estado local imediatamente
      await refreshUser();
      
    } catch (err: any) {
      console.error("Erro ao resgatar recompensa:", err);
      setError("Falha ao salvar no banco. Tente novamente.");
    } finally {
      setRedeemingId(null);
    }
  };

  const missions: Mission[] = [
    { 
      id: 1, 
      title: "Primeira Dose", 
      description: "Peça seu primeiro delivery Patanegra.", 
      progress: user?.completed_missions?.includes(1) ? 1 : 0, 
      total: 1, 
      reward: "10% OFF" 
    },
    { 
      id: 2, 
      title: "Mestre dos Estilos", 
      description: "Colecione 5 estilos diferentes de growlers.", 
      progress: Math.min(unlockedIds.length, 5), 
      total: 5, 
      reward: "15% OFF" 
    },
    { 
      id: 3, 
      title: "Resenha Épica", 
      description: "Compre 10 growlers em um único pedido.", 
      progress: user?.completed_missions?.includes(3) ? 10 : 0, 
      total: 10, 
      reward: "20% OFF" 
    },
    { 
      id: 4, 
      title: "Dono da Festa", 
      description: "Peça um delivery de barril (30L ou 50L).", 
      progress: user?.completed_missions?.includes(4) ? 1 : 0, 
      total: 1, 
      reward: "20% OFF" 
    },
    { 
      id: 5, 
      title: "Cliente de Elite", 
      description: "Conclua 3 pedidos no aplicativo.", 
      progress: user?.completed_missions?.includes(5) ? 3 : (user?.completed_missions?.length || 0), 
      total: 3, 
      reward: "15% OFF" 
    }
  ];

  return (
    <div className="animate-fade-in flex flex-col h-full bg-zinc-950 pb-24">
      <div className="p-8 pb-4">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <Trophy className="text-amber-500" size={24} />
                <h1 className="text-2xl font-serif text-white">Minha Coleção</h1>
            </div>
            <div className="bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                <span className="text-amber-500 text-[10px] font-black uppercase tracking-widest">Nível {(user?.completed_missions?.length || 0) + 1}</span>
            </div>
        </div>

        <div className="flex p-1 bg-zinc-900 rounded-2xl mb-6 border border-zinc-800">
            <button 
                onClick={() => setActiveTab('stickers')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'stickers' ? 'bg-amber-500 text-black shadow-lg' : 'text-zinc-500'}`}
            >
                Growlers
            </button>
            <button 
                onClick={() => setActiveTab('missions')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'missions' ? 'bg-amber-500 text-black shadow-lg' : 'text-zinc-500'}`}
            >
                Missões
            </button>
        </div>
        
        {activeTab === 'stickers' && (
            <div className="animate-fade-in">
                <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-2">
                    {stats.unlocked} de {stats.total} Growlers Colecionados
                </p>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                   <div 
                     className="h-full bg-amber-500 transition-all duration-1000 shadow-[0_0_15px_rgba(245,158,11,0.5)]" 
                     style={{ width: `${(stats.unlocked / stats.total) * 100}%` }}
                   />
                </div>
            </div>
        )}

        {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-3 text-red-500 text-[10px] font-bold uppercase mb-4 animate-shake">
                <AlertCircle size={14} /> {error}
            </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        {activeTab === 'stickers' ? (
            <div className="grid grid-cols-2 gap-4 animate-fade-in">
               {growlers.map(product => {
                 const isUnlocked = unlockedIds.includes(product.id);
                 return (
                   <button 
                     key={product.id}
                     onClick={() => isUnlocked && setSelectedProduct(product)}
                     className={`relative aspect-[3/4] rounded-2xl border transition-all duration-500 group overflow-hidden ${isUnlocked ? 'border-amber-500/50 bg-zinc-900 active:scale-95' : 'border-zinc-800 bg-zinc-950 grayscale opacity-60'}`}
                   >
                      <div className={`absolute inset-0 p-3 flex flex-col items-center justify-center gap-3 ${!isUnlocked && 'blur-[2px]'}`}>
                         <img src={product.image} className="w-full h-3/4 object-contain" alt={product.name} />
                         <span className={`text-[10px] font-black uppercase text-center leading-tight ${isUnlocked ? 'text-white' : 'text-zinc-700'}`}>
                            {product.name}
                         </span>
                      </div>
                      <div className="absolute top-2 right-2">
                         {isUnlocked ? (
                           <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-black shadow-lg">
                              <CheckCircle2 size={14} />
                           </div>
                         ) : (
                           <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                              <Lock size={12} />
                           </div>
                         )}
                      </div>
                      {isUnlocked && (
                        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                   </button>
                 );
               })}
            </div>
        ) : (
            <div className="space-y-4 animate-fade-in pb-10">
                {missions.map(mission => {
                    const isCompleted = user?.completed_missions?.includes(mission.id);
                    const isRedeemed = user?.redeemed_missions?.includes(mission.id);
                    const isUsed = user?.used_discounts?.includes(mission.id);
                    
                    return (
                        <div key={mission.id} className="relative bg-zinc-900 rounded-[2rem] p-6 border border-zinc-800 overflow-hidden group">
                            {isCompleted && !isUsed && (
                                <div className="absolute -inset-10 bg-amber-500/5 blur-[50px] pointer-events-none" />
                            )}
                            
                            <div className="flex items-start gap-5 relative z-10">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all ${isCompleted ? 'bg-amber-500 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-zinc-950 border-zinc-800'}`}>
                                    {isCompleted ? (
                                        <Award size={28} className="text-black" />
                                    ) : (
                                        <div className="relative">
                                            <Sparkles size={24} className="text-zinc-800" />
                                            <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`font-bold text-sm tracking-tight ${isCompleted ? 'text-white' : 'text-zinc-300'}`}>
                                            {mission.title}
                                        </h3>
                                        {isUsed ? (
                                            <span className="bg-zinc-800 text-zinc-500 border-zinc-700 text-[8px] font-black uppercase px-2 py-1 rounded-md border">
                                                Resgatado
                                            </span>
                                        ) : isCompleted ? (
                                            <span className="bg-green-500/20 text-green-500 border-green-500/20 text-[8px] font-black uppercase px-2 py-1 rounded-md border">
                                                Concluída
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-amber-500">{mission.reward}</span>
                                        )}
                                    </div>
                                    <p className="text-zinc-500 text-[11px] leading-relaxed mb-4">
                                        {mission.description}
                                    </p>

                                    {isCompleted && !isRedeemed ? (
                                        <button 
                                          onClick={() => handleRedeemReward(mission.id)}
                                          disabled={redeemingId !== null}
                                          className="w-full py-2.5 bg-amber-500 rounded-xl text-black font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-500/20 animate-pulse flex items-center justify-center gap-2"
                                        >
                                          {redeemingId === mission.id ? <Loader2 size={14} className="animate-spin" /> : <><Gift size={14} /> Resgatar Recompensa</>}
                                        </button>
                                    ) : (
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Progresso</span>
                                                <span className="text-[10px] font-bold text-zinc-400">{isCompleted ? mission.total : mission.progress}/{mission.total}</span>
                                            </div>
                                            <div className="h-2 w-full bg-black rounded-full overflow-hidden border border-white/5">
                                                <div 
                                                    className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-green-500' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`}
                                                    style={{ width: `${(isCompleted ? 1 : mission.progress / mission.total) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {!isCompleted && (
                                <div className="absolute bottom-0 right-0 w-12 h-12 bg-amber-500/5 rotate-45 translate-x-6 translate-y-6 border border-amber-500/20" />
                            )}
                        </div>
                    );
                })}
            </div>
        )}
      </div>

      <HologramModal 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />

      <div className="p-6 text-center">
         <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest opacity-60">
            {activeTab === 'stickers' ? 'Toque no growler para ver o holograma 3D' : 'Resgate suas recompensas concluídas para usar no próximo pedido'}
         </p>
      </div>
    </div>
  );
};
