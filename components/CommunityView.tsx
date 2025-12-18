
import React, { useState, useEffect, useRef } from 'react';
import { Heart, Plus, User, MapPin, Loader2, X, Instagram, MoreHorizontal, ShoppingCart, MessageCircle, ChevronLeft, ChevronRight, Send, Bookmark } from 'lucide-react';
import { Post, UserProfile, Comment, Story, Product } from '../types';
import { Button } from './Button';
import { supabase } from '../lib/supabase';
import { PRODUCTS } from '../constants';

interface CommunityViewProps {
  user: UserProfile | null;
  onUserClick: () => void;
  addToCart: (product: Product) => void;
  currentCartTotal: number;
  onOpenCart: () => void;
}

interface ExtendedStory extends Story {
  productId?: string;
}

const STORIES: ExtendedStory[] = [
  { 
    id: 2, 
    name: 'Patanegra', 
    img: 'https://i.imgur.com/hm4KO4J_d.webp?maxwidth=760&fidelity=grand', 
    content_img: 'https://i.imgur.com/gZiNOEd_d.webp?maxwidth=760&fidelity=grand', 
    active: true,
    productId: 'growler-pilsen-cristal-1l'
  },
  { 
    id: 3, 
    name: 'Hefe Weiss',
    img: 'https://i.imgur.com/ucynvQo_d.webp?maxwidth=1520&fidelity=grand', 
    content_img: 'https://i.imgur.com/ucynvQo_d.webp?maxwidth=1520&fidelity=grand', 
    active: true,
    productId: 'growler-vinho-tinto-1l'
  },
  { 
    id: 4, 
    name: 'Qualidade', 
    img: 'https://i.imgur.com/oCMsckR_d.webp?maxwidth=1520&fidelity=grand', 
    content_img: 'https://i.imgur.com/oCMsckR_d.webp?maxwidth=1520&fidelity=grand', 
    active: true,
    productId: 'growler-session-ipa-1l'
  },
  { 
    id: 5, 
    name: 'Noite VIP', 
    img: 'https://i.imgur.com/z56aU0d_d.webp?maxwidth=1520&fidelity=grand', 
    content_img: 'https://i.imgur.com/z56aU0d_d.webp?maxwidth=1520&fidelity=grand', 
    active: true,
    productId: 'growler-session-ipa-1l'
  },
  { 
    id: 6, 
    name: 'Momentos', 
    img: 'https://i.imgur.com/SA2rL5d_d.webp?maxwidth=1520&fidelity=grand', 
    content_img: 'https://i.imgur.com/SA2rL5d_d.webp?maxwidth=1520&fidelity=grand', 
    active: true,
    productId: 'growler-vinho-branco-1l'
  },
];

const FEATURED_POSTS: Post[] = [
  {
    id: 'featured-1',
    user_id: 'patanegra-official',
    user_name: 'Patanegra Delivery',
    content_text: 'O melhor chope na porta da sua casa, gelado e pronto para servir! 🍺🚀 Peça agora pelo app e receba em minutos.',
    content_image: 'https://i.imgur.com/5apEheA_d.webp?maxwidth=760&fidelity=grand',
    likes: 0,
    location: 'Marechal C. Rondon',
    created_at: new Date().toISOString(),
    is_liked: false
  },
  {
    id: 'featured-2',
    user_id: 'patanegra-store',
    user_name: 'Loja Patanegra',
    content_text: 'Estilo e paixão por cerveja. Confira nossa coleção exclusiva de camisas, canecas e bonés para os verdadeiros mestres cervejeiros! 👕Cap🍺',
    content_image: 'https://i.imgur.com/mAEF2Ah_d.webp?maxwidth=1520&fidelity=grand',
    likes: 0,
    location: 'Official Store',
    created_at: new Date().toISOString()
  },
  {
    id: 'featured-3',
    user_id: 'patanegra-quality',
    user_name: 'Patanegra Premium',
    content_text: 'O melhor para o seu delivery: Qualidade garantida em cada barril. Patanegra é a escolha certa para tornar seu evento inesquecível. 🔝🔥',
    content_image: 'https://i.imgur.com/35PIyrN_d.webp?maxwidth=760&fidelity=grand',
    likes: 0,
    location: 'Patanegra Matriz',
    created_at: new Date().toISOString()
  }
];

export const CommunityView: React.FC<CommunityViewProps> = ({ user, onUserClick, addToCart, currentCartTotal, onOpenCart }) => {
  // Inicializamos com FEATURED_POSTS para garantir que algo apareça instantaneamente
  const [posts, setPosts] = useState<Post[]>(FEATURED_POSTS);
  const [loading, setLoading] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const touchStartX = useRef<number>(0);
  const [addingToCartState, setAddingToCartState] = useState(false);

  useEffect(() => { 
    fetchPosts(); 
  }, []);

  const fetchPosts = async () => {
    try {
      // Tentamos buscar novos posts, mas o estado já começa com os em destaque
      const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setPosts([...FEATURED_POSTS, ...data]);
      }
    } catch (err) { 
      console.warn("Supabase fetch failed, staying with featured posts", err);
    }
  };

  const handleNextStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex < STORIES.length - 1) setActiveStoryIndex(activeStoryIndex + 1);
    else setActiveStoryIndex(null);
  };

  const handlePrevStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex > 0) setActiveStoryIndex(activeStoryIndex - 1);
    else setActiveStoryIndex(null);
  };

  const handleAddToCartFromStory = (e: React.MouseEvent, productId?: string) => {
    e.stopPropagation();
    if (!productId) return;
    const product = PRODUCTS.find(p => p.id === productId);
    if (product) {
      setAddingToCartState(true);
      addToCart(product);
      setTimeout(() => setAddingToCartState(false), 800);
    }
  };

  const activeStory = activeStoryIndex !== null ? STORIES[activeStoryIndex] : null;

  return (
    <div className="animate-fade-in flex flex-col h-[100dvh] bg-zinc-950 max-w-md mx-auto relative overflow-hidden">
      
      {/* Story Viewer - Centralizado e com largura máxima para evitar super zoom no PC */}
      {activeStory && (
        <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-md flex items-center justify-center animate-fade-in">
          <div 
            className="relative w-full max-w-md h-full sm:h-[90vh] bg-black overflow-hidden sm:rounded-3xl shadow-2xl flex flex-col"
            onTouchStart={(e) => touchStartX.current = e.touches[0].clientX}
            onTouchEnd={(e) => {
              const diff = touchStartX.current - e.changedTouches[0].clientX;
              if (Math.abs(diff) > 40) diff > 0 ? handleNextStory() : handlePrevStory();
            }}
          >
             {/* Imagem de Fundo em Camada Base - Ocupa TUDO dentro do max-w-md */}
             <div className="absolute inset-0 bg-zinc-900 overflow-hidden">
                <img 
                  key={activeStory.id} 
                  src={activeStory.content_img || activeStory.img} 
                  className="w-full h-full object-cover animate-scale-soft" 
                  alt="Story Content"
                />
                {/* Overlay suave para melhorar legibilidade das barras e botões */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />
             </div>

             {/* Progress Bars - Camada Superior */}
             <div className="absolute top-0 left-0 right-0 h-1 flex gap-1 px-3 pt-6 z-[510]">
                {STORIES.map((_, idx) => (
                  <div key={idx} className="h-[2px] flex-1 bg-white/20 rounded-full overflow-hidden">
                     <div 
                        className={`h-full bg-white transition-all duration-[5000ms] ease-linear origin-left ${idx === activeStoryIndex ? 'w-full' : idx < (activeStoryIndex || 0) ? 'w-full' : 'w-0'}`}
                        onAnimationEnd={() => idx === activeStoryIndex && handleNextStory()}
                     />
                  </div>
                ))}
             </div>
             
             {/* Story Header - Camada Superior */}
             <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 pt-10 z-[510]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-600 to-amber-300">
                    <img src={activeStory.img} className="w-full h-full rounded-full object-cover border border-black" />
                  </div>
                  <div>
                    <span className="text-white text-[11px] font-bold block leading-tight">{activeStory.name}</span>
                    <span className="text-white/60 text-[9px] font-medium tracking-wide">Patanegra Official</span>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveStoryIndex(null); }} 
                  className="text-white/80 p-2 hover:text-white transition-colors bg-black/20 backdrop-blur-md rounded-full"
                >
                  <X size={20}/>
                </button>
             </div>

             {/* Click Areas (Invisible) para navegação por toque nas laterais */}
             <div className="absolute inset-0 z-[505] flex">
                <div className="w-1/3 h-full cursor-pointer" onClick={(e) => { e.stopPropagation(); handlePrevStory(); }} />
                <div className="w-1/3 h-full cursor-pointer" /> 
                <div className="w-1/3 h-full cursor-pointer" onClick={(e) => { e.stopPropagation(); handleNextStory(); }} />
             </div>

             {/* Floating Cart (Lateral Direita) - Se houver itens */}
             {currentCartTotal > 0 && (
              <button 
                onClick={(e) => { e.stopPropagation(); onOpenCart(); }}
                className="absolute right-4 bottom-52 z-[515] animate-slide-left flex items-center gap-3 bg-zinc-900/60 backdrop-blur-xl border border-amber-500/40 rounded-2xl p-3 shadow-2xl active:scale-95 transition-all"
              >
                 <div className="flex flex-col items-end">
                    <span className="text-[7px] text-zinc-400 uppercase font-black tracking-widest">Pedido</span>
                    <span className="text-amber-500 font-bold text-sm leading-none">R$ {currentCartTotal.toFixed(2)}</span>
                 </div>
                 <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <ShoppingCart size={18} className="text-black" />
                 </div>
              </button>
             )}

             {/* Bloco de Interação Bottom - Camada Superior */}
             <div className="absolute bottom-0 left-0 right-0 p-6 pb-12 z-[510]">
                <div className="flex items-center justify-between mb-6">
                   <div className="flex gap-10">
                      <button className="text-white/90 active:scale-125 transition-transform drop-shadow-lg"><Heart size={30} /></button>
                      <button onClick={() => setActiveStoryIndex(null)} className="text-white/90 active:scale-125 transition-transform drop-shadow-lg"><X size={30} /></button>
                   </div>
                   <span className="text-white/30 text-[9px] font-black uppercase tracking-[0.2em]">Patanegra Moments</span>
                </div>

                {activeStory.productId && (
                  <button 
                    onClick={(e) => handleAddToCartFromStory(e, activeStory.productId)}
                    className={`w-full h-16 rounded-2xl font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-4 transition-all active:scale-95 shadow-[0_20px_50px_rgba(0,0,0,0.6)] ${addingToCartState ? 'bg-green-600 text-white' : 'bg-amber-500 text-black hover:bg-amber-400'}`}
                  >
                    {addingToCartState ? (<><Plus size={20} /> Adicionado!</>) : (<>Comprar este Growler <ShoppingCart size={20} /></>)}
                  </button>
                )}
             </div>
          </div>
        </div>
      )}

      {/* Community Main Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-2">
           <Instagram size={20} className="text-amber-500" />
           <h1 className="text-xl font-serif text-amber-500 italic">Moments</h1>
        </div>
        <button onClick={onUserClick} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
             {user ? <span className="text-xs font-bold text-amber-500">{user.full_name?.substring(0,1).toUpperCase()}</span> : <User size={16} className="text-zinc-500" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        {/* Stories Bar */}
        <div className="py-4 border-b border-zinc-900 overflow-x-auto flex gap-4 px-4 no-scrollbar bg-zinc-950/50">
          {STORIES.map((story, index) => (
            <button key={story.id} onClick={() => setActiveStoryIndex(index)} className="flex flex-col items-center gap-1.5 shrink-0 active:scale-90 transition-transform">
               <div className="p-[2.5px] rounded-full bg-gradient-to-tr from-amber-600 to-amber-300">
                  <div className="w-16 h-16 rounded-full border-2 border-zinc-950 overflow-hidden bg-zinc-900">
                    <img src={story.img} className="w-full h-full object-cover" />
                  </div>
               </div>
               <span className="text-[10px] text-zinc-500 font-bold truncate w-16">{story.name}</span>
            </button>
          ))}
        </div>

        {loading && posts.length === 0 ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-amber-500" size={32} /></div>
        ) : (
          <div className="space-y-0 pb-10">
            {posts.map(post => (
              <div key={post.id} className="bg-black border-b border-zinc-900/40">
                {/* 1. Header (User Info) */}
                <div className="flex items-center justify-between px-3 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-600 to-amber-300">
                        <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-white font-bold text-[10px] border border-black">
                            {post.user_name ? post.user_name[0] : 'P'}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-white leading-tight">{post.user_name}</h4>
                        {post.location && <span className="text-[9px] text-zinc-500 block font-medium">{post.location}</span>}
                    </div>
                  </div>
                  <button className="text-zinc-400 p-1"><MoreHorizontal size={18} /></button>
                </div>

                {/* 2. Image (Instagram Style: Photo on Top) */}
                {post.content_image && (
                  <div className="relative w-full aspect-square bg-zinc-900">
                     <img 
                        src={post.content_image} 
                        className="w-full h-full object-cover" 
                        alt="Post Content" 
                        loading="lazy"
                     />
                  </div>
                )}

                {/* 3. Action Buttons */}
                <div className="px-3 pt-3 flex items-center justify-between">
                    <div className="flex gap-4">
                        <button className="text-white hover:text-red-500 transition-colors"><Heart size={24} /></button>
                        <button className="text-white"><MessageCircle size={24} /></button>
                        <button className="text-white"><Send size={24} /></button>
                    </div>
                    <button className="text-white"><Bookmark size={24} /></button>
                </div>

                {/* 4. Description & Metadata (Instagram Style: Caption below actions) */}
                <div className="px-3 py-3 space-y-1.5">
                    <div className="text-xs font-bold text-white">0 curtidas</div>
                    
                    <div className="text-sm leading-snug">
                        <span className="font-bold text-white mr-2">{post.user_name}</span>
                        <span className="text-zinc-300">{post.content_text}</span>
                    </div>
                    
                    <button className="text-zinc-500 text-xs block pt-1">Ver todos os 0 comentários</button>
                    
                    <div className="text-[9px] text-zinc-600 uppercase pt-1 tracking-tighter">Há 1 hora</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes scale-soft { from { transform: scale(1.08); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-soft { animation: scale-soft 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .no-scrollbar::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        
        @keyframes slide-left { from { transform: translateX(30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-left { animation: slide-left 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};
