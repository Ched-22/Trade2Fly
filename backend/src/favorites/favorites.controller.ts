import { Controller, Delete, Get, Param, ParseIntPipe, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FavoritesService } from './favorites.service';

@ApiTags('favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.favoritesService.findAll(req.user.id);
  }

  @Get('ids')
  getIds(@Request() req: any) {
    return this.favoritesService.getFavoriteIds(req.user.id);
  }

  @Post(':listingId')
  toggle(@Request() req: any, @Param('listingId', ParseIntPipe) listingId: number) {
    return this.favoritesService.toggle(req.user.id, listingId);
  }

  @Delete(':listingId')
  remove(@Request() req: any, @Param('listingId', ParseIntPipe) listingId: number) {
    return this.favoritesService.toggle(req.user.id, listingId);
  }
}
