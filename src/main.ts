import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger/dist';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT || 5000;
  const swaggerOptions = new DocumentBuilder()
    .setTitle('Clothes shop APIs')
    .setDescription('These are the APIs for the clothing sales system.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerOptions);

  app.enableCors({
    origin: process.env.CLIENT_URI,
  });

  SwaggerModule.setup('api/document', app, document);

  await app.listen(PORT);
}
bootstrap();
