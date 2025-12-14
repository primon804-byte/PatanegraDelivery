import React from 'react';
import { Product } from '../types';
import { Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  onClick: (product: Product) => void;
  featured?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd, onClick, featured = false }) => {
  return (
    <div 
      onClick={() => onClick(product)}
      className={`relative group overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 ${featured ? 'col-span-2' : 'col-span-1'} cursor-pointer transition-transform active:scale-[0.98]`}
    >
      {product.isPopular && (
        <div className="absolute top-3 left-3 z-10 bg-amber-500 text-black text-xs font-bold px-2 py-1 rounded-md shadow-lg">
          MAIS PEDIDO
        </div>
      )}
      
      <div className={`relative ${featured ? 'h-48' : 'h-40'} w-full overflow-hidden`}>
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-semibold text-lg text-white leading-tight">{product.name}</h3>
        </div>
        
        <p className="text-zinc-400 text-xs mb-3 line-clamp-2 min-h-[2.5em]">{product.description}</p>
        
        <div className="flex items-center justify-between mt-auto">
          <span className="text-amber-500 font-bold text-lg">
            R$ {product.price.toFixed(2)}
          </span>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onAdd(product);
            }}
            className="w-10 h-10 rounded-full bg-zinc-800 text-white flex items-center justify-center hover:bg-amber-500 hover:text-black transition-colors shadow-lg shadow-black/50"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};