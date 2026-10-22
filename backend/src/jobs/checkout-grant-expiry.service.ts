import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CheckoutGrantsService } from '../checkout-grants/checkout-grants.service';

@Injectable()
export class CheckoutGrantExpiryService {
  private readonly logger = new Logger(CheckoutGrantExpiryService.name);

  constructor(private readonly checkoutGrantsService: CheckoutGrantsService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiry() {
    const processed = await this.checkoutGrantsService.expireStaleGrants();
    if (processed > 0) {
      this.logger.log(`Expired ${processed} checkout grant(s)`);
    }
  }
}
