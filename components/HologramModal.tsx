
import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Move3d, Rotate3d, Info } from 'lucide-react';
import { Product } from '../types';

interface HologramModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const HologramModal: React.FC<HologramModalProps> = ({ product, isOpen, onClose }) => {
  const [rotation, setRotation] = useState({ x: -10, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    lastPos.current = { x: clientX, y: clientY };
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - lastPos.current.x;
    const deltaY = clientY - lastPos.current.y;

    setRotation(prev => ({
      x: prev.x - deltaY * 0.5,
      y: prev.y + deltaX * 0.5
    }));

    lastPos.current = { x: clientX, y: clientY };
  };

  const handleEnd = () => setIsDragging(false);

  useEffect(() => {
    if (isOpen) setRotation({ x: -10, y: 0 });
  }, [isOpen]);

  if (!isOpen || !product) return null;

  // Efeito foil calculado com base na rotação
  const shimmerX = (rotation.y % 360) * 1.5;
  const shimmerY = (rotation.x % 360) * 1.5;
  const rainbowOpacity = 0.3 + Math.abs(Math.sin(rotation.y * 0.05)) * 0.4;

  return (
    <div 
      className="fixed inset-0 z-[400] flex items-center justify-center bg-black/98 backdrop-blur-3xl p-6 select-none touch-none animate-fade-in"
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.1),transparent_80%)]" />
      
      <button onClick={onClose} className="absolute top-8 right-8 text-white/40 hover:text-white z-50 p-3 bg-white/5 rounded-full border border-white/10 transition-all">
        <X size={24} />
      </button>

      <div className="text-center space-y-10 max-w-sm w-full relative z-10">
        <div className="space-y-2">
            <h2 className="text-3xl font-serif text-white tracking-tight drop-shadow-2xl">{product.name}</h2>
            <div className="flex items-center justify-center gap-2 text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] opacity-80">
                <Sparkles size={12} className="animate-pulse" /> Double-Sided Foil
            </div>
        </div>

        <div 
            className="perspective-2000 flex items-center justify-center h-[480px] cursor-grab active:cursor-grabbing"
            onMouseDown={handleStart}
            onTouchStart={handleStart}
        >
           <div 
             className="relative w-64 h-96 transition-transform duration-300 ease-out preserve-3d"
             style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
           >
              {/* --- FRENTE DO CARD --- */}
              <div 
                className="absolute inset-0 rounded-[2rem] bg-zinc-950 border border-white/20 shadow-2xl overflow-hidden preserve-3d"
                style={{ backfaceVisibility: 'hidden' }}
              >
                  {/* Fundo Atmosférico */}
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

                  {/* Paralaxe do Produto */}
                  <div 
                    className="absolute inset-4 transition-transform duration-150 ease-out pointer-events-none"
                    style={{ transform: `translateX(${rotation.y * -0.1}px) translateY(${rotation.x * 0.1}px) translateZ(30px) scale(1.1)` }}
                  >
                    <img src={product.image} className="w-full h-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]" />
                  </div>

                  {/* Efeito Holográfico Frontal */}
                  <div 
                    className="absolute inset-[-100%] pointer-events-none mix-blend-color-dodge transition-opacity duration-300"
                    style={{ 
                        background: `linear-gradient(${rotation.y + 45}deg, rgba(255,0,0,0.1) 0%, rgba(0,255,0,0.1) 33%, rgba(0,0,255,0.1) 66%, rgba(255,0,0,0.1) 100%)`,
                        transform: `translateX(${shimmerX}px) translateY(${shimmerY}px)`,
                        opacity: rainbowOpacity
                    }}
                  />
                  
                  {/* Borda Glow */}
                  <div className="absolute inset-0 rounded-[2rem] border-[2px] border-white/5 pointer-events-none z-50" />
              </div>

              {/* --- VERSO DO CARD (LIFESTYLE MOMENT) --- */}
              <div 
                className="absolute inset-0 rounded-[2rem] bg-zinc-950 border border-amber-500/30 shadow-2xl overflow-hidden preserve-3d"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                  {/* Imagem de Brinde (Momento) */}
                  <img src={product.backImage} className="absolute inset-0 w-full h-full object-cover scale-110 opacity-60 mix-blend-luminosity" />
                  
                  {/* Overlay Colorido do Brinde */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-amber-500/10 mix-blend-overlay" />

                  {/* Texto do Verso */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center" style={{ transform: 'translateZ(20px)' }}>
                     <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mb-4 bg-black/40 backdrop-blur-md">
                        <img src="https://i.imgur.com/hm4KO4J_d.webp?maxwidth=760&fidelity=grand" className="w-8 h-8 object-contain" />
                     </div>
                     <h3 className="text-white font-serif text-lg mb-2">Momento Patanegra</h3>
                     <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                        Celebrando a vida nos melhores lugares.
                     </p>
                  </div>

                  {/* Efeito Holográfico do Verso */}
                  <div 
                    className="absolute inset-[-100%] pointer-events-none mix-blend-soft-light transition-opacity duration-300"
                    style={{ 
                        background: `linear-gradient(${rotation.y - 45}deg, transparent 40%, rgba(245,158,11,0.3) 50%, transparent 60%)`,
                        transform: `translateX(${-shimmerX}px)`,
                        opacity: 0.6
                    }}
                  />
              </div>
           </div>
        </div>

        <div className="flex flex-col items-center gap-6 animate-fade-in delay-300">
            <div className="px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 shadow-xl">
                <Rotate3d size={18} className="text-amber-500 animate-spin-slow" />
                <span className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.25em]">
                    Gire 360° para ver o verso
                </span>
            </div>
        </div>
      </div>

      <style>{`
        .perspective-2000 { perspective: 2500px; }
        .preserve-3d { transform-style: preserve-3d; }
        @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}</style>
    </div>
  );
};
