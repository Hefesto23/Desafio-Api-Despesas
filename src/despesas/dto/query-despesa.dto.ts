import { ApiPropertyOptional } from '@nestjs/swagger';
import { ExpenseCategory } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumberString,
  IsOptional,
  Length,
  Matches,
} from 'class-validator';

export class QueryDespesaDto {
  @ApiPropertyOptional({
    description: 'Mês para filtrar (01-12)',
    example: '05',
    pattern: '^(0[1-9]|1[0-2])$',
  })
  @IsOptional()
  @IsNumberString({}, { message: 'Mês deve ser um número' })
  @Length(2, 2, { message: 'Mês deve ter exatamente 2 dígitos' })
  @Matches(/^(0[1-9]|1[0-2])$/, {
    message: 'Mês deve estar entre 01 e 12',
  })
  mes?: string;

  @ApiPropertyOptional({
    description: 'Ano para filtrar',
    example: '2025',
    pattern: '^[0-9]{4}$',
  })
  @IsOptional()
  @IsNumberString({}, { message: 'Ano deve ser um número' })
  @Length(4, 4, { message: 'Ano deve ter exatamente 4 dígitos' })
  @Matches(/^[0-9]{4}$/, {
    message: 'Ano deve ter formato YYYY',
  })
  ano?: string;

  @ApiPropertyOptional({
    description: 'Categoria para filtrar',
    enum: ExpenseCategory,
    example: 'ALIMENTACAO',
  })
  @IsOptional()
  @IsEnum(ExpenseCategory, {
    message: `Categoria deve ser uma das opções: ${Object.values(ExpenseCategory).join(', ')}`,
  })
  categoria?: ExpenseCategory;

  @ApiPropertyOptional({
    description: 'Página (para paginação futura)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  pagina?: number = 1;

  @ApiPropertyOptional({
    description: 'Itens por página (para paginação futura)',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  limite?: number = 50;
}
