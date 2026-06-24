import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:4173',
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  const config = new DocumentBuilder()
    .setTitle('Trade2Fly API')
    .setDescription('Marketplace de equipamentos de paraquedismo')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

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
