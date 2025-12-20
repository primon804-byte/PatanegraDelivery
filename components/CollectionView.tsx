
import React, { useState } from 'react';
import { Trophy, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { PRODUCTS } from '../constants';
import { ProductCategory, Product } from '../types';
import { HologramModal } from './HologramModal';

interface CollectionViewProps {
  unlockedIds: string[];
}

export const CollectionView: React.FC<CollectionViewProps> = ({ unlockedIds }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const growlers = PRODUCTS.filter(p => p.category === ProductCategory.GROWLER);
  
  const stats = {
    total: growlers.length,
    unlocked: growlers.filter(g => unlockedIds.includes(g.id)).length
  };

  return (
    <div className="animate-fade-in flex flex-col h-full bg-zinc-950 pb-24">
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3 mb-2">
            <Trophy className="text-amber-500" size={24} />
            <h1 className="text-2xl font-serif text-white">Minha Coleção</h1>
        </div>
        <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">
            {stats.unlocked} de {stats.total} Growlers Colecionados
        </p>
        
        {/* Progress Bar */}
        <div className="mt-4 h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
           <div 
             className="h-full bg-amber-500 transition-all duration-1000 shadow-[0_0_15px_rgba(245,158,11,0.5)]" 
             style={{ width: `${(stats.unlocked / stats.total) * 100}%` }}
           />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <div className="grid grid-cols-2 gap-4">
           {growlers.map(product => {
             const isUnlocked = unlockedIds.includes(product.id);
             return (
               <button 
                 key={product.id}
                 onClick={() => isUnlocked && setSelectedProduct(product)}
                 className={`relative aspect-[3/4] rounded-2xl border transition-all duration-500 group overflow-hidden ${isUnlocked ? 'border-amber-500/50 bg-zinc-900 active:scale-95' : 'border-zinc-800 bg-zinc-950 grayscale opacity-60'}`}
               >
                  {/* Sticker Visual */}
                  <div className={`absolute inset-0 p-3 flex flex-col items-center justify-center gap-3 ${!isUnlocked && 'blur-[2px]'}`}>
                     <img src={product.image} className="w-full h-3/4 object-contain" alt={product.name} />
                     <span className={`text-[10px] font-black uppercase text-center leading-tight ${isUnlocked ? 'text-white' : 'text-zinc-700'}`}>
                        {product.name}
                     </span>
                  </div>

                  {/* Badge Status */}
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

                  {/* Hover/Unlock Glow */}
                  {isUnlocked && (
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
               </button>
             );
           })}
        </div>
      </div>

      <HologramModal 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />

      <div className="p-6 text-center">
         <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">
            Compre novos sabores para completar seu álbum
         </p>
      </div>
    </div>
  );
};
