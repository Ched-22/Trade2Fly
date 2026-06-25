import { Controller, Get, Param, ParseIntPipe, Res, StreamableFile } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { MediaService } from './media.service';

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
}
