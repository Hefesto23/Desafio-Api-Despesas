import {
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async onModuleInit() {
    await this.createDefaultUser();
  }

  private async createDefaultUser() {
    try {
      const defaultEmail =
        process.env.DEFAULT_USER_EMAIL || 'admin@expenses.com';
      const defaultPassword = process.env.DEFAULT_USER_PASSWORD || 'admin123';

      const existingUser = await this.prisma.user.findUnique({
        where: { email: defaultEmail },
      });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        await this.prisma.user.create({
          data: {
            email: defaultEmail,
            password: hashedPassword,
          },
        });

        this.logger.log(`✅ Usuário padrão criado: ${defaultEmail}`);
        this.logger.log(`🔑 Senha padrão: ${defaultPassword}`);
        this.logger.log(`🚀 Faça login para obter o token JWT!`);
      }
    } catch (error) {
      this.logger.warn('Erro ao criar usuário padrão:', error.message);
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const token = this.generateToken(user);

    return {
      access_token: token,
      token_type: 'Bearer',
      expires_in: this.getTokenExpirationTime(),
      message:
        'Login realizado com sucesso! Use o token para criar, atualizar e excluir despesas.',
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  private generateToken(user: { id: string; email: string }) {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  private getTokenExpirationTime(): number {
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    if (expiresIn.includes('d')) {
      return parseInt(expiresIn) * 24 * 60 * 60;
    } else if (expiresIn.includes('h')) {
      return parseInt(expiresIn) * 60 * 60;
    } else {
      return parseInt(expiresIn);
    }
  }
}
