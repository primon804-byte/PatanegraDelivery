
import React, { useState, useEffect } from 'react';
import { Product, ProductCategory, CartItem } from '../types';
import { Button } from './Button';
import { X, Droplets, Hop, Utensils, ShoppingBag, Umbrella, Beer, LayoutGrid, Check, Sparkles } from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (product: Product, options?: Partial<CartItem>) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, isOpen, onClose, onAdd }) => {
  const [rentTables, setRentTables] = useState(false);
  const [rentUmbrellas, setRentUmbrellas] = useState(false);
  const [cupsQuantity, setCupsQuantity] = useState<number | null>(null);

  // Reset state when product changes
  useEffect(() => {
    if (isOpen) {
      setRentTables(false);
      setRentUmbrellas(false);
      setCupsQuantity(null);
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const isKeg = product.category === ProductCategory.KEG30 || product.category === ProductCategory.KEG50;
  const isGrowler = product.category === ProductCategory.GROWLER;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className={`relative w-full max-w-md bg-zinc-950 sm:rounded-[2.5rem] rounded-t-[2.5rem] overflow-hidden shadow-2xl animate-slide-up flex flex-col ${isGrowler ? 'h-auto max-h-[95vh]' : 'h-[90vh]'}`}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 z-50 p-2.5 bg-black/40 backdrop-blur-xl rounded-full text-white/70 hover:text-white border border-white/10 transition-all active:scale-90"
        >
          <X size={20} />
        </button>

        {/* Image Header - Dynamic height for Growlers to fit content */}
        <div className={`relative w-full overflow-hidden flex-shrink-0 ${isGrowler ? 'h-56' : 'h-64'}`}>
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
          
          {/* Category Badge */}
          <div className="absolute bottom-4 left-6 flex items-center gap-2">
             <div className="px-3 py-1 bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest rounded-full shadow-xl">
               {product.category}
             </div>
             {isGrowler && (
                <div className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-full border border-white/10 flex items-center gap-1.5">
                    <Sparkles size={10} className="text-amber-500" /> Item Colecionável
                </div>
             )}
          </div>
        </div>

        {/* Info Section */}
        <div className={`flex-1 flex flex-col px-6 ${isGrowler ? 'overflow-visible pb-6' : 'overflow-y-auto pt-2 pb-10 scrollbar-hide'}`}>
          
          <div className="mt-4 mb-4">
            <h2 className="text-3xl font-serif font-bold text-white leading-tight">
              {product.name}
            </h2>
          </div>

          {/* Technical Specs Grid - Optimized for Growlers */}
          {(product.abv || product.ibu) && (
            <div className="grid grid-cols-2 gap-3 mb-5">
              {product.abv !== undefined && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/50">
                  <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                    <Droplets size={18} />
                  </div>
                  <div>
                    <span className="block text-[8px] text-zinc-500 uppercase font-black tracking-widest">Teor (ABV)</span>
                    <span className="text-base font-bold text-zinc-200">{product.abv}%</span>
                  </div>
                </div>
              )}
              {product.ibu !== undefined && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/50">
                  <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                    <Hop size={18} />
                  </div>
                  <div>
                    <span className="block text-[8px] text-zinc-500 uppercase font-black tracking-widest">Amargor (IBU)</span>
                    <span className="text-base font-bold text-zinc-200">{product.ibu}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Description - Without clamp, full text */}
          <div className="mb-6">
            <p className="text-zinc-400 leading-relaxed text-sm">
              {product.description}
            </p>
          </div>
          
          {/* EXTRAS - Only for Kegs (Barris) */}
          {isKeg && (
            <div className="space-y-4 pt-4 border-t border-zinc-900 mb-6">
              <h3 className="text-amber-500 font-black uppercase text-[10px] tracking-[0.2em] mb-3">Serviços Adicionais para Eventos</h3>
              
              <button 
                onClick={() => setRentTables(!rentTables)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${rentTables ? 'bg-amber-500/10 border-amber-500' : 'bg-zinc-900/50 border-zinc-800'}`}
              >
                <div className="flex items-center gap-4">
                  <LayoutGrid size={20} className={rentTables ? 'text-amber-500' : 'text-zinc-500'} />
                  <div className="text-left">
                     <span className={`block font-bold text-sm ${rentTables ? 'text-white' : 'text-zinc-400'}`}>Mesas de Apoio</span>
                     <span className="text-[10px] text-zinc-500 uppercase font-black tracking-tighter">Solicitar orçamento</span>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${rentTables ? 'bg-amber-500 border-amber-500 text-black' : 'border-zinc-700'}`}>
                   {rentTables && <Check size={14} />}
                </div>
              </button>

              <button 
                onClick={() => setRentUmbrellas(!rentUmbrellas)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${rentUmbrellas ? 'bg-amber-500/10 border-amber-500' : 'bg-zinc-900/50 border-zinc-800'}`}
              >
                <div className="flex items-center gap-4">
                  <Umbrella size={20} className={rentUmbrellas ? 'text-amber-500' : 'text-zinc-500'} />
                  <div className="text-left">
                     <span className={`block font-bold text-sm ${rentUmbrellas ? 'text-white' : 'text-zinc-400'}`}>Ombrelones</span>
                     <span className="text-[10px] text-zinc-500 uppercase font-black tracking-tighter">Solicitar orçamento</span>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${rentUmbrellas ? 'bg-amber-500 border-amber-500 text-black' : 'border-zinc-700'}`}>
                   {rentUmbrellas && <Check size={14} />}
                </div>
              </button>
              
              <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-3 mb-3">
                   <Beer size={18} className="text-zinc-500" />
                   <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Copos Descartáveis</span>
                </div>
                <select 
                  className="w-full bg-zinc-950 text-white border border-zinc-800 rounded-xl p-3 text-sm focus:border-amber-500 focus:outline-none appearance-none cursor-pointer"
                  value={cupsQuantity || ''}
                  onChange={(e) => setCupsQuantity(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Não preciso de copos</option>
                  <option value="100">100 Copos</option>
                  <option value="200">200 Copos</option>
                  <option value="500">500 Copos</option>
                  <option value="1000">1000 Copos</option>
                </select>
              </div>
            </div>
          )}

          {/* Pairing - Elegant for Growlers */}
          {product.pairing && (
            <div className={`bg-amber-500/5 p-4 rounded-[1.5rem] border border-amber-500/10 ${isGrowler ? 'mb-4' : 'mb-0'}`}>
              <div className="flex items-center gap-2 mb-2 text-amber-500">
                <Utensils size={14} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Harmonização</h3>
              </div>
              <p className="text-zinc-400 text-xs italic leading-relaxed">
                "{product.pairing}"
              </p>
            </div>
          )}
        </div>

        {/* Bottom Action Area */}
        <div className="p-6 border-t border-zinc-900/50 bg-zinc-950 pb-safe sm:pb-6">
          <div className="flex items-center justify-between gap-4 mb-6 px-1">
             <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest leading-none mb-1">Valor Unitário</span>
                <div className="text-2xl font-serif text-white">R$ {product.price.toFixed(2)}</div>
             </div>
             {isGrowler && (
                <div className="text-right">
                    <span className="text-[8px] text-zinc-600 uppercase font-black tracking-widest block mb-1">Acúmulo de Pontos</span>
                    <span className="text-amber-500 font-bold text-xs">+150 XP</span>
                </div>
             )}
          </div>
          <Button 
            fullWidth 
            className="h-16 rounded-[1.5rem] text-sm font-black uppercase tracking-[0.15em] shadow-xl shadow-amber-500/10"
            icon={<ShoppingBag size={20} />} 
            onClick={() => {
              onAdd(product, {
                rentTables,
                rentUmbrellas,
                cupsQuantity
              });
              onClose();
            }}
          >
            Adicionar ao Pedido
          </Button>
        </div>

      </div>
    </div>
  );
};
