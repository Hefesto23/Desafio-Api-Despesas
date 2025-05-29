import { ApiPropertyOptional } from '@nestjs/swagger';
import { ExpenseCategory } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class AtualizarDespesaDto {
  @ApiPropertyOptional({
    description: 'Título da despesa',
    example: 'Supermercado Extra - Atualizado',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Título deve ser uma string' })
  @MaxLength(255, { message: 'Título deve ter no máximo 255 caracteres' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Valor da despesa',
    example: 95.75,
    minimum: 0.01,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Valor deve ser um número com no máximo 2 casas decimais' },
  )
  @IsPositive({ message: 'Valor deve ser positivo' })
  @Type(() => Number)
  amount?: number;

  @ApiPropertyOptional({
    description: 'Categoria da despesa',
    enum: ExpenseCategory,
    example: 'TRANSPORTE',
  })
  @IsOptional()
  @IsEnum(ExpenseCategory, {
    message: `Categoria deve ser uma das opções: ${Object.values(ExpenseCategory).join(', ')}`,
  })
  category?: ExpenseCategory;

  @ApiPropertyOptional({
    description: 'Data da despesa (formato: YYYY-MM-DD)',
    example: '2025-05-29',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Data deve estar no formato YYYY-MM-DD' })
  date?: string;
}
