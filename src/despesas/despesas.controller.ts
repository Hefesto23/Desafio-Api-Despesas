import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ExpenseCategory } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DespesasService } from './despesas.service';
import { AtualizarDespesaDto } from './dto/atualizar-despesa.dto';
import { CriarDespesaDto } from './dto/criar-despesa.dto';
import {
  DespesaListResponseDto,
  DespesaResponseDto,
  DespesaStatsDto,
} from './dto/despesa-response.dto';
import { QueryDespesaDto } from './dto/query-despesa.dto';

@ApiTags('💰 Despesas')
@Controller('despesas')
export class DespesasController {
  constructor(private readonly despesasService: DespesasService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Criar nova despesa',
    description: `
    **🔒 Requer autenticação JWT**

    Cria uma nova despesa no sistema.

    **Categorias disponíveis:**
    - ALIMENTACAO
    - TRANSPORTE
    - SAUDE
    - LAZER
    - OUTROS

    **Formato da data:** YYYY-MM-DD (exemplo: 2025-05-28)
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Despesa criada com sucesso',
    type: DespesaResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido ou não fornecido',
  })
  async create(
    @Body() criarDespesaDto: CriarDespesaDto,
  ): Promise<DespesaResponseDto> {
    return this.despesasService.create(criarDespesaDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas as despesas',
    description: `
    **📖 Endpoint público (não requer autenticação)**

    Lista todas as despesas com filtros opcionais.

    **Filtros disponíveis:**
    - \`mes\`: Mês (01-12)
    - \`ano\`: Ano (YYYY)
    - \`categoria\`: Categoria da despesa

    **Exemplos:**
    - \`GET /despesas\` - Todas as despesas
    - \`GET /despesas?mes=05&ano=2025\` - Despesas de maio/2025
    - \`GET /despesas?categoria=ALIMENTACAO\` - Apenas alimentação
    - \`GET /despesas?mes=12&ano=2024&categoria=LAZER\` - Lazer em dez/2024
    `,
  })
  @ApiQuery({
    name: 'mes',
    required: false,
    description: 'Filtrar por mês (01-12)',
    example: '05',
  })
  @ApiQuery({
    name: 'ano',
    required: false,
    description: 'Filtrar por ano (YYYY)',
    example: '2025',
  })
  @ApiQuery({
    name: 'categoria',
    required: false,
    enum: ExpenseCategory,
    description: 'Filtrar por categoria',
    example: 'ALIMENTACAO',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de despesas retornada com sucesso',
    type: DespesaListResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Parâmetros de filtro inválidos',
  })
  async findAll(
    @Query() query: QueryDespesaDto,
  ): Promise<DespesaListResponseDto> {
    return this.despesasService.findAll(query);
  }

  @Get('estatisticas')
  @ApiOperation({
    summary: 'Estatísticas das despesas',
    description: `
    **📊 Endpoint público (não requer autenticação)**

    Retorna estatísticas das despesas com os mesmos filtros do endpoint de listagem.

    **Informações retornadas:**
    - Total de despesas
    - Soma total dos valores
    - Estatísticas por categoria (quantidade e valor total)
    - Período dos filtros aplicados

    **Filtros disponíveis:** (mesmos da listagem)
    - \`mes\`: Mês (01-12)
    - \`ano\`: Ano (YYYY)
    - \`categoria\`: Categoria da despesa
    `,
  })
  @ApiQuery({
    name: 'mes',
    required: false,
    description: 'Filtrar por mês (01-12)',
    example: '05',
  })
  @ApiQuery({
    name: 'ano',
    required: false,
    description: 'Filtrar por ano (YYYY)',
    example: '2025',
  })
  @ApiQuery({
    name: 'categoria',
    required: false,
    enum: ExpenseCategory,
    description: 'Filtrar por categoria',
    example: 'ALIMENTACAO',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas retornadas com sucesso',
    type: DespesaStatsDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Parâmetros de filtro inválidos',
  })
  async getStats(@Query() query: QueryDespesaDto): Promise<DespesaStatsDto> {
    return this.despesasService.getStats(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar despesa por ID',
    description: `
    **📖 Endpoint público (não requer autenticação)**

    Retorna uma despesa específica pelo seu ID único.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da despesa (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Despesa encontrada',
    type: DespesaResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Despesa não encontrada',
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido (deve ser UUID)',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DespesaResponseDto> {
    return this.despesasService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Atualizar despesa',
    description: `
    **🔒 Requer autenticação JWT**

    Atualiza uma despesa existente. Todos os campos são opcionais.

    **Campos que podem ser atualizados:**
    - \`title\`: Título da despesa
    - \`amount\`: Valor da despesa
    - \`category\`: Categoria (ALIMENTACAO, TRANSPORTE, SAUDE, LAZER, OUTROS)
    - \`date\`: Data da despesa (formato YYYY-MM-DD)
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da despesa (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Despesa atualizada com sucesso',
    type: DespesaResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos ou ID inválido',
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido ou não fornecido',
  })
  @ApiResponse({
    status: 404,
    description: 'Despesa não encontrada',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() atualizarDespesaDto: AtualizarDespesaDto,
  ): Promise<DespesaResponseDto> {
    return this.despesasService.update(id, atualizarDespesaDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Excluir despesa',
    description: `
    **🔒 Requer autenticação JWT**

    Remove uma despesa do sistema permanentemente.

    **⚠️ Atenção:** Esta ação não pode ser desfeita!
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da despesa (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Despesa removida com sucesso',
    schema: {
      type: 'object',
      properties: {
        mensagem: {
          type: 'string',
          example:
            'Despesa 123e4567-e89b-12d3-a456-426614174000 removida com sucesso',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido (deve ser UUID)',
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido ou não fornecido',
  })
  @ApiResponse({
    status: 404,
    description: 'Despesa não encontrada',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ mensagem: string }> {
    return this.despesasService.remove(id);
  }
}
