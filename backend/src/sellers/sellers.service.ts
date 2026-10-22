import { Injectable } from '@nestjs/common';
import { AsaasPayoutsService } from '../payments/asaas/asaas-payouts.service';
import { SetPayoutPixKeyDto } from './dto/set-payout-pix-key.dto';

@Injectable()
export class SellersService {
  constructor(private readonly asaasPayouts: AsaasPayoutsService) {}

  async setPayoutPixKey(sellerId: string, dto: SetPayoutPixKeyDto) {
    return this.asaasPayouts.setPayoutPixKey(sellerId, dto.pixKeyType, dto.pixKey);
  }

  async getPayoutStatus(sellerId: string) {
    return this.asaasPayouts.getPayoutStatus(sellerId);
  }
}
