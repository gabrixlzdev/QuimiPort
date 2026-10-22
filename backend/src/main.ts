import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('QuimiPort API')
    .setDescription(
      'API backend para gestão de cargas químicas portuárias - Tech Challenge FIAP Fase 2.',
    )
    .setVersion('1.0')
    .addTag('Produtos Químicos', 'Gerenciamento de produtos químicos cadastrados')
    .addTag('Cargas Químicas', 'Registro, controle de status, movimentação e auditoria de cargas')
    .addTag('Responsáveis Técnicos', 'Cadastro de responsáveis técnicos (CRQ/CREA)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
