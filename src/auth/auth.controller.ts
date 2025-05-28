import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthResponseDto, LoginDto } from './dto/auth.dto';

@ApiTags('** Autenticação **')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Fazer login para obter token JWT',
    description: `
    **Credenciais padrão:**
    - Email: admin@expenses.com
    - Senha: admin123

    **Como usar o token:**
    1. Copie o \`access_token\` da resposta
    2. Use no header: \`Authorization: Bearer {seu-token}\`
    3. Token necessário para: **POST**, **PATCH** e **DELETE** de despesas
    4. Endpoints **GET** são públicos (não precisam de token)

    **Exemplo de uso:**
    \`\`\`
    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    \`\`\`
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso - token JWT retornado',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Email ou senha inválidos',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos (validação falhou)',
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }
}
