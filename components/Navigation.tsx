import React from 'react';
import { Home, Beer, Calculator, ShoppingCart } from 'lucide-react';
import { ViewState } from '../types';

interface NavigationProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  cartCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onChangeView, cartCount }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Início' },
    { id: 'menu', icon: Beer, label: 'Produtos' },
    { id: 'calculator', icon: Calculator, label: 'Calc' },
    { id: 'cart', icon: ShoppingCart, label: 'Pedido', badge: cartCount > 0 ? cartCount : null },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-zinc-800 z-50 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id as ViewState)}
              className={`flex flex-col items-center justify-center w-16 space-y-1 transition-all ${
                isActive ? 'text-amber-500' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className="relative">
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-bounce">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};