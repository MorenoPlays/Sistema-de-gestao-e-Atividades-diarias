#!/bin/bash

# Script de Setup Completo - MPGestor
# Executa este script para setup local completo

set -e  # Exit on error

echo "🚀 MPGestor - Setup Completo"
echo "=================================="
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir com cor
print_step() {
  echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

# 1. Verificar dependências
print_step "Verificando dependências..."

if ! command -v node &> /dev/null; then
  print_warning "Node.js não está instalado"
  echo "Instale em: https://nodejs.org/"
  exit 1
fi

if ! command -v psql &> /dev/null; then
  print_warning "PostgreSQL não está instalado"
  echo "Instale em: https://www.postgresql.org/download/"
  exit 1
fi

print_success "Dependências encontradas"
echo "  Node: $(node --version)"
echo "  npm: $(npm --version)"
echo "  PostgreSQL: $(psql --version)"
echo ""

# 2. Criar banco de dados
print_step "Criando banco de dados..."

if psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'star_step_db'" | grep -q 1; then
  print_warning "Banco 'star_step_db' já existe"
else
  psql -U postgres -c "CREATE DATABASE star_step_db;"
  print_success "Banco de dados criado"
fi
echo ""

# 3. Configurar backend
print_step "Configurando backend..."
cd backend

if [ ! -f .env ]; then
  cp .env.example .env
  print_success "Arquivo .env criado"
  print_warning "Edite backend/.env com suas credenciais PostgreSQL"
else
  print_warning "Arquivo .env já existe"
fi

# 4. Instalar dependências backend
print_step "Instalando dependências do backend..."
npm install
print_success "Dependências instaladas"
echo ""

# 5. Executar migrations
print_step "Executando migrations do banco..."
npm run prisma:migrate -- --name init 2>/dev/null || echo "i
nit" | npm run prisma:migrate
print_success "Migrations executadas"
echo ""

# 6. Voltar à raiz
cd ..

# 7. Configurar frontend
print_step "Configurando frontend..."

if [ ! -f .env.local ]; then
  cat > .env.local << EOF
VITE_API_URL=http://localhost:3001/api
EOF
  print_success "Arquivo .env.local criado"
else
  print_warning "Arquivo .env.local já existe"
fi

# 8. Instalar dependências frontend
print_step "Instalando dependências do frontend..."
npm install
print_success "Dependências instaladas"
echo ""

# Resumo
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║         ✅ Setup Completo com Sucesso!                   ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "📝 Próximos Passos:"
echo ""
echo "1️⃣  Inicie o Backend (Terminal 1):"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "2️⃣  Inicie o Frontend (Terminal 2):"
echo "   npm run dev"
echo ""
echo "3️⃣  Abra no navegador:"
echo "   http://localhost:3000"
echo ""
echo "🔗 Backend estará em:"
echo "   http://localhost:3001"
echo ""
echo "📊 Visualizar dados:"
echo "   cd backend && npm run prisma:studio"
echo ""
echo "📖 Documentação:"
echo "   - COMECE_AQUI.md"
echo "   - INTEGRACAO.md"
echo "   - SETUP_BACKEND.md"
echo ""
