import { Article } from "./types";

export const initialArticles: Article[] = [
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
    comments: []
  },
  {
    id: "art-3",
    category: "podcast",
    title: "GeekTalk #42 - O Futuro dos Consoles de Mesa e Portáteis na Era do Cloud Gaming",
    excerpt: "Debatemos os impactos do processamento em nuvem, vida útil de portáteis híbridos e se a mídia física ainda resiste.",
    content: "No episódio desta semana, nossos editores sentaram para discutir a rápida evolução do Cloud Gaming. Será que as plataformas físicas estão com os dias contados? Analisamos o comportamento de grandes publicadoras e a recepção do público que prefere a praticidade digital.\n\nAssista ao episódio completo anexado abaixo para entender em detalhes onde investir seu dinheiro para as próximas gerações.",
    author: "PodCast DigaNews",
    date: "Há 2 dias",
    readTime: "5 min de leitura",
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
    rating: 9.2,
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    views: 450,
    likes: 31,
    comments: []
  }
];
