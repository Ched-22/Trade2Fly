import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream, existsSync } from 'fs';
import type { Readable } from 'stream';
import { StorageFactory } from './storage/storage.factory';

const ACCEPTED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

@Injectable()
export class MediaService {
  constructor(
    private readonly storageFactory: StorageFactory,
    private readonly config: ConfigService,
  ) {}

  get maxListingPhotos(): number {
    return Number(this.config.get<string>('MAX_LISTING_PHOTOS') ?? 8);
  }

  get maxPhotoBytes(): number {
    return Number(this.config.get<string>('MAX_PHOTO_BYTES') ?? 2 * 1024 * 1024);
  }

  validateFiles(files: Express.Multer.File[]): void {
    if (!files?.length) {
      throw new BadRequestException('Envie pelo menos uma foto.');
    }
    if (files.length > this.maxListingPhotos) {
      throw new BadRequestException(`Máximo de ${this.maxListingPhotos} fotos por anúncio.`);
    }
    for (const file of files) {
      if (!ACCEPTED_MIMES.includes(file.mimetype)) {
        throw new BadRequestException('Formato inválido. Use JPG, PNG ou WebP.');
      }
      if (file.size > this.maxPhotoBytes) {
        throw new BadRequestException('Cada foto deve ter no máximo 2 MB.');
      }
    }
  }

  async replaceListingPhotos(
    listingId: number,
    files: Express.Multer.File[],
  ): Promise<string[]> {
    this.validateFiles(files);
    const driver = this.storageFactory.getDriver();
    await driver.deleteListingFolder(listingId);

    const imageUrls: string[] = [];
    for (const file of files) {
      const saved = await driver.save(listingId, file);
      imageUrls.push(saved.publicUrl);
    }
    return imageUrls;
  }

  getListingPhotoStream(
    listingId: number,
    filename: string,
  ): { stream: Readable; contentType: string } {
    if (!/^[a-zA-Z0-9-]+\.(jpg|jpeg|png|webp)$/i.test(filename)) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    const driver = this.storageFactory.getDriver();
    const filePath = driver.getFilePath(listingId, filename);
    if (!existsSync(filePath)) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    const ext = filename.split('.').pop()?.toLowerCase();
    const contentType =
      ext === 'png'
        ? 'image/png'
        : ext === 'webp'
          ? 'image/webp'
          : 'image/jpeg';

    return { stream: createReadStream(filePath), contentType };
  }
}
