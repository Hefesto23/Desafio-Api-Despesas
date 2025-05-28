import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Executando seed do banco de dados...');

  // Criar usuário admin
  const adminEmail = process.env.DEFAULT_USER_EMAIL || 'admin@expenses.com';
  const adminPassword = process.env.DEFAULT_USER_PASSWORD || 'admin123';

  console.log(`Criando usuário admin: ${adminEmail}`);

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
    },
  });

  console.log(`Usuário admin criado com ID: ${adminUser.id}`);

  // Estatísticas
  const totalUsers = await prisma.user.count();

  console.log('Resumo do seed:');
  console.log(`   - Usuários: ${totalUsers}`);
  console.log(`   - Email: ${adminEmail}`);
  console.log(`   - Senha: ${adminPassword}`);
}

main()
  .then(async () => {
    console.log('✅ Seed executado com sucesso!');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erro no seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
