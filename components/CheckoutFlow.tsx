
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, X, ChevronRight, User, Calendar, Map, CheckCircle2, ArrowRight, QrCode, CreditCard, Banknote, RefreshCw, Loader2, PartyPopper, Zap, Clock, AlertTriangle, Sparkles, Trophy, Move3d } from 'lucide-react';
import { Button } from './Button';
import { CartItem, ProductCategory, Product } from '../types';
import { WHATSAPP_NUMBERS } from '../constants';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { HologramModal } from './HologramModal';

interface CheckoutFlowProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  total: number;
  onOrderComplete?: () => void;
  onGoToCollection?: () => void;
}

type LocationType = 'Marechal Cândido Rondon' | 'Foz do Iguaçu';
type PaymentMethod = 'PIX' | 'Cartão' | 'Dinheiro';

export const CheckoutFlow: React.FC<CheckoutFlowProps> = ({ isOpen, onClose, cart, total, onOrderComplete, onGoToCollection }) => {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [location, setLocation] = useState<LocationType | null>(null);
  const [unlockedItems, setUnlockedItems] = useState<Product[]>([]);
  const [selectedHologram, setSelectedHologram] = useState<Product | null>(null);
  
  const [name, setName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [address, setAddress] = useState(''); 
  
  const hasKegs = cart.some(item => item.category === ProductCategory.KEG30 || item.category === ProductCategory.KEG50);
  const [eventAddress, setEventAddress] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [voltage, setVoltage] = useState<'110v' | '220v' | null>(null);
  const [provideLater, setProvideLater] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const checkoutSessionActive = useRef(false);

  useEffect(() => {
    if (isOpen && !checkoutSessionActive.current) {
        checkoutSessionActive.current = true;
        setStep(1);
        if (user) {
            setName(user.full_name || '');
            const savedAddress = [user.address, user.bairro, user.city].filter(Boolean).join(', ');
            setAddress(savedAddress || '');
        }
    }
    if (!isOpen) {
        checkoutSessionActive.current = false;
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleLocationSelect = (loc: LocationType) => {
    setLocation(loc);
    setStep(2);
  };

  const saveOrderToSupabase = async () => {
    if (!user) return null;
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          customer_name: name,
          customer_phone: user.phone || 'N/A',
          total: total,
          status: 'Em Andamento',
          payment_method: paymentMethod,
          delivery_address: hasKegs && !provideLater ? eventAddress : address,
          branch_location: location,
          whatsapp_sent: true,
          event_address: hasKegs ? eventAddress : null,
          event_date: hasKegs ? eventDate : null,
          event_time: hasKegs ? eventTime : null,
          voltage: hasKegs ? voltage : null,
          provide_info_later: provideLater
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const itemsToInsert = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        product_name: item.name,
        category: item.category,
        quantity: item.quantity,
        price: item.price,
        extras: {
          rentTables: item.rentTables,
          rentUmbrellas: item.rentUmbrellas,
          cupsQuantity: item.cupsQuantity
        }
      }));

      await supabase.from('order_items').insert(itemsToInsert);
      return orderData.id;
    } catch (error) {
      console.error('Erro ao salvar pedido:', error);
      return null;
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !paymentMethod) return;
    
    setIsSubmitting(true);
    
    // Captura os growlers ANTES de limpar para a tela de prêmio
    const growlersInCart = cart.filter(i => i.category === ProductCategory.GROWLER);
    setUnlockedItems(growlersInCart);
    
    await saveOrderToSupabase();

    const phoneNumber = location === 'Marechal Cândido Rondon' 
      ? WHATSAPP_NUMBERS.MARECHAL 
      : WHATSAPP_NUMBERS.FOZ;

    const message = encodeURIComponent(`*Novo Pedido Patanegra*\nTotal: R$ ${total.toFixed(2)}\nUnidade: ${location}\nPagamento: ${paymentMethod}`);
    
    setStep(3);
    setIsSubmitting(false);
    
    // Pequena pausa para garantir transição visual
    setTimeout(() => {
        if (onOrderComplete) onOrderComplete();
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    }, 200);
  };

  const isValid = () => {
    if (!location || !paymentMethod) return false;
    if (hasKegs && !provideLater) {
        return eventAddress && eventDate && eventTime && voltage;
    }
    return !!address;
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md animate-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-md bg-zinc-950 rounded-[3rem] border border-zinc-800/50 shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        {step !== 3 && (
            <div className="p-8 pb-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-serif text-white">
                        {step === 1 ? 'Qual sua unidade?' : 'Finalizar Pedido'}
                    </h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X size={24} /></button>
                </div>
                <div className="flex gap-2">
                    <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-zinc-800'}`} />
                    <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-zinc-800'}`} />
                </div>
            </div>
        )}

        {step === 1 && (
          <div className="p-8 pt-0 space-y-4 overflow-y-auto scrollbar-hide">
             <button onClick={() => handleLocationSelect('Marechal Cândido Rondon')} className={`w-full p-5 rounded-[2rem] flex items-center justify-between transition-all border group ${location === 'Marechal Cândido Rondon' ? 'bg-amber-500/10 border-amber-500' : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'}`}>
                <div className="flex items-center gap-5 text-left">
                    <div className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform"><MapPin size={24}/></div>
                    <div>
                        <span className="block font-bold text-base text-white">Marechal C. Rondon</span>
                        <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Unidade Matriz</span>
                    </div>
                </div>
                <ChevronRight className="text-zinc-700" size={20} />
             </button>
             <button onClick={() => handleLocationSelect('Foz do Iguaçu')} className={`w-full p-5 rounded-[2rem] flex items-center justify-between transition-all border group ${location === 'Foz do Iguaçu' ? 'bg-amber-500/10 border-amber-500' : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'}`}>
                <div className="flex items-center gap-5 text-left">
                    <div className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform"><MapPin size={24}/></div>
                    <div>
                        <span className="block font-bold text-base text-white">Foz do Iguaçu</span>
                        <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Unidade Cataratas</span>
                    </div>
                </div>
                <ChevronRight className="text-zinc-700" size={20} />
             </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleFinalSubmit} className="p-8 pt-0 flex flex-col gap-5 overflow-y-auto scrollbar-hide">
            {!hasKegs && (
                <div className="space-y-2">
                    <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest px-1">Endereço de Entrega</label>
                    <textarea required className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 text-white focus:border-amber-500 outline-none resize-none text-sm transition-colors" rows={2} value={address} onChange={e => setAddress(e.target.value)} placeholder="Rua, número, bairro..." />
                </div>
            )}
            
            {hasKegs && (
                <div className="space-y-5 animate-fade-in">
                    <div className="flex items-center gap-3 px-1">
                        <input type="checkbox" id="provideLater" checked={provideLater} onChange={e => setProvideLater(e.target.checked)} className="w-5 h-5 accent-amber-500 rounded-lg cursor-pointer" />
                        <label htmlFor="provideLater" className="text-xs text-zinc-400 font-medium cursor-pointer">Enviar dados do evento depois</label>
                    </div>
                    {!provideLater && (
                        <div className="space-y-4">
                             <input required className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 text-white text-sm focus:border-amber-500 outline-none" placeholder="Local exato do Evento" value={eventAddress} onChange={e => setEventAddress(e.target.value)} />
                             <div className="grid grid-cols-2 gap-4">
                                <input type="date" required className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 text-white text-sm [color-scheme:dark] outline-none focus:border-amber-500" value={eventDate} onChange={e => setEventDate(e.target.value)} />
                                <input type="time" required className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 text-white text-sm [color-scheme:dark] outline-none focus:border-amber-500" value={eventTime} onChange={e => setEventTime(e.target.value)} />
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <button type="button" onClick={() => setVoltage('110v')} className={`p-4 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all ${voltage === '110v' ? 'bg-amber-500 text-black border-amber-500' : 'bg-zinc-900/50 border-zinc-800 text-zinc-500'}`}>110V</button>
                                <button type="button" onClick={() => setVoltage('220v')} className={`p-4 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all ${voltage === '220v' ? 'bg-amber-500 text-black border-amber-500' : 'bg-zinc-900/50 border-zinc-800 text-zinc-500'}`}>220V</button>
                             </div>
                        </div>
                    )}
                </div>
            )}

            <div className="space-y-3">
                <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest px-1">Forma de Pagamento</label>
                <div className="grid grid-cols-3 gap-3">
                    {['PIX', 'Cartão', 'Dinheiro'].map(m => (
                        <button key={m} type="button" onClick={() => setPaymentMethod(m as PaymentMethod)} className={`p-4 rounded-2xl border text-[9px] font-black uppercase tracking-wider transition-all ${paymentMethod === m ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'bg-zinc-900/50 border-zinc-800 text-zinc-600'}`}>{m}</button>
                    ))}
                </div>
            </div>

            <Button type="submit" fullWidth className="h-16 rounded-2xl mt-4" disabled={!isValid() || isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : 'Confirmar Pedido'}
            </Button>
          </form>
        )}

        {step === 3 && (
            <div className="p-10 flex flex-col items-center text-center animate-fade-in overflow-y-auto scrollbar-hide">
                <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mb-8 relative">
                    <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping" />
                    <Trophy size={48} className="text-amber-500 relative z-10" />
                </div>
                
                <h2 className="text-4xl font-serif text-white mb-3">Concluído!</h2>
                <p className="text-zinc-500 text-sm mb-10 leading-relaxed px-4">
                    Sua solicitação foi enviada. Agora, confira seus novos colecionáveis 3D!
                </p>

                <div className="w-full bg-zinc-900/50 rounded-[2.5rem] p-8 border border-amber-500/30 relative overflow-hidden mb-10 shadow-2xl">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl animate-bounce">
                        <Sparkles size={10} /> {unlockedItems.length > 0 ? 'Novas Figurinhas' : 'Coleção Atualizada'}
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-6 py-6 min-h-[160px]">
                        {unlockedItems.length > 0 ? unlockedItems.map(item => (
                            <button 
                                key={item.id}
                                onClick={() => setSelectedHologram(item)}
                                className="w-24 aspect-[3/4] bg-zinc-950 rounded-2xl border border-white/10 p-3 relative group overflow-hidden active:scale-90 transition-all shadow-lg hover:border-amber-500/50"
                            >
                                <img src={item.image} className="w-full h-full object-contain filter drop-shadow-md" />
                                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Move3d size={24} className="text-white drop-shadow-lg" />
                                </div>
                            </button>
                        )) : (
                            <div className="flex flex-col items-center opacity-40">
                                <Sparkles size={48} className="text-zinc-600" />
                                <span className="text-[10px] text-zinc-600 mt-4 uppercase font-black">Nenhum sticker extra</span>
                            </div>
                        )}
                    </div>
                    
                    <Button fullWidth onClick={onGoToCollection} variant="outline" className="h-14 rounded-xl border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-black mt-6 font-black uppercase text-[10px] tracking-widest">
                        Abrir Álbum Completo
                    </Button>
                </div>

                <button onClick={onClose} className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.3em] hover:text-white transition-colors py-4">
                    Finalizar e Voltar
                </button>
            </div>
        )}
      </div>

      {selectedHologram && (
          <HologramModal 
            product={selectedHologram} 
            isOpen={!!selectedHologram} 
            onClose={() => setSelectedHologram(null)} 
          />
      )}
    </div>
  );
};
