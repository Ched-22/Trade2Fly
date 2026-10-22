import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SellersService } from './sellers.service';
import { SetPayoutPixKeyDto } from './dto/set-payout-pix-key.dto';

@ApiTags('sellers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Post('payout-pix-key')
  setPayoutPixKey(@Request() req: any, @Body() dto: SetPayoutPixKeyDto) {
    return this.sellersService.setPayoutPixKey(req.user.id, dto);
  }

  @Get('payout-pix-key/status')
  getPayoutStatus(@Request() req: any) {
    return this.sellersService.getPayoutStatus(req.user.id);
  }
}
