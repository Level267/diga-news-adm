import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const DATA_FILE = path.join(process.cwd(), "articles.json");

// Default initial articles seeded with mock data if file doesn't exist
const defaultArticles = [
  {
    id: "art-1",
    category: "games",
    title: "Vazamento do Console de Nova Geração indica hardware otimizado e retrocompatibilidade com Ray Tracing",
    excerpt: "Novos relatórios industriais apontam que o aguardado sucessor focará em upscaling por hardware avançado e suporte integral a mídias anteriores.",
    content: "Análises de fornecedores de semicondutores revelaram detalhes técnicos fascinantes sobre a próxima plataforma de entretenimento portátil. Segundo fontes internas da linha de produção na Ásia, o dispositivo contará com um chip de arquitetura personalizada da NVIDIA, trazendo tecnologia DLSS integrada que permitirá resoluções em alta definição mesmo no modo portátil.\n\nAlém disso, desenvolvedores parceiros que já possuem os kits de desenvolvimento (devkits) confirmam que jogos de atual geração rodarão com otimizações de framerate automáticas, além de suporte nativo à iluminação por Ray Tracing em títulos selecionados. A fabricante deve fazer o anúncio oficial no final do trimestre fiscal, gerando imensa expectativa no mercado financeiro.",
    author: "Felipe 'TechX' Souza",
    date: "Hoje mesmo",
    readTime: "3 min de leitura",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
    rating: 9.5,
    views: 1240,
    likes: 84,
    pinned: true,
    comments: [
      { id: "c-1", author: "Marcos_Gamer", text: "Excelente análise, tomara que a retrocompatibilidade venha mesmo!", date: "Há 2 horas" }
    ]
  },
  {
    id: "art-2",
    category: "animes",
    title: "Estreia da nova temporada do anime sensação quebra recordes de audiência nos serviços de streaming",
    excerpt: "Adaptação do aclamado arco do torneio mundial de fantasia entrega animação impecável e engaja milhões de fãs globalmente.",
    content: "O primeiro episódio da nova temporada foi ao ar no último fim de semana e causou um verdadeiro congestionamento nos servidores das principais plataformas de streaming mundiais. Fãs elogiaram profundamente a transição de design de personagens e as coreografias de combate de altíssimo nível desenvolvidas pela equipe técnica titular.\n\nEspecialistas de entretenimento estimam que esta temporada consolidará a franquia como um dos títulos mais influentes da década, expandindo também a venda de produtos licenciados e jogos derivados.",
    author: "Beatriz 'OtakuZone' Lima",
    date: "Ontem",
    readTime: "2 min de leitura",
    imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
    rating: 8.8,
    views: 955,
    likes: 67,
    pinned: false,
    comments: []
  },
  {
    id: "art-3",
    category: "podcast",
    title: "GeekTalk #42 - O Futuro dos Consoles de Mesa e Portáteis na Era do Cloud Gaming",
    excerpt: "Debatemos os impactos do processamento em nuvem, vida útil de portáteis híbridos e se a mídia física ainda resiste.",
    content: "No episódio desta semana, nossos editores sentaram para discutir a rápida evolução do Cloud Gaming. Será que as plataformas físicas estão com os dias contados? Analisamos o comportamento de grandes publicadoras e a recepção do público que prefere a praticidade digital.\n\nAssista ao episódio completo anexado abaixo para entender em detalhes onde investigar seu dinheiro para as próximas gerações.",
    author: "PodCast DigaNews",
    date: "Há 2 dias",
    readTime: "5 min de leitura",
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
    rating: 9.2,
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    views: 450,
    likes: 31,
    pinned: false,
    comments: []
  }
];

// Helper to loads database state from json
function loadArticlesFromFile() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Local database load issue:", err);
  }
  return null;
}

// Global server memory state synchronized with JSON file
let serverArticles = loadArticlesFromFile() || defaultArticles;

// Helper to persist state back to file
function saveArticlesToFile() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(serverArticles, null, 2), "utf-8");
  } catch (err) {
    console.error("Local database save issue:", err);
  }
}

// Initial write to sync the seed file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  saveArticlesToFile();
}

// Lazy-initialized Gemini Client helper
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("A chave GEMINI_API_KEY não está definida nas configurações do ambiente.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS middleware allowing cross-origin requests from any site or app (Flutter, React Native, external Web)
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // === REST APIs for Articles Database ===

  // 1. GET all articles sorted by pinned status
  app.get("/api/articles", (req, res) => {
    const sorted = [...serverArticles].sort((a, b) => {
      const aPinned = a.pinned ? 1 : 0;
      const bPinned = b.pinned ? 1 : 0;
      return bPinned - aPinned;
    });
    res.json(sorted);
  });

  // 2. POST create dynamic news (simultaneously added to database)
  app.post("/api/articles", (req, res) => {
    const { category, title, excerpt, content, author, imageUrl, rating, videoUrl, pinned, publishDate } = req.body;
    
    if (!title || !content || !author) {
      return res.status(400).json({ error: "Título, conteúdo e autor são campos obrigatórios." });
    }

    const newArticle = {
      id: "art-server-" + Date.now().toString(),
      category: category || "games",
      title,
      excerpt: excerpt || content.substring(0, 100) + "...",
      content,
      author,
      date: "Hoje mesmo",
      readTime: `${Math.max(1, Math.round(content.split(/\s+/).length / 150))} min de leitura`,
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
      rating: rating !== undefined ? Number(rating) : 9.0,
      videoUrl: videoUrl || undefined,
      views: 1,
      likes: 0,
      comments: [],
      pinned: pinned !== undefined ? Boolean(pinned) : false,
      publishDate: publishDate || undefined
    };

    serverArticles.unshift(newArticle);
    saveArticlesToFile();
    res.status(201).json(newArticle);
  });

  // 3. PUT update existing article
  app.put("/api/articles/:id", (req, res) => {
    const { id } = req.params;
    const { category, title, excerpt, content, author, imageUrl, rating, videoUrl, likes, comments, views, pinned, publishDate } = req.body;

    const index = serverArticles.findIndex((art) => art.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Artigo não encontrado no servidor." });
    }

    const original = serverArticles[index];
    const updatedArticle = {
      ...original,
      category: category || original.category,
      title: title || original.title,
      excerpt: excerpt || original.excerpt,
      content: content || original.content,
      author: author || original.author,
      readTime: content ? `${Math.max(1, Math.round(content.split(/\s+/).length / 150))} min de leitura` : original.readTime,
      imageUrl: imageUrl !== undefined ? imageUrl : original.imageUrl,
      rating: rating !== undefined ? Number(rating) : original.rating,
      videoUrl: videoUrl !== undefined ? videoUrl : original.videoUrl,
      likes: likes !== undefined ? Number(likes) : original.likes,
      comments: comments !== undefined ? comments : original.comments,
      views: views !== undefined ? Number(views) : original.views,
      pinned: pinned !== undefined ? Boolean(pinned) : (original.pinned || false),
      publishDate: publishDate !== undefined ? publishDate : original.publishDate
    };

    serverArticles[index] = updatedArticle;
    saveArticlesToFile();
    res.json(updatedArticle);
  });

  // 4. DELETE article
  app.delete("/api/articles/:id", (req, res) => {
    const { id } = req.params;
    const index = serverArticles.findIndex((art) => art.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Artigo não encontrado para exclusão." });
    }
    
    const deleted = serverArticles.splice(index, 1);
    saveArticlesToFile();
    res.json({ success: true, deleted: deleted[0] });
  });

  // === AI Endpoint using @google/genai & gemini-3.5-flash ===
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "O array de mensagens é obrigatório." });
      }

      // Extract user prompt
      const userPrompt = messages[messages.length - 1].content;
      
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
      });

      res.json({ reply: response.text });
    } catch (err: any) {
      console.error("Gemini API server exception:", err);
      
      let userFriendlyMsg = "Erro interno ao processar requisição de IA.";
      const errMsg = err.message || "";
      const errStr = typeof err === "object" ? JSON.stringify(err) : String(err);

      if (
        errMsg.includes("leaked") || 
        errMsg.includes("403") || 
        errMsg.includes("PERMISSION_DENIED") ||
        errStr.includes("leaked") ||
        errStr.includes("403") ||
        errStr.includes("PERMISSION_DENIED")
      ) {
        userFriendlyMsg = "Sua chave de API do Gemini (GEMINI_API_KEY) foi classificada como vazada ou inválida pela infraestrutura de segurança do Google. Para reativar as funções de IA, por favor troque a chave nas Configurações da plataforma (Settings) no canto superior direito.";
      } else if (
        errMsg.includes("API key not found") || 
        errMsg.includes("not defined") ||
        errStr.includes("API key not found")
      ) {
        userFriendlyMsg = "Chave de API do Gemini (GEMINI_API_KEY) ausente ou inválida. Configure seu ambiente com uma chave ativa nas Configurações.";
      } else {
        userFriendlyMsg = `Erro na API do Gemini: ${err.message || "Tente novamente mais tarde."}`;
      }

      res.status(500).json({ error: userFriendlyMsg });
    }
  });

  // Serve static files / integration with Vite build
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
