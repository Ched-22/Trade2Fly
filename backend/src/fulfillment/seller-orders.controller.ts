import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { OrderProofKind } from '@prisma/client';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrderScopeQueryDto } from '../orders/dto/order-scope-query.dto';
import { FulfillmentService } from './fulfillment.service';

@ApiTags('seller-orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('seller/orders')
export class SellerOrdersController {
  constructor(private readonly fulfillmentService: FulfillmentService) {}

  @Get()
  findAll(
    @Request() req: { user: { id: string } },
    @Query() query: OrderScopeQueryDto,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.fulfillmentService.findSellerOrders(
      req.user.id,
      page ? Number(page) : 1,
      pageSize ? Number(pageSize) : 20,
      query.scope,
    );
  }

  @Get(':id')
  findOne(@Request() req: { user: { id: string } }, @Param('id', ParseIntPipe) id: number) {
    return this.fulfillmentService.getOrderDetail(id, req.user.id);
  }

  @Post(':id/start-shipment')
  startShipment(@Request() req: { user: { id: string } }, @Param('id', ParseIntPipe) id: number) {
    return this.fulfillmentService.startShipment(req.user.id, id);
  }

  @Post(':id/submit-shipment')
  submitShipment(@Request() req: { user: { id: string } }, @Param('id', ParseIntPipe) id: number) {
    return this.fulfillmentService.submitShipment(req.user.id, id);
  }

  @Post(':id/proof-files')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  uploadProof(
    @Request() req: { user: { id: string } },
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Query('kind') kind: OrderProofKind,
    @Query('durationSeconds') durationSeconds?: string,
  ) {
    return this.fulfillmentService.uploadProof(
      req.user.id,
      id,
      kind,
      file,
      durationSeconds ? Number(durationSeconds) : undefined,
    );
  }

  @Delete(':id/proof-files/:proofFileId')
  deleteProof(
    @Request() req: { user: { id: string } },
    @Param('id', ParseIntPipe) id: number,
    @Param('proofFileId', ParseIntPipe) proofFileId: number,
  ) {
    return this.fulfillmentService.deleteProof(req.user.id, id, proofFileId);
  }
}
