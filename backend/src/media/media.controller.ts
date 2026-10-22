import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MediaService } from './media.service';

type AuthUser = { id: string; role?: UserRole };

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('listings/:listingId/:filename')
  serveListingPhoto(
    @Param('listingId', ParseIntPipe) listingId: number,
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ): StreamableFile {
    const { stream, contentType } = this.mediaService.getListingPhotoStream(
      listingId,
      filename,
    );
    res.set({ 'Content-Type': contentType, 'Cache-Control': 'public, max-age=86400' });
    return new StreamableFile(stream);
  }

  @Get('orders/:orderId/:filename')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async serveOrderProof(
    @Req() req: Request & { user: AuthUser },
    @Param('orderId', ParseIntPipe) orderId: number,
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    await this.mediaService.assertCanAccessOrderProof(
      req.user.id,
      req.user.role,
      orderId,
      filename,
    );
    const { stream, contentType } = this.mediaService.getOrderProofStream(orderId, filename);
    res.set({ 'Content-Type': contentType, 'Cache-Control': 'private, max-age=3600' });
    return new StreamableFile(stream);
  }
}
