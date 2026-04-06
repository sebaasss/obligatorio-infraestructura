import fs from 'fs';
import path from 'path';
import { StorageProvider, UploadResult } from './StorageProvider';

interface LocalStorageConfig {
  storagePath: string;
  baseUrl: string;
}

export class LocalStorageProvider implements StorageProvider {
  private storagePath: string;
  private baseUrl: string;

  constructor(config: LocalStorageConfig) {
    this.storagePath = path.resolve(config.storagePath);
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
  }

  async upload(buffer: Buffer, filename: string, _mimetype: string): Promise<UploadResult> {
    const dest = path.join(this.storagePath, filename);
    await fs.promises.writeFile(dest, buffer);
    return {
      url: `${this.baseUrl}/${filename}`,
      key: filename,
    };
  }

  async delete(key: string): Promise<void> {
    const dest = path.join(this.storagePath, key);
    if (fs.existsSync(dest)) {
      await fs.promises.unlink(dest);
    }
  }
}
