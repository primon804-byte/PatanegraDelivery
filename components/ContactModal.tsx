
import React from 'react';
import { X, MapPin, MessageCircle, ChevronRight, CalendarDays } from 'lucide-react';
import { WHATSAPP_NUMBERS } from '../constants';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleContact = (number: string) => {
    const message = encodeURIComponent("Olá! Gostaria de fazer um orçamento para um evento.");
    window.open(`https://wa.me/${number}?text=${message}`, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative w-full max-w-sm bg-zinc-950 rounded-3xl border border-zinc-800 shadow-2xl p-6 animate-slide-up overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-8 relative z-10">
          <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500 border border-zinc-800 shadow-lg">
            <CalendarDays size={24} />
          </div>
          <h2 className="text-2xl font-serif text-white mb-2">Orçamento para Eventos</h2>
          <p className="text-zinc-400 text-sm">Selecione sua região para falar com um especialista.</p>
        </div>

        <div className="space-y-3 relative z-10">
          <button
            onClick={() => handleContact(WHATSAPP_NUMBERS.MARECHAL)}
            className="w-full group bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/50 p-4 rounded-xl flex items-center justify-between transition-all duration-300"
          >
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center border border-green-500/20">
                    <MessageCircle size={20} />
                </div>
                <div className="text-left">
                <span className="block text-white font-bold group-hover:text-amber-500 transition-colors">Marechal Cândido Rondon</span>
                <span className="text-xs text-zinc-500">(45) 98817-5171</span>
                </div>
            </div>
            <ChevronRight className="text-zinc-600 group-hover:text-amber-500 transition-colors" size={20} />
          </button>

          <button
            onClick={() => handleContact(WHATSAPP_NUMBERS.FOZ)}
            className="w-full group bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/50 p-4 rounded-xl flex items-center justify-between transition-all duration-300"
          >
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center border border-green-500/20">
                    <MessageCircle size={20} />
                </div>
                <div className="text-left">
                <span className="block text-white font-bold group-hover:text-amber-500 transition-colors">Foz do Iguaçu</span>
                <span className="text-xs text-zinc-500">(45) 99990-1000</span>
                </div>
            </div>
            <ChevronRight className="text-zinc-600 group-hover:text-amber-500 transition-colors" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
