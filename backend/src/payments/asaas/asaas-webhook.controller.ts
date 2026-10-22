import { Body, Controller, Headers, HttpCode, Inject, Post, UnauthorizedException, forwardRef } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { OrdersService } from '../../orders/orders.service';
import { AsaasConfigService } from './asaas-config.service';

const CONFIRMED_EVENTS = new Set(['PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED']);
const FAILED_EVENTS = new Set([
  'PAYMENT_OVERDUE',
  'PAYMENT_DELETED',
  'PAYMENT_REFUNDED',
  'PAYMENT_REFUSED',
  'PAYMENT_CHARGEBACK_REQUESTED',
]);

interface AsaasWebhookBody {
  event: string;
  payment?: { id: string; status: string };
}

@ApiExcludeController()
@Controller('payments/webhooks/asaas')
export class AsaasWebhookController {
  constructor(
    private readonly asaasConfig: AsaasConfigService,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
  ) {}

  @Post()
  @HttpCode(200)
  async handle(@Headers('asaas-access-token') token: string | undefined, @Body() body: AsaasWebhookBody) {
    const expected = this.asaasConfig.webhookToken;
    if (expected && token !== expected) {
      throw new UnauthorizedException('Token de webhook inválido');
    }

    const paymentId = body.payment?.id;
    if (!paymentId) return { received: true };

    if (CONFIRMED_EVENTS.has(body.event)) {
      await this.ordersService.markPaymentConfirmed(paymentId, body.payment!.status);
    } else if (FAILED_EVENTS.has(body.event)) {
      await this.ordersService.markPaymentFailed(paymentId, body.payment!.status);
    }

    return { received: true };
  }
}
