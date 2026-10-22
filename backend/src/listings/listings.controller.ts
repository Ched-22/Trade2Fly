import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { ListingsService } from './listings.service';
import { OffersService } from './offers.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { CreateOfferDto } from './dto/create-offer.dto';
import { RespondOfferDto } from './dto/respond-offer.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { FilterListingDto } from './dto/filter-listing.dto';
import { MyListingsQueryDto } from './dto/my-listings-query.dto';

@ApiTags('listings')
@Controller('listings')
export class ListingsController {
  constructor(
    private readonly listingsService: ListingsService,
    private readonly offersService: OffersService,
  ) {}

  @Get()
  findAll(@Query() filters: FilterListingDto) {
    return this.listingsService.findAll(filters);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me/listings')
  myListings(@Request() req: any, @Query() query: MyListingsQueryDto) {
    return this.listingsService.findBySeller(req.user.id, query.active ?? 'true');
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: { user?: { id: string } }) {
    return this.listingsService.findOne(id, req.user?.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/offers')
  createOffer(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: string } },
    @Body() dto: CreateOfferDto,
  ) {
    return this.offersService.createOffer(req.user.id, id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/offer-responses')
  respondOffer(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: string } },
    @Body() dto: RespondOfferDto,
  ) {
    return this.offersService.respond(req.user.id, id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/photos')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('photos', 8, {
      storage: memoryStorage(),
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  uploadPhotos(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.listingsService.uploadPhotos(id, req.user.id, files ?? []);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: any, @Body() dto: CreateListingDto) {
    return this.listingsService.create(req.user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() dto: UpdateListingDto,
  ) {
    return this.listingsService.update(id, req.user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.listingsService.remove(id, req.user.id);
  }
}
