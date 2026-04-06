import express from 'express';
import cors from 'cors';
import path from 'path';
import { env } from './config/env';
import articleRoutes from './routes/articleRoutes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.storage.provider === 'local') {
  app.use('/uploads', express.static(path.resolve(env.storage.localPath)));
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: env.nodeEnv });
});

app.use('/articles', articleRoutes);

app.use(errorHandler);

export default app;
