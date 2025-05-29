import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ExpenseCategory, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AtualizarDespesaDto } from './dto/atualizar-despesa.dto';
import { CriarDespesaDto } from './dto/criar-despesa.dto';
import {
  DespesaListResponseDto,
  DespesaResponseDto,
  DespesaStatsDto,
} from './dto/despesa-response.dto';
import { QueryDespesaDto } from './dto/query-despesa.dto';

@Injectable()
export class DespesasService {
  private readonly logger = new Logger(DespesasService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(criarDespesaDto: CriarDespesaDto): Promise<DespesaResponseDto> {
    try {
      const despesa = await this.prisma.expense.create({
        data: {
          title: criarDespesaDto.title,
          amount: new Prisma.Decimal(criarDespesaDto.amount),
          category: criarDespesaDto.category,
          date: new Date(criarDespesaDto.date),
        },
      });

      this.logger.log(`Despesa criada com ID: ${despesa.id}`);

      return this.formatDespesaResponse(despesa);
    } catch (error) {
      this.logger.error('Erro ao criar despesa:', error);
      throw error;
    }
  }

  async findAll(query: QueryDespesaDto): Promise<DespesaListResponseDto> {
    try {
      const whereClause = this.buildWhereClause(query);

      const [despesas, total] = await Promise.all([
        this.prisma.expense.findMany({
          where: whereClause,
          orderBy: { date: 'desc' },
          // Para implementação futura de paginação:
          // skip: (query.pagina - 1) * query.limite,
          // take: query.limite,
        }),
        this.prisma.expense.count({ where: whereClause }),
      ]);

      const valorTotal = despesas.reduce(
        (sum, despesa) => sum + despesa.amount.toNumber(),
        0,
      );

      return {
        despesas: despesas.map(this.formatDespesaResponse),
        total,
        valorTotal: Number(valorTotal.toFixed(2)),
        filtros: this.getAppliedFilters(query),
      };
    } catch (error) {
      this.logger.error('Erro ao buscar despesas:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<DespesaResponseDto> {
    try {
      const despesa = await this.prisma.expense.findUnique({
        where: { id },
      });

      if (!despesa) {
        throw new NotFoundException(`Despesa com ID ${id} não encontrada`);
      }

      return this.formatDespesaResponse(despesa);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Erro ao buscar despesa ${id}:`, error);
      throw error;
    }
  }

  async update(
    id: string,
    atualizarDespesaDto: AtualizarDespesaDto,
  ): Promise<DespesaResponseDto> {
    try {
      // Verificar se a despesa existe
      await this.findOne(id);

      const updateData: any = {};

      if (atualizarDespesaDto.title !== undefined) {
        updateData.title = atualizarDespesaDto.title;
      }
      if (atualizarDespesaDto.amount !== undefined) {
        updateData.amount = new Prisma.Decimal(atualizarDespesaDto.amount);
      }
      if (atualizarDespesaDto.category !== undefined) {
        updateData.category = atualizarDespesaDto.category;
      }
      if (atualizarDespesaDto.date !== undefined) {
        updateData.date = new Date(atualizarDespesaDto.date);
      }

      const despesa = await this.prisma.expense.update({
        where: { id },
        data: updateData,
      });

      this.logger.log(`Despesa ${id} atualizada com sucesso`);

      return this.formatDespesaResponse(despesa);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Erro ao atualizar despesa ${id}:`, error);
      throw error;
    }
  }

  async remove(id: string): Promise<{ mensagem: string }> {
    try {
      // Verificar se a despesa existe
      await this.findOne(id);

      await this.prisma.expense.delete({
        where: { id },
      });

      this.logger.log(`Despesa ${id} removida com sucesso`);

      return {
        mensagem: `Despesa ${id} removida com sucesso`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Erro ao remover despesa ${id}:`, error);
      throw error;
    }
  }

  async getStats(query: QueryDespesaDto): Promise<DespesaStatsDto> {
    try {
      const whereClause = this.buildWhereClause(query);

      const despesas = await this.prisma.expense.findMany({
        where: whereClause,
        select: {
          amount: true,
          category: true,
        },
      });

      const totalDespesas = despesas.length;
      const valorTotal = despesas.reduce(
        (sum, despesa) => sum + despesa.amount.toNumber(),
        0,
      );

      // Estatísticas por categoria
      const porCategoria: Record<
        string,
        { quantidade: number; total: number }
      > = {};

      for (const category of Object.values(ExpenseCategory)) {
        const categoryDespesas = despesas.filter(
          (despesa) => despesa.category === category,
        );
        const categoryTotal = categoryDespesas.reduce(
          (sum, despesa) => sum + despesa.amount.toNumber(),
          0,
        );

        if (categoryDespesas.length > 0) {
          porCategoria[category] = {
            quantidade: categoryDespesas.length,
            total: Number(categoryTotal.toFixed(2)),
          };
        }
      }

      return {
        totalDespesas,
        valorTotal: Number(valorTotal.toFixed(2)),
        porCategoria,
        periodo: {
          mes: query.mes,
          ano: query.ano,
        },
      };
    } catch (error) {
      this.logger.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  //corrigido
  private buildWhereClause(query: QueryDespesaDto) {
    const where: any = {};

    // Filtro de categoria
    if (query.categoria) {
      where.category = query.categoria;
    }

    // Para mês SEM ano - buscar em múltiplos anos
    if (query.mes && !query.ano) {
      const month = parseInt(query.mes.toString());
      if (month >= 1 && month <= 12) {
        const currentYear = new Date().getFullYear();
        const ranges: any[] = [];

        // Busca nos últimos 5 anos e próximos 2 anos
        for (let year = currentYear - 5; year <= currentYear + 2; year++) {
          ranges.push({
            date: {
              gte: new Date(year, month - 1, 1),
              lte: new Date(year, month, 0),
            },
          });
        }

        where.OR = ranges;
      }
    }
    // Para ano COM ou SEM mês
    else if (query.ano) {
      const year = parseInt(query.ano.toString());

      if (query.mes) {
        // Mês + Ano específicos
        const month = parseInt(query.mes.toString());
        if (month >= 1 && month <= 12) {
          const startDate = new Date(year, month - 1, 1);
          const endDate = new Date(year, month, 0);
          where.date = { gte: startDate, lte: endDate };
        }
      } else {
        // Só ano - todos os meses
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);
        where.date = { gte: startDate, lte: endDate };
      }
    }

    console.log('🔍 Query recebida:', query);
    console.log('🔍 WHERE CLAUSE GERADO:', JSON.stringify(where, null, 2));
    return where;
  }

  private formatDespesaResponse(despesa: any): DespesaResponseDto {
    return {
      id: despesa.id,
      title: despesa.title,
      amount: despesa.amount.toNumber(),
      category: despesa.category,
      date: despesa.date.toISOString().split('T')[0], // YYYY-MM-DD
      createdAt: despesa.createdAt,
      updatedAt: despesa.updatedAt,
    };
  }

  private getAppliedFilters(query: QueryDespesaDto) {
    const filtros: any = {};

    if (query.mes) filtros.mes = query.mes;
    if (query.ano) filtros.ano = query.ano;
    if (query.categoria) filtros.categoria = query.categoria;

    return Object.keys(filtros).length > 0 ? filtros : undefined;
  }
}
