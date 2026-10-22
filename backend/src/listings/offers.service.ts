import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { ListingSaleMode, MessageType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from '../chat/chat.gateway';
import { CheckoutGrantsService } from '../checkout-grants/checkout-grants.service';
import { MessagesService } from '../messages/messages.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { RespondOfferDto } from './dto/respond-offer.dto';

function formatBrl(amount: number): string {
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

@Injectable()
export class OffersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly checkoutGrantsService: CheckoutGrantsService,
    @Inject(forwardRef(() => MessagesService))
    private readonly messagesService: MessagesService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {}

  async createOffer(buyerId: string, listingId: number, dto: CreateOfferDto) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing || !listing.active) throw new NotFoundException('Anúncio não encontrado');
    if (listing.sellerId === buyerId) {
      throw new BadRequestException('Você não pode enviar oferta no seu próprio anúncio.');
    }

    const offerLine = `💰 Nova oferta: ${formatBrl(dto.offerAmount)}`;
    const text = dto.text?.trim() ? `${offerLine}\n\n${dto.text.trim()}` : offerLine;

    let thread = await this.prisma.chatThread.findUnique({
      where: { buyerId_listingId: { buyerId, listingId } },
    });

    if (!thread) {
      thread = await this.prisma.chatThread.create({
        data: { buyerId, sellerId: listing.sellerId, listingId },
      });
    }

    const pending = await this.getPendingOfferMessage(thread.id);
    if (pending) {
      if (pending.senderId === buyerId) {
        throw new BadRequestException(
          'Sua proposta ainda aguarda resposta. Aguarde o vendedor aceitar, recusar ou contra-propor.',
        );
      }
      throw new BadRequestException(
        'Há uma contraproposta aguardando sua resposta no chat. Abra a conversa para aceitar, recusar ou contra-propor.',
      );
    }

    const existingOfferCount = await this.prisma.message.count({
      where: { thread: { listingId }, messageType: MessageType.offer },
    });
    const isFirstOfferOnListing = existingOfferCount === 0;

    const message = await this.prisma.message.create({
      data: {
        threadId: thread.id,
        senderId: buyerId,
        text,
        messageType: MessageType.offer,
        offerAmount: dto.offerAmount,
      },
      include: { sender: { select: { id: true, displayName: true } } },
    });

    if (isFirstOfferOnListing && listing.saleMode === ListingSaleMode.direct) {
      await this.prisma.listing.update({
        where: { id: listingId },
        data: { saleMode: ListingSaleMode.offersOnly },
      });
      this.chatGateway.broadcastListingSaleModeChanged({
        listingId,
        saleMode: ListingSaleMode.offersOnly,
      });
    }

    const formatted = this.messagesService.formatMessage(message);
    await this.messagesService.markThreadAsRead(buyerId, thread.id, message.createdAt);
    this.chatGateway.broadcastNewMessage(thread, formatted);

    return {
      threadId: thread.id,
      message: formatted,
      saleMode: isFirstOfferOnListing ? ListingSaleMode.offersOnly : listing.saleMode,
    };
  }

  async respond(
    userId: string,
    listingId: number,
    dto: RespondOfferDto,
  ) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing || !listing.active) throw new NotFoundException('Anúncio não encontrado');

    const thread = await this.prisma.chatThread.findFirst({
      where: {
        id: dto.threadId,
        listingId,
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
    });
    if (!thread) throw new ForbiddenException('Conversa não encontrada.');

    const isSeller = thread.sellerId === userId;
    const pendingOffer = await this.getPendingOfferMessage(thread.id);
    if (!pendingOffer) {
      throw new BadRequestException('Não há proposta pendente para responder.');
    }
    if (pendingOffer.id !== dto.offerMessageId) {
      throw new BadRequestException('Esta proposta já não está pendente.');
    }
    if (pendingOffer.senderId === userId) {
      throw new BadRequestException('Aguarde a resposta da outra parte.');
    }

    if (dto.action === 'decline') {
      return this.declineOffer(userId, thread, pendingOffer);
    }

    if (dto.action === 'counter') {
      return this.counterOffer(userId, listing, thread, pendingOffer, dto);
    }

    return this.acceptOffer(userId, listing, thread, pendingOffer, isSeller, dto);
  }

  private async declineOffer(
    userId: string,
    thread: { id: number; buyerId: string; sellerId: string; listingId: number },
    pendingOffer: { id: number; offerAmount: number | null },
  ) {
    const amountLabel =
      pendingOffer.offerAmount != null ? formatBrl(pendingOffer.offerAmount) : 'proposta';
    const text = `❌ Proposta de ${amountLabel} recusada.`;

    const message = await this.prisma.message.create({
      data: {
        threadId: thread.id,
        senderId: userId,
        text,
        messageType: MessageType.offer_declined,
        offerAmount: pendingOffer.offerAmount,
      },
      include: { sender: { select: { id: true, displayName: true } } },
    });

    const formatted = this.messagesService.formatMessage(message);
    await this.messagesService.markThreadAsRead(userId, thread.id, message.createdAt);
    this.chatGateway.broadcastNewMessage(thread, formatted);

    return { threadId: thread.id, message: formatted, action: 'decline' as const };
  }

  private async counterOffer(
    userId: string,
    listing: { id: number; saleMode: ListingSaleMode },
    thread: { id: number; buyerId: string; sellerId: string; listingId: number },
    _pendingOffer: { id: number },
    dto: RespondOfferDto,
  ) {
    if (dto.offerAmount == null || dto.offerAmount <= 0) {
      throw new BadRequestException('Informe um valor válido para a contraproposta.');
    }

    const offerLine = `🔄 Contraproposta: ${formatBrl(dto.offerAmount)}`;
    const text = dto.text?.trim() ? `${offerLine}\n\n${dto.text.trim()}` : offerLine;

    const message = await this.prisma.message.create({
      data: {
        threadId: thread.id,
        senderId: userId,
        text,
        messageType: MessageType.offer,
        offerAmount: dto.offerAmount,
      },
      include: { sender: { select: { id: true, displayName: true } } },
    });

    if (listing.saleMode === ListingSaleMode.direct) {
      await this.prisma.listing.update({
        where: { id: listing.id },
        data: { saleMode: ListingSaleMode.offersOnly },
      });
      this.chatGateway.broadcastListingSaleModeChanged({
        listingId: listing.id,
        saleMode: ListingSaleMode.offersOnly,
      });
    }

    const formatted = this.messagesService.formatMessage(message);
    await this.messagesService.markThreadAsRead(userId, thread.id, message.createdAt);
    this.chatGateway.broadcastNewMessage(thread, formatted);

    return {
      threadId: thread.id,
      message: formatted,
      action: 'counter' as const,
      saleMode: ListingSaleMode.offersOnly,
    };
  }

  private async acceptOffer(
    userId: string,
    listing: { id: number; title: string; sellerId: string },
    thread: { id: number; buyerId: string; sellerId: string; listingId: number },
    pendingOffer: { id: number; offerAmount: number | null },
    isSeller: boolean,
    dto: RespondOfferDto,
  ) {
    if (pendingOffer.offerAmount == null || pendingOffer.offerAmount <= 0) {
      throw new BadRequestException('Proposta sem valor válido.');
    }

    const agreedPrice = pendingOffer.offerAmount;
    let checkoutGrant = null;

    if (isSeller) {
      if (!dto.sellerAcknowledgedWarning) {
        throw new BadRequestException({
          code: 'SELLER_WARNING_REQUIRED',
          message: 'Confirme o aviso antes de aceitar e liberar o pagamento.',
        });
      }

      checkoutGrant = await this.checkoutGrantsService.create(userId, listing.id, {
        threadId: thread.id,
        agreedPrice,
        sellerAcknowledgedWarning: true,
      });
    }

    const roleLabel = isSeller ? 'Vendedor' : 'Comprador';
    const text = isSeller
      ? `✅ ${roleLabel} aceitou a proposta de ${formatBrl(agreedPrice)} e liberou o pagamento.`
      : `✅ ${roleLabel} aceitou a proposta de ${formatBrl(agreedPrice)}. Aguardando liberação do pagamento pelo vendedor.`;

    const message = await this.prisma.message.create({
      data: {
        threadId: thread.id,
        senderId: userId,
        text,
        messageType: MessageType.offer_accepted,
        offerAmount: agreedPrice,
      },
      include: { sender: { select: { id: true, displayName: true } } },
    });

    const formatted = this.messagesService.formatMessage(message);
    await this.messagesService.markThreadAsRead(userId, thread.id, message.createdAt);
    this.chatGateway.broadcastNewMessage(thread, formatted);

    return {
      threadId: thread.id,
      message: formatted,
      action: 'accept' as const,
      agreedPrice,
      checkoutGrant,
    };
  }

  /** Pending = latest negotiation event is an `offer` from the other party. */
  private async getPendingOfferMessage(threadId: number) {
    const latest = await this.prisma.message.findFirst({
      where: {
        threadId,
        messageType: {
          in: [MessageType.offer, MessageType.offer_accepted, MessageType.offer_declined],
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!latest || latest.messageType !== MessageType.offer) return null;
    return latest;
  }
}
