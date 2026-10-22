import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PaymentsConfigService } from '../../payments-config.service';

@Injectable()
export class PaymentMethodsEnabledGuard implements CanActivate {
  constructor(private readonly paymentsConfig: PaymentsConfigService) {}

  canActivate(_context: ExecutionContext): boolean {
    if (!this.paymentsConfig.enabled) {
      throw new ServiceUnavailableException({
        code: 'PAYMENT_METHODS_DISABLED',
        message: 'Métodos de pagamento temporariamente indisponíveis.',
      });
    }
    return true;
  }
}

type RateBucket = { count: number; resetAt: number };

@Injectable()
export class PaymentRateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, RateBucket>();

  constructor(private readonly paymentsConfig: PaymentsConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ user?: { id: string } }>();
    const userId = req.user?.id ?? 'anonymous';
    const limit = this.paymentsConfig.rateLimitPerMin;
    const now = Date.now();
    const bucket = this.buckets.get(userId);

    if (!bucket || now >= bucket.resetAt) {
      this.buckets.set(userId, { count: 1, resetAt: now + 60_000 });
      return true;
    }

    if (bucket.count >= limit) {
      throw new HttpException(
        {
          code: 'PAYMENT_RATE_LIMIT',
          message: 'Muitas tentativas. Aguarde um minuto e tente novamente.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    bucket.count += 1;
    return true;
  }
}
