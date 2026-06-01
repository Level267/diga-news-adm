import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Wifi, 
  Battery, 
  Signal, 
  Smartphone, 
  MessageSquare, 
  ThumbsUp, 
  Bookmark, 
  Compass, 
  Tv, 
  ChevronRight, 
  CornerDownRight,
  ArrowLeft
} from "lucide-react";
import { Article } from "../types";

interface MobileAppSimulatorProps {
  articles: Article[];
  onAddComment?: (articleId: string, author: string, text: string) => void;
  onLikePress?: (articleId: string) => void;
}

export default function MobileAppSimulator({ articles, onAddComment, onLikePress }: MobileAppSimulatorProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [commentText, setCommentText] = useState("");
  const [authorName, setAuthorName] = useState("");

  const sortedArticles = [...articles].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  // Filter out articles scheduled for the future
  const publishedArticles = sortedArticles.filter(art => {
    if (art.publishDate) {
      const pubDate = new Date(art.publishDate);
      return pubDate <= new Date(); // Only if publication date is past or equal to now
    }
    return true; // No publication date means publish immediately
  });

  const filtered = selectedCategory === "all" 
    ? publishedArticles 
    : publishedArticles.filter(art => art.category === selectedCategory);

  const handlePostComment = (e: React.FormEvent, articleId: string) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const author = authorName.trim() || "User_Móvel";
    if (onAddComment) {
      onAddComment(articleId, author, commentText.trim());
    }
    setCommentText("");
    // Update local state copy of comments so it shows immediately inside mobile view
    if (selectedArticle && selectedArticle.id === articleId) {
      const updatedComments = [
        ...(selectedArticle.comments || []),
        { id: "cm-m-" + Date.now(), author, text: commentText.trim(), date: "Agora" }
      ];
      setSelectedArticle({
        ...selectedArticle,
        comments: updatedComments
      });
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Device Body Container */}
      <div className="relative mx-auto w-[335px] h-[670px] bg-[#0c0d14] rounded-[48px] p-3.5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border-[6px] border-[#2c2f3a] overflow-hidden flex flex-col">
        {/* Notch sensor bar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-36 bg-[#2c2f3a] rounded-b-2xl z-40 flex items-center justify-center">
          <div className="w-12 h-1 bg-black/60 rounded-full" />
          <div className="w-2.5 h-2.5 bg-[#1a1b22] rounded-full ml-3 border border-slate-800" />
        </div>

        {/* Operating System Status Bar */}
        <div className="h-6 pt-1 px-5 flex items-center justify-between text-[10px] text-slate-400 font-mono font-bold z-30 select-none">
          <span>09:41</span>
          <div className="flex items-center gap-1">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5 fill-slate-400" />
          </div>
        </div>

        {/* Main Phone Screens */}
        <div className="flex-1 overflow-hidden relative bg-[#090a0f] flex flex-col pt-1">
          <AnimatePresence mode="wait">
            {!selectedArticle ? (
              <motion.div
                key="list-screen"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex-col h-full flex"
              >
                {/* Simulated App Bar Header */}
                <div className="px-4 py-2 flex items-center justify-between border-b border-white/5 bg-[#0f1118]">
                  <div>
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block leading-none">DIGANEWS</span>
                    <h4 className="text-xs font-black text-white mt-1 uppercase tracking-tight">Aplicativo Geek</h4>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center justify-center font-mono text-[10px] font-black">
                    APP
                  </div>
                </div>

                {/* Subheader / Sync proof badge */}
                <div className="bg-[#12141c] border-b border-white/5 py-1.5 px-3 flex items-center justify-between">
                  <span className="text-[9px] text-[#00f2fe] font-mono flex items-center gap-1.5 font-bold">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                    SINC. SIMULTÂNEA ATIVA
                  </span>
                  <span className="text-[8px] text-slate-500 font-mono">
                    {publishedArticles.length} posts
                  </span>
                </div>

                {/* Slider / Category Filters */}
                <div className="flex gap-1.5 overflow-x-auto p-3 no-scrollbar shrink-0 bg-[#090a10]">
                  {["all", "games", "animes", "podcast", "filmes", "series"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                        selectedCategory === cat
                          ? "bg-cyan-500 text-black scale-105"
                          : "bg-slate-900 text-slate-400 border border-white/5"
                      }`}
                    >
                      {cat === "all" ? "Todos" : cat}
                    </button>
                  ))}
                </div>

                {/* News Scrolling Feed */}
                <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-3 custom-scrollbar">
                  {filtered.length > 0 ? (
                    filtered.map((art) => (
                      <motion.div
                        layoutId={`app-art-${art.id}`}
                        key={art.id}
                        onClick={() => setSelectedArticle(art)}
                        className={`rounded-2xl overflow-hidden shadow-lg hover:border-cyan-500/15 cursor-pointer active:scale-[0.98] transition-all border ${
                          art.pinned 
                            ? "border-cyan-500/30 bg-gradient-to-b from-[#161f2d] to-[#12141c] shadow-[0_0_15px_rgba(6,182,212,0.1)]" 
                            : "bg-[#12141c] border-white/5"
                        }`}
                      >
                        <div className="relative h-28 bg-slate-900">
                          <img 
                            src={art.imageUrl} 
                            alt="" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80";
                            }}
                          />
                          <div className="absolute top-2 left-2 flex gap-1 items-center">
                            <span className="px-1.5 py-0.5 bg-cyan-500 rounded text-[7.5px] font-black text-black uppercase tracking-wider">
                              {art.category}
                            </span>
                            {art.pinned && (
                              <span className="px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded text-[7.5px] font-black text-black uppercase tracking-wider flex items-center gap-0.5 shadow-sm">
                                📌 DESTAQUE
                              </span>
                            )}
                          </div>
                          {art.rating && (
                            <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-yellow-400 text-[8px] font-extrabold font-mono">
                              ★ {art.rating.toFixed(1)}
                            </div>
                          )}
                        </div>

                        <div className="p-3 space-y-1">
                          <h5 className="text-[11px] font-extrabold text-[#f3f4f6] line-clamp-1 leading-snug">
                            {art.title}
                          </h5>
                          <p className="text-[9.5px] text-slate-450 line-clamp-2 leading-relaxed h-[28px]">
                            {art.excerpt}
                          </p>
                          
                          <div className="flex items-center justify-between text-[8px] text-slate-500 pt-2 border-t border-white/5">
                            <span className="font-medium line-clamp-1 max-w-[120px]">
                              Por {art.author}
                            </span>
                            <span className="font-mono flex items-center gap-1 shrink-0 text-cyan-400">
                              Ler mais <ChevronRight className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-12 text-center border border-dashed border-white/5 rounded-2xl bg-[#0f1118]">
                      <Compass className="w-6 h-6 text-slate-600 mx-auto mb-1.5" />
                      <p className="text-[10px] text-slate-400 font-mono">Nenhum feed simultâneo.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="detail-screen"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-col h-full flex bg-[#090a10]"
              >
                {/* Sub-Header Back Navigation */}
                <div className="px-3 py-2 bg-[#0f1118] border-b border-white/5 flex items-center gap-3">
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="p-1 rounded bg-slate-905 bg-slate-900 border border-white/10 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Matéria sintonizada
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto pb-6">
                  {/* Aspect Ratio Header Cover */}
                  <div className="relative h-40 bg-slate-950">
                    <img 
                      src={selectedArticle.imageUrl} 
                      alt="" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090a10] to-transparent" />
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-cyan-500 text-black text-[8px] font-black uppercase rounded">
                      {selectedArticle.category}
                    </div>
                  </div>

                  {/* Body News elements */}
                  <div className="px-4 space-y-3">
                    <h4 className="text-xs font-black text-white leading-snug">
                      {selectedArticle.title}
                    </h4>

                    {/* Metadata line */}
                    <div className="flex justify-between items-center text-[8.5px] text-slate-500 py-1.5 border-y border-white/5 font-mono">
                      <span>Ref ID: <span className="text-cyan-400">{selectedArticle.id}</span></span>
                      <span>{selectedArticle.readTime}</span>
                    </div>

                    <p className="text-[10px] text-slate-350 leading-relaxed font-sans whitespace-pre-wrap">
                      {selectedArticle.content}
                    </p>

                    {/* Media Video Embed Frame Simulator */}
                    {selectedArticle.videoUrl && (
                      <div className="mt-2.5 p-2 rounded-xl bg-red-950/10 border border-red-500/20 space-y-1.5 text-center">
                        <span className="text-[8px] uppercase tracking-wider text-[#ff3333] font-bold flex items-center justify-center gap-1.5">
                          <Tv className="w-3 h-3 text-[#ff3333]" />
                          Vídeo Anexado Disponível
                        </span>
                        <div className="aspect-video bg-red-950/50 rounded-lg flex flex-col items-center justify-center border border-red-500/10 p-2 cursor-pointer active:opacity-80">
                          <span className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold shadow-md">▶</span>
                          <span className="text-[8px] font-mono text-slate-300 mt-1">Carregar Player Multimídia</span>
                        </div>
                      </div>
                    )}

                    {/* Internal Interactive likes action */}
                    <div className="flex gap-4 pt-3 border-t border-white/5 text-slate-400">
                      <button
                        onClick={() => {
                          if (onLikePress) {
                            onLikePress(selectedArticle.id);
                            setSelectedArticle({
                              ...selectedArticle,
                              likes: selectedArticle.likes + 1
                            });
                          }
                        }}
                        className="flex items-center gap-1 text-[9px] hover:text-white cursor-pointer"
                      >
                        <ThumbsUp className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{selectedArticle.likes} likes</span>
                      </button>

                      <span className="flex items-center gap-1 text-[9px]">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                        <span>{selectedArticle.comments?.length || 0} comentários</span>
                      </span>
                    </div>

                    {/* Comments simulation list */}
                    <div className="space-y-2 pt-2.5">
                      <h6 className="text-[9.5px] uppercase tracking-wider font-mono text-slate-300">Comentários do App</h6>
                      
                      <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                        {(selectedArticle.comments && selectedArticle.comments.length > 0) ? (
                          selectedArticle.comments.map((cm) => (
                            <div key={cm.id} className="bg-[#12141a] p-2 rounded-lg border border-white/5 space-y-0.5">
                              <div className="flex justify-between text-[8px] font-mono font-bold text-slate-400">
                                <span className="text-cyan-400">{cm.author}</span>
                                <span>{cm.date}</span>
                              </div>
                              <p className="text-[9px] text-slate-305 text-slate-300 font-sans leading-tight">
                                {cm.text}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-[8px] text-slate-500 font-mono italic">Nem um comentário móvel ainda.</p>
                        )}
                      </div>

                      {/* Comment Form */}
                      <form onSubmit={(e) => handlePostComment(e, selectedArticle.id)} className="space-y-1 pt-2">
                        <div className="grid grid-cols-2 gap-1">
                          <input
                            type="text"
                            placeholder="Membro"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            className="bg-[#161a22] border border-white/10 rounded px-1.5 py-1 text-[9px] text-white focus:outline-none"
                          />
                          <button
                            type="submit"
                            className="bg-cyan-500 text-black py-1 px-2.5 rounded text-[8px] font-black uppercase hover:bg-cyan-400 cursor-pointer"
                          >
                            Enviar
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Escreva sua opinião..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="w-full bg-[#161a22] border border-white/10 rounded px-1.5 py-1 text-[9px] text-white focus:outline-none"
                          required
                        />
                      </form>
                    </div>

                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Device Home button bar */}
        <div className="h-6 flex items-center justify-center z-40 select-none cursor-pointer" onClick={() => setSelectedArticle(null)}>
          <div className="w-28 h-1 bg-white/40 rounded-full" />
        </div>
      </div>
    </div>
  );
}
