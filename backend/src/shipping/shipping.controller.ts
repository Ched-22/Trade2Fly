import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShippingQuoteDto } from './dto/shipping-quote.dto';
import { ShippingService } from './shipping.service';

@ApiTags('shipping')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post('quote')
  quote(@Body() dto: ShippingQuoteDto) {
    return this.shippingService.quote(dto);
  }
}
