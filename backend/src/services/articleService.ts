import { articleRepository, ArticleFilters, PaginationOptions } from '../repositories/articleRepository';
import { ArticleCreationAttributes, ArticleAttributes } from '../models/Article';
import { getStorageProvider } from '../config/storage';

export const articleService = {
  async listArticles(filters: ArticleFilters, pagination: PaginationOptions) {
    return articleRepository.findAll(filters, pagination);
  },

  async getArticle(id: number) {
    const article = await articleRepository.findById(id);
    if (!article) throw { status: 404, message: 'Article not found' };
    return article;
  },

  async createArticle(data: ArticleCreationAttributes) {
    return articleRepository.create(data);
  },

  async updateArticle(id: number, data: Partial<ArticleAttributes>) {
    const article = await articleRepository.update(id, data);
    if (!article) throw { status: 404, message: 'Article not found' };
    return article;
  },

  async deleteArticle(id: number) {
    const article = await articleRepository.findById(id);
    if (!article) throw { status: 404, message: 'Article not found' };

    if (article.coverImageKey) {
      try {
        await getStorageProvider().delete(article.coverImageKey);
      } catch {
        console.warn(`Could not delete cover image key=${article.coverImageKey}`);
      }
    }

    await articleRepository.delete(id);
  },

  async uploadCover(id: number, buffer: Buffer, filename: string, mimetype: string) {
    const article = await articleRepository.findById(id);
    if (!article) throw { status: 404, message: 'Article not found' };

    const storage = getStorageProvider();

    if (article.coverImageKey) {
      try {
        await storage.delete(article.coverImageKey);
      } catch {
        console.warn(`Could not delete old cover image key=${article.coverImageKey}`);
      }
    }

    const result = await storage.upload(buffer, filename, mimetype);
    return articleRepository.update(id, {
      coverImageUrl: result.url,
      coverImageKey: result.key,
    });
  },
};
