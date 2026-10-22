import { Module } from '@nestjs/common';
import { LoggiService } from './loggi.service';
import { ShippingController } from './shipping.controller';
import { ShippingService } from './shipping.service';
import { ViaCepService } from './viacep.service';

@Module({
  controllers: [ShippingController],
  providers: [ShippingService, LoggiService, ViaCepService],
  exports: [ShippingService],
})
export class ShippingModule {}
