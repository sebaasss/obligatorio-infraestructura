import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';
import { StorageProvider, UploadResult } from './StorageProvider';

interface S3StorageConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  baseUrl: string;
}

export class S3StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucket: string;
  private baseUrl: string;

  constructor(config: S3StorageConfig) {
    this.client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    this.bucket = config.bucket;
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
  }

  async upload(buffer: Buffer, filename: string, mimetype: string): Promise<UploadResult> {
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: filename,
        Body: Readable.from(buffer),
        ContentType: mimetype,
      },
    });
    await upload.done();
    return {
      url: `${this.baseUrl}/${filename}`,
      key: filename,
    };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key })
    );
  }
}
