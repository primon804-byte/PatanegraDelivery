
import React from 'react';
import { Star, Calculator } from 'lucide-react';
import { Button } from './Button';

interface HeroSliderProps {
  onOrderClick: () => void;
  onCalcClick: () => void;
}

const STATIC_IMAGE = 'https://i.ibb.co/jZWpr3kK/IMG-9249-1.jpg';

export const HeroSlider: React.FC<HeroSliderProps> = ({ onOrderClick, onCalcClick }) => {
  return (
    <div className="relative h-[70vh] w-full overflow-hidden">
        {/* Static Background Image */}
        <div className="absolute inset-0">
          <img 
            src={STATIC_IMAGE}
            alt="Patanegra Destaque"
            className="w-full h-full object-cover"
            loading="eager"
            // @ts-ignore
            fetchPriority="high"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-zinc-950" />
        </div>

        {/* Overlay Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 pb-12 z-10">
          
          <div className="mb-4 inline-flex items-center px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 backdrop-blur-md self-start animate-fade-in">
            <Star size={14} className="text-amber-500 fill-amber-500 mr-2" />
            <span className="text-amber-500 text-xs font-bold tracking-wide uppercase">Chope Premium</span>
          </div>
          
          <div className="flex flex-col gap-3 w-full">
            <Button fullWidth onClick={onOrderClick}>
              Pedir Agora
            </Button>
            
            <Button 
              fullWidth 
              variant="outline" 
              onClick={onCalcClick}
              className="bg-zinc-950/40 backdrop-blur-md border-zinc-700 hover:bg-zinc-900 hover:border-amber-500"
              icon={<Calculator size={18} />}
            >
               Calculadora de Chopp
            </Button>
          </div>
        </div>
      </div>
  );
};
