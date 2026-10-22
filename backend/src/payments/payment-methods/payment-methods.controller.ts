import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  NotImplementedException,
  Param,
  Patch,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PaymentsConfigService } from '../payments-config.service';
import { CreatePaymentMethodDto, SetupIntentDto } from './dto/payment-method.dto';
import { PaymentMethodsEnabledGuard, PaymentRateLimitGuard } from './guards/payment-methods.guard';
import { PaymentMethodsService } from './payment-methods.service';

@ApiTags('payment-methods')
@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(
    private readonly paymentMethodsService: PaymentMethodsService,
    private readonly paymentsConfig: PaymentsConfigService,
  ) {}

  @Get('config')
  @UseGuards(JwtAuthGuard)
  getConfig() {
    return this.paymentMethodsService.getGatewayInfo();
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PaymentMethodsEnabledGuard, PaymentRateLimitGuard)
  list(@Req() req: { user: { id: string } }) {
    return this.paymentMethodsService.list(req.user.id);
  }

  @Post('setup-intent')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PaymentMethodsEnabledGuard, PaymentRateLimitGuard)
  createSetupIntent(@Req() req: { user: { id: string; email: string } }, @Body() _dto: SetupIntentDto) {
    return this.paymentMethodsService.createSetupIntent(req.user.id, req.user.email);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PaymentMethodsEnabledGuard, PaymentRateLimitGuard)
  create(@Req() req: { user: { id: string; email: string } }, @Body() dto: CreatePaymentMethodDto) {
    return this.paymentMethodsService.create(req.user.id, req.user.email, dto);
  }

  @Patch(':id/default')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PaymentMethodsEnabledGuard, PaymentRateLimitGuard)
  setDefault(@Req() req: { user: { id: string } }, @Param('id') id: string) {
    return this.paymentMethodsService.setDefault(req.user.id, id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PaymentMethodsEnabledGuard, PaymentRateLimitGuard)
  remove(@Req() req: { user: { id: string } }, @Param('id') id: string) {
    return this.paymentMethodsService.remove(req.user.id, id);
  }

  @Post('webhooks/stripe')
  stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature?: string,
  ) {
    const secret = this.paymentsConfig.stripeWebhookSecret;
    if (!secret) {
      throw new NotImplementedException({
        code: 'WEBHOOK_NOT_CONFIGURED',
        message: 'Webhook Stripe não configurado.',
      });
    }
    if (!signature) {
      throw new NotImplementedException({
        code: 'WEBHOOK_NOT_CONFIGURED',
        message: 'Assinatura Stripe ausente.',
      });
    }
    // Processing deferred to escrow PRD — acknowledge receipt in v1 stub
    return { received: true };
  }
}
