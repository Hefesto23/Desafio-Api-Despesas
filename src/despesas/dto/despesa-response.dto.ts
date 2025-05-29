import { ApiProperty } from '@nestjs/swagger';
import { ExpenseCategory } from '@prisma/client';

export class DespesaResponseDto {
  @ApiProperty({
    description: 'ID único da despesa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Título da despesa',
    example: 'Supermercado Extra',
  })
  title: string;

  @ApiProperty({
    description: 'Valor da despesa',
    example: 85.5,
  })
  amount: number;

  @ApiProperty({
    description: 'Categoria da despesa',
    enum: ExpenseCategory,
    example: 'ALIMENTACAO',
  })
  category: ExpenseCategory;

  @ApiProperty({
    description: 'Data da despesa',
    example: '2025-05-28',
  })
  date: string;

  @ApiProperty({
    description: 'Data de criação',
    example: '2025-05-28T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de atualização',
    example: '2025-05-28T12:45:00.000Z',
  })
  updatedAt: Date;
}

export class DespesaListResponseDto {
  @ApiProperty({
    description: 'Lista de despesas',
    type: [DespesaResponseDto],
  })
  despesas: DespesaResponseDto[];

  @ApiProperty({
    description: 'Total de despesas encontradas',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: 'Filtros aplicados',
    example: { month: '05', year: '2025', category: 'ALIMENTACAO' },
  })
  filtros?: {
    month?: string;
    year?: string;
    category?: ExpenseCategory;
  };

  @ApiProperty({
    description: 'Soma total dos valores',
    example: 1250.75,
  })
  valorTotal: number;
}

export class DespesaStatsDto {
  @ApiProperty({
    description: 'Total de despesas',
    example: 25,
  })
  totalDespesas: number;

  @ApiProperty({
    description: 'Soma total dos valores',
    example: 1250.75,
  })
  valorTotal: number;

  @ApiProperty({
    description: 'Estatísticas por categoria',
    example: {
      ALIMENTACAO: { quantidade: 12, total: 650.0 },
      TRANSPORTE: { quantidade: 8, total: 320.5 },
      LAZER: { quantidade: 5, total: 280.25 },
    },
  })
  porCategoria: Record<string, { quantidade: number; total: number }>;

  @ApiProperty({
    description: 'Período dos filtros aplicados',
    example: { mes: '05', ano: '2025' },
  })
  periodo?: {
    mes?: string;
    ano?: string;
  };
}
