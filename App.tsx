
import React, { useState } from 'react';
import { ShoppingBag, Truck, ShieldCheck, Trash2, ShoppingCart } from 'lucide-react';
import { PRODUCTS } from './constants';
import { Product, CartItem, ViewState, ProductCategory } from './types';
import { Button } from './components/Button';
import { ProductCard } from './components/ProductCard';
import { Calculator } from './components/Calculator';
import { Navigation } from './components/Navigation';
import { ProductDetail } from './components/ProductDetail';
import { HeroSlider } from './components/HeroSlider';
import { FloatingCart } from './components/FloatingCart';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutFlow } from './components/CheckoutFlow';

// --- Extracted Components ---

const HomeView: React.FC<{
  setView: (v: ViewState) => void;
  onOrderClick: () => void;
}> = ({ setView, onOrderClick }) => (
  <div className="animate-fade-in pb-32 relative bg-zinc-950">
      
      {/* Logo Overlay - Fixed Image URL */}
      <div className="absolute top-0 left-0 right-0 z-40 flex justify-center pt-8 pointer-events-none">
         <div className="h-32 w-auto max-w-[80%] flex items-center justify-center drop-shadow-2xl">
            <img 
              src="https://i.imgur.com/hm4KO4J_d.webp?maxwidth=760&fidelity=grand" 
              alt="Patanegra" 
              className="h-full w-full object-contain filter drop-shadow-lg" 
            />
         </div>
      </div>

      <HeroSlider 
        onOrderClick={onOrderClick}
        onCalcClick={() => setView('calculator')}
      />

      <div className="px-6 py-10 bg-zinc-950 -mt-10 relative z-20 rounded-t-[2.5rem] border-t border-zinc-900 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
        <div className="w-12 h-1 bg-zinc-800 mx-auto rounded-full mb-8 opacity-50"></div>
        
        <h2 className="text-3xl font-serif text-white mb-4 text-center">Por que Patanegra?</h2>
        <p className="text-zinc-400 text-center mb-10 text-lg leading-relaxed max-w-xs mx-auto">
          Transforme seu evento com o melhor chope da cidade. Rápido, gelado e sem complicações.
        </p>

        <div className="grid grid-cols-1 gap-6">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
             <div className="p-3 bg-zinc-800 rounded-lg text-amber-500">
               <Truck size={24} />
             </div>
             <div>
               <h3 className="font-bold text-white">Entrega Expressa</h3>
               <p className="text-sm text-zinc-400 mt-1">Seu chope chega na temperatura ideal e pronto para servir.</p>
             </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
             <div className="p-3 bg-zinc-800 rounded-lg text-amber-500">
               <ShieldCheck size={24} />
             </div>
             <div>
               <h3 className="font-bold text-white">Qualidade Garantida</h3>
               <p className="text-sm text-zinc-400 mt-1">Barris selecionados e equipamentos profissionais.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
);

const MenuView: React.FC<{
  products: Product[];
  addToCart: (p: Product) => void;
  setSelectedProduct: (p: Product | null) => void;
  recommendedVolume: number | null;
}> = ({ products, addToCart, setSelectedProduct, recommendedVolume }) => {
  const [activeCategory, setActiveCategory] = useState<ProductCategory>(ProductCategory.GROWLER);
  const filteredProducts = products.filter(p => p.category === activeCategory);

  return (
    <div className="animate-fade-in pb-24 max-w-md mx-auto h-screen flex flex-col">
      <div className="p-4 pb-2 pt-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-serif text-white">Nosso Catálogo</h2>
          </div>
        </div>
        
        {recommendedVolume && (
            <p className="text-amber-500 text-sm mt-1">
              Baseado no seu cálculo: ~{recommendedVolume} Litros
            </p>
        )}
      </div>
      
      <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur-md pt-2 pb-4 border-b border-zinc-900">
        <div className="flex overflow-x-auto gap-2 px-4 snap-x">
          {Object.values(ProductCategory).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`snap-center flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 scale-105'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Padding bottom ensures content isn't hidden behind floating elements */}
        <div className="grid grid-cols-2 gap-4 pb-32">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAdd={addToCart}
                onClick={setSelectedProduct}
                featured={product.category === ProductCategory.COMBO && product.isPopular}
              />
            ))
          ) : (
            <div className="col-span-2 text-center py-12 text-zinc-500">
              <p>Nenhum produto nesta categoria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CartView: React.FC<{
  cart: CartItem[];
  cartTotal: number;
  setView: (v: ViewState) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, d: number) => void;
  onCheckout: () => void;
}> = ({ cart, cartTotal, setView, removeFromCart, updateQuantity, onCheckout }) => (
  <div className="animate-slide-up p-4 pt-8 pb-24 h-full flex flex-col max-w-md mx-auto min-h-screen">
      <h2 className="text-3xl font-serif text-white mb-6">Seu Pedido</h2>
      
      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center opacity-50">
          <ShoppingBag size={64} className="mb-4 text-zinc-600" />
          <p className="text-xl">Seu carrinho está vazio</p>
          <Button variant="outline" className="mt-6" onClick={() => setView('menu')}>
            Ver Produtos
          </Button>
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-4 overflow-y-auto">
            {cart.map(item => (
              <div key={item.id} className="flex items-center gap-4 bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <h4 className="font-bold text-white">{item.name}</h4>
                  <div className="text-amber-500 font-semibold">R$ {item.price.toFixed(2)}</div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                   <button onClick={() => removeFromCart(item.id)} className="text-zinc-500 hover:text-red-500">
                     <Trash2 size={16} />
                   </button>
                   <div className="flex items-center bg-zinc-800 rounded-lg">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center text-zinc-300 hover:text-white"
                      >-</button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center text-zinc-300 hover:text-white"
                      >+</button>
                   </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
            <div className="flex justify-between items-center mb-4 text-zinc-400">
              <span>Subtotal</span>
              <span>R$ {cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-6 text-white text-xl font-bold">
              <span>Total</span>
              <span className="text-amber-500">R$ {cartTotal.toFixed(2)}</span>
            </div>
            <Button fullWidth onClick={onCheckout} icon={<ShoppingBag size={20} />}>
              Finalizar no WhatsApp
            </Button>
            <p className="text-xs text-center text-zinc-500 mt-3">
              Ao clicar, você será redirecionado para o WhatsApp para confirmar entrega e pagamento.
            </p>
          </div>
        </>
      )}
    </div>
);

// --- Main App Component ---

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Products are now completely static from constants.ts
  const products = PRODUCTS;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [recommendedVolume, setRecommendedVolume] = useState<number | null>(null);

  // Product Detail State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleOrderClick = () => {
    // Just switch to menu
    setView('menu');
  };

  const handleCheckoutClick = () => {
    // Open the new checkout flow (Location + Form)
    setIsCartOpen(false); // Close drawer if open
    setIsCheckoutOpen(true);
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleCalculatorResult = (liters: number) => {
    setRecommendedVolume(liters);
    setView('menu');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500 selection:text-black">
      <main className="max-w-md mx-auto min-h-screen bg-zinc-950 shadow-2xl overflow-hidden relative">
        
        {view === 'home' && (
          <HomeView 
            setView={setView} 
            onOrderClick={handleOrderClick}
          />
        )}

        {view === 'menu' && (
          <MenuView 
            products={products} 
            addToCart={addToCart} 
            setSelectedProduct={setSelectedProduct}
            recommendedVolume={recommendedVolume}
          />
        )}

        {view === 'calculator' && (
          <Calculator onCalculate={handleCalculatorResult} />
        )}

        {view === 'cart' && (
          <CartView 
            cart={cart}
            cartTotal={cartTotal}
            setView={setView}
            removeFromCart={removeFromCart}
            updateQuantity={updateQuantity}
            onCheckout={handleCheckoutClick}
          />
        )}
        
        {/* Product Detail Modal */}
        {selectedProduct && (
          <ProductDetail 
            product={selectedProduct} 
            isOpen={!!selectedProduct} 
            onClose={() => setSelectedProduct(null)}
            onAdd={addToCart}
          />
        )}

        {/* Side Cart Drawer */}
        <CartDrawer 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          total={cartTotal}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
          onCheckout={handleCheckoutClick}
        />

        {/* Checkout Flow (Location + Data) */}
        <CheckoutFlow 
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cart={cart}
          total={cartTotal}
        />

        {/* Floating Cart Indicator - Opens Drawer instead of switching view */}
        {cart.length > 0 && view !== 'cart' && !isCartOpen && (
          <FloatingCart 
            count={cartCount} 
            total={cartTotal} 
            onClick={() => setIsCartOpen(true)} 
          />
        )}
      </main>
      
      <Navigation currentView={view} onChangeView={(v) => setView(v)} cartCount={cartCount} />
    </div>
  );
};

export default App;
