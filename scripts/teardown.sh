#!/bin/bash

echo "🛑 Encerrando containers da API de Despesas..."

# Funções de output universais
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

# Verificar Docker
if ! command -v docker >/dev/null 2>&1; then
    print_error "Docker não está instalado!"
    exit 1
fi

if ! command -v docker-compose >/dev/null 2>&1; then
    print_error "Docker Compose não está instalado!"
    exit 1
fi

# Mostrar containers ativos antes de parar
print_status "Containers ativos:"
docker-compose ps 2>/dev/null || echo "Nenhum container ativo encontrado"

# Parar todos os containers (desenvolvimento e teste)
print_status "Parando todos os containers..."
docker-compose down

# Verificar se deve limpar volumes
if [ "$1" = "--clean" ] || [ "$1" = "-c" ]; then
    print_warning "Removendo volumes (dados serão perdidos)..."
    docker-compose down -v

    # Remover volumes específicos se existirem
    docker volume rm expenses-api_postgres_data 2>/dev/null && print_status "Volume de desenvolvimento removido" || true
    docker volume rm expenses-api_postgres_test_data 2>/dev/null && print_status "Volume de teste removido" || true

    print_warning "Todos os dados foram removidos!"
else
    print_status "Volumes preservados (dados mantidos)"
    print_status "Use 'npm run teardown:clean' para remover dados"
fi

# Mostrar containers após parar
print_status "Verificando containers após encerramento..."
if [ "$(docker-compose ps -q)" ]; then
    print_warning "Alguns containers ainda estão ativos:"
    docker-compose ps
else
    print_success "Todos os containers foram encerrados!"
fi

# Verificar volumes existentes
print_status "Volumes existentes relacionados ao projeto:"
docker volume ls | grep expenses 2>/dev/null || echo "Nenhum volume encontrado"

print_success "Encerramento concluído!"

echo ""
echo "============================================"
echo "🛑 CONTAINERS ENCERRADOS"
echo "============================================"
echo ""
echo "📋 Para reiniciar:"
echo "   npm run setup      # Setup desenvolvimento"
echo "   npm run setup:test # Setup teste"
echo "   npm run dev        # Desenvolvimento rápido"
echo ""
echo "🧪 Para limpar tudo (remove dados):"
echo "   npm run teardown:clean"
