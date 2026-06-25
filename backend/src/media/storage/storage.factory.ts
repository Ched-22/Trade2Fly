import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalStorageDriver } from './local-storage.driver';
import type { StorageDriver } from './storage.interface';

@Injectable()
export class StorageFactory implements OnModuleInit {
  private driver!: StorageDriver;

  constructor(
    private readonly config: ConfigService,
    private readonly localStorageDriver: LocalStorageDriver,
  ) {}

  onModuleInit() {
    const storageDriver = this.config.get<string>('STORAGE_DRIVER') ?? 'local';
    if (storageDriver === 's3') {
      throw new Error(
        'S3 driver not implemented — use STORAGE_DRIVER=local or see PRD listing-media-s3',
      );
    }
    if (storageDriver !== 'local') {
      throw new Error(`Unknown STORAGE_DRIVER "${storageDriver}" — use "local"`);
    }
    this.driver = this.localStorageDriver;
  }

  getDriver(): StorageDriver {
    return this.driver;
  }
}
