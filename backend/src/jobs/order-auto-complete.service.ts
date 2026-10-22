import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FulfillmentService } from '../fulfillment/fulfillment.service';

@Injectable()
export class OrderAutoCompleteService {
  private readonly logger = new Logger(OrderAutoCompleteService.name);

  constructor(private readonly fulfillmentService: FulfillmentService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleAutoComplete() {
    const result = await this.fulfillmentService.runAutoCompleteJob();
    if (result.processed > 0) {
      this.logger.log(`Auto-completed ${result.processed} order(s)`);
    }
  }
}
