import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('API E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Usar variáveis do .env.test
  const testEmail = process.env.DEFAULT_USER_EMAIL || 'admin@expenses.com';
  const testPassword = process.env.DEFAULT_USER_PASSWORD || 'admin123';
  const testEnvironment = process.env.NODE_ENV || 'test';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Configurar validação como na aplicação real
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    prisma = app.get(PrismaService);

    await app.init();
  });

  beforeEach(async () => {
    // Limpar banco de dados antes de cada teste
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  describe('Endpoints Principais', () => {
    describe('GET /', () => {
      it('deve retornar Hello World', async () => {
        const response = await request(app.getHttpServer())
          .get('/')
          .expect(200);

        expect(response.text).toContain('Hello World');
      });

      it('deve retornar Content-Type text/html', async () => {
        await request(app.getHttpServer())
          .get('/')
          .expect('Content-Type', /text\/html/)
          .expect(200);
      });
    });

    describe('GET /health', () => {
      it('deve retornar status de saúde da API', async () => {
        const response = await request(app.getHttpServer())
          .get('/health')
          .expect(200);

        expect(response.body).toHaveProperty('status', 'OK');
        expect(response.body).toHaveProperty(
          'message',
          'API de Despesas está funcionando',
        );
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('environment', testEnvironment);
        expect(response.body).toHaveProperty('version', '1.0.0');
      });

      it('deve retornar timestamp válido', async () => {
        const response = await request(app.getHttpServer())
          .get('/health')
          .expect(200);

        const timestamp = new Date(response.body.timestamp);
        expect(timestamp).toBeInstanceOf(Date);
        expect(isNaN(timestamp.getTime())).toBe(false);
      });

      it('deve retornar Content-Type application/json', async () => {
        await request(app.getHttpServer())
          .get('/health')
          .expect('Content-Type', /json/)
          .expect(200);
      });
    });
  });

  describe('Endpoints Inexistentes', () => {
    it('deve retornar 404 para endpoint inexistente', async () => {
      await request(app.getHttpServer())
        .get('/endpoint-inexistente')
        .expect(404);
    });

    it('deve retornar erro estruturado para 404', async () => {
      const response = await request(app.getHttpServer())
        .get('/rota-que-nao-existe')
        .expect(404);

      expect(response.body).toHaveProperty('statusCode', 404);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Autenticação', () => {
    describe('POST /auth/login', () => {
      it('deve fazer login com credenciais corretas', async () => {
        const hashedPassword = await bcrypt.hash(testPassword, 10);

        await prisma.user.upsert({
          where: { email: testEmail },
          update: {
            password: hashedPassword,
          },
          create: {
            email: testEmail,
            password: hashedPassword,
          },
        });

        const loginDto = {
          email: testEmail,
          password: testPassword,
        };

        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send(loginDto)
          .expect('Content-Type', /json/)
          .expect(201);

        // console.log(response.body); // Logar a resposta para depuração

        expect(response.body).toHaveProperty('access_token');
        expect(response.body).toHaveProperty('token_type', 'Bearer');
        expect(response.body).toHaveProperty('expires_in');
        expect(response.body).toHaveProperty('message');
        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user).toHaveProperty('email', testEmail);

        // Verificar se o token é uma string válida
        expect(typeof response.body.access_token).toBe('string');
        expect(response.body.access_token.length).toBeGreaterThan(50);
      });

      it('deve retornar erro com email inválido', async () => {
        const loginDto = {
          email: 'wrong@email.com',
          password: testPassword,
        };

        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send(loginDto)
          .expect(401);

        expect(response.body).toHaveProperty(
          'message',
          'Email ou senha inválidos',
        );
        expect(response.body).toHaveProperty('statusCode', 401);
      });

      it('deve retornar erro com senha inválida', async () => {
        const loginDto = {
          email: testEmail,
          password: 'senhaerrada',
        };

        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send(loginDto)
          .expect(401);

        expect(response.body).toHaveProperty(
          'message',
          'Email ou senha inválidos',
        );
      });

      it('deve retornar erro de validação com email mal formatado', async () => {
        const loginDto = {
          email: 'email-invalido',
          password: testPassword,
        };

        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send(loginDto)
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(Array.isArray(response.body.message)).toBe(true);
        expect(response.body.message).toContain(
          'Email deve ter um formato válido',
        );
      });

      it('deve retornar erro de validação com senha muito curta', async () => {
        const loginDto = {
          email: testEmail,
          password: '123',
        };

        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send(loginDto)
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(Array.isArray(response.body.message)).toBe(true);
        expect(response.body.message).toContain(
          'Senha deve ter pelo menos 6 caracteres',
        );
      });

      it('deve retornar erro com campos faltando', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({})
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(Array.isArray(response.body.message)).toBe(true);
      });

      it('deve retornar erro com campos extras não permitidos', async () => {
        const loginDto = {
          email: testEmail,
          password: testPassword,
          campoExtra: 'nao-permitido',
        };

        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send(loginDto)
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(Array.isArray(response.body.message)).toBe(true);
      });
    });
  });
});
