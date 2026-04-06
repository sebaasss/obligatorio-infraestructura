export interface UploadResult {
  url: string;
  key: string;
}

export interface StorageProvider {
  upload(buffer: Buffer, filename: string, mimetype: string): Promise<UploadResult>;
  delete(key: string): Promise<void>;
}
