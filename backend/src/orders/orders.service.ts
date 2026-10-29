import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CheckoutGrantStatus, ListingSaleMode, OrderStatus } from '@prisma/client';
import { CheckoutGrantsService } from '../checkout-grants/checkout-grants.service';
import { buildOrderScopeFilter, type OrderScope } from './order-scope.util';
import { FulfillmentService } from '../fulfillment/fulfillment.service';
import { PrismaService } from '../prisma/prisma.service';
import { AsaasPaymentsService } from '../payments/asaas/asaas-payments.service';
import { AsaasPayoutsService } from '../payments/asaas/asaas-payouts.service';
import type { AsaasBillingType } from '../payments/asaas/asaas.types';
import { calculateCardChargeTotal } from '../common/card-installment-fee';
import { SHIPPING_INSURANCE_FEE } from '../common/shipping-fees';
import { ShippingService } from '../shipping/shipping.service';
import { CreateOrderDto } from './dto/create-order.dto';

const BILLING_TYPE_BY_PAYMENT_TYPE: Record<string, AsaasBillingType> = {
  pix: 'PIX',
  card: 'CREDIT_CARD',
  boleto: 'BOLETO',
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fulfillmentService: FulfillmentService,
    private readonly checkoutGrantsService: CheckoutGrantsService,
    private readonly asaasPayments: AsaasPaymentsService,
    private readonly asaasPayouts: AsaasPayoutsService,
    private readonly shippingService: ShippingService,
  ) {}

  private async getOrCreateAsaasCustomer(
    buyer: { id: string; displayName: string; email: string; asaasCustomerId: string | null; cpfCnpj: string | null },
    cpfCnpj: string,
  ) {
    if (buyer.asaasCustomerId && buyer.cpfCnpj === cpfCnpj) {
      return buyer.asaasCustomerId;
    }

    const existing = await this.asaasPayments.findCustomerByCpfCnpj(cpfCnpj);
    const customer =
      existing ??
      (await this.asaasPayments.createCustomer({
        name: buyer.displayName,
        email: buyer.email,
        cpfCnpj,
      }));

    await this.prisma.user.update({
      where: { id: buyer.id },
      data: { asaasCustomerId: customer.id, cpfCnpj },
    });

    return customer.id;
  }

  private async chargeOrder(
    orderId: number,
    buyerId: string,
    sellerId: string,
    amount: number,
    shippingTotal: number,
    dto: CreateOrderDto,
  ) {
    await this.asaasPayouts.assertSellerHasPayoutConfigured(sellerId);

    const buyer = await this.prisma.user.findUniqueOrThrow({ where: { id: buyerId } });
    const asaasCustomerId = await this.getOrCreateAsaasCustomer(buyer, dto.cpfCnpj);
    const billingType = BILLING_TYPE_BY_PAYMENT_TYPE[dto.paymentType];

    // Frete e seguro são cobrados junto, mas ficam fora da base de comissão (`order.amount`).
    const baseCharge = Math.round((amount + shippingTotal) * 100) / 100;

    // Parcelamento no cartão (2x+) tem taxa mais alta na Asaas; esse acréscimo é repassado ao
    // comprador como juros, para a comissão líquida não variar conforme a forma de pagamento.
    const { chargeAmount } =
      dto.paymentType === 'card'
        ? calculateCardChargeTotal(baseCharge, dto.installments ?? 1)
        : { chargeAmount: baseCharge };

    const payment = await this.asaasPayments.createCharge({
      customerId: asaasCustomerId,
      billingType,
      value: chargeAmount,
      dueDate: dto.paymentType === 'boleto' ? addDaysIso(3) : todayIso(),
      description: `Trade2Fly - Pedido #${orderId}`,
      externalReference: String(orderId),
      installmentCount: dto.paymentType === 'card' ? dto.installments : undefined,
      creditCard:
        dto.paymentType === 'card'
          ? {
              holderName: dto.cardHolderName!,
              number: dto.cardNumber!,
              expiryMonth: dto.cardExpiryMonth!,
              expiryYear: dto.cardExpiryYear!,
              ccv: dto.cardCcv!,
            }
          : undefined,
      creditCardHolderInfo:
        dto.paymentType === 'card'
          ? {
              name: dto.cardHolderName!,
              email: buyer.email,
              cpfCnpj: dto.cpfCnpj,
              postalCode: dto.cardHolderPostalCode!,
              addressNumber: dto.cardHolderAddressNumber!,
              phone: dto.cardHolderPhone!,
            }
          : undefined,
    });

    let pixPayload: string | undefined;
    let pixQrCodeBase64: string | undefined;
    if (billingType === 'PIX') {
      const qrCode = await this.asaasPayments.getPixQrCode(payment.id);
      pixPayload = qrCode.payload;
      pixQrCodeBase64 = qrCode.encodedImage;
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        asaasCustomerId,
        asaasPaymentId: payment.id,
        asaasPaymentStatus: payment.status,
        chargeAmount,
        invoiceUrl: payment.invoiceUrl,
        bankSlipUrl: payment.bankSlipUrl ?? undefined,
        pixPayload,
        pixQrCodeBase64,
      },
    });

    if (payment.status === 'CONFIRMED' || payment.status === 'RECEIVED') {
      await this.markPaymentConfirmed(payment.id, payment.status);
    }

    return payment;
  }

  private async releaseReservation(listingId: number, orderId: number) {
    await this.prisma.$transaction([
      this.prisma.order.update({ where: { id: orderId }, data: { status: OrderStatus.cancelled } }),
      this.prisma.listing.update({ where: { id: listingId }, data: { active: true } }),
    ]);
  }

  async create(buyerId: string, dto: CreateOrderDto) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: dto.listingId },
      include: { seller: { select: { id: true } } },
    });
    if (!listing || !listing.active) throw new NotFoundException('Anúncio não encontrado');
    if (listing.sellerId === buyerId) {
      throw new BadRequestException('Você não pode comprar seu próprio anúncio');
    }

    let amount: number;
    let usedGrantId: number | null = null;

    if (listing.saleMode === ListingSaleMode.offersOnly) {
      const grant = await this.checkoutGrantsService.findValidActiveGrant(dto.listingId, buyerId);

      if (!grant) {
        const expiredGrant = await this.prisma.checkoutGrant.findFirst({
          where: { listingId: dto.listingId, buyerId, status: CheckoutGrantStatus.expired },
          orderBy: { expiresAt: 'desc' },
        });

        if (expiredGrant) {
          throw new BadRequestException({
            code: 'CHECKOUT_EXPIRED',
            message:
              'O prazo de 1 hora para pagamento expirou. Envie uma nova oferta ou peça ao vendedor para liberar o pagamento novamente.',
          });
        }

        throw new BadRequestException({
          code: 'CHECKOUT_NOT_ALLOWED',
          message: 'Checkout não liberado para este anúncio.',
        });
      }

      const requestedAmount = dto.amount ?? grant.agreedPrice;
      if (requestedAmount !== grant.agreedPrice) {
        await this.prisma.checkoutViolation.create({
          data: {
            userId: buyerId,
            listingId: dto.listingId,
            attemptedAmount: requestedAmount,
            agreedPrice: grant.agreedPrice,
          },
        });
        throw new BadRequestException({
          code: 'CHECKOUT_PRICE_MISMATCH',
          message: 'O valor do pedido não corresponde ao valor acordado.',
        });
      }

      amount = grant.agreedPrice;
      usedGrantId = grant.id;
    } else {
      amount = dto.amount ?? listing.priceNum;
      if (dto.amount !== undefined && dto.amount !== listing.priceNum) {
        throw new BadRequestException({
          code: 'CHECKOUT_PRICE_MISMATCH',
          message: 'O valor do pedido não corresponde ao preço do anúncio.',
        });
      }
    }

    // Frete calculado no servidor (nunca confiamos no valor do cliente).
    const deliveryMode = dto.deliveryMode ?? 'shipping';
    let shippingAmount = 0;
    let shippingInsurance = 0;
    if (deliveryMode === 'shipping') {
      const quote = await this.shippingService.quote({
        listingId: dto.listingId,
        destinationCep: dto.shippingZip!,
        destinationCity: dto.shippingCity,
        destinationState: dto.shippingState,
      });
      shippingAmount = quote.amount;
      shippingInsurance = dto.shippingInsurance ? SHIPPING_INSURANCE_FEE : 0;
    }

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          buyerId,
          listingId: dto.listingId,
          amount,
          shippingAmount,
          shippingInsurance,
          deliveryMode,
          ...(deliveryMode === 'shipping'
            ? {
                shippingZip: dto.shippingZip,
                shippingStreet: dto.shippingStreet?.trim(),
                shippingNumber: dto.shippingNumber?.trim(),
                shippingComplement: dto.shippingComplement?.trim() || undefined,
                shippingDistrict: dto.shippingDistrict?.trim(),
                shippingCity: dto.shippingCity?.trim(),
                shippingState: dto.shippingState?.toUpperCase(),
              }
            : {}),
          paymentType: dto.paymentType,
          installments: dto.paymentType === 'card' ? dto.installments : undefined,
          cpfCnpj: dto.cpfCnpj,
          status: OrderStatus.awaiting_payment,
        },
        include: {
          listing: { select: { id: true, title: true, priceNum: true, location: true, sellerId: true } },
        },
      });

      if (usedGrantId) {
        await tx.checkoutGrant.update({ where: { id: usedGrantId }, data: { status: CheckoutGrantStatus.used } });
      }

      await tx.listing.update({ where: { id: dto.listingId }, data: { active: false } });

      return created;
    });

    try {
      await this.chargeOrder(
        order.id,
        buyerId,
        listing.sellerId,
        amount,
        shippingAmount + shippingInsurance,
        dto,
      );
      return this.prisma.order.findUniqueOrThrow({
        where: { id: order.id },
        include: {
          listing: { select: { id: true, title: true, priceNum: true, location: true, sellerId: true } },
        },
      });
    } catch (error) {
      await this.releaseReservation(dto.listingId, order.id);
      throw error;
    }
  }

  async markPaymentConfirmed(asaasPaymentId: string, status: string) {
    const order = await this.prisma.order.findUnique({
      where: { asaasPaymentId },
      include: {
        listing: { select: { id: true, title: true, priceNum: true, location: true, sellerId: true } },
      },
    });
    if (!order || order.status !== OrderStatus.awaiting_payment) return;

    const updated = await this.prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.awaiting_shipment, asaasPaymentStatus: status },
      include: {
        listing: { select: { id: true, title: true, priceNum: true, location: true, sellerId: true } },
      },
    });

    await this.fulfillmentService.notifyOrderPurchased(updated);
  }

  async markPaymentFailed(asaasPaymentId: string, status: string) {
    const order = await this.prisma.order.findUnique({ where: { asaasPaymentId } });
    if (!order || order.status !== OrderStatus.awaiting_payment) return;

    await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.cancelled, asaasPaymentStatus: status },
      }),
      this.prisma.listing.update({ where: { id: order.listingId }, data: { active: true } }),
    ]);
  }

  async findAll(buyerId: string, scope?: OrderScope) {
    const scopeFilter = buildOrderScopeFilter(scope);
    const orders = await this.prisma.order.findMany({
      where: { buyerId, ...scopeFilter },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            priceNum: true,
            location: true,
            category: true,
            imageUrls: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => ({
      id: order.id,
      amount: order.amount,
      paymentType: order.paymentType,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      completedAt: order.completedAt?.toISOString() ?? null,
      listing: {
        id: order.listing.id,
        title: order.listing.title,
        priceNum: order.listing.priceNum,
        location: order.listing.location,
        category: order.listing.category,
        imageUrl: order.listing.imageUrls[0] ?? null,
      },
    }));
  }

  async findOne(id: number, userId: string) {
    return this.fulfillmentService.getOrderDetail(id, userId);
  }
}
