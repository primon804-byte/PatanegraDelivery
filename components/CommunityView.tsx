
import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Send, Plus, User, MapPin, Loader2, X, Instagram, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { Post, UserProfile, Comment, Story } from '../types';
import { Button } from './Button';
import { supabase } from '../lib/supabase';

interface CommunityViewProps {
  user: UserProfile | null;
  onUserClick: () => void;
}

const STORIES: Story[] = [
  { 
    id: 2, 
    name: 'Patanegra', 
    img: 'https://i.imgur.com/hm4KO4J_d.webp?maxwidth=760&fidelity=grand', 
    content_img: 'https://i.imgur.com/gZiNOEd_d.webp?maxwidth=760&fidelity=grand', 
    active: true 
  },
  { 
    id: 3, 
    name: 'Chopp Real', 
    img: 'https://i.imgur.com/ucynvQo_d.webp?maxwidth=1520&fidelity=grand', 
    content_img: 'https://i.imgur.com/ucynvQo_d.webp?maxwidth=1520&fidelity=grand', 
    active: true 
  },
  { 
    id: 4, 
    name: 'Qualidade', 
    img: 'https://i.imgur.com/oCMsckR_d.webp?maxwidth=1520&fidelity=grand', 
    content_img: 'https://i.imgur.com/oCMsckR_d.webp?maxwidth=1520&fidelity=grand', 
    active: true 
  },
  { 
    id: 5, 
    name: 'Noite VIP', 
    img: 'https://i.imgur.com/z56aU0d_d.webp?maxwidth=1520&fidelity=grand', 
    content_img: 'https://i.imgur.com/z56aU0d_d.webp?maxwidth=1520&fidelity=grand', 
    active: true 
  },
  { 
    id: 6, 
    name: 'Momentos', 
    img: 'https://i.imgur.com/SA2rL5d_d.webp?maxwidth=1520&fidelity=grand', 
    content_img: 'https://i.imgur.com/SA2rL5d_d.webp?maxwidth=1520&fidelity=grand', 
    active: true 
  },
];

export const CommunityView: React.FC<CommunityViewProps> = ({ user, onUserClick }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isPosting, setIsPosting] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeCommentsPost, setActiveCommentsPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');

  // Story states
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const touchStartX = useRef<number>(0);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error("Erro ao carregar posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNextStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex < STORIES.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else {
      setActiveStoryIndex(null); // Fecha ao chegar no fim
    }
  };

  const handlePrevStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    } else {
      setActiveStoryIndex(null);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) { // Swipe detectado
      if (diff > 0) {
        handleNextStory();
      } else {
        handlePrevStory();
      }
    }
  };

  const handleLike = async (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          is_liked: !p.is_liked,
          likes: p.is_liked ? p.likes - 1 : p.likes + 1
        };
      }
      return p;
    }));
  };

  const handleSubmitPost = async () => {
    if (!newPostText.trim()) return;
    if (!user) {
        onUserClick();
        return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          user_name: user.full_name || user.email.split('@')[0],
          content_text: newPostText,
          likes: 0,
          location: user.city || 'Patanegra Moments'
        })
        .select()
        .single();

      if (error) throw error;

      setPosts([data, ...posts]);
      setNewPostText('');
      setIsPosting(false);
    } catch (err: any) {
      alert("Erro ao postar: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openComments = async (post: Post) => {
    setActiveCommentsPost(post);
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!newCommentText.trim() || !activeCommentsPost || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: activeCommentsPost.id,
          user_id: user.id,
          user_name: user.full_name || user.email.split('@')[0],
          content_text: newCommentText
        })
        .select()
        .single();

      if (error) throw error;
      setComments([...comments, data]);
      setNewCommentText('');
      
      setPosts(prev => prev.map(p => 
        p.id === activeCommentsPost.id ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p
      ));
    } catch (err: any) {
      alert("Erro ao comentar: " + err.message);
    }
  };

  const activeStory = activeStoryIndex !== null ? STORIES[activeStoryIndex] : null;

  return (
    <div className="animate-fade-in flex flex-col h-screen bg-zinc-950 max-w-md mx-auto relative overflow-hidden">
      
      {/* Story Viewer - Immersive Layout with Navigation */}
      {activeStory && (
        <div 
          className="fixed inset-0 z-[500] bg-black flex flex-col animate-fade-in"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
           {/* Progress Bars Container */}
           <div className="absolute top-0 left-0 right-0 h-1 flex gap-1 px-2 pt-4 z-[510]">
              {STORIES.map((_, idx) => (
                <div key={idx} className="h-0.5 flex-1 bg-white/20 rounded-full overflow-hidden">
                   <div 
                      className={`h-full bg-white transition-all duration-[5000ms] ease-linear origin-left ${idx === activeStoryIndex ? 'w-full' : idx < (activeStoryIndex || 0) ? 'w-full' : 'w-0'}`}
                      onAnimationEnd={() => idx === activeStoryIndex && handleNextStory()}
                   />
                </div>
              ))}
           </div>
           
           {/* Story Header */}
           <div className="flex items-center justify-between p-4 pt-8 z-[510] bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full p-[1px] bg-gradient-to-tr from-amber-600 to-amber-300">
                  <img src={activeStory.img} className="w-full h-full rounded-full object-cover border-2 border-black" />
                </div>
                <div>
                  <span className="text-white text-sm font-bold block leading-tight">{activeStory.name}</span>
                  <span className="text-white/60 text-[10px]">Patanegra Official</span>
                </div>
              </div>
              <button onClick={() => setActiveStoryIndex(null)} className="text-white p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24}/>
              </button>
           </div>

           {/* Story Content Area */}
           <div className="flex-1 flex items-center justify-center p-0 overflow-hidden relative">
              {/* Invisible Click Targets for Next/Prev */}
              <div className="absolute inset-0 z-[505] flex">
                  <div className="w-1/3 h-full" onClick={(e) => { e.stopPropagation(); handlePrevStory(); }} />
                  <div className="w-2/3 h-full" onClick={(e) => { e.stopPropagation(); handleNextStory(); }} />
              </div>

              <img 
                key={activeStory.id}
                src={activeStory.content_img || activeStory.img} 
                className="w-full h-full object-cover sm:object-contain animate-scale-soft" 
                alt={activeStory.name}
              />
              
              {/* Interaction Overlay */}
              <div className="absolute bottom-10 left-0 right-0 px-6 flex items-center gap-4 z-[510]">
                  <div className="flex-1 bg-black/20 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-white/80 text-sm">
                    Responder a {activeStory.name}...
                  </div>
                  <button className="text-white"><Heart size={24} /></button>
                  <button className="text-white"><Send size={24} /></button>
              </div>
           </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-2">
           <Instagram size={20} className="text-amber-500" />
           <h1 className="text-xl font-serif text-amber-500 italic">Moments</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsPosting(true)} className="text-zinc-400 hover:text-amber-500 transition-colors">
            <Plus size={24} />
          </button>
          <button onClick={onUserClick} className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center">
             {user ? <span className="text-xs font-bold text-amber-500">{user.full_name?.substring(0,1).toUpperCase()}</span> : <User size={16} className="text-zinc-500" />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
        {/* Stories Horizontal List - Removed "Seu Story" */}
        <div className="py-4 border-b border-zinc-900 overflow-x-auto flex gap-4 px-4 scrollbar-hide bg-zinc-950/50">
          {STORIES.map((story, index) => (
            <button key={story.id} onClick={() => setActiveStoryIndex(index)} className="flex flex-col items-center gap-1.5 shrink-0 transition-transform active:scale-95">
               <div className={`p-[2px] rounded-full ${story.active ? 'bg-gradient-to-tr from-amber-600 to-amber-300' : 'bg-zinc-800'}`}>
                  <div className="w-16 h-16 rounded-full border-2 border-zinc-950 overflow-hidden">
                    <img src={story.img} className="w-full h-full object-cover" />
                  </div>
               </div>
               <span className="text-[10px] text-zinc-400 font-medium truncate w-16 text-center">{story.name}</span>
            </button>
          ))}
        </div>

        {/* Feed */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-amber-500" size={32} /></div>
        ) : (
          <div className="space-y-6 py-4">
            {posts.length === 0 ? (
                <div className="text-center py-20 px-8">
                    <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-700">
                        <Instagram size={32} />
                    </div>
                    <p className="text-zinc-500 text-sm">Nenhum momento compartilhado ainda. Seja o primeiro!</p>
                </div>
            ) : posts.map(post => (
              <div key={post.id} className="bg-zinc-950 border-b border-zinc-900/50 pb-4">
                <div className="flex items-center justify-between px-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-amber-500">{post.user_name.substring(0,1).toUpperCase()}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{post.user_name}</h4>
                      <span className="text-zinc-500 text-[9px] flex items-center gap-1"><MapPin size={8}/>{post.location}</span>
                    </div>
                  </div>
                  <button className="text-zinc-600"><MoreHorizontal size={18}/></button>
                </div>
                <div className="px-4 py-1 text-zinc-200 text-sm whitespace-pre-wrap leading-relaxed">{post.content_text}</div>
                <div className="px-4 py-3 flex items-center gap-6">
                  <button onClick={() => handleLike(post.id)} className={`transition-all active:scale-125 ${post.is_liked ? 'text-red-500' : 'text-zinc-400'}`}>
                    <Heart size={22} fill={post.is_liked ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={() => openComments(post)} className="text-zinc-400 flex items-center gap-1">
                    <MessageCircle size={22} />
                    <span className="text-[10px] font-bold">{post.comments_count || 0}</span>
                  </button>
                  <button className="text-zinc-400 hover:text-amber-500 transition-colors"><Send size={22} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Post Modal */}
      {isPosting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsPosting(false)} />
           <div className="relative w-full max-w-sm bg-zinc-900 rounded-3xl border border-zinc-800 p-6 animate-slide-up shadow-2xl">
              <h3 className="text-white font-serif text-lg mb-4">Novo Momento</h3>
              <textarea 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white text-sm focus:border-amber-500 focus:outline-none min-h-[120px] resize-none mb-4"
                placeholder="Compartilhe seu momento Patanegra..."
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
              />
              <Button fullWidth onClick={handleSubmitPost} disabled={isSubmitting}>{isSubmitting ? 'Postando...' : 'Compartilhar'}</Button>
           </div>
        </div>
      )}

      {/* Comments Drawer */}
      {activeCommentsPost && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveCommentsPost(null)} />
            <div className="relative w-full max-w-md bg-zinc-900 rounded-t-3xl h-[70vh] flex flex-col animate-slide-up shadow-2xl border-t border-zinc-800">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                    <span className="text-white font-bold text-sm">Comentários</span>
                    <button onClick={() => setActiveCommentsPost(null)} className="text-zinc-500 p-1 hover:text-white transition-colors"><X size={20}/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                    {loadingComments ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-amber-500"/></div> : 
                    comments.length === 0 ? <div className="text-center text-zinc-500 text-sm mt-10">Seja o primeiro a comentar.</div> :
                    comments.map(c => (
                        <div key={c.id} className="flex gap-3 animate-fade-in">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-amber-500 shrink-0 border border-zinc-700">{c.user_name.substring(0,1).toUpperCase()}</div>
                            <div className="flex-1 bg-zinc-800/40 p-3 rounded-2xl border border-zinc-800/50">
                                <h5 className="text-white text-[10px] font-bold mb-1">{c.user_name}</h5>
                                <p className="text-zinc-300 text-xs">{c.content_text}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-md flex gap-3 pb-safe">
                    <input className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-500" placeholder="Escreva um comentário..." value={newCommentText} onChange={e => setNewCommentText(e.target.value)} />
                    <button onClick={handleAddComment} className="w-10 h-10 bg-amber-500 text-black rounded-full flex items-center justify-center hover:bg-amber-400 transition-all active:scale-90"><Send size={18}/></button>
                </div>
            </div>
        </div>
      )}

      <style>{`
        @keyframes progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes scale-soft { from { transform: scale(1.05); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-soft { animation: scale-soft 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};
