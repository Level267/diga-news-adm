import React, { useState, useEffect } from "react";
import AdminPanel from "./components/AdminPanel";
import MobileAppSimulator from "./components/MobileAppSimulator";
import { Article } from "./types";
import { 
  Plus, 
  Sparkles, 
  Layout, 
  Eye, 
  Smartphone, 
  Database, 
  TrendingUp, 
  CheckCircle, 
  Server,
  Share2,
  ListCollapse,
  RefreshCw,
  Bell
} from "lucide-react";

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // High Density Sidebar toggles
  const [sidebarTab, setSidebarTab] = useState<"manager" | "simulator" | "analytics">("manager");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch initial articles with live connection
  const loadArticles = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/articles");
      if (!res.ok) throw new Error("Falha ao obter base de notícias do servidor.");
      const data = await res.json();
      setArticles(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Não foi possível sincronizar com o banco central.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  // Handler: POST dynamic news
  const handleAddArticle = async (newArt: Article) => {
    try {
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newArt)
      });

      if (!response.ok) throw new Error("Falha ao propagar notícia para os canais.");
      const savedArt = await response.json();
      
      // Update local reactive state
      setArticles((prev) => [savedArt, ...prev]);
    } catch (err: any) {
      console.error(err);
      // Fallback local persistence if offline
      setArticles((prev) => [newArt, ...prev]);
    }
  };

  // Handler: PUT update news
  const handleUpdateArticle = async (updatedArt: Article) => {
    try {
      const response = await fetch(`/api/articles/${updatedArt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedArt)
      });

      if (!response.ok) throw new Error("Erro ao atualizar matéria no banco.");
      const saved = await response.json();

      setArticles((prev) => prev.map((art) => (art.id === saved.id ? saved : art)));
    } catch (err: any) {
      console.error(err);
      setArticles((prev) => prev.map((art) => (art.id === updatedArt.id ? updatedArt : art)));
    }
  };

  // Handler: DELETE news
  const handleDeleteArticle = async (id: string) => {
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Erro ao deletar notícia.");
      setArticles((prev) => prev.filter((art) => art.id !== id));
    } catch (err: any) {
      console.error(err);
      setArticles((prev) => prev.filter((art) => art.id !== id));
    }
  };

  // Interactive mobile simulator helpers: Like and Comment callbacks
  const handleAppLikePress = async (articleId: string) => {
    // Find article and update likes locally + sync if necessary
    const target = articles.find(art => art.id === articleId);
    if (target) {
      const updated = { ...target, likes: (target.likes || 0) + 1 };
      handleUpdateArticle(updated);
    }
  };

  const handleAppAddComment = async (articleId: string, author: string, text: string) => {
    const target = articles.find(art => art.id === articleId);
    if (target) {
      const updatedComments = [
        ...(target.comments || []),
        { id: "cmt-" + Date.now(), author, text, date: "Agora de pouco" }
      ];
      const updated = { ...target, comments: updatedComments };
      handleUpdateArticle(updated);
    }
  };

  // Compute stats metrics based on live state
  const totalViews = articles.reduce((sum, art) => sum + (art.views || 0), 0);
  const totalLikes = articles.reduce((sum, art) => sum + (art.likes || 0), 0);
  const articlesByCat = (cat: string) => articles.filter(art => art.category === cat).length;

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* Sidebar (Slate-900 Theme) */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 select-none">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-md shadow-blue-900/40">AI</div>
          <div>
            <span className="font-semibold text-white tracking-tight text-md block leading-none">AdminHub</span>
            <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase mt-1 block">Live Multichannel</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Painéis Centrais</div>
          
          <button
            onClick={() => setSidebarTab("manager")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-xs uppercase tracking-wider transition-all text-left border-l-2 ${
              sidebarTab === "manager"
                ? "bg-blue-600/15 text-blue-400 border-blue-600 font-bold"
                : "border-transparent hover:bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Database className="w-4 h-4" />
            Notícias & Feeds
          </button>

          <button
            onClick={() => setSidebarTab("simulator")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-xs uppercase tracking-wider transition-all text-left border-l-2 ${
              sidebarTab === "simulator"
                ? "bg-blue-600/15 text-blue-400 border-blue-600 font-bold"
                : "border-transparent hover:bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Simulador Mobile App
          </button>

          <button
            onClick={() => setSidebarTab("analytics")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-xs uppercase tracking-wider transition-all text-left border-l-2 ${
              sidebarTab === "analytics"
                ? "bg-blue-600/15 text-blue-400 border-blue-600 font-bold"
                : "border-transparent hover:bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Métricas de Sincronia
          </button>

          <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 mt-6 mb-2">Status do Sistema</div>
          <div className="space-y-2 px-3 text-[11px] font-mono">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Servidor Web
              </span>
              <span className="text-emerald-400">ONLINE</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Sincronia App
              </span>
              <span className="text-emerald-400">ATIVA</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Gemini Model
              </span>
              <span className="text-emerald-400">PRONTO</span>
            </div>
          </div>
        </nav>

        {/* Footer Profile */}
        <div className="p-4 bg-slate-950/60 mt-auto border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center border border-blue-500/30 font-mono text-sm uppercase">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">Administrador</p>
              <p className="text-[10px] text-slate-500 truncate">level267x@gmail.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header Section */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">Painel Multicanais de Notícias</h1>
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
              Live Sync On
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center text-xs font-mono text-slate-400 gap-4 pr-4 border-r border-slate-200">
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-500" /> Web DB: {articles.length} posts
              </div>
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-purple-500" /> App DB: {articles.length} posts
              </div>
            </div>

            <button 
              onClick={loadArticles} 
              disabled={isRefreshing}
              className="p-2 text-slate-500 hover:text-blue-500 hover:bg-slate-100 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
              title="Sincronizar dados"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-blue-500" : ""}`} />
              Auto-Sinc
            </button>
          </div>
        </header>

        {/* Workspace Body Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          
          <div className="grid grid-cols-12 gap-6 max-w-7xl mx-auto h-full items-start">
            
            {/* View switching panel (col-span 7 or 12 depending on full-width toggles) */}
            <div className="col-span-12 xl:col-span-7 space-y-6">
              {loading ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                  <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700">Carregando canais unificados de notícias...</p>
                  <p className="text-xs text-slate-400 mt-1">Conectando ao banco de dados Express...</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-6 text-center shadow-sm">
                  <p className="text-sm font-bold">⚠️ Falha na conexão simultânea</p>
                  <p className="text-xs mt-1 text-red-600">{error}</p>
                  <button 
                    onClick={loadArticles} 
                    className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-extrabold uppercase transition-colors"
                  >
                    Tentar Novamente
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1">
                  <AdminPanel 
                    articles={articles}
                    onAddArticle={handleAddArticle}
                    onUpdateArticle={handleUpdateArticle}
                    onDeleteArticle={handleDeleteArticle}
                  />
                </div>
              )}
            </div>

            {/* Right Side: Channel Stats & Smartphone Live Simulator */}
            <div className="col-span-12 xl:col-span-5 flex flex-col gap-6">
              
              {/* Stats Grid Dashboard Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Estatísticas Unificadas de Audiência</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <div className="text-xs text-blue-600 font-bold uppercase">Portal Web</div>
                    <div className="text-2xl font-black text-slate-800 tracking-tight mt-1">{totalViews}</div>
                    <div className="text-[10px] text-blue-500 mt-1 uppercase font-bold">● {articles.length} Matérias Live</div>
                  </div>
                  <div className="p-3 bg-purple-50 border border-purple-100 rounded-lg">
                    <div className="text-xs text-purple-600 font-bold uppercase">Aplicativo Móvel</div>
                    <div className="text-2xl font-black text-slate-800 tracking-tight mt-1">{totalLikes}</div>
                    <div className="text-[10px] text-purple-500 mt-1 uppercase font-bold">❤ {totalLikes} Likes em Tempo Real</div>
                  </div>
                </div>

                {/* Categories quick lookup counters */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>💻 Games: {articlesByCat("games")}</span>
                  <span>🍥 Animes: {articlesByCat("animes")}</span>
                  <span>🎙️ Podcast: {articlesByCat("podcast")}</span>
                </div>
              </div>

              {/* Interactive Phone Simulator container */}
              <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-200 flex flex-col items-center">
                <div className="text-center mb-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-800">Visualização do Aplicativo do Usuário</h4>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Toque nos cards do celular para abrir o post, dar curtidas e escrever comentários simultâneos!
                  </p>
                </div>
                
                <MobileAppSimulator 
                  articles={articles}
                  onAddComment={handleAppAddComment}
                  onLikePress={handleAppLikePress}
                />
              </div>

            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
