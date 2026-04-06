export type ArticleSource = 'manual' | 'generated';
export type ArticleStatus = 'draft' | 'published';

export interface Article {
  id: number;
  title: string;
  content: string;
  summary?: string;
  coverImageUrl?: string;
  coverImageKey?: string;
  source: ArticleSource;
  status: ArticleStatus;
  externalSourceUrl?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleListResponse {
  articles: Article[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateArticleDto {
  title: string;
  content: string;
  summary?: string;
  status?: ArticleStatus;
}

export interface UpdateArticleDto {
  title?: string;
  content?: string;
  summary?: string;
  status?: ArticleStatus;
}
