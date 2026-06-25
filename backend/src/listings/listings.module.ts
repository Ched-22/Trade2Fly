import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';

@Module({
  imports: [MediaModule],
  providers: [ListingsService],
  controllers: [ListingsController],
})
export class ListingsModule {}
