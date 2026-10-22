import { Module } from '@nestjs/common';
import { AsaasModule } from '../payments/asaas/asaas.module';
import { SellersController } from './sellers.controller';
import { SellersService } from './sellers.service';

@Module({
  imports: [AsaasModule],
  controllers: [SellersController],
  providers: [SellersService],
})
export class SellersModule {}
