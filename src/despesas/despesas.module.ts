import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DespesasController } from './despesas.controller';
import { DespesasService } from './despesas.service';

@Module({
  imports: [
    AuthModule, // Importar AuthModule para usar JwtAuthGuard
  ],
  controllers: [DespesasController],
  providers: [DespesasService],
  exports: [DespesasService], // Exportar caso seja usado em outros módulos
})
export class DespesasModule {}
