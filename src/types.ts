export interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface Article {
  id: string;
  category: "games" | "filmes" | "series" | "animes" | "quadrinhos" | "podcast";
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  imageUrl: string;
  rating?: number;
  videoUrl?: string;
  views: number;
  likes: number;
  pinned?: boolean;
  publishDate?: string;
  comments?: Comment[];
}
