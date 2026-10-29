import {
  Body,
  Controller,
  Delete,
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
import { ReceiptDecisionDto } from './dto/receipt-decision.dto';
import { FulfillmentService } from './fulfillment.service';

@ApiTags('order-fulfillment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderFulfillmentController {
  constructor(private readonly fulfillmentService: FulfillmentService) {}

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

  @Post(':id/receipt-decision')
  receiptDecision(
    @Request() req: { user: { id: string } },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReceiptDecisionDto,
  ) {
    return this.fulfillmentService.receiptDecision(
      req.user.id,
      id,
      dto.decision,
      dto.reason,
      dto.reasonType,
    );
  }
}
