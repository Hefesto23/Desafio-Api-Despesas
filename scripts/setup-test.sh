#!/bin/bash

echo "🧪 Configurando Ambiente de Teste..."

# Funções de output universais
print_status() {
    echo "[TEST] $1"
}

print_success() {
    echo "[SUCCESS] $1"
}

print_warning() {
    echo "[WARNING] $1"
}

print_error() {
    echo "[ERROR] $1"
}

# Verificar Docker
if ! command -v docker >/dev/null 2>&1; then
    print_error "Docker não está instalado!"
    exit 1
fi

if ! command -v docker-compose >/dev/null 2>&1; then
    print_error "Docker Compose não está instalado!"
    exit 1
fi

# Verificar se .env.test existe
if [ ! -f .env.test ]; then
    print_warning "ERRO: Arquivo .env.test não encontrado!"
    exit 1
else
    print_status "Arquivo .env.test encontrado"
fi

# Mostrar DATABASE_URL de teste
print_status "DATABASE_URL de teste:"
grep DATABASE_URL .env.test 2>/dev/null || print_error "DATABASE_URL não encontrada em .env.test!"

# Verificar se dotenv-cli está instalado
if ! command -v dotenv >/dev/null 2>&1; then
    print_warning "dotenv-cli não encontrado, instalando..."
    if command -v pnpm >/dev/null 2>&1; then
        pnpm add -D dotenv-cli
    else
        npm install -D dotenv-cli
    fi
fi

# Subir container de teste
print_status "Iniciando PostgreSQL para testes..."
docker-compose up -d postgres-test

# Aguardar PostgreSQL teste
print_status "Aguardando PostgreSQL teste inicializar..."
sleep 8

# Verificar conectividade do banco de teste
print_status "Testando conectividade PostgreSQL teste..."
max_attempts=20
attempt=1

while [ $attempt -le $max_attempts ]; do
    if docker-compose exec postgres-test pg_isready -U postgres >/dev/null 2>&1; then
        print_success "PostgreSQL teste está respondendo!"
        break
    fi

    if [ $attempt -eq $max_attempts ]; then
        print_error "PostgreSQL teste não iniciou após $max_attempts tentativas!"
        print_error "Logs do PostgreSQL teste:"
        docker-compose logs postgres-test
        exit 1
    fi

    print_status "Tentativa $attempt/$max_attempts..."
    sleep 3
    attempt=$((attempt + 1))
done

# Executar migração com .env.test
print_status "Executando migrações no banco de teste..."
if dotenv -e .env.test -- npx prisma migrate dev --name initial; then
    print_success "Migrações de teste executadas com sucesso!"
else
    print_error "Migrações de teste falharam!"
    print_status "Tentando diagnosticar..."

    if dotenv -e .env.test -- npx prisma db push --accept-data-loss; then
        print_warning "db push funcionou, tentando migração novamente..."
        dotenv -e .env.test -- npx prisma migrate dev --name initial
    else
        print_error "Problema de conectividade com banco de teste"
        exit 1
    fi
fi

print_success "Ambiente de teste configurado!"

echo ""
echo "============================================"
echo "🧪 AMBIENTE DE TESTE PRONTO!"
echo "============================================"
echo ""
echo "📋 Para executar testes:"
echo "   npm run test:e2e           # Testes E2E"
echo "   npm run test:e2e:watch     # Testes E2E em modo watch"
echo ""
echo "🌐 URLs de teste:"
echo "   - Banco teste: localhost:5433"
echo "   - Prisma Studio teste: dotenv -e .env.test -- npx prisma studio --port 5556"
echo ""
echo "📊 Ver banco de teste:"
echo "   dotenv -e .env.test -- npx prisma studio --port 5556"
