#!/bin/bash

echo "🚀 Configurando API de Despesas..."

# Funções de output (funcionam em todos os sistemas)
print_status() {
    echo "[INFO] $1"
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

# Verificar Docker (universal)
if ! command -v docker >/dev/null 2>&1; then
    print_error "Docker não está instalado!"
    echo "Instale o Docker em: https://www.docker.com/get-started"
    exit 1
fi

if ! command -v docker-compose >/dev/null 2>&1; then
    print_error "Docker Compose não está instalado!"
    exit 1
fi

# Criar .env se não existir
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        print_success "ERRO: Arquivo .env criado a partir do .env.example"
    else
        print_warning "Arquivo .env.example também não existe!"
        exit 1
    fi
else
    print_warning "Arquivo .env já existe"
fi

# Mostrar DATABASE_URL
print_status "DATABASE_URL configurada:"
grep DATABASE_URL .env 2>/dev/null || print_error "DATABASE_URL não encontrada!"

# Parar containers existentes
print_status "Parando containers existentes..."
docker-compose down -v >/dev/null 2>&1

# Subir PostgreSQL
print_status "Iniciando PostgreSQL..."
docker-compose up -d postgres

# Aguardar PostgreSQL
print_status "Aguardando PostgreSQL inicializar..."
sleep 8

# Verificar conectividade (método universal)
print_status "Testando conectividade PostgreSQL..."
max_attempts=20
attempt=1

while [ $attempt -le $max_attempts ]; do
    if docker-compose exec postgres pg_isready -U postgres >/dev/null 2>&1; then
        print_success "PostgreSQL está respondendo!"
        break
    fi

    if [ $attempt -eq $max_attempts ]; then
        print_error "PostgreSQL não iniciou após $max_attempts tentativas!"
        print_error "Logs do PostgreSQL:"
        docker-compose logs postgres
        exit 1
    fi

    print_status "Tentativa $attempt/$max_attempts..."
    sleep 3
    attempt=$((attempt + 1))
done

# Verificar gerenciador de pacotes (universal)
if command -v pnpm >/dev/null 2>&1; then
    PACKAGE_MANAGER="pnpm"
elif command -v npm >/dev/null 2>&1; then
    PACKAGE_MANAGER="npm"
    print_warning "pnpm não encontrado, usando npm"
else
    print_error "Nem pnpm nem npm encontrados!"
    exit 1
fi

# Instalar dependências
print_status "Instalando dependências com $PACKAGE_MANAGER..."
$PACKAGE_MANAGER install

# Aguardar estabilização
print_status "Aguardando estabilização..."
sleep 3

# Executar migrações
print_status "Executando migrações Prisma..."
if npx prisma migrate dev --name initial; then
    print_success "Migrações executadas com sucesso!"
else
    print_error "Migrações falharam!"
    print_status "Tentando diagnosticar..."

    if npx prisma db push --accept-data-loss; then
        print_warning "db push funcionou, tentando migração novamente..."
        npx prisma migrate dev --name initial
    else
        print_error "Problema de conectividade com o banco"
        exit 1
    fi
fi

print_success "Setup de desenvolvimento concluído!"

echo ""
echo "============================================"
echo "🎉 PRONTO PARA DESENVOLVIMENTO!"
echo "============================================"
echo ""
echo "📋 Próximos passos:"
echo "   pnpm run start:dev    # Iniciar API"
echo ""
echo "🌐 URLs:"
echo "   - API: http://localhost:3000"
echo "   - Prisma Studio: npx prisma studio"
echo ""
echo "🔐 Login padrão (criado automaticamente):"
echo "   - Email: admin@expenses.com"
echo "   - Senha: admin123"
echo ""
echo "🧪 Testar login (em outro terminal):"
echo "   curl -X POST http://localhost:3000/auth/login -H \"Content-Type: application/json\" -d '{\"email\":\"admin@expenses.com\",\"password\":\"admin123\"}'"
