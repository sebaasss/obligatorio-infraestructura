import { Request, Response, NextFunction } from 'express';
import { articleService } from '../services/articleService';
import { generateArticles } from '../services/contentGeneratorService';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export const articleController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { source, status, search, page, limit } = req.query;
      const result = await articleService.listArticles(
        {
          source: source as string | undefined,
          status: status as string | undefined,
          search: search as string | undefined,
        },
        {
          page: page ? parseInt(page as string, 10) : undefined,
          limit: limit ? parseInt(limit as string, 10) : undefined,
        }
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid id' });
        return;
      }
      const article = await articleService.getArticle(id);
      res.json(article);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, content, summary, status, externalSourceUrl } = req.body;
      if (!title || !content) {
        res.status(400).json({ error: 'title and content are required' });
        return;
      }
      const article = await articleService.createArticle({
        title,
        content,
        summary,
        source: 'manual',
        status: status || 'published',
        externalSourceUrl,
        publishedAt: status === 'published' ? new Date() : undefined,
      });
      res.status(201).json(article);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid id' });
        return;
      }
      const { title, content, summary, status } = req.body;
      const article = await articleService.updateArticle(id, {
        title,
        content,
        summary,
        status,
      });
      res.json(article);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid id' });
        return;
      }
      await articleService.deleteArticle(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async uploadCover(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid id' });
        return;
      }
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }
      const ext = path.extname(req.file.originalname).toLowerCase();
      const filename = `cover-${id}-${uuidv4()}${ext}`;
      const article = await articleService.uploadCover(
        id,
        req.file.buffer,
        filename,
        req.file.mimetype
      );
      res.json(article);
    } catch (err) {
      next(err);
    }
  },

  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const count = req.body.count ? parseInt(req.body.count, 10) : undefined;
      const created = await generateArticles(count);
      res.json({ message: `Created ${created} articles`, count: created });
    } catch (err) {
      next(err);
    }
  },
};
