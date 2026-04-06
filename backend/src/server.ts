import app from './app';
import { env } from './config/env';
import { sequelize } from './config/database';

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    await sequelize.sync({ alter: env.nodeEnv === 'development' });
    console.log('Database models synchronized.');

    app.listen(env.port, env.host, () => {
      console.log(`Server running at http://${env.host}:${env.port}`);
      console.log(`Environment: ${env.nodeEnv}`);
      console.log(`Storage provider: ${env.storage.provider}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
