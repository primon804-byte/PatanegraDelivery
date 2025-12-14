
import React from 'react';
import { ShoppingBag, ChevronRight } from 'lucide-react';

interface FloatingCartProps {
  count: number;
  total: number;
  onClick: () => void;
}

export const FloatingCart: React.FC<FloatingCartProps> = ({ count, total, onClick }) => {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-24 right-4 z-40 animate-slide-up">
      <button
        onClick={onClick}
        className="group relative flex items-center gap-3 bg-zinc-900 border border-amber-500/30 pl-4 pr-2 py-2 rounded-2xl shadow-2xl shadow-black/80 hover:border-amber-500 transition-all active:scale-95"
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-amber-500/5 rounded-2xl group-hover:bg-amber-500/10 transition-colors" />

        {/* Text Info */}
        <div className="flex flex-col items-end z-10">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
            Seu Pedido
          </span>
          <span className="text-amber-500 font-bold font-serif text-lg leading-none">
            R$ {total.toFixed(2)}
          </span>
        </div>

        {/* Icon Container */}
        <div className="relative z-10 bg-amber-500 text-black w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-shadow">
          <ShoppingBag size={20} />
          
          {/* Notification Badge */}
          <div className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-zinc-900 shadow-sm">
            {count}
          </div>
        </div>
      </button>
    </div>
  );
};
