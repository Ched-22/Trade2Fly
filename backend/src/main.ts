import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'express';
import { corsOriginOption, resolveCorsOrigins } from './config/cors-origins';
import { SocketIoAdapter } from './socket-io.adapter';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Avatar do perfil é enviado como data URL (base64) — o limite padrão do Express (100kb) é
  // pequeno demais para uma foto.
  app.use(json({ limit: '5mb' }));

  app.useWebSocketAdapter(new SocketIoAdapter(app));

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: corsOriginOption(resolveCorsOrigins(configService)),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Trade2Fly API')
    .setDescription('Marketplace de equipamentos de paraquedismo')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig));

  const port = Number(process.env.PORT) || 3000;

  try {
    await app.listen(port);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EADDRINUSE') {
      console.error(
        `\nPorta ${port} já está em uso. Rode "npm run stop:dev" no backend ou encerre o processo manualmente:\n  lsof -ti :${port} | xargs kill\n`,
      );
      process.exit(1);
    }
    throw error;
  }

  console.log(`Backend rodando em http://localhost:${port}`);
  console.log(`Docs em http://localhost:${port}/api/docs`);
}

bootstrap();
