import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { LocalStorageDriver } from './storage/local-storage.driver';
import { StorageFactory } from './storage/storage.factory';

@Module({
  controllers: [MediaController],
  providers: [MediaService, LocalStorageDriver, StorageFactory],
  exports: [MediaService],
})
export class MediaModule {}
