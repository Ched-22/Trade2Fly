import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { CheckoutGrantStatus, NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from '../chat/chat.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateCheckoutGrantDto } from './dto/create-checkout-grant.dto';

export const CHECKOUT_GRANT_TTL_MS = 60 * 60 * 1000;

type CheckoutGrantRecord = {
  id: number;
  listingId: number;
  threadId: number;
  buyerId: string;
  sellerId: string;
  agreedPrice: number;
  status: CheckoutGrantStatus;
  expiresAt: Date;
  createdAt: Date;
};

@Injectable()
export class CheckoutGrantsService {
  private readonly logger = new Logger(CheckoutGrantsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

  buildExpiresAt(from = new Date()): Date {
    return new Date(from.getTime() + CHECKOUT_GRANT_TTL_MS);
  }

  isGrantValid(grant: { status: CheckoutGrantStatus; expiresAt: Date }): boolean {
    return grant.status === CheckoutGrantStatus.active && grant.expiresAt.getTime() > Date.now();
  }

  formatGrant(grant: CheckoutGrantRecord) {
    return {
      id: grant.id,
      listingId: grant.listingId,
      threadId: grant.threadId,
      buyerId: grant.buyerId,
      sellerId: grant.sellerId,
      agreedPrice: grant.agreedPrice,
      status: grant.status,
      expiresAt: grant.expiresAt.toISOString(),
      createdAt: grant.createdAt.toISOString(),
    };
  }

  formatCheckoutAccess(grant: CheckoutGrantRecord) {
    return {
      canCheckout: true,
      agreedPrice: grant.agreedPrice,
      threadId: grant.threadId,
      expiresAt: grant.expiresAt.toISOString(),
      expired: false,
    };
  }

  formatExpiredCheckoutAccess(grant: CheckoutGrantRecord) {
    return {
      canCheckout: false,
      agreedPrice: grant.agreedPrice,
      threadId: grant.threadId,
      expiresAt: grant.expiresAt.toISOString(),
      expired: true,
    };
  }

  async expireGrantIfNeeded(grant: CheckoutGrantRecord): Promise<boolean> {
    if (this.isGrantValid(grant)) return false;
    if (grant.status !== CheckoutGrantStatus.active) return grant.status === CheckoutGrantStatus.expired;

    await this.prisma.checkoutGrant.update({
      where: { id: grant.id },
      data: { status: CheckoutGrantStatus.expired },
    });

    this.chatGateway.broadcastCheckoutExpired({
      listingId: grant.listingId,
      threadId: grant.threadId,
      buyerId: grant.buyerId,
    });

    this.logger.log(
      `Checkout grant ${grant.id} expired for listing ${grant.listingId}, buyer ${grant.buyerId}`,
    );

    return true;
  }

  async findValidActiveGrant(listingId: number, buyerId: string) {
    const grant = await this.prisma.checkoutGrant.findFirst({
      where: { listingId, buyerId, status: CheckoutGrantStatus.active },
    });
    if (!grant) return null;

    const expired = await this.expireGrantIfNeeded(grant);
    return expired ? null : grant;
  }

  async findActiveForBuyer(listingId: number, buyerId: string) {
    return this.findValidActiveGrant(listingId, buyerId);
  }

  async expireStaleGrants(): Promise<number> {
    const stale = await this.prisma.checkoutGrant.findMany({
      where: {
        status: CheckoutGrantStatus.active,
        expiresAt: { lte: new Date() },
      },
    });

    for (const grant of stale) {
      await this.expireGrantIfNeeded(grant);
    }

    return stale.length;
  }

  async create(sellerId: string, listingId: number, dto: CreateCheckoutGrantDto) {
    if (!dto.sellerAcknowledgedWarning) {
      throw new BadRequestException({
        code: 'SELLER_WARNING_REQUIRED',
        message: 'Confirme o aviso antes de liberar o pagamento.',
      });
    }
    if (dto.agreedPrice <= 0) {
      throw new BadRequestException({
        code: 'INVALID_AGREED_PRICE',
        message: 'Informe um valor acordado válido.',
      });
    }

    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing || !listing.active) throw new NotFoundException('Anúncio não encontrado');
    if (listing.sellerId !== sellerId) throw new ForbiddenException();

    const thread = await this.prisma.chatThread.findFirst({
      where: { id: dto.threadId, listingId },
    });
    if (!thread) {
      throw new ForbiddenException('Conversa não pertence a este anúncio.');
    }
    if (thread.sellerId !== sellerId) {
      throw new ForbiddenException();
    }

    const expiresAt = this.buildExpiresAt();

    const grant = await this.prisma.$transaction(async (tx) => {
      await tx.checkoutGrant.updateMany({
        where: { listingId, status: CheckoutGrantStatus.active },
        data: { status: CheckoutGrantStatus.revoked },
      });

      return tx.checkoutGrant.create({
        data: {
          listingId,
          threadId: dto.threadId,
          buyerId: thread.buyerId,
          sellerId,
          agreedPrice: dto.agreedPrice,
          expiresAt,
        },
      });
    });

    const formatted = this.formatGrant(grant);
    this.chatGateway.broadcastCheckoutUnlocked({
      listingId,
      threadId: dto.threadId,
      buyerId: thread.buyerId,
      agreedPrice: dto.agreedPrice,
      expiresAt: grant.expiresAt.toISOString(),
    });

    const formattedPrice = dto.agreedPrice.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    await this.notificationsService.create({
      userId: thread.buyerId,
      type: NotificationType.checkout_available,
      title: 'Compra liberada!',
      body: `O vendedor liberou o pagamento de ${formattedPrice} para "${listing.title}". Você tem 1 hora para concluir a compra.`,
      listingId,
    });

    return formatted;
  }

  async findByListing(sellerId: string, listingId: number) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Anúncio não encontrado');
    if (listing.sellerId !== sellerId) throw new ForbiddenException();

    const grants = await this.prisma.checkoutGrant.findMany({
      where: { listingId },
      orderBy: { createdAt: 'desc' },
    });

    return grants.map((grant) => this.formatGrant(grant));
  }

  async revoke(sellerId: string, listingId: number, grantId: number) {
    const grant = await this.prisma.checkoutGrant.findFirst({
      where: { id: grantId, listingId },
    });
    if (!grant) throw new NotFoundException('Liberação não encontrada');
    if (grant.sellerId !== sellerId) throw new ForbiddenException();
    if (grant.status !== CheckoutGrantStatus.active) {
      throw new BadRequestException('Esta liberação já não está ativa.');
    }

    const updated = await this.prisma.checkoutGrant.update({
      where: { id: grantId },
      data: { status: CheckoutGrantStatus.revoked },
    });

    return this.formatGrant(updated);
  }
}
