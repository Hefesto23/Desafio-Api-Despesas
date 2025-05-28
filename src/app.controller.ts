import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Endpoint raiz da API',
    description:
      'Retorna uma mensagem de boas-vindas para verificar se a API está funcionando',
  })
  @ApiResponse({
    status: 200,
    description: 'API está funcionando corretamente',
    schema: {
      type: 'string',
      example: 'Hello World! 🚀 API de Despesas funcionando!',
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({
    summary: 'Verificação de saúde da API',
    description: 'Retorna informações sobre o status da API',
  })
  @ApiResponse({
    status: 200,
    description: 'Informações de saúde da API',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'OK' },
        message: {
          type: 'string',
          example: 'API de Despesas está funcionando',
        },
        timestamp: { type: 'string', example: '2025-05-28T10:30:00.000Z' },
        environment: { type: 'string', example: 'development' },
        version: { type: 'string', example: '1.0.0' },
      },
    },
  })
  getHealth() {
    return this.appService.getHealth();
  }
}
