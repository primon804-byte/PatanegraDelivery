import React, { useState } from 'react';
import { Button } from './Button';
import { Users, Clock, Beer } from 'lucide-react';

interface CalculatorProps {
  onCalculate: (liters: number) => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ onCalculate }) => {
  const [guests, setGuests] = useState(20);
  const [hours, setHours] = useState(4);
  const [beerDrinkersPct, setBeerDrinkersPct] = useState(80);

  // Simple Logic: Average consumption ~1.5L to 2L per person in 4-5 hours.
  // Formula: Guests * (Percentage/100) * Hours * 0.5 Liters/Hour (conservative avg)
  const calculateTotal = () => {
    const drinkers = guests * (beerDrinkersPct / 100);
    const litersPerHour = 0.5; 
    const total = Math.ceil(drinkers * hours * litersPerHour);
    return total;
  };

  const totalLiters = calculateTotal();

  return (
    <div className="space-y-8 p-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-serif text-amber-500">Calculadora de Chopp</h2>
        <p className="text-zinc-400 text-sm">Descubra a quantidade ideal para seu evento sem desperdício.</p>
      </div>

      <div className="space-y-6 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
        
        {/* Guests Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2 text-zinc-300"><Users size={18} className="text-amber-500"/> Convidados</span>
            <span className="font-bold text-xl">{guests}</span>
          </div>
          <input 
            type="range" 
            min="5" 
            max="200" 
            step="5" 
            value={guests} 
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        {/* Hours Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2 text-zinc-300"><Clock size={18} className="text-amber-500"/> Duração (horas)</span>
            <span className="font-bold text-xl">{hours}h</span>
          </div>
          <input 
            type="range" 
            min="2" 
            max="12" 
            step="1" 
            value={hours} 
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        {/* Drinkers % Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2 text-zinc-300"><Beer size={18} className="text-amber-500"/> Bebem cerveja?</span>
            <span className="font-bold text-xl">{beerDrinkersPct}%</span>
          </div>
          <input 
            type="range" 
            min="10" 
            max="100" 
            step="10" 
            value={beerDrinkersPct} 
            onChange={(e) => setBeerDrinkersPct(Number(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>
      </div>

      <div className="text-center py-6 bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-2xl border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
        <p className="text-zinc-400 text-sm mb-1">Você vai precisar de aproximadamente:</p>
        <div className="text-5xl font-bold text-white mb-2">{totalLiters} <span className="text-2xl text-amber-500">Litros</span></div>
        <p className="text-xs text-zinc-500 px-4">Cálculo baseado em consumo médio. Recomendamos sempre uma margem de segurança de 10%.</p>
      </div>

      <Button fullWidth onClick={() => onCalculate(totalLiters)}>
        Ver Barris Recomendados
      </Button>
    </div>
  );
};