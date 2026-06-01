import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  ShieldCheck, 
  Plus, 
  Sparkles, 
  Image as ImageIcon, 
  User, 
  Layout, 
  Eye, 
  HelpCircle, 
  FileText, 
  X,
  Search,
  Trash2,
  Edit2,
  ArrowLeft,
  BookOpen
} from "lucide-react";
import { Article } from "../types";

interface AdminPanelProps {
  articles: Article[];
  onAddArticle: (article: Article) => void;
  onUpdateArticle: (article: Article) => void;
  onDeleteArticle: (id: string) => void;
  onClose?: () => void;
}

export default function AdminPanel({ 
  articles, 
  onAddArticle, 
  onUpdateArticle, 
  onDeleteArticle, 
  onClose 
}: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Tabs for backoffice: "manage" (list and edit/delete), "write" (create/update form), "comments" (comment moderation) or "stats" (analytics & charts)
  const [activeTab, setActiveTab] = useState<"manage" | "write" | "comments" | "stats">("manage");
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [manageSearchTerm, setManageSearchTerm] = useState("");

  // Toast / Custom alert notifications state
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  
  // Custom confirmation modal state for deletion
  const [deleteConfirmId, setDeleteConfirmId] = useState<{ id: string; title: string } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((current) => current?.message === message ? null : current);
    }, 4000);
  };

  // Article creation/editing form states
  const [category, setCategory] = useState<Article["category"]>("games");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [rating, setRating] = useState<number>(9.0);
  const [videoUrl, setVideoUrl] = useState("");
  const [pinned, setPinned] = useState(false);
  const [publishDate, setPublishDate] = useState("");

  // IA helper states
  const [aiDraftPrompt, setAiDraftPrompt] = useState("");
  const [generatingWithAi, setGeneratingWithAi] = useState(false);

  // Load draft from localStorage upon authentication
  React.useEffect(() => {
    if (isAuthenticated) {
      const saved = localStorage.getItem("diganews_draft");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.title) setTitle(parsed.title);
          if (parsed.excerpt) setExcerpt(parsed.excerpt);
          if (parsed.content) setContent(parsed.content);
          if (parsed.author) setAuthor(parsed.author);
          if (parsed.category) setCategory(parsed.category);
          if (parsed.rating) setRating(parsed.rating);
          if (parsed.imageUrl) setImageUrl(parsed.imageUrl);
          if (parsed.videoUrl) setVideoUrl(parsed.videoUrl);
          if (parsed.pinned !== undefined) setPinned(parsed.pinned);
          if (parsed.publishDate) setPublishDate(parsed.publishDate);
        } catch (e) {
          console.error("Failed to parse draft", e);
        }
      }
    }
  }, [isAuthenticated]);

  // Save draft whenever form values change
  React.useEffect(() => {
    if (isAuthenticated && !editingArticleId) {
      const draft = { category, title, excerpt, content, author, imageUrl, rating, videoUrl, pinned, publishDate };
      localStorage.setItem("diganews_draft", JSON.stringify(draft));
    }
  }, [category, title, excerpt, content, author, imageUrl, rating, videoUrl, pinned, publishDate, isAuthenticated, editingArticleId]);

  // Clear draft
  const clearDraft = () => {
    localStorage.removeItem("diganews_draft");
  };

  // Aggregate comments across all articles for moderation
  interface AggregatedComment {
    articleId: string;
    articleTitle: string;
    commentId: string;
    author: string;
    text: string;
    date: string;
  }

  const getAllComments = (): AggregatedComment[] => {
    const list: AggregatedComment[] = [];
    articles.forEach(art => {
      if (art.comments && Array.isArray(art.comments)) {
        art.comments.forEach(cm => {
          list.push({
            articleId: art.id,
            articleTitle: art.title,
            commentId: cm.id,
            author: cm.author,
            text: cm.text,
            date: cm.date
          });
        });
      }
    });
    return list;
  };

  const handleModerateDelete = (articleId: string, commentId: string) => {
    const art = articles.find(a => a.id === articleId);
    if (!art) return;
    const cleanComments = (art.comments || []).filter(cm => cm.id !== commentId);
    const updated: Article = {
      ...art,
      comments: cleanComments
    };
    onUpdateArticle(updated);
    showToast("Comentário moderado e removido!", "success");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.toLowerCase() === "admin" || password === "1234") {
      setIsAuthenticated(true);
      setLoginError("");
      showToast("Autenticado com sucesso no painel de redação!", "success");
    } else {
      setLoginError("Senha de demonstração incorreta! Use 'admin' ou '1234'.");
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim() || !content.trim() || !author.trim()) {
      showToast("Por favor, preencha todos os campos obrigatórios.", "error");
      return;
    }

    const defaultImagesByCat = {
      games: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
      filmes: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
      series: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
      animes: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
      quadrinhos: "https://images.unsplash.com/photo-1588497859490-85d1c17db96d?auto=format&fit=crop&w=800&q=80",
      podcast: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80"
    };

    if (editingArticleId) {
      // Find original values to keep likes, comments, views
      const original = articles.find(art => art.id === editingArticleId);
      const updatedArt: Article = {
        ...original,
        id: editingArticleId,
        category,
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        author: author.trim(),
        readTime: `${Math.max(1, Math.round(content.split(" ").length / 150))} min de leitura`,
        imageUrl: imageUrl.trim() || (original?.imageUrl || defaultImagesByCat[category]),
        rating: rating,
        pinned: pinned,
        publishDate: publishDate || undefined,
        videoUrl: videoUrl.trim() || undefined
      } as Article;

      onUpdateArticle(updatedArt);
      showToast("Matéria atualizada simultaneamente no Site e App!", "success");
      clearDraft();
      resetForm();
      setEditingArticleId(null);
      setActiveTab("manage");
    } else {
      const newArt: Article = {
        id: "art-user-" + Date.now().toString(),
        category,
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        author: author.trim(),
        date: "Hoje mesmo",
        readTime: `${Math.max(1, Math.round(content.split(" ").length / 150))} min de leitura`,
        imageUrl: imageUrl.trim() || defaultImagesByCat[category],
        views: 12,
        likes: 1,
        rating: rating,
        comments: [],
        pinned: pinned,
        publishDate: publishDate || undefined,
        videoUrl: videoUrl.trim() || undefined
      };

      onAddArticle(newArt);
      showToast("Matéria publicada simultaneamente no Site e App!", "success");
      clearDraft();
      resetForm();
      setActiveTab("manage");
    }
  };

  const startEditing = (art: Article) => {
    setEditingArticleId(art.id);
    setCategory(art.category);
    setTitle(art.title);
    setExcerpt(art.excerpt);
    setContent(art.content);
    setAuthor(art.author);
    setImageUrl(art.imageUrl || "");
    setRating(art.rating || 9.0);
    setVideoUrl(art.videoUrl || "");
    setPinned(art.pinned || false);
    setPublishDate(art.publishDate || "");
    setActiveTab("write");
  };

  const cancelFormOrEditing = () => {
    resetForm();
    setEditingArticleId(null);
    setActiveTab("manage");
  };

  const resetForm = () => {
    setTitle("");
    setExcerpt("");
    setContent("");
    setAuthor("");
    setImageUrl("");
    setRating(9.0);
    setPinned(false);
    setPublishDate("");
    setVideoUrl("");
    setAiDraftPrompt("");
  };

  // Helper to extract JSON from markdown or arbitrary strings reliably
  const extractJSON = (text: string) => {
    try {
      const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
      const match = text.match(jsonBlockRegex);
      const stringToParse = match ? match[1] : text;
      
      const cleanText = stringToParse
        .trim()
        .replace(/^[^{]*/, "")
        .replace(/[^}]*$/, "");
        
      return JSON.parse(cleanText);
    } catch (e) {
      console.error("JSON Parsing failed", e, text);
      throw e;
    }
  };

  // Option to automate story draft generation using Gemini
  const handleAiDraftGenerator = async () => {
    if (!aiDraftPrompt.trim()) return;
    setGeneratingWithAi(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Com base nesta ideia original de jogo ou filme ou geek: "${aiDraftPrompt}", gere uma matéria com um tom altamente profissional, jornalístico, sério, informativo e imparcial, de acordo com o padrão de grandes portais de tecnologia e entretenimento (como IGN, G1, Tecnoblog ou Meio Bit). Evite gírias informais ou brincadeiras bobas. Foque na clareza informativa dos fatos apresentados.
              Retorne um objeto JSON no formato abaixo. Certifique-se de retornar APENAS o JSON válido:
              {
                "title": "Um título jornalístico, informativo, claro e de forte impacto técnico ou editorial",
                "excerpt": "Um subtítulo de apoio sucinto e profissional (linha fina) que resume as principais conclusões",
                "content": "A reportagem completa e bem estruturada, dividida formalmente em parágrafos de análise técnica e jornalística profunda",
                "author": "Nome de um jornalista profissional independente ou Redação DigaNews"
              }`
            }
          ]
        })
      });

      const data = await response.json();
      if (response.ok) {
        const parsed = extractJSON(data.reply);
        setTitle(parsed.title || "");
        setExcerpt(parsed.excerpt || "");
        setContent(parsed.content || "");
        setAuthor(parsed.author || "Redação DigaNews");
        showToast("Rascunho gerado com sucesso pelo Gemini 3.5!", "success");
      } else {
        showToast(data.error || "Roteiro indisponível no momento.", "error");
      }
    } catch (err: any) {
      showToast("Falha ao comunicar com o sintonizador do Gemini.", "error");
    } finally {
      setGeneratingWithAi(false);
    }
  };

  const filteredManageArticles = articles.filter(art => 
    art.title.toLowerCase().includes(manageSearchTerm.toLowerCase()) ||
    art.author.toLowerCase().includes(manageSearchTerm.toLowerCase()) ||
    art.category.toLowerCase().includes(manageSearchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-sm p-6 space-y-5 shadow-sm relative mx-auto my-12">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Acesso Editor (ADM)</h3>
          <p className="text-xs text-slate-500 mt-1">Insira as credenciais para autorizar transmissões simultâneas.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Senha de Acesso</label>
            <input
              id="admin-passcode-input"
              type="password"
              placeholder="Digite 'admin' ou '1234'"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-md text-xs py-2 px-3 text-slate-800 focus:outline-none focus:bg-white"
              required
            />
          </div>

          {loginError && (
            <p className="text-[10px] text-red-600 font-mono text-center">❌ {loginError}</p>
          )}

          <button
            id="submit-admin-login-btn"
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase rounded-md tracking-wider transition-colors cursor-pointer"
          >
            Liberar Painel ADM
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden flex flex-col relative min-h-[500px]">
      {/* Floating Custom Toast Notification */}
      {notification && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-100 bg-blue-50 text-blue-855 text-blue-800 shadow-md">
          <span className="text-xs font-mono font-bold flex items-center gap-1.5">
            {notification.type === "success" ? "🛸" : "⚠️"} {notification.message}
          </span>
          <button 
            type="button"
            onClick={() => setNotification(null)}
            className="p-0.5 hover:bg-blue-100 rounded ml-2 text-blue-500 hover:text-blue-800 cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Custom Delete Confirmation Modal Overlay */}
      {deleteConfirmId && (
        <div className="absolute inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="text-center">
              <span className="inline-flex p-3 rounded-full bg-red-50 text-red-600 mb-3">
                <Trash2 className="w-6 h-6" />
              </span>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800">Remover Publicação?</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Você quer mesmo deletar a matéria <span className="text-slate-900 font-semibold">"{deleteConfirmId.title}"</span>? Esta ação deleta simultaneamente do Site e do feed do App em produção.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-1 px-3 bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 rounded-md text-xs font-bold transition-all cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteArticle(deleteConfirmId.id);
                  setDeleteConfirmId(null);
                  showToast("Matéria deletada dos canais!", "success");
                }}
                className="flex-1 py-1 px-3 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-bold transition-all cursor-pointer"
              >
                Deletar de Ambos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header styling */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-[10px] bg-blue-100 text-blue-700 border border-blue-200 font-bold px-2 py-0.5 rounded uppercase tracking-wider">MESA EDITORIAL</span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-750 text-slate-700">Canal de Redação Simultânea</h3>
        </div>

        <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
          {/* View Switch Toggles */}
          <button
            type="button"
            onClick={() => { setActiveTab("manage"); setEditingArticleId(null); }}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all border ${
              activeTab === "manage" 
                ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            📋 Catalogar ({articles.length})
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("comments"); setEditingArticleId(null); }}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all border ${
              activeTab === "comments" 
                ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            💬 Moderar ({getAllComments().length})
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("stats"); setEditingArticleId(null); }}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all border ${
              activeTab === "stats" 
                ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            📊 Estatísticas Live
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("write"); resetForm(); setEditingArticleId(null); }}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all border ${
              activeTab === "write" && !editingArticleId
                ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            ➕ Redigir Furo
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-5">
        
        {activeTab === "manage" ? (
          <div className="space-y-4">
            {/* Manage Header & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Matérias Publicadas Hoje</h4>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">As modificações refletem no Site e no App simultaneamente.</p>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pesquisar furos..."
                  value={manageSearchTerm}
                  onChange={(e) => setManageSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-md text-[11px] py-1.5 pl-8 pr-3 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            {/* Articles Grid List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredManageArticles.length > 0 ? (
                filteredManageArticles.map((art) => (
                  <div 
                    key={art.id} 
                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-3 flex gap-4 transition-all hover:bg-slate-50/50"
                  >
                    {/* Image Thumbnail */}
                    <div className="w-16 h-16 rounded-md bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                      <img 
                        src={art.imageUrl} 
                        alt="" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80";
                        }}
                      />
                    </div>

                    {/* Info and Actions */}
                    <div className="min-w-0 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-mono font-bold uppercase mb-1">
                          <span className="text-blue-600 bg-blue-50 px-1 py-0.2 rounded border border-blue-100">{art.category}</span>
                          {art.pinned && (
                            <span className="text-amber-600 bg-amber-50 px-1 py-0.2 rounded border border-amber-100 flex items-center gap-0.5 font-bold">
                              📌 DESTAQUE
                            </span>
                          )}
                          {art.publishDate && (
                            <span className={`px-1 py-0.2 rounded border font-bold flex items-center gap-1 ${
                              new Date(art.publishDate) > new Date()
                                ? "text-violet-600 bg-violet-50 border-violet-100"
                                : "text-emerald-700 bg-emerald-50 border-emerald-100"
                            }`}>
                              ⏰ {new Date(art.publishDate) > new Date() ? `AGENDADO (${new Date(art.publishDate).toLocaleDateString("pt-BR")} ${new Date(art.publishDate).toLocaleTimeString("pt-BR", {hour: "2-digit", minute: "2-digit"})})` : "PUBLICADO AGENDADO"}
                            </span>
                          )}
                          {art.publishDate && new Date(art.publishDate) > new Date() && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateArticle({
                                  ...art,
                                  publishDate: undefined
                                });
                                showToast("Matéria publicada imediatamente no feed!", "success");
                              }}
                              className="text-[8px] font-bold text-white bg-violet-600 hover:bg-violet-700 px-1.5 py-0.2 rounded cursor-pointer transition-all uppercase"
                            >
                              🚀 Liberar Agora
                            </button>
                          )}
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500">★ {art.rating?.toFixed(1) || "9.0"}</span>
                        </div>
                        
                        <h5 className="text-xs font-bold text-slate-900 line-clamp-1 leading-snug">{art.title}</h5>
                        <p className="text-[10px] text-slate-500 line-clamp-1">Redator: {art.author}</p>
                      </div>

                      {/* Edit and Delete Buttons */}
                      <div className="flex gap-2 pt-1.5">
                        <button
                          type="button"
                          onClick={() => startEditing(art)}
                          className="flex-1 py-1 px-2 border border-slate-200 hover:bg-slate-100 text-[#475569] hover:text-blue-600 rounded-md text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteConfirmId({ id: art.id, title: art.title });
                          }}
                          className="py-1 px-2.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-100/50 rounded-md text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                          title="Apagar"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-mono">Nenhuma matéria foi encontrada.</p>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "stats" ? (
          <div className="space-y-6">
            {/* Stats Header */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-705 text-slate-700">Métricas Consolidadas do Ecossistema</h4>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Indicadores chave de performance em tempo real monitorados no Site e App Simulador.</p>
            </div>

            {/* Top Widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                <span className="text-xl p-2 bg-blue-50 text-blue-600 rounded-lg">🔥</span>
                <div>
                  <div className="text-[9px] font-mono font-bold text-slate-400 uppercase">Artigo Mais Visto</div>
                  <div className="text-xs font-bold text-slate-800 line-clamp-1">
                    {articles.length > 0 
                      ? articles.reduce((max, a) => (a.views || 0) > (max.views || 0) ? a : max, articles[0]).title 
                      : "Nenhum"}
                  </div>
                  <div className="text-[9px] font-mono font-bold text-blue-600">
                    {Math.max(...articles.map(a => a.views || 0), 0)} views
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                <span className="text-xl p-2 bg-purple-50 text-purple-600 rounded-lg">❤️</span>
                <div>
                  <div className="text-[9px] font-mono font-bold text-slate-400 uppercase">Artigo Mais Curtido</div>
                  <div className="text-xs font-bold text-slate-800 line-clamp-1">
                    {articles.length > 0 
                      ? articles.reduce((max, a) => (a.likes || 0) > (max.likes || 0) ? a : max, articles[0]).title 
                      : "Nenhum"}
                  </div>
                  <div className="text-[9px] font-mono font-bold text-purple-600">
                    {Math.max(...articles.map(a => a.likes || 0), 0)} curtidas
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                <span className="text-xl p-2 bg-amber-50 text-amber-600 rounded-lg">⭐</span>
                <div>
                  <div className="text-[9px] font-mono font-bold text-slate-400 uppercase font-bold">Nota Média Geral</div>
                  <div className="text-xs font-bold text-slate-800 line-clamp-1">
                    {(articles.reduce((sum, a) => sum + (a.rating || 0), 0) / (articles.length || 1)).toFixed(2)} / 10.0
                  </div>
                  <div className="text-[9px] font-mono font-bold text-amber-500">
                    Avaliação Editorial
                  </div>
                </div>
              </div>
            </div>

            {/* Graphics Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h5 className="text-[11px] uppercase font-bold tracking-wider text-slate-700">Volume de Cliques por Categoria (Views unificadas)</h5>
              
              <div className="space-y-3">
                {(["games", "animes", "podcast", "filmes", "series", "quadrinhos"] as const).map(cat => {
                  const views = articles.filter(a => a.category === cat).reduce((sum, a) => sum + (a.views || 0), 0);
                  const maxViews = Math.max(...(["games", "animes", "podcast", "filmes", "series", "quadrinhos"] as const).map(c => 
                    articles.filter(a => a.category === c).reduce((sum, a) => sum + (a.views || 0), 0)
                  ), 1);
                  const percentage = Math.round((views / maxViews) * 100);
                  
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] uppercase font-mono">
                        <span className="font-bold text-slate-700">{cat}</span>
                        <span className="text-slate-500 font-bold">{views} views ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${Math.max(3, percentage)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive category details ring / stats breakdown */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h5 className="text-[11px] uppercase font-bold tracking-wider text-slate-700 mb-2">Composição do Feed</h5>
                <p className="text-[10px] text-slate-500 leading-relaxed font-mono">Número total de matérias publicadas e arquivadas por editoria na plataforma.</p>
                <div className="mt-4 space-y-2">
                  {(["games", "animes", "podcast", "filmes", "series", "quadrinhos"] as const).map(cat => {
                    const count = articles.filter(a => a.category === cat).length;
                    return (
                      <div key={cat} className="flex justify-between items-center text-xs border-b border-slate-100 pb-1.5 font-sans">
                        <span className="capitalize text-slate-600 font-medium">{cat}</span>
                        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-800 font-bold">{count} furos</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h5 className="text-[11px] uppercase font-bold tracking-wider text-slate-700 mb-2">Engajamento de Curtidas</h5>
                <p className="text-[10px] text-slate-500 leading-relaxed font-mono">Soma das interações voluntárias recebidas via Simulador Mobile.</p>
                <div className="mt-4 space-y-2">
                  {(["games", "animes", "podcast", "filmes", "series", "quadrinhos"] as const).map(cat => {
                    const likes = articles.filter(a => a.category === cat).reduce((sum, a) => sum + (a.likes || 0), 0);
                    return (
                      <div key={cat} className="flex justify-between items-center text-xs border-b border-slate-100 pb-1.5 font-sans">
                        <span className="capitalize text-slate-600 font-medium">{cat}</span>
                        <span className="font-mono bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold">❤️ {likes} likes</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "comments" ? (
          <div className="space-y-4">
            {/* Moderation Header */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-705 text-slate-700">Moderação de Comentários</h4>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Veja e remova comentários impróprios enviados pelos usuários no App Simulador de forma instantânea.</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {getAllComments().length > 0 ? (
                getAllComments().map((cm) => (
                  <div 
                    key={cm.commentId} 
                    className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-500">
                        <span className="text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">{cm.author}</span>
                        <span>•</span>
                        <span>{cm.date}</span>
                        <span>•</span>
                        <span>Ref Artigo: <span className="text-slate-800 underline font-medium">{cm.articleTitle}</span></span>
                      </div>
                      <p className="text-xs text-slate-800 font-sans leading-relaxed">
                        {cm.text}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleModerateDelete(cm.articleId, cm.commentId)}
                      className="py-1 px-3 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-100 rounded-md text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0 self-end sm:self-center"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remover Comentário
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <span className="text-xl mb-1 block">💬</span>
                  <p className="text-xs text-slate-500 font-mono">Nenhum comentário enviado recentemente para moderar.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Back button or Editor State */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={cancelFormOrEditing}
                  className="p-1 px-2.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 text-[10px] font-mono border border-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Voltar
                </button>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-mono font-bold uppercase tracking-tight text-blue-600">
                  {editingArticleId ? "🔒 Editando" : "✨ Nova Matéria"}
                </span>
              </div>

              {editingArticleId && (
                <span className="text-[9px] font-mono uppercase bg-amber-50 border border-amber-200 text-amber-600 px-2 py-0.5 rounded font-bold">
                  ID: {editingArticleId}
                </span>
              )}
            </div>

            {/* AI Drafting Feature */}
            {!editingArticleId && (
              <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl space-y-2.5">
                <h4 className="text-xs font-bold text-purple-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Assistente de Reportagem AI (Gemini 3.5-Flash)
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Escreva um roteiro rápido (Ex: <i>"Lançamento de console portátil da Nintendo com retrocompatibilidade"</i>) e o sintonizador do Gemini redigirá toda a notícia instantaneamente!
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="ai-draft-guideline-input"
                    type="text"
                    placeholder="Ex: Trailer oficial de anime sensacional lançado em Tóquio"
                    value={aiDraftPrompt}
                    onChange={(e) => setAiDraftPrompt(e.target.value)}
                    className="bg-white border border-slate-200 text-xs px-3 py-1.5 text-slate-800 placeholder-slate-400 rounded-md flex-1 focus:outline-none focus:border-purple-400 font-sans"
                  />
                  <button
                    id="ai-draft-generation-btn"
                    type="button"
                    onClick={handleAiDraftGenerator}
                    disabled={generatingWithAi || !aiDraftPrompt.trim()}
                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-[10px] uppercase tracking-wider px-4 py-1.5 rounded-md shrink-0 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-purple-200" />
                    {generatingWithAi ? "Redigindo..." : "Gerar com IA"}
                  </button>
                </div>
              </div>
            )}

            {/* Edit Form */}
            <form onSubmit={handlePublish} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              
              {/* Left Inputs */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Seção Editorial</label>
                  <select
                    id="new-article-cat-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md text-xs py-1.5 px-3 text-slate-800 focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="games">💻 Games</option>
                    <option value="filmes">🎬 Filmes</option>
                    <option value="series">📺 Séries</option>
                    <option value="animes">🍥 Animes</option>
                    <option value="quadrinhos">📚 Quadrinhos</option>
                    <option value="podcast">🎙️ Podcast</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Título Principal</label>
                  <input
                    id="new-article-title-input"
                    type="text"
                    placeholder="Título chamativo da reportagem"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-md text-xs py-1.5 px-3 text-slate-800 focus:outline-none focus:bg-white font-sans"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Lide / Subtítulo</label>
                  <textarea
                    id="new-article-excerpt-input"
                    placeholder="Linha fina / resumo da chamada na home"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-md text-xs py-1.5 px-3 text-slate-800 focus:outline-none focus:bg-white h-14 resize-none font-sans"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Autor</label>
                    <input
                      id="new-article-author-input"
                      type="text"
                      placeholder="Nome do Editor"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-md text-xs py-1.5 px-3 text-slate-800 focus:outline-none focus:bg-white font-sans"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Nota Especial</label>
                    <input
                      id="new-article-rating-input"
                      type="number"
                      step="0.1"
                      min="1"
                      max="10"
                      placeholder="9.0"
                      value={rating}
                      onChange={(e) => setRating(parseFloat(e.target.value) || 9.0)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-md text-xs py-1.5 px-3 text-slate-800 focus:outline-none focus:bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Destaque Pin Toggle */}
                <div className="p-3 bg-blue-50/40 border border-blue-200/50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-100 p-1.5 rounded-md">📌</span>
                    <div>
                      <h5 className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">Fixar Como Destaque</h5>
                      <p className="text-[9px] text-slate-500 font-mono">Esta matéria será fixada automaticamente no topo do feed do Site e App.</p>
                    </div>
                  </div>
                  <input
                    id="new-article-pinned-checkbox"
                    type="checkbox"
                    checked={pinned}
                    onChange={(e) => setPinned(e.target.checked)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                  />
                </div>

                {/* Agendamento de Postagem Fields */}
                <div className="p-3 bg-violet-50/40 border border-violet-200/50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-violet-100 p-1.5 rounded-md">⏰</span>
                      <div>
                        <h5 className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">Agendar Publicação</h5>
                        <p className="text-[9px] text-slate-500 font-mono">Defina uma data/hora futura para simular post agendado.</p>
                      </div>
                    </div>
                    {publishDate && (
                      <button
                        type="button"
                        onClick={() => setPublishDate("")}
                        className="text-[9px] font-bold font-mono text-red-500 hover:underline hover:text-red-700 cursor-pointer"
                      >
                        Limpar Agendamento (Imediato)
                      </button>
                    )}
                  </div>
                  <input
                    id="new-article-publish-date-input"
                    type="datetime-local"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-violet-550 focus:border-violet-500 rounded-md text-xs py-1.5 px-3 text-slate-800 font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Link da Capa (Unsplash)</label>
                    <button
                      id="ai-generate-cover-btn"
                      type="button"
                      disabled={!title.trim() || generatingWithAi}
                      onClick={async () => {
                        if (!title.trim()) return;
                        setGeneratingWithAi(true);
                        try {
                          const response = await fetch("/api/gemini/chat", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              messages: [
                                {
                                  role: "user",
                                  content: `Com base em uma matéria de portal de notícias geek chamada: "${title}", selecione 4 termos ou palavras-chave em inglês perfeitos para buscar uma imagem fotorrealista de alta qualidade no Unsplash.
                                  Retorne APENAS um objeto JSON válido, sem usar formatação de bloco de código markdown ou crases (JSON puro) no formato exato:
                                  { "keywords": "cyberpunk city neon", "description": "Uma breve descrição da imagem sugerida" }`
                                }
                              ]
                            })
                          });

                          const data = await response.json();
                          if (response.ok) {
                            const parsed = extractJSON(data.reply);
                            const query = encodeURIComponent(parsed.keywords || "geek,technology");
                            const randomId = Math.floor(Math.random() * 1000) + 1;
                            
                            const customUrl = `https://images.unsplash.com/featured/1200x675/?${query}&sig=${randomId}`;
                            setImageUrl(customUrl);
                            showToast(`Capa sugerida pelo Gemini: ${parsed.description || parsed.keywords}`, "success");
                          } else {
                            showToast(data.error || "Não foi possível carregar a sugestão de capa.", "error");
                            setImageUrl(`https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80`);
                          }
                        } catch (err) {
                          console.error("Cover image generation error", err);
                          showToast("Não foi possível alcançar o sintonizador do Gemini.", "error");
                          setImageUrl(`https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80`);
                        } finally {
                          setGeneratingWithAi(false);
                        }
                      }}
                      className="text-[10px] font-bold uppercase text-purple-600 hover:text-purple-800 flex items-center gap-1 transition-all disabled:opacity-55 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      Pesquisar Capa com IA
                    </button>
                  </div>
                  <input
                    id="new-article-cover-input"
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-md text-xs py-1.5 px-3 text-slate-800 focus:outline-none focus:bg-white font-mono"
                  />
                </div>

                {/* YouTube Embed Link input */}
                <div className="space-y-1 p-2.5 rounded-lg bg-red-50 border border-red-100 flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-red-700 flex items-center gap-1">
                    📺 Código/Link do YouTube (Opcional)
                  </label>
                  <input
                    id="new-article-youtube-input"
                    type="text"
                    placeholder="Ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-md text-xs py-1.5 px-3 text-slate-855 focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              {/* Right Side: Full Body and Live Preview */}
              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-1 flex flex-col flex-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-bold">Matéria Completa</label>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {content.split(/\s+/).filter(Boolean).length} pal.
                    </span>
                  </div>
                  <textarea
                    id="new-article-body-textarea"
                    placeholder="Articule aqui toda a reportagem do furo..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-md text-xs py-2 px-3 text-slate-855 focus:outline-none focus:bg-white flex-1 min-h-[140px] font-sans"
                    required
                  />
                </div>

                {/* Dynamic Live Preview Card */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="text-[9px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1 font-bold">
                    <Eye className="w-3.5 h-3.5 text-blue-500" />
                    Preview Geral do Layout
                  </h4>
                  
                  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm flex gap-3 p-2">
                    <div className="w-16 h-16 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                      {imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt="Preview" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=850&q=80";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    
                    <div className="min-w-0 flex-1 flex flex-col justify-center">
                      <h5 className="text-xs font-bold text-slate-900 truncate">
                        {title || "Sem título definido"}
                      </h5>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {excerpt || "Defina um resumo marcante."}
                      </p>
                      <div className="text-[9px] text-slate-400 mt-1 uppercase font-semibold">
                        {category} • Por {author || "Redação"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-3 border-t border-slate-100">
                  <button
                    id="discard-inputs-btn"
                    type="button"
                    onClick={cancelFormOrEditing}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs uppercase rounded-md cursor-pointer transition-all"
                  >
                    Descartar
                  </button>
                  <button
                    id="publish-news-to-feed-btn"
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase rounded-md tracking-wider transition-all shadow-sm cursor-pointer"
                  >
                    {editingArticleId ? "✏️ Modificar" : "🚀 Publicar Simultaneamente!"}
                  </button>
                </div>
              </div>

            </form>
          </div>
        )}
      </div>
    </div>
  );
}
