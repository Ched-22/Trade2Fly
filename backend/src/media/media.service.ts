import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderProofKind, UserRole } from '@prisma/client';
import { createReadStream, existsSync } from 'fs';
import type { Readable } from 'stream';
import { PrismaService } from '../prisma/prisma.service';
import { StorageFactory } from './storage/storage.factory';

const SHIPMENT_PROOF_KINDS: OrderProofKind[] = [
  OrderProofKind.product_photo,
  OrderProofKind.boxed_photo,
  OrderProofKind.packing_video,
];

const PHOTO_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const VIDEO_MIMES = ['video/mp4', 'video/webm'];
const ACCEPTED_MIMES = [...PHOTO_MIMES, ...VIDEO_MIMES];

const PROOF_KIND_MIMES: Record<OrderProofKind, string[]> = {
  product_photo: PHOTO_MIMES,
  boxed_photo: PHOTO_MIMES,
  received_photo: PHOTO_MIMES,
  packing_video: VIDEO_MIMES,
  unboxing_video: VIDEO_MIMES,
};

@Injectable()
export class MediaService {
  constructor(
    private readonly storageFactory: StorageFactory,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  get maxListingPhotos(): number {
    return Number(this.config.get<string>('MAX_LISTING_PHOTOS') ?? 8);
  }

  get maxPhotoBytes(): number {
    return Number(this.config.get<string>('MAX_PHOTO_BYTES') ?? 2 * 1024 * 1024);
  }

  get orderProofPhotoMaxMb(): number {
    return Number(this.config.get<string>('ORDER_PROOF_PHOTO_MAX_MB') ?? 5);
  }

  get orderProofVideoMaxMb(): number {
    return Number(this.config.get<string>('ORDER_PROOF_VIDEO_MAX_MB') ?? 200);
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

  validateOrderProofFile(kind: OrderProofKind, file: Express.Multer.File) {
    const allowed = PROOF_KIND_MIMES[kind];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException({
        code: 'UPLOAD_INVALID_TYPE',
        message: 'Formato de arquivo inválido para este tipo de prova.',
      });
    }

    const isVideo = kind === 'packing_video' || kind === 'unboxing_video';
    const maxBytes = isVideo
      ? this.orderProofVideoMaxMb * 1024 * 1024
      : this.orderProofPhotoMaxMb * 1024 * 1024;

    if (file.size > maxBytes) {
      throw new PayloadTooLargeException({
        code: isVideo ? 'VIDEO_TOO_LARGE' : 'UPLOAD_TOO_LARGE',
        message: isVideo ? 'Vídeo excede o tamanho máximo permitido.' : 'Foto excede o tamanho máximo.',
      });
    }
  }

  async saveOrderProofFile(
    orderId: number,
    file: Express.Multer.File,
  ): Promise<{ key: string; publicUrl: string }> {
    const driver = this.storageFactory.getDriver();
    return driver.saveOrderFile(orderId, file);
  }

  async deleteOrderProofFile(storageKey: string): Promise<void> {
    const driver = this.storageFactory.getDriver();
    await driver.delete(storageKey);
  }

  /**
   * Order proof media is private. Shipment proofs: seller or admin only.
   * Receipt proofs: buyer, seller, or admin of that order.
   */
  async assertCanAccessOrderProof(
    userId: string,
    role: UserRole | undefined,
    orderId: number,
    filename: string,
  ): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        listing: { select: { sellerId: true } },
        proofFiles: true,
      },
    });

    if (!order) {
      throw new NotFoundException({ code: 'ORDER_NOT_FOUND', message: 'Pedido não encontrado' });
    }

    const proof = order.proofFiles.find((file) => {
      const storedName = file.storageKey.split('/').pop() ?? '';
      return storedName === filename;
    });

    if (!proof) {
      throw new NotFoundException({ code: 'FILE_NOT_FOUND', message: 'Arquivo não encontrado' });
    }

    const isSeller = order.listing.sellerId === userId;
    const isBuyer = order.buyerId === userId;
    const isAdmin = role === UserRole.admin;

    if (SHIPMENT_PROOF_KINDS.includes(proof.kind)) {
      if (!isSeller && !isAdmin) {
        throw new ForbiddenException({
          code: 'ORDER_PROOF_FORBIDDEN',
          message: 'Acesso negado às provas de despacho',
        });
      }
      return;
    }

    if (!isBuyer && !isSeller && !isAdmin) {
      throw new ForbiddenException({
        code: 'ORDER_PROOF_FORBIDDEN',
        message: 'Acesso negado',
      });
    }
  }

  getOrderProofStream(
    orderId: number,
    filename: string,
  ): { stream: Readable; contentType: string } {
    if (!/^[a-zA-Z0-9-]+\.(jpg|jpeg|png|webp|mp4|webm)$/i.test(filename)) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    const driver = this.storageFactory.getDriver();
    const filePath = driver.getOrderFilePath(orderId, filename);
    if (!existsSync(filePath)) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    const ext = filename.split('.').pop()?.toLowerCase();
    const contentType =
      ext === 'png'
        ? 'image/png'
        : ext === 'webp'
          ? 'image/webp'
          : ext === 'mp4'
            ? 'video/mp4'
            : ext === 'webm'
              ? 'video/webm'
              : 'image/jpeg';

    return { stream: createReadStream(filePath), contentType };
  }
}
