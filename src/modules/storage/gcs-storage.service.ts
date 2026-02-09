import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { randomUUID } from 'crypto';
import * as path from 'path';

@Injectable()
export class GcsStorageService {
  private storage: Storage;
  private bucketName: string;
  private publicBaseUrl: string;

  constructor() {
    this.bucketName = process.env.GCS_BUCKET_NAME!;
    this.publicBaseUrl =
      process.env.GCS_PUBLIC_BASE_URL || 'https://storage.googleapis.com';

    this.storage = new Storage({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
  }

  async uploadPublicImage(
    file: Express.Multer.File,
    folder = 'products',
  ): Promise<{ url: string; path: string }> {
    if (!file?.buffer) {
      throw new Error('Invalid file');
    }

    const ext = path.extname(file.originalname);
    const filename = `${folder}/${randomUUID()}${ext}`;

    const bucket = this.storage.bucket(this.bucketName);
    const blob = bucket.file(filename);

    const stream = blob.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
    });

    await new Promise<void>((resolve, reject) => {
      stream
        .on('error', reject)
        .on('finish', resolve)
        .end(file.buffer);
    });

    const url = `${this.publicBaseUrl}/${this.bucketName}/${filename}`;

    return { url, path: filename };
  }

  async deleteImage(filePath: string): Promise<void> {
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(filePath);
    await file.delete({ ignoreNotFound: true });
  }
}
