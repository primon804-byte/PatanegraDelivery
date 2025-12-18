
import React, { useState, useEffect } from 'react';
import { MapPin, X, ChevronRight, User, Calendar, Map, CheckCircle2, ArrowRight, QrCode, CreditCard, Banknote, RefreshCw, Loader2, PartyPopper, Zap, Clock, AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { CartItem, ProductCategory } from '../types';
import { WHATSAPP_NUMBERS } from '../constants';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CheckoutFlowProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  total: number;
  onOrderComplete?: () => void;
}

type LocationType = 'Marechal Cândido Rondon' | 'Foz do Iguaçu';
type PaymentMethod = 'PIX' | 'Cartão' | 'Dinheiro';

export const CheckoutFlow: React.FC<CheckoutFlowProps> = ({ isOpen, onClose, cart, total, onOrderComplete }) => {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [location, setLocation] = useState<LocationType | null>(null);
  
  // Basic Form State
  const [name, setName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [address, setAddress] = useState(''); // Used for simple delivery or fallback
  
  // Event Form State (Only for Kegs)
  const hasKegs = cart.some(item => item.category === ProductCategory.KEG30 || item.category === ProductCategory.KEG50);
  const [eventAddress, setEventAddress] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [voltage, setVoltage] = useState<'110v' | '220v' | null>(null);
  const [provideLater, setProvideLater] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize data from user profile
  useEffect(() => {
    if (isOpen && user) {
        setName(user.full_name || '');
        setAddress(user.address || '');
        setStep(1);
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
      // 1. Create Order with Customer Info
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
          // New Fields
          event_address: hasKegs ? eventAddress : null,
          event_date: hasKegs ? eventDate : null,
          event_time: hasKegs ? eventTime : null,
          voltage: hasKegs ? voltage : null,
          provide_info_later: provideLater
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create Order Items
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

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      return orderData.id;

    } catch (error) {
      console.error('Erro ao salvar pedido:', error);
      return null;
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !paymentMethod) return;
    
    // Validation for Event Data
    if (hasKegs && !provideLater) {
        if (!eventAddress || !eventDate || !eventTime || !voltage) return;
    } else {
        if (!address) return; // Regular delivery needs address
    }
    
    setIsSubmitting(true);

    // Save to DB
    await saveOrderToSupabase();

    // Determine WhatsApp Number
    const phoneNumber = location === 'Marechal Cândido Rondon' 
      ? WHATSAPP_NUMBERS.MARECHAL 
      : WHATSAPP_NUMBERS.FOZ;

    // Construct Message
    const header = `*Novo Pedido - Patanegra App*\n------------------\n`;
    
    const items = cart.map(item => {
      let itemString = `• ${item.quantity}x ${item.name} (R$ ${item.price})\n`;
      const extras = [];
      if (item.rentTables) extras.push("  - Orçamento Mesas: Sim");
      if (item.rentUmbrellas) extras.push("  - Orçamento Ombrelones: Sim");
      if (item.cupsQuantity) extras.push(`  - Copos: ${item.cupsQuantity} un.`);
      if (extras.length > 0) itemString += extras.join('\n') + '\n';
      return itemString;
    }).join('');

    const totalMsg = `\n*Total Aprox.: R$ ${total.toFixed(2)}*`;
    
    // Calculate total Liters from Cart
    const totalLiters = cart.reduce((acc, item) => {
        if (item.category === ProductCategory.KEG30) return acc + (30 * item.quantity);
        if (item.category === ProductCategory.KEG50) return acc + (50 * item.quantity);
        if (item.volumeLiters) return acc + (item.volumeLiters * item.quantity);
        return acc;
    }, 0);

    let logisticInfo = '';
    if (hasKegs) {
        if (provideLater) {
             logisticInfo = `\n\n🚛 *Logística do Evento*\n------------------\n⚠️ Cliente enviará dados depois.`;
        } else {
             logisticInfo = `\n\n🚛 *Logística do Evento*\n------------------\n📍 Local: ${eventAddress}\n📅 Data: ${eventDate}\n⏰ Hora: ${eventTime}\n⚡ Voltagem: ${voltage}\n🍺 Total Litros: ${totalLiters}L`;
        }
    } else {
        logisticInfo = `\n\n📍 *Entrega*: ${address}`;
    }
    
    const clientInfo = `\n\n👤 *Cliente*\n------------------\nNome: ${name}\nUnidade: ${location}\nPagamento: ${paymentMethod}`;
    const footer = `\n\n------------------\nAguardando confirmação.`;

    const message = encodeURIComponent(header + items + totalMsg + logisticInfo + clientInfo + footer);
    
    setIsSubmitting(false);
    if (onOrderComplete) onOrderComplete();
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    setStep(3);
  };

  // Check validity for button
  const isValid = () => {
    if (!location || !paymentMethod) return false;
    if (hasKegs && !provideLater) {
        return eventAddress && eventDate && eventTime && voltage;
    }
    return !!address;
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-fade-in"
        onClick={() => step === 3 ? onClose() : onClose()}
      />

      <div className="relative w-full max-w-md bg-zinc-950 rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />

        {step !== 3 && (
            <div className="flex items-center justify-between p-6 pb-2">
            <h2 className="text-xl font-serif text-white">
                {step === 1 ? 'Onde será a entrega?' : 'Dados do Evento'}
            </h2>
            <button 
                onClick={onClose}
                className="text-zinc-500 hover:text-white transition-colors"
            >
                <X size={20} />
            </button>
            </div>
        )}

        {step !== 3 && (
            <div className="px-6 flex gap-2 mb-6">
            <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-amber-500' : 'bg-zinc-800'}`} />
            <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-amber-500' : 'bg-zinc-800'}`} />
            </div>
        )}

        {/* STEP 1: Location Selection */}
        {step === 1 && (
          <div className="p-6 pt-0 space-y-4 overflow-y-auto">
             <button
              onClick={() => handleLocationSelect('Marechal Cândido Rondon')}
              className={`w-full group border p-4 rounded-xl flex items-center justify-between transition-all duration-300 ${location === 'Marechal Cândido Rondon' ? 'bg-amber-500/10 border-amber-500' : 'bg-zinc-900 border-zinc-800 hover:border-amber-500/50'}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center border bg-zinc-950 text-amber-500 border-zinc-800">
                  <MapPin size={20} />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-sm text-white">Marechal Cândido Rondon</span>
                  <span className="text-xs text-zinc-500">Matriz</span>
                </div>
              </div>
              <ChevronRight className="text-zinc-600" size={20} />
            </button>

            <button
              onClick={() => handleLocationSelect('Foz do Iguaçu')}
              className={`w-full group border p-4 rounded-xl flex items-center justify-between transition-all duration-300 ${location === 'Foz do Iguaçu' ? 'bg-amber-500/10 border-amber-500' : 'bg-zinc-900 border-zinc-800 hover:border-amber-500/50'}`}
            >
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full flex items-center justify-center border bg-zinc-950 text-amber-500 border-zinc-800">
                  <MapPin size={20} />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-sm text-white">Foz do Iguaçu</span>
                  <span className="text-xs text-zinc-500">Filial</span>
                </div>
              </div>
              <ChevronRight className="text-zinc-600" size={20} />
            </button>
          </div>
        )}

        {/* STEP 2: Event Details Form */}
        {step === 2 && (
          <form onSubmit={handleFinalSubmit} className="p-6 pt-0 flex flex-col gap-4 overflow-y-auto">
            
            {/* Context Info */}
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                <span>Unidade: <strong className="text-amber-500">{location}</strong></span>
                <button type="button" onClick={() => setStep(1)} className="underline hover:text-white">Alterar</button>
            </div>

            {hasKegs ? (
                // --- KEG SPECIFIC FIELDS ---
                <div className="space-y-4 animate-fade-in">
                    
                    <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-start gap-3">
                        <AlertTriangle className="text-amber-500 shrink-0 mt-1" size={16} />
                        <div className="text-xs text-zinc-300">
                            Você tem <strong>Barris de Chopp</strong> no carrinho. Precisamos dos detalhes do evento para a instalação.
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                        <input 
                            type="checkbox" 
                            id="provideLater"
                            checked={provideLater}
                            onChange={(e) => setProvideLater(e.target.checked)}
                            className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                        />
                        <label htmlFor="provideLater" className="text-sm text-zinc-400 cursor-pointer select-none">
                            Não tenho os dados agora (enviar depois)
                        </label>
                    </div>

                    {!provideLater && (
                        <div className="space-y-4 border-l-2 border-zinc-800 pl-4">
                            <div className="space-y-1">
                                <label className="text-xs text-zinc-500 uppercase font-bold">Endereço do Evento</label>
                                <input 
                                    required
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none"
                                    placeholder="Local da festa..."
                                    value={eventAddress}
                                    onChange={e => setEventAddress(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-500 uppercase font-bold">Data</label>
                                    <input 
                                        type="date"
                                        required
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none [color-scheme:dark]"
                                        value={eventDate}
                                        onChange={e => setEventDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-500 uppercase font-bold">Hora</label>
                                    <input 
                                        type="time"
                                        required
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none [color-scheme:dark]"
                                        value={eventTime}
                                        onChange={e => setEventTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-zinc-500 uppercase font-bold">Voltagem da Tomada</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setVoltage('110v')}
                                        className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${voltage === '110v' ? 'bg-amber-500 text-black border-amber-500 font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
                                    >
                                        <Zap size={16} /> 110V
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setVoltage('220v')}
                                        className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${voltage === '220v' ? 'bg-amber-500 text-black border-amber-500 font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
                                    >
                                        <Zap size={16} /> 220V
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                // --- SIMPLE DELIVERY FIELDS ---
                <div className="space-y-1 animate-fade-in">
                    <label className="text-xs text-zinc-500 uppercase font-bold">Endereço de Entrega</label>
                    <textarea 
                        required
                        rows={2}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 pl-10 text-white focus:border-amber-500 focus:outline-none resize-none"
                        placeholder="Rua, Número, Bairro..."
                    />
                    <Map size={18} className="absolute left-3 top-9 text-zinc-500" />
                </div>
            )}

            {/* Total Liters Display */}
            {hasKegs && (
                <div className="bg-zinc-900 p-3 rounded-xl flex justify-between items-center border border-zinc-800">
                    <span className="text-xs text-zinc-400 font-bold uppercase">Total de Chopp</span>
                    <span className="text-amber-500 font-bold">
                        {cart.reduce((acc, item) => {
                            const vol = item.volumeLiters || (item.category === ProductCategory.KEG30 ? 30 : (item.category === ProductCategory.KEG50 ? 50 : 0));
                            return acc + (vol * item.quantity);
                        }, 0)} Litros
                    </span>
                </div>
            )}

            <div className="space-y-2 pt-2 border-t border-zinc-900">
               <label className="text-xs text-zinc-500 uppercase font-bold">Forma de Pagamento</label>
               <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setPaymentMethod('PIX')} className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'PIX' ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}>
                    <QrCode size={20} /> <span className="text-[10px] font-bold">PIX</span>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('Cartão')} className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'Cartão' ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}>
                    <CreditCard size={20} /> <span className="text-[10px] font-bold">Cartão</span>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('Dinheiro')} className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'Dinheiro' ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}>
                    <Banknote size={20} /> <span className="text-[10px] font-bold">Dinheiro</span>
                  </button>
               </div>
            </div>

            <Button 
              type="submit" 
              fullWidth 
              className="mt-2"
              icon={isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
              disabled={!isValid() || isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Finalizar no WhatsApp'}
            </Button>
          </form>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 3 && (
            <div className="p-8 flex flex-col items-center justify-center h-full text-center animate-fade-in">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                    <CheckCircle2 size={40} className="text-green-500 relative z-10" />
                </div>
                
                <h2 className="text-2xl font-serif text-white mb-2">Pedido Enviado!</h2>
                <p className="text-zinc-400 text-sm mb-6">
                    Agradecemos a preferência. A confirmação do seu pedido e detalhes de entrega serão tratados diretamente no WhatsApp que abriu.
                </p>

                <Button fullWidth onClick={onClose} variant="secondary">
                    Voltar para o Cardápio
                </Button>
            </div>
        )}
      </div>
    </div>
  );
};
