import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Button } from './Button';
import { HERO_IMAGES } from '../constants';

interface HeroSliderProps {
  onOrderClick: () => void;
  onCalcClick: () => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ onOrderClick, onCalcClick }) => {
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Initialize Slider (Shuffle)
  useEffect(() => {
    // Fisher-Yates shuffle algorithm
    const shuffled = [...HERO_IMAGES];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setHeroImages(shuffled);
  }, []);

  // Slider Timer
  useEffect(() => {
    if (heroImages.length === 0) return;
    const timer = setInterval(() => {
      setCurrentHeroIndex(prev => (prev + 1) % heroImages.length);
    }, 5000); 
    return () => clearInterval(timer);
  }, [heroImages]);

  return (
    <div className="relative h-[70vh] w-full overflow-hidden">
        {/* Background Slider */}
        {heroImages.map((src, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentHeroIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img 
              src={src}
              alt="Patanegra Mood"
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-zinc-950" />
          </div>
        ))}

        {/* Static Overlay Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 pb-12 z-10">
          
          <div className="mb-4 inline-flex items-center px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 backdrop-blur-md self-start animate-fade-in">
            <Star size={14} className="text-amber-500 fill-amber-500 mr-2" />
            <span className="text-amber-500 text-xs font-bold tracking-wide uppercase">Chope Premium</span>
          </div>
          
          <div className="flex gap-4">
            <Button fullWidth onClick={onOrderClick}>
              Pedir Agora
            </Button>
            <Button variant="secondary" onClick={onCalcClick} className="w-16 flex-shrink-0">
               <span className="sr-only">Calculadora</span>
               🧮
            </Button>
          </div>
        </div>
      </div>
  );
};