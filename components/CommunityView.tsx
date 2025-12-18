
import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, Plus, User, MapPin, MoreHorizontal, Loader2, X } from 'lucide-react';
import { Post, UserProfile, Comment, Story } from '../types';
import { Button } from './Button';
import { supabase } from '../lib/supabase';

interface CommunityViewProps {
  user: UserProfile | null;
  onUserClick: () => void;
}

const STORIES: Story[] = [
  { id: 1, name: 'Seu Story', img: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=100&h=100&fit=crop', isMe: true },
  { id: 2, name: 'Patanegra', img: 'https://i.imgur.com/hm4KO4J_d.webp?maxwidth=760&fidelity=grand', content_img: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&q=80&w=800', active: true },
  { id: 3, name: 'Churrasco', img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=100&h=100&fit=crop', content_img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', active: true },
  { id: 4, name: 'Festa VIP', img: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=100&h=100&fit=crop', content_img: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800', active: true },
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

  const [activeStory, setActiveStory] = useState<Story | null>(null);

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
      
      // Atualiza contador de comentários localmente se desejar
      setPosts(prev => prev.map(p => 
        p.id === activeCommentsPost.id ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p
      ));
    } catch (err: any) {
      alert("Erro ao comentar: " + err.message);
    }
  };

  return (
    <div className="animate-fade-in flex flex-col h-screen bg-zinc-950 max-w-md mx-auto relative overflow-hidden">
      
      {/* Story Viewer */}
      {activeStory && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col">
           <div className="absolute top-0 left-0 right-0 h-1 flex gap-1 p-2 z-10">
              <div className="h-full flex-1 bg-white/20 rounded-full overflow-hidden">
                 <div className="h-full bg-white w-full animate-[progress_5s_linear_forwards]" onAnimationEnd={() => setActiveStory(null)} />
              </div>
           </div>
           <div className="flex items-center justify-between p-4 mt-4 z-10">
              <div className="flex items-center gap-3">
                <img src={activeStory.img} className="w-8 h-8 rounded-full border border-white/20" />
                <span className="text-white text-xs font-bold">{activeStory.name}</span>
              </div>
              <button onClick={() => setActiveStory(null)} className="text-white"><X size={24}/></button>
           </div>
           <div className="flex-1 flex items-center justify-center p-4">
              <img src={activeStory.content_img || activeStory.img} className="w-full rounded-2xl max-h-[70vh] object-cover shadow-2xl" />
           </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
        <h1 className="text-xl font-serif text-amber-500 italic">Moments</h1>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsPosting(true)} className="text-white hover:text-amber-500"><Plus size={24} /></button>
          <button onClick={onUserClick} className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center">
             {user ? <span className="text-xs font-bold text-amber-500">{user.full_name?.substring(0,1).toUpperCase()}</span> : <User size={16} className="text-zinc-500" />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
        {/* Stories */}
        <div className="py-4 border-b border-zinc-900 overflow-x-auto flex gap-4 px-4 scrollbar-hide">
          {STORIES.map(story => (
            <button key={story.id} onClick={() => story.active && setActiveStory(story)} className="flex flex-col items-center gap-1 shrink-0">
               <div className={`p-[2px] rounded-full ${story.active ? 'bg-gradient-to-tr from-amber-600 to-amber-300' : 'bg-zinc-800'}`}>
                  <div className="w-14 h-14 rounded-full border-2 border-zinc-950 overflow-hidden"><img src={story.img} className="w-full h-full object-cover" /></div>
               </div>
               <span className="text-[10px] text-zinc-500 font-medium truncate w-14 text-center">{story.name}</span>
            </button>
          ))}
        </div>

        {/* Feed */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-amber-500" size={32} /></div>
        ) : (
          <div className="space-y-4 py-4">
            {posts.map(post => (
              <div key={post.id} className="bg-zinc-950 border-b border-zinc-900/50 pb-4">
                <div className="flex items-center justify-between px-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center"><User size={14} className="text-zinc-600" /></div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{post.user_name}</h4>
                      <span className="text-zinc-500 text-[9px] flex items-center gap-1"><MapPin size={8}/>{post.location}</span>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-1 text-zinc-200 text-sm whitespace-pre-wrap">{post.content_text}</div>
                <div className="px-4 py-3 flex items-center gap-6">
                  <button onClick={() => handleLike(post.id)} className={post.is_liked ? 'text-red-500' : 'text-zinc-400'}><Heart size={22} fill={post.is_liked ? 'currentColor' : 'none'} /></button>
                  <button onClick={() => openComments(post)} className="text-zinc-400 flex items-center gap-1"><MessageCircle size={22} /><span className="text-[10px] font-bold">{post.comments_count || 0}</span></button>
                  <button className="text-zinc-400"><Send size={22} /></button>
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
           <div className="relative w-full max-w-sm bg-zinc-900 rounded-3xl border border-zinc-800 p-6 animate-slide-up">
              <h3 className="text-white font-serif text-lg mb-4">Novo Momento</h3>
              <textarea 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white text-sm focus:border-amber-500 focus:outline-none min-h-[120px] resize-none mb-4"
                placeholder="No que você está pensando?"
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
              />
              <Button fullWidth onClick={handleSubmitPost} disabled={isSubmitting}>{isSubmitting ? 'Postando...' : 'Postar'}</Button>
           </div>
        </div>
      )}

      {/* Comments Drawer */}
      {activeCommentsPost && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveCommentsPost(null)} />
            <div className="relative w-full max-w-md bg-zinc-900 rounded-t-3xl h-[70vh] flex flex-col animate-slide-up">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                    <span className="text-white font-bold text-sm">Comentários</span>
                    <button onClick={() => setActiveCommentsPost(null)} className="text-zinc-500"><X size={20}/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loadingComments ? <div className="flex justify-center"><Loader2 className="animate-spin text-amber-500"/></div> : 
                    comments.length === 0 ? <div className="text-center text-zinc-500 text-sm mt-10">Nenhum comentário.</div> :
                    comments.map(c => (
                        <div key={c.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500 shrink-0">{c.user_name.substring(0,1)}</div>
                            <div className="flex-1 bg-zinc-800/50 p-3 rounded-2xl">
                                <h5 className="text-white text-[10px] font-bold mb-1">{c.user_name}</h5>
                                <p className="text-zinc-300 text-xs">{c.content_text}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-zinc-800 bg-zinc-950/50 flex gap-3">
                    <input className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 text-white text-sm focus:outline-none" placeholder="Comentar..." value={newCommentText} onChange={e => setNewCommentText(e.target.value)} />
                    <button onClick={handleAddComment} className="w-10 h-10 bg-amber-500 text-black rounded-full flex items-center justify-center"><Send size={18}/></button>
                </div>
            </div>
        </div>
      )}

      <style>{`
        @keyframes progress { from { width: 0%; } to { width: 100%; } }
      `}</style>
    </div>
  );
};
