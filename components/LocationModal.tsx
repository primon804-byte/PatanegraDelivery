
import React from 'react';
import { MapPin, X, ChevronRight } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: string) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative w-full max-w-sm bg-zinc-950 rounded-3xl border border-zinc-800 shadow-2xl p-6 animate-slide-up overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-8 relative z-10">
          <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500 border border-zinc-800 shadow-lg">
            <MapPin size={24} />
          </div>
          <h2 className="text-2xl font-serif text-white mb-2">Selecione sua Unidade</h2>
          <p className="text-zinc-400 text-sm">Escolha a distribuidora mais próxima para agilizar seu atendimento.</p>
        </div>

        <div className="space-y-3 relative z-10">
          <button
            onClick={() => onSelect('Marechal Cândido Rondon')}
            className="w-full group bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/50 p-4 rounded-xl flex items-center justify-between transition-all duration-300"
          >
            <div className="text-left">
              <span className="block text-white font-bold group-hover:text-amber-500 transition-colors">Marechal Cândido Rondon</span>
              <span className="text-xs text-zinc-500">Matriz e Região</span>
            </div>
            <ChevronRight className="text-zinc-600 group-hover:text-amber-500 transition-colors" size={20} />
          </button>

          <button
            onClick={() => onSelect('Foz do Iguaçu')}
            className="w-full group bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/50 p-4 rounded-xl flex items-center justify-between transition-all duration-300"
          >
            <div className="text-left">
              <span className="block text-white font-bold group-hover:text-amber-500 transition-colors">Foz do Iguaçu</span>
              <span className="text-xs text-zinc-500">Filial e Região</span>
            </div>
            <ChevronRight className="text-zinc-600 group-hover:text-amber-500 transition-colors" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
