import { ApiProperty } from '@nestjs/swagger';
import { ExpenseCategory } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CriarDespesaDto {
  @ApiProperty({
    description: 'Título da despesa',
    example: 'Supermercado Extra',
    maxLength: 255,
  })
  @IsString({ message: 'Título deve ser uma string' })
  @IsNotEmpty({ message: 'Título é obrigatório' })
  @MaxLength(255, { message: 'Título deve ter no máximo 255 caracteres' })
  title: string;

  @ApiProperty({
    description: 'Valor da despesa',
    example: 85.5,
    minimum: 0.01,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Valor deve ser um número com no máximo 2 casas decimais' },
  )
  @IsPositive({ message: 'Valor deve ser positivo' })
  @Type(() => Number)
  amount: number;

  @ApiProperty({
    description: 'Categoria da despesa',
    enum: ExpenseCategory,
    example: 'ALIMENTACAO',
  })
  @IsEnum(ExpenseCategory, {
    message: `Categoria deve ser uma das opções: ${Object.values(ExpenseCategory).join(', ')}`,
  })
  category: ExpenseCategory;

  @ApiProperty({
    description: 'Data da despesa (formato: YYYY-MM-DD)',
    example: '2025-05-28',
  })
  @IsDateString({}, { message: 'Data deve estar no formato YYYY-MM-DD' })
  date: string;
}
