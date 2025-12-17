
import React, { useState } from 'react';
import { MapPin, X, ChevronRight, User, Calendar, Map, CheckCircle2, ArrowRight, QrCode, CreditCard, Banknote, RefreshCw, Loader2, PartyPopper } from 'lucide-react';
import { Button } from './Button';
import { CartItem } from '../types';
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
  
  // Form State
  const [name, setName] = useState(user?.full_name || '');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState(user?.address || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          delivery_address: address,
          branch_location: location,
          whatsapp_sent: true
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create Order Items with Category (Class)
      const itemsToInsert = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        product_name: item.name,
        category: item.category, // Saving the class/category
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
    if (!location || !name || !dob || !address || !paymentMethod) return;
    
    setIsSubmitting(true);

    // Save to DB
    await saveOrderToSupabase();

    // Determine WhatsApp Number based on Location
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
      
      if (extras.length > 0) {
        itemString += extras.join('\n') + '\n';
      }
      return itemString;
    }).join('');

    const totalMsg = `\n*Total Aprox.: R$ ${total.toFixed(2)}*`;
    
    const clientInfo = `\n\n👤 *Dados do Cliente*\n------------------\nNome: ${name}\nNascimento: ${dob}\nEndereço: ${address}\n📍 Unidade: ${location}\n💰 Pagamento: ${paymentMethod}`;
    const footer = `\n\n------------------\nGostaria de confirmar o pedido.`;

    const message = encodeURIComponent(header + items + totalMsg + clientInfo + footer);
    
    setIsSubmitting(false);
    
    // Clear cart via parent prop
    if (onOrderComplete) {
        onOrderComplete();
    }

    // Open WhatsApp
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    
    // Move to Step 3 (Success)
    setStep(3);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-fade-in"
        onClick={() => step === 3 ? onClose() : onClose()}
      />

      {/* Content Container */}
      <div className="relative w-full max-w-sm bg-zinc-950 rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        
        {/* Glow Effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />

        {/* Header (Hidden on Success step for cleaner look) */}
        {step !== 3 && (
            <div className="flex items-center justify-between p-6 pb-2">
            <h2 className="text-xl font-serif text-white">
                {step === 1 ? 'Onde você está?' : 'Finalizar Pedido'}
            </h2>
            <button 
                onClick={onClose}
                className="text-zinc-500 hover:text-white transition-colors"
            >
                <X size={20} />
            </button>
            </div>
        )}

        {/* Progress Bar (Hidden on Success) */}
        {step !== 3 && (
            <div className="px-6 flex gap-2 mb-6">
            <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-amber-500' : 'bg-zinc-800'}`} />
            <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-amber-500' : 'bg-zinc-800'}`} />
            </div>
        )}

        {/* STEP 1: Location Selection */}
        {step === 1 && (
          <div className="p-6 pt-0 space-y-4 overflow-y-auto">
             <p className="text-zinc-400 text-sm mb-4">Selecione a unidade mais próxima para agilizar sua entrega.</p>
             
             <button
              onClick={() => handleLocationSelect('Marechal Cândido Rondon')}
              className={`w-full group border p-4 rounded-xl flex items-center justify-between transition-all duration-300 ${location === 'Marechal Cândido Rondon' ? 'bg-amber-500/10 border-amber-500' : 'bg-zinc-900 border-zinc-800 hover:border-amber-500/50'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${location === 'Marechal Cândido Rondon' ? 'bg-amber-500 text-black border-amber-500' : 'bg-zinc-950 text-amber-500 border-zinc-800'}`}>
                  <MapPin size={20} />
                </div>
                <div className="text-left">
                  <span className={`block font-bold text-sm transition-colors ${location === 'Marechal Cândido Rondon' ? 'text-amber-500' : 'text-white'}`}>Marechal Cândido Rondon</span>
                  <span className="text-xs text-zinc-500">Matriz e Região</span>
                </div>
              </div>
              <ChevronRight className={`transition-colors ${location === 'Marechal Cândido Rondon' ? 'text-amber-500' : 'text-zinc-600 group-hover:text-amber-500'}`} size={20} />
            </button>

            <button
              onClick={() => handleLocationSelect('Foz do Iguaçu')}
              className={`w-full group border p-4 rounded-xl flex items-center justify-between transition-all duration-300 ${location === 'Foz do Iguaçu' ? 'bg-amber-500/10 border-amber-500' : 'bg-zinc-900 border-zinc-800 hover:border-amber-500/50'}`}
            >
              <div className="flex items-center gap-4">
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${location === 'Foz do Iguaçu' ? 'bg-amber-500 text-black border-amber-500' : 'bg-zinc-950 text-amber-500 border-zinc-800'}`}>
                  <MapPin size={20} />
                </div>
                <div className="text-left">
                  <span className={`block font-bold text-sm transition-colors ${location === 'Foz do Iguaçu' ? 'text-amber-500' : 'text-white'}`}>Foz do Iguaçu</span>
                  <span className="text-xs text-zinc-500">Filial e Região</span>
                </div>
              </div>
              <ChevronRight className={`transition-colors ${location === 'Foz do Iguaçu' ? 'text-amber-500' : 'text-zinc-600 group-hover:text-amber-500'}`} size={20} />
            </button>
          </div>
        )}

        {/* STEP 2: User Data Form */}
        {step === 2 && (
          <form onSubmit={handleFinalSubmit} className="p-6 pt-0 flex flex-col gap-4 overflow-y-auto">
            
            {/* Interactive Location Display */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                        <MapPin size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] text-zinc-500 uppercase font-bold">Unidade</p>
                        <p className="text-sm font-medium text-white leading-tight">{location}</p>
                    </div>
                </div>
                <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                >
                    <RefreshCw size={12} />
                    Trocar
                </button>
            </div>

            {!user && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 text-center">
                    Dica: Faça login para salvar seus pedidos e não precisar preencher seus dados toda vez.
                </div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Seu Nome</label>
              <div className="relative">
                <input 
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 pl-10 text-white focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="Como podemos te chamar?"
                />
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Data de Nascimento</label>
              <div className="relative">
                <input 
                  required
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 pl-10 text-white focus:border-amber-500 focus:outline-none transition-colors [color-scheme:dark]"
                />
                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Endereço de Entrega</label>
              <div className="relative">
                <textarea 
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 pl-10 text-white focus:border-amber-500 focus:outline-none transition-colors resize-none"
                  placeholder="Rua, Número, Bairro..."
                />
                <Map size={18} className="absolute left-3 top-4 text-zinc-500" />
              </div>
            </div>

            <div className="space-y-2 pt-2">
               <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Forma de Pagamento</label>
               <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PIX')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'PIX' ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}
                  >
                    <QrCode size={20} />
                    <span className="text-[10px] font-bold">PIX</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cartão')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'Cartão' ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}
                  >
                    <CreditCard size={20} />
                    <span className="text-[10px] font-bold">Cartão</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Dinheiro')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'Dinheiro' ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}
                  >
                    <Banknote size={20} />
                    <span className="text-[10px] font-bold">Dinheiro</span>
                  </button>
               </div>
            </div>

            <Button 
              type="submit" 
              fullWidth 
              className="mt-4"
              icon={isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
              disabled={!name || !dob || !address || !paymentMethod || isSubmitting}
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

                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 w-full mb-8">
                    <div className="flex items-center justify-center gap-2 text-amber-500 mb-1">
                        <PartyPopper size={18} />
                        <span className="font-bold text-sm uppercase">Tudo Certo</span>
                    </div>
                    <p className="text-xs text-zinc-500">Seu pedido já foi salvo em nosso sistema.</p>
                </div>

                <Button fullWidth onClick={onClose} variant="secondary">
                    Voltar para o Cardápio
                </Button>
            </div>
        )}
      </div>
    </div>
  );
};
