import { env } from './env';
import { StorageProvider } from '../services/storage/StorageProvider';
import { LocalStorageProvider } from '../services/storage/LocalStorageProvider';
import { S3StorageProvider } from '../services/storage/S3StorageProvider';

let storageProvider: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (!storageProvider) {
    if (env.storage.provider === 's3') {
      storageProvider = new S3StorageProvider({
        region: env.storage.aws.region,
        accessKeyId: env.storage.aws.accessKeyId,
        secretAccessKey: env.storage.aws.secretAccessKey,
        bucket: env.storage.aws.bucket,
        baseUrl: env.storage.aws.baseUrl,
      });
    } else {
      storageProvider = new LocalStorageProvider({
        storagePath: env.storage.localPath,
        baseUrl: env.storage.localBaseUrl,
      });
    }
  }
  return storageProvider;
}
