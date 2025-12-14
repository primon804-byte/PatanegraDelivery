import React from 'react';
import { Product } from '../types';
import { Button } from './Button';
import { X, Droplets, Hop, Utensils, ShoppingBag } from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (product: Product) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, isOpen, onClose, onAdd }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-zinc-950 sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl animate-slide-up max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Image Header */}
        <div className="relative h-64 sm:h-72 flex-shrink-0">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
          
          {/* Price Tag Overlay */}
          <div className="absolute bottom-6 left-6">
             <div className="inline-block px-3 py-1 bg-amber-500 text-black text-xs font-bold rounded mb-2">
               {product.category}
             </div>
             <h2 className="text-3xl font-serif font-bold text-white leading-none shadow-black drop-shadow-lg">
               {product.name}
             </h2>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Technical Specs Grid */}
          {(product.abv || product.ibu) && (
            <div className="grid grid-cols-2 gap-4">
              {product.abv && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                    <Droplets size={20} />
                  </div>
                  <div>
                    <span className="block text-xs text-zinc-500 uppercase tracking-wider">Teor (ABV)</span>
                    <span className="text-lg font-bold text-zinc-200">{product.abv}%</span>
                  </div>
                </div>
              )}
              {product.ibu && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                    <Hop size={20} />
                  </div>
                  <div>
                    <span className="block text-xs text-zinc-500 uppercase tracking-wider">Amargor (IBU)</span>
                    <span className="text-lg font-bold text-zinc-200">{product.ibu}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-white font-bold mb-2">Sobre</h3>
            <p className="text-zinc-400 leading-relaxed text-sm">
              {product.description}
            </p>
          </div>

          {/* Pairing */}
          {product.pairing && (
            <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-2 mb-2 text-amber-500">
                <Utensils size={18} />
                <h3 className="font-bold text-sm uppercase tracking-wide">Harmonização</h3>
              </div>
              <p className="text-zinc-300 text-sm italic">
                "{product.pairing}"
              </p>
            </div>
          )}
          
          {/* Spacer for bottom bar */}
          <div className="h-12"></div>
        </div>

        {/* Sticky Bottom Action */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-950 pb-8 sm:pb-4">
          <div className="flex items-center justify-between gap-4 mb-4">
             <div className="text-zinc-400 text-sm">Preço Unitário</div>
             <div className="text-2xl font-serif text-white">R$ {product.price.toFixed(2)}</div>
          </div>
          <Button 
            fullWidth 
            icon={<ShoppingBag size={20} />} 
            onClick={() => {
              onAdd(product);
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