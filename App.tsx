
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Truck, ShieldCheck, Trash2, ShoppingCart, CalendarDays, User } from 'lucide-react';
import { PRODUCTS, HERO_IMAGES } from './constants';
import { Product, CartItem, ViewState, ProductCategory, UserProfile } from './types';
import { Button } from './components/Button';
import { ProductCard } from './components/ProductCard';
import { Calculator } from './components/Calculator';
import { Navigation } from './components/Navigation';
import { ProductDetail } from './components/ProductDetail';
import { HeroSlider } from './components/HeroSlider';
import { FloatingCart } from './components/FloatingCart';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutFlow } from './components/CheckoutFlow';
import { ContactModal } from './components/ContactModal';
// New Imports
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { ProfileDrawer } from './components/ProfileDrawer';
import { AdminDashboard } from './components/AdminDashboard';
import { CommunityView } from './components/CommunityView';

// --- Loading Component ---
const LoadingScreen = () => (
  <div className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col items-center justify-center animate-fade-in">
    <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
       <div className="absolute inset-0 bg-amber-500/15 rounded-full animate-ping" />
       <div className="relative z-10 w-full h-full bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 shadow-2xl">
          <img 
            src="https://i.imgur.com/hm4KO4J_d.webp?maxwidth=760&fidelity=grand" 
            alt="Loading"
            className="w-20 h-20 object-contain animate-pulse" 
          />
       </div>
    </div>
    <div className="text-amber-500 font-serif text-sm tracking-[0.2em] uppercase animate-pulse">Iniciando</div>
  </div>
);

// --- User Button Component ---
const UserButton = ({ onClick, user }: { onClick: () => void, user: UserProfile | null }) => {
  return (
    <button 
      onClick={onClick}
      className={`absolute top-6 right-6 z-50 w-10 h-10 backdrop-blur-md rounded-full flex items-center justify-center border transition-all duration-300 shadow-lg ${
        user 
          ? 'bg-amber-500 text-black border-amber-400 font-bold' 
          : 'bg-black/40 text-white border-white/10 hover:bg-amber-500 hover:text-black hover:border-amber-500'
      }`}
    >
      {user ? (
        <span className="text-sm">
          {user.full_name 
            ? user.full_name.substring(0, 2).toUpperCase() 
            : user.email.substring(0, 2).toUpperCase()}
        </span>
      ) : (
        <User size={20} />
      )}
    </button>
  );
};

const HomeView: React.FC<{
  setView: (v: ViewState) => void;
  onOrderClick: () => void;
  onEventClick: () => void;
  onUserClick: () => void;
  user: UserProfile | null;
}> = ({ setView, onOrderClick, onEventClick, onUserClick, user }) => (
  <div className="animate-fade-in pb-32 relative bg-zinc-950">
      <UserButton onClick={onUserClick} user={user} />
      <div className="absolute top-0 left-0 right-0 z-40 flex justify-center pt-8 pointer-events-none">
         <div className="h-32 w-auto max-w-[80%] flex items-center justify-center drop-shadow-2xl">
            <img 
              src="https://i.imgur.com/hm4KO4J_d.webp?maxwidth=760&fidelity=grand" 
              alt="Patanegra" 
              className="h-full w-full object-contain filter drop-shadow-lg"
            />
         </div>
      </div>
      <HeroSlider onOrderClick={onOrderClick} onCalcClick={() => setView('calculator')} />
      <div className="px-6 py-10 bg-zinc-950 -mt-10 relative z-20 rounded-t-[2.5rem] border-t border-zinc-900 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
        <div className="w-12 h-1 bg-zinc-800 mx-auto rounded-full mb-8 opacity-50"></div>
        <h2 className="text-3xl font-serif text-white mb-4 text-center">Por que Patanegra?</h2>
        <p className="text-zinc-400 text-center mb-10 text-lg leading-relaxed max-w-xs mx-auto">
          Transforme seu evento com o melhor chope da cidade. Rápido, gelado e sem complicações.
        </p>
        <div className="grid grid-cols-1 gap-6">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
             <div className="p-3 bg-zinc-800 rounded-lg text-amber-500"><Truck size={24} /></div>
             <div><h3 className="font-bold text-white">Entrega Expressa</h3><p className="text-sm text-zinc-400 mt-1">Seu chope chega na temperatura ideal e pronto para servir.</p></div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
             <div className="p-3 bg-zinc-800 rounded-lg text-amber-500"><ShieldCheck size={24} /></div>
             <div><h3 className="font-bold text-white">Qualidade Garantida</h3><p className="text-sm text-zinc-400 mt-1">Barris selecionados e equipamentos profissionais.</p></div>
          </div>
          <button onClick={onEventClick} className="flex items-start text-left gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-900 transition-all active:scale-[0.98]">
             <div className="p-3 bg-zinc-800 rounded-lg text-amber-500"><CalendarDays size={24} /></div>
             <div><h3 className="font-bold text-white flex items-center gap-2">Contate para Eventos <span className="text-[10px] bg-amber-500 text-black px-1.5 py-0.5 rounded font-bold uppercase">Novo</span></h3><p className="text-sm text-zinc-400 mt-1">Fale diretamente com nossa equipe via WhatsApp.</p></div>
          </button>
        </div>
      </div>
    </div>
);

const MenuView: React.FC<{
  products: Product[];
  addToCart: (p: Product, options?: Partial<CartItem>) => void;
  setSelectedProduct: (p: Product | null) => void;
  recommendedVolume: number | null;
  activeCategory: ProductCategory;
  setActiveCategory: (c: ProductCategory) => void;
  onUserClick: () => void;
  user: UserProfile | null;
}> = ({ products, addToCart, setSelectedProduct, recommendedVolume, activeCategory, setActiveCategory, onUserClick, user }) => {
  const filteredProducts = products.filter(p => p.category === activeCategory);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (scrollContainerRef.current) scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' }); }, [activeCategory]);
  return (
    <div className="animate-fade-in pb-24 max-w-md mx-auto h-screen flex flex-col relative overflow-hidden">
      <UserButton onClick={onUserClick} user={user} />
      <div className="p-4 pb-2 pt-8 flex-shrink-0">
        <h2 className="text-3xl font-serif text-white">Nosso Catálogo</h2>
        {recommendedVolume && <p className="text-amber-500 text-sm mt-1 animate-pulse">Recomendação para seu evento: ~{recommendedVolume} Litros</p>}
      </div>
      <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur-md pt-2 pb-4 border-b border-zinc-900 flex-shrink-0">
        <div className="flex overflow-x-auto gap-2 px-4 scrollbar-hide">
          {Object.values(ProductCategory).map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeCategory === cat ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 scale-105' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 scroll-smooth overscroll-contain">
        <div className="grid grid-cols-2 gap-4 pb-32">
          {filteredProducts.map(product => <ProductCard key={product.id} product={product} onAdd={(p) => addToCart(p)} onClick={setSelectedProduct} />)}
        </div>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewState>('home');
  const [activeCategory, setActiveCategory] = useState<ProductCategory>(ProductCategory.GROWLER);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('login');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [recommendedVolume, setRecommendedVolume] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Ultra-fast loader: removes splash once auth or a small timeout (400ms) is hit
    const timer = setTimeout(() => {
      setLoading(false);
      // Coordinate with index.html splash screen
      const htmlSplash = document.getElementById('initial-splash');
      if (htmlSplash) {
        htmlSplash.style.opacity = '0';
        setTimeout(() => htmlSplash.remove(), 400);
      }
    }, 400); 
    return () => clearTimeout(timer);
  }, []);

  const addToCart = (product: Product, options?: Partial<CartItem>) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.id === product.id);
      if (existingIndex >= 0) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += 1;
        return newCart;
      }
      return [...prev, { ...product, quantity: 1, ...options }];
    });
  };

  const removeFromCart = (productId: string) => setCart(prev => prev.filter(item => item.id !== productId));
  const updateQuantity = (productId: string, delta: number) => setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));

  const handleCheckoutClick = () => {
    if (!user) { setIsCartOpen(false); setAuthInitialMode('login'); setIsAuthOpen(true); return; }
    setIsCartOpen(false); setIsCheckoutOpen(true);
  };

  const handleUserClick = () => {
    if (user) setIsProfileOpen(true);
    else { setAuthInitialMode('login'); setIsAuthOpen(true); }
  };

  if (loading || authLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans animate-fade-in overflow-hidden">
      <main className="max-w-md mx-auto h-screen bg-zinc-950 shadow-2xl overflow-hidden relative flex flex-col">
        <div className="flex-1 overflow-hidden relative">
            {view === 'home' && <HomeView setView={setView} onOrderClick={() => setView('menu')} onEventClick={() => setIsContactOpen(true)} onUserClick={handleUserClick} user={user} />}
            {view === 'menu' && <MenuView products={PRODUCTS} addToCart={addToCart} setSelectedProduct={setSelectedProduct} recommendedVolume={recommendedVolume} activeCategory={activeCategory} setActiveCategory={setActiveCategory} onUserClick={handleUserClick} user={user} />}
            {view === 'community' && <CommunityView user={user} onUserClick={handleUserClick} addToCart={addToCart} currentCartTotal={cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)} onOpenCart={() => setIsCartOpen(true)} />}
            {view === 'calculator' && <div className="h-full overflow-y-auto"><Calculator onCalculate={(l) => { setRecommendedVolume(l); setView('menu'); }} /></div>}
            {view === 'cart' && <div className="p-4 pt-8 text-white h-full overflow-y-auto"><h2 className="text-3xl font-serif mb-6">Seu Pedido</h2>{cart.length === 0 ? <p className="text-zinc-500">Vazio</p> : <div className="space-y-4">{cart.map(i => <div key={i.id} className="p-4 bg-zinc-900 rounded-xl flex justify-between"><span>{i.name}</span><span>R$ {i.price}</span></div>)}<Button fullWidth onClick={handleCheckoutClick}>Finalizar</Button></div>}</div>}
        </div>
        
        <ProductDetail product={selectedProduct!} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={addToCart} />
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} total={cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} onCheckout={handleCheckoutClick} />
        <CheckoutFlow isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} cart={cart} total={cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)} onOrderComplete={() => setCart([])} />
        <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLoginSuccess={() => { setIsAuthOpen(false); setIsProfileOpen(true); }} initialView={authInitialMode} />
        <ProfileDrawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} onOpenAdmin={() => { setIsProfileOpen(false); setIsAdminOpen(true); }} />
        <AdminDashboard isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />

        {cart.length > 0 && view !== 'cart' && !isCartOpen && view !== 'community' && (
          <FloatingCart count={cart.reduce((acc, item) => acc + item.quantity, 0)} total={cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)} onClick={() => setIsCartOpen(true)} />
        )}
      </main>
      <Navigation currentView={view} onChangeView={setView} cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} />
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
