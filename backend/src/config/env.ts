import dotenv from 'dotenv';
dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || '0.0.0.0',

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    name: process.env.DB_NAME || 'articles_db',
    user: process.env.DB_USER || 'articles_user',
    password: process.env.DB_PASSWORD || 'articles_pass',
  },

  storage: {
    provider: (process.env.STORAGE_PROVIDER || 'local') as 'local' | 's3',
    localPath: process.env.LOCAL_STORAGE_PATH || './uploads',
    localBaseUrl: process.env.LOCAL_STORAGE_BASE_URL || 'http://localhost:3001/uploads',
    aws: {
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      bucket: process.env.S3_BUCKET || '',
      baseUrl: process.env.S3_BASE_URL || '',
    },
  },

  generator: {
    apiUrl: process.env.GENERATOR_API_URL || 'https://jsonplaceholder.typicode.com/posts',
    count: parseInt(process.env.GENERATOR_COUNT || '5', 10),
  },
};
