/**
 * Content Generator Service
 *
 * Fetches posts from a public API and creates articles with source='generated'.
 * Can be invoked manually via: npm run generate
 * Or scheduled with cron / systemd timer.
 */

import axios from 'axios';
import { articleRepository } from '../repositories/articleRepository';
import { env } from '../config/env';

interface ExternalPost {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export async function generateArticles(count?: number): Promise<number> {
  const targetCount = count ?? env.generator.count;
  const response = await axios.get<ExternalPost[]>(env.generator.apiUrl);
  const posts = response.data.slice(0, targetCount);

  let created = 0;
  for (const post of posts) {
    await articleRepository.create({
      title: post.title,
      content: post.body,
      summary: post.body.substring(0, 200),
      source: 'generated',
      status: 'published',
      externalSourceUrl: `${env.generator.apiUrl}/${post.id}`,
      publishedAt: new Date(),
    });
    created++;
  }

  console.log(`Generated ${created} articles from ${env.generator.apiUrl}`);
  return created;
}

if (require.main === module) {
  import('../config/database').then(({ sequelize }) => {
    sequelize.sync().then(() => {
      return generateArticles();
    }).then((count) => {
      console.log(`Done. Created ${count} articles.`);
      process.exit(0);
    }).catch((err) => {
      console.error('Generator failed:', err);
      process.exit(1);
    });
  });
}
