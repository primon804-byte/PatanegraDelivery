
import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Gift, Sparkles } from 'lucide-react';
import { CartItem } from '../types';
import { Button } from './Button';
import { useAuth } from '../contexts/AuthContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  total: number;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  total,
  onUpdateQuantity,
  onRemove,
  onCheckout
}) => {
  const { user } = useAuth();
  
  if (!isOpen) return null;

  const hasAvailableReward = user?.redeemed_missions?.some(
    missionId => !user?.used_discounts?.includes(missionId)
  );

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-[85vw] sm:max-w-md h-full bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col animate-slide-left">
        
        <div className="flex items-center justify-between p-5 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 text-black p-2 rounded-lg"><ShoppingBag size={20} /></div>
            <h2 className="text-xl font-serif text-white">Seu Pedido</h2>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-full transition-colors"><X size={24} /></button>
        </div>

        {/* Banner de Recompensa */}
        {hasAvailableReward && cart.length > 0 && (
          <div className="bg-amber-500 p-2 flex items-center justify-center gap-3 animate-pulse">
            <Gift size={16} className="text-black" />
            <span className="text-black text-[10px] font-black uppercase tracking-widest">Recompensa disponível! Aplique no Checkout</span>
            <Sparkles size={14} className="text-black" />
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
              <ShoppingBag size={48} className="opacity-20" />
              <p>Seu carrinho está vazio.</p>
              <Button variant="outline" onClick={onClose} className="mt-4">Ver Cardápio</Button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-3 bg-zinc-900/50 p-3 rounded-xl border border-zinc-900">
                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover bg-zinc-800" />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-zinc-200 text-sm leading-tight mb-1">{item.name}</h4>
                    <span className="text-amber-500 font-semibold text-sm">R$ {item.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center bg-zinc-950 rounded-lg border border-zinc-800 h-8">
                      <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-8 h-full flex items-center justify-center text-zinc-400 hover:text-white">-</button>
                      <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-8 h-full flex items-center justify-center text-zinc-400 hover:text-white">+</button>
                    </div>
                    <button onClick={() => onRemove(item.id)} className="text-zinc-600 hover:text-red-500 p-1"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-5 border-t border-zinc-900 bg-zinc-950 pb-safe">
            <div className="flex justify-between items-end mb-4">
              <span className="text-zinc-400 text-sm">Total do Pedido</span>
              <span className="text-2xl font-bold text-amber-500 font-serif">R$ {total.toFixed(2)}</span>
            </div>
            <Button fullWidth onClick={onCheckout} icon={<ArrowRight size={20} />}>
              Continuar para Pagamento
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
