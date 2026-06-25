import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import type { SavedFile, StorageDriver } from './storage.interface';

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

@Injectable()
export class LocalStorageDriver implements StorageDriver {
  private readonly uploadDir: string;
  private readonly mediaPublicUrl: string;

  constructor(private readonly config: ConfigService) {
    this.uploadDir = this.config.get<string>('UPLOAD_DIR') ?? './uploads';
    this.mediaPublicUrl = (
      this.config.get<string>('MEDIA_PUBLIC_URL') ?? 'http://localhost:3000'
    ).replace(/\/$/, '');
  }

  async save(listingId: number, file: Express.Multer.File): Promise<SavedFile> {
    const ext = MIME_TO_EXT[file.mimetype] ?? 'bin';
    const filename = `${randomUUID()}.${ext}`;
    const dir = path.join(this.uploadDir, 'listings', String(listingId));
    await fs.mkdir(dir, { recursive: true });
    const absolutePath = path.join(dir, filename);
    await fs.writeFile(absolutePath, file.buffer);
    const key = `listings/${listingId}/${filename}`;
    return {
      key,
      publicUrl: this.getPublicUrl(listingId, filename),
    };
  }

  async delete(key: string): Promise<void> {
    const absolutePath = path.join(this.uploadDir, key);
    await fs.unlink(absolutePath).catch(() => undefined);
  }

  async deleteListingFolder(listingId: number): Promise<void> {
    const dir = path.join(this.uploadDir, 'listings', String(listingId));
    await fs.rm(dir, { recursive: true, force: true });
  }

  getPublicUrl(listingId: number, filename: string): string {
    return `${this.mediaPublicUrl}/api/media/listings/${listingId}/${filename}`;
  }

  getFilePath(listingId: number, filename: string): string {
    return path.join(this.uploadDir, 'listings', String(listingId), filename);
  }
}
