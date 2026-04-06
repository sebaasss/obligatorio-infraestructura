import { Article, ArticleCreationAttributes, ArticleAttributes } from '../models/Article';
import { WhereOptions, Op } from 'sequelize';

export interface ArticleFilters {
  source?: string;
  status?: string;
  search?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export const articleRepository = {
  async findAll(filters: ArticleFilters = {}, pagination: PaginationOptions = {}) {
    const where: WhereOptions<ArticleAttributes> = {};
    if (filters.source) where.source = filters.source as 'manual' | 'generated';
    if (filters.status) where.status = filters.status as 'draft' | 'published';
    if (filters.search) {
      where.title = { [Op.like]: `%${filters.search}%` };
    }

    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(100, Math.max(1, pagination.limit || 20));
    const offset = (page - 1) * limit;

    const { rows, count } = await Article.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return { articles: rows, total: count, page, limit };
  },

  async findById(id: number) {
    return Article.findByPk(id);
  },

  async create(data: ArticleCreationAttributes) {
    return Article.create(data);
  },

  async update(id: number, data: Partial<ArticleAttributes>) {
    const article = await Article.findByPk(id);
    if (!article) return null;
    return article.update(data);
  },

  async delete(id: number) {
    const article = await Article.findByPk(id);
    if (!article) return false;
    await article.destroy();
    return true;
  },
};
