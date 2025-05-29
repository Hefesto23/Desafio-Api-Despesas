// import { Decimal } from '@prisma/client/runtime/library';

// export class DecimalUtils {
//   /**
//    * Converte number para Decimal do Prisma
//    */
//   static fromNumber(value: number): Decimal {
//     return new Decimal(value);
//   }

//   /**
//    * Converte Decimal para number para serialização JSON
//    */
//   static toNumber(value: Decimal): number {
//     return value.toNumber();
//   }

//   /**
//    * Converte string para Decimal
//    */
//   static fromString(value: string): Decimal {
//     return new Decimal(value);
//   }

//   /**
//    * Soma dois valores Decimal
//    */
//   static add(a: Decimal, b: Decimal): Decimal {
//     return a.add(b);
//   }

//   /**
//    * Divide um Decimal por outro
//    */
//   static divide(dividend: Decimal, divisor: Decimal): Decimal {
//     return dividend.div(divisor);
//   }

//   /**
//    * Formata Decimal como moeda brasileira
//    */
//   static formatCurrency(value: Decimal): string {
//     return new Intl.NumberFormat('pt-BR', {
//       style: 'currency',
//       currency: 'BRL',
//     }).format(value.toNumber());
//   }

//   /**
//    * Valida se um valor é um Decimal válido
//    */
//   static isValid(value: any): boolean {
//     try {
//       new Decimal(value);
//       return true;
//     } catch {
//       return false;
//     }
//   }

//   /**
//    * Retorna zero como Decimal
//    */
//   static zero(): Decimal {
//     return new Decimal(0);
//   }

//   /**
//    * Converte array de Decimal para array de numbers
//    */
//   static arrayToNumbers(values: Decimal[]): number[] {
//     return values.map((value) => value.toNumber());
//   }
// }
