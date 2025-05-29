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

  // Criar despesas de exemplo
  console.log('Criando despesas de exemplo...');
  enum categorias {
    ALIMENTACAO = 'ALIMENTACAO',
    TRANSPORTE = 'TRANSPORTE',
    SAUDE = 'SAUDE',
    LAZER = 'LAZER',
    OUTROS = 'OUTROS',
  }

  const despesasExemplo = [
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      title: 'Posto de Gasolina Shell',
      amount: 89.9,
      category: categorias.TRANSPORTE,
      date: new Date('2025-04-24'),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      title: 'Cinema - Ingresso Duplo',
      amount: 45.0,
      category: categorias.LAZER,
      date: new Date('2024-05-23'),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      title: 'Farmácia - Medicamentos',
      amount: 67.8,
      category: categorias.SAUDE,
      date: new Date('2021-01-22'),
    },
  ];

  for (const despesa of despesasExemplo) {
    const { id, ...despesaData } = despesa;

    await prisma.expense.upsert({
      where: { id },
      update: { ...despesaData },
      create: {
        id,
        ...despesaData,
      },
    });
  }
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
