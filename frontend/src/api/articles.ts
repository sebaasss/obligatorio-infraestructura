import axios from 'axios';
import type { Article, ArticleListResponse, CreateArticleDto, UpdateArticleDto } from '../types/article';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${BASE_URL}/articles`,
});

export interface ListParams {
  page?: number;
  limit?: number;
  source?: string;
  status?: string;
  search?: string;
}

export const articlesApi = {
  list(params?: ListParams): Promise<ArticleListResponse> {
    return api.get<ArticleListResponse>('/', { params }).then(r => r.data);
  },

  getById(id: number): Promise<Article> {
    return api.get<Article>(`/${id}`).then(r => r.data);
  },

  create(data: CreateArticleDto): Promise<Article> {
    return api.post<Article>('/', data).then(r => r.data);
  },

  update(id: number, data: UpdateArticleDto): Promise<Article> {
    return api.put<Article>(`/${id}`, data).then(r => r.data);
  },

  delete(id: number): Promise<void> {
    return api.delete(`/${id}`).then(() => undefined);
  },

  uploadCover(id: number, file: File): Promise<Article> {
    const form = new FormData();
    form.append('cover', file);
    return api.post<Article>(`/${id}/cover`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  generate(count?: number): Promise<{ message: string; count: number }> {
    return api.post<{ message: string; count: number }>('/generate', { count }).then(r => r.data);
  },
};
