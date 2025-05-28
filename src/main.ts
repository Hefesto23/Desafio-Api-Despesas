import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Configurar validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades não definidas nos DTOs
      forbidNonWhitelisted: true, // Rejeita requisições com propriedades extras
      transform: true, // Transforma automaticamente tipos
      disableErrorMessages: false, // Mantém mensagens de erro em desenvolvimento
    }),
  );

  // Configurar CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'], // Adicione seus domínios
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Despesas Pessoais')
    .setDescription(
      `
    **API RESTful para gerenciar despesas pessoais**

    **Autenticação:**
    - Faça login em /auth/login para obter o token
    - Use o token nos endpoints protegidos: Authorization: Bearer {token}

    🌐 **Endpoints:**
    - **Públicos (sem token):** GET /expenses (listar, buscar, estatísticas)
    - **Protegidos (com token):** POST, PATCH, DELETE /expenses

    **Categorias disponíveis:**
    ALIMENTACAO | TRANSPORTE | SAUDE | LAZER | OUTROS
    `,
    )
    .setVersion('1.0')
    .addTag(' Autenticação', 'Login para obter token JWT')
    .addTag('Despesas', 'CRUD de despesas pessoais')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Insira o token JWT obtido no login',
        in: 'header',
      },
      'JWT-auth', // Nome da segurança
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'API Despesas - Documentação',
    customfavIcon: '📚',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  // Configurar porta
  const port = process.env.PORT || 3000;

  await app.listen(port);

  logger.log(`🚀 Aplicação rodando em: http://localhost:${port}`);
  logger.log(`📚 Documentação Swagger: http://localhost:${port}/api/docs`);
  logger.log(`🔑 Usuário padrão: admin@expenses.com / admin123`);
}

bootstrap();
