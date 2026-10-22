import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import type { ServerOptions } from 'socket.io';
import { corsOriginOption, resolveCorsOrigins } from './config/cors-origins';

export class SocketIoAdapter extends IoAdapter {
  constructor(private readonly app: INestApplicationContext) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const config = this.app.get(ConfigService);
    const wsPath = config.get<string>('WS_PATH') || '/socket.io';
    const origins = resolveCorsOrigins(config);

    return super.createIOServer(port, {
      ...options,
      path: wsPath,
      cors: {
        origin: corsOriginOption(origins),
        credentials: true,
      },
    });
  }
}
