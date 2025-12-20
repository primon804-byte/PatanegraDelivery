
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, X, ChevronRight, User, Calendar, Map, CheckCircle2, ArrowRight, QrCode, CreditCard, Banknote, RefreshCw, Loader2, PartyPopper, Zap, Clock, AlertTriangle, Sparkles, Trophy, Move3d, Tag, BellRing, Gift } from 'lucide-react';
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
  onOrderComplete?: (discountUsedId?: number) => void;
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
  
  const [selectedDiscountId, setSelectedDiscountId] = useState<number | null>(null);
  
  const availableDiscounts = [
    { id: 1, label: '10% OFF (Primeira Dose)', value: 0.1, missionId: 1 },
    { id: 2, label: '15% OFF (Mestre dos Estilos)', value: 0.15, missionId: 2 },
    { id: 3, label: '20% OFF (Resenha Épica)', value: 0.2, missionId: 3 },
    { id: 4, label: '20% OFF (Dono da Festa)', value: 0.2, missionId: 4 },
    { id: 5, label: '15% OFF (Cliente de Elite)', value: 0.15, missionId: 5 },
  ].filter(d => user?.redeemed_missions?.includes(d.missionId) && !user?.used_discounts?.includes(d.missionId));

  // Auto-selecionar o maior desconto disponível ao abrir
  useEffect(() => {
    if (isOpen && availableDiscounts.length > 0 && !selectedDiscountId) {
      const bestDiscount = [...availableDiscounts].sort((a, b) => b.value - a.value)[0];
      setSelectedDiscountId(bestDiscount.id);
    }
  }, [isOpen, availableDiscounts]);

  const appliedDiscountValue = selectedDiscountId 
    ? (availableDiscounts.find(d => d.id === selectedDiscountId)?.value || 0) 
    : 0;
  
  const finalTotal = total * (1 - appliedDiscountValue);

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
    if (!isOpen) checkoutSessionActive.current = false;
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
          total: finalTotal,
          status: 'Em Andamento',
          payment_method: paymentMethod,
          delivery_address: hasKegs && !provideLater ? eventAddress : address,
          branch_location: location,
          whatsapp_sent: true,
          event_address: hasKegs ? eventAddress : null,
          event_date: hasKegs ? eventDate : null,
          event_time: hasKegs ? eventTime : null,
          voltage: hasKegs ? voltage : null,
          provide_info_later: provideLater,
          discount_applied: appliedDiscountValue > 0 ? appliedDiscountValue * 100 : null
        })
        .select().single();

      if (orderError) throw orderError;

      const itemsToInsert = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        product_name: item.name,
        category: item.category,
        quantity: item.quantity,
        price: item.price,
        extras: { rentTables: item.rentTables, rentUmbrellas: item.rentUmbrellas, cupsQuantity: item.cupsQuantity }
      }));

      await supabase.from('order_items').insert(itemsToInsert);

      if (selectedDiscountId) {
        const missionId = availableDiscounts.find(d => d.id === selectedDiscountId)?.missionId;
        if (missionId) {
          const currentUsed = user.used_discounts || [];
          await supabase.from('profiles').update({ 
            used_discounts: Array.from(new Set([...currentUsed, missionId])) 
          }).eq('id', user.id);
        }
      }
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
    const growlersInCart = cart.filter(i => i.category === ProductCategory.GROWLER);
    setUnlockedItems(growlersInCart);
    await saveOrderToSupabase();
    const phoneNumber = location === 'Marechal Cândido Rondon' ? WHATSAPP_NUMBERS.MARECHAL : WHATSAPP_NUMBERS.FOZ;
    const discountText = selectedDiscountId ? `\nDesconto Aplicado: -${appliedDiscountValue * 100}%` : '';
    const message = encodeURIComponent(`*Novo Pedido Patanegra*\nTotal: R$ ${finalTotal.toFixed(2)}${discountText}\nUnidade: ${location}\nPagamento: ${paymentMethod}`);
    setStep(3);
    setIsSubmitting(false);
    setTimeout(() => {
        if (onOrderComplete) onOrderComplete(selectedDiscountId || undefined);
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    }, 200);
  };

  const isValid = () => (location && paymentMethod && (hasKegs ? (provideLater || (eventAddress && eventDate && eventTime && voltage)) : address));

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-md bg-zinc-950 rounded-[3rem] border border-zinc-800/50 shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        {step !== 3 && (
            <div className="p-8 pb-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-serif text-white">{step === 1 ? 'Qual sua unidade?' : 'Finalizar Pedido'}</h2>
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
             <button onClick={() => handleLocationSelect('Marechal Cândido Rondon')} className="w-full p-5 rounded-[2rem] flex items-center justify-between transition-all border group bg-zinc-900/50 border-zinc-800 hover:border-amber-500">
                <div className="flex items-center gap-5 text-left">
                    <div className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform"><MapPin size={24}/></div>
                    <div><span className="block font-bold text-base text-white">Marechal C. Rondon</span><span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Unidade Matriz</span></div>
                </div>
                <ChevronRight className="text-zinc-700" size={20} />
             </button>
             <button onClick={() => handleLocationSelect('Foz do Iguaçu')} className="w-full p-5 rounded-[2rem] flex items-center justify-between transition-all border group bg-zinc-900/50 border-zinc-800 hover:border-amber-500">
                <div className="flex items-center gap-5 text-left">
                    <div className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform"><MapPin size={24}/></div>
                    <div><span className="block font-bold text-base text-white">Foz do Iguaçu</span><span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Unidade Cataratas</span></div>
                </div>
                <ChevronRight className="text-zinc-700" size={20} />
             </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleFinalSubmit} className="p-8 pt-0 flex flex-col gap-5 overflow-y-auto scrollbar-hide">
            
            {availableDiscounts.length > 0 && (
              <div className="space-y-3 bg-amber-500/5 p-5 rounded-[2rem] border border-amber-500/30 relative overflow-hidden group animate-fade-in shadow-[0_0_20px_rgba(245,158,11,0.05)]">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Gift size={40} className="text-amber-500" /></div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} className="text-amber-500 animate-pulse" />
                  <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Recompensa Ativada!</span>
                </div>
                <div className="flex flex-col gap-2 relative z-10">
                  {availableDiscounts.map(d => (
                    <button 
                      key={d.id} type="button" onClick={() => setSelectedDiscountId(selectedDiscountId === d.id ? null : d.id)}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${selectedDiscountId === d.id ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                    >
                      <div className="flex items-center gap-3"><Tag size={16} /><span className="text-xs font-bold">{d.label}</span></div>
                      {selectedDiscountId === d.id ? <CheckCircle2 size={16} /> : <div className="w-4 h-4 rounded-full border border-zinc-700" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!hasKegs && (
                <div className="space-y-2">
                    <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest px-1">Endereço de Entrega</label>
                    <textarea required className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 text-white focus:border-amber-500 outline-none resize-none text-sm transition-colors" rows={2} value={address} onChange={e => setAddress(e.target.value)} placeholder="Rua, número, bairro..." />
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

            <div className="mt-4 p-5 bg-zinc-900 rounded-[2rem] border border-zinc-800">
               <div className="flex justify-between items-center mb-1"><span className="text-zinc-500 text-[10px] uppercase font-black">Subtotal</span><span className="text-white text-sm font-bold">R$ {total.toFixed(2)}</span></div>
               {appliedDiscountValue > 0 && (
                 <div className="flex justify-between items-center mb-1 text-green-500"><span className="text-[10px] uppercase font-black">Recompensa Aplicada</span><span className="text-sm font-bold">- R$ {(total * appliedDiscountValue).toFixed(2)}</span></div>
               )}
               <div className="flex justify-between items-center mt-2 pt-2 border-t border-zinc-800"><span className="text-white text-xs uppercase font-black">Total Final</span><span className="text-amber-500 text-xl font-bold font-serif">R$ {finalTotal.toFixed(2)}</span></div>
            </div>

            <Button type="submit" fullWidth className="h-16 rounded-2xl mt-4 shadow-xl shadow-amber-500/10" disabled={!isValid() || isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : 'Finalizar Pedido'}
            </Button>
          </form>
        )}

        {step === 3 && (
            <div className="p-10 flex flex-col items-center text-center animate-fade-in overflow-y-auto scrollbar-hide relative">
                <div className="absolute top-0 left-0 right-0 p-4 bg-amber-500 text-black flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] animate-slide-down">
                    <BellRing size={16} className="animate-bounce" /> Pedido Concluído com Sucesso!
                </div>
                <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mb-8 mt-12 relative"><div className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping" /><Trophy size={48} className="text-amber-500 relative z-10" /></div>
                <h2 className="text-4xl font-serif text-white mb-3">Brinde!</h2>
                <p className="text-zinc-500 text-sm mb-10 leading-relaxed px-4">Enviamos seu pedido para a unidade {location}. Confira suas figurinhas 3D!</p>

                <div className="w-full bg-zinc-900/50 rounded-[2.5rem] p-8 border border-amber-500/30 relative overflow-hidden mb-10 shadow-2xl">
                    <div className="flex flex-wrap justify-center gap-6 py-6 min-h-[160px]">
                        {unlockedItems.map(item => (
                            <button key={item.id} onClick={() => setSelectedHologram(item)} className="w-24 aspect-[3/4] bg-zinc-950 rounded-2xl border border-white/10 p-3 relative group overflow-hidden active:scale-90 transition-all shadow-lg hover:border-amber-500/50">
                                <img src={item.image} className="w-full h-full object-contain filter drop-shadow-md" />
                            </button>
                        ))}
                    </div>
                    <Button fullWidth onClick={onGoToCollection} variant="outline" className="h-14 rounded-xl border-amber-500/30 text-amber-500 mt-6 font-black uppercase text-[10px] tracking-widest">Abrir Álbum</Button>
                </div>
                <button onClick={onClose} className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.3em] hover:text-white transition-colors py-4">Voltar ao Início</button>
            </div>
        )}
      </div>
      {selectedHologram && <HologramModal product={selectedHologram} isOpen={!!selectedHologram} onClose={() => setSelectedHologram(null)} />}
    </div>
  );
};
