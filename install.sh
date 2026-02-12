#!/bin/bash

echo "🎮 MPGestor - Instalação Rápida"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js não está instalado!"
    echo "Por favor, instale Node.js primeiro: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"
echo ""

# Install dependencies
echo "📦 Instalando dependências..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Instalação concluída com sucesso!"
    echo ""
    echo "🚀 Para iniciar o projeto, execute:"
    echo "   npm run dev"
    echo ""
    echo "📱 O site abrirá automaticamente em: http://localhost:3000"
    echo ""
else
    echo ""
    echo "❌ Erro na instalação. Verifique os logs acima."
    exit 1
fi
