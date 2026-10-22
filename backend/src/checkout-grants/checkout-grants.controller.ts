import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckoutGrantsService } from './checkout-grants.service';
import { CreateCheckoutGrantDto } from './dto/create-checkout-grant.dto';

@ApiTags('checkout-grants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('listings/:listingId/checkout-grants')
export class CheckoutGrantsController {
  constructor(private readonly checkoutGrantsService: CheckoutGrantsService) {}

  @Post()
  create(
    @Param('listingId', ParseIntPipe) listingId: number,
    @Request() req: { user: { id: string } },
    @Body() dto: CreateCheckoutGrantDto,
  ) {
    return this.checkoutGrantsService.create(req.user.id, listingId, dto);
  }

  @Get()
  findAll(
    @Param('listingId', ParseIntPipe) listingId: number,
    @Request() req: { user: { id: string } },
  ) {
    return this.checkoutGrantsService.findByListing(req.user.id, listingId);
  }

  @Delete(':grantId')
  revoke(
    @Param('listingId', ParseIntPipe) listingId: number,
    @Param('grantId', ParseIntPipe) grantId: number,
    @Request() req: { user: { id: string } },
  ) {
    return this.checkoutGrantsService.revoke(req.user.id, listingId, grantId);
  }
}
