#!/bin/bash

echo "🌱 Executando seed do APP"

# Funções de output
print_status() {
    echo "[SEED-DEV] $1"
}

print_success() {
    echo "[SUCCESS] $1"
}

print_error() {
    echo "[ERROR] $1"
}

# Verificar se arquivo .env existe
if [ ! -f .env ]; then
    print_error "Arquivo .env não encontrado!"
    echo "Execute: npm run setup"
    exit 1
fi

# Verificar se arquivo de seed existe
if [ ! -f prisma/seed.ts ]; then
    print_error "Arquivo prisma/seed.ts não encontrado!"
    exit 1
fi

# Executar seed de desenvolvimento
print_status "Criando usuário admin para desenvolvimento..."
if npx tsx prisma/seed.ts; then
    print_success "Usuário admin de desenvolvimento criado com sucesso!"
else
    print_error "Falha ao criar usuário admin de desenvolvimento!"
    exit 1
fi

echo ""
echo "============================================"
echo "👤 USUÁRIO ADMIN CRIADO!"
echo "============================================"
echo ""
echo "🔐 Credenciais para login:"
echo "   - Email: admin@expenses.com"
echo "   - Senha: admin123"
echo ""
echo " Testar login:"
if [ "$1" = "test" ] || [ "$1" = "--test" ]; then
    echo "   # Configure a API para usar .env.test primeiro"
else
    echo "   npm run test:auth"
fi
echo ""
echo " Para visualizar os dados:"
if [ "$1" = "test" ] || [ "$1" = "--test" ]; then
    echo "   dotenv -e .env.test -- npx prisma studio --port 5556"
else
    echo "   npx prisma studio"
fi
