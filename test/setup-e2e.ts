import * as dotenv from 'dotenv';
import { join } from 'path';

// Carregar variáveis de ambiente de teste
dotenv.config({ path: join(__dirname, '..', '.env.test') });

// Verificar se as variáveis foram carregadas
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não encontrada no .env.test');
  process.exit(1);
}

// Configurar timeout para testes
jest.setTimeout(60000);
