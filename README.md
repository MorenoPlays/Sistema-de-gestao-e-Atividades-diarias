# 🎮 Star Step Game - Sistema de Gestão de Atividades

> **Sistema completo de gestão de atividades diárias e folha de pagamento**  
> Desenvolvido em React + Express + PostgreSQL

## 🚀 Funcionalidades

### 🔐 Autenticação
- **Login** - Autenticação com JWT seguro
- **Cadastro** - Registrar nova empresa e admin user
- **Persistência** - Token salvo em localStorage
- **Proteção** - Endpoint autenticação verificada

### 📋 Atividades Diárias
- Registro de atividades com data, semana e expediente
- Controle de entrada e saída de dinheiro
- Cálculo automático de saldo/balance
- Descrição detalhada das atividades
- Histórico completo com filtros
- Relatórios diários e mensais
- API backend para persistência

### 💰 Folha de Salário
- Geração profissional de folhas de pagamento
- Campos para mês, ano e dados do funcionário
- Cálculo automático de salário líquido
- Histórico completo de pagamentos
- Relatórios mensais
- API backend para persistência

### 👥 Gestão de Usuários
- **Roles:** Admin, Manager, Employee
- **Permissões:** Baseadas em papéis
- **Criação:** Admins podem criar novos usuários
- **Gestão:** Ativar/desativar usuários

## 📦 Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca JavaScript para interfaces
- **Vite** - Build tool moderno
- **Tailwind CSS** - Framework CSS
- **Fetch API** - Cliente HTTP

### Backend
- **Express.js** - Framework web Node.js
- **TypeScript** - Type safety
- **PostgreSQL** - Banco de dados
- **Prisma** - ORM
- **JWT** - Autenticação
- **bcryptjs** - Hashing de senhas
- **Zod** - Validação

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- PostgreSQL 15+
- npm ou yarn

### Quick Start (5 minutos)

**Opção 1: Setup Automático**
```bash
chmod +x setup.sh
./setup.sh
```

**Opção 2: Setup Manual**

3. **Inicie o servidor de desenvolvimento:**
```bash
npm run dev
```

4. **Acesse no navegador:**
```
http://localhost:3000
```

## 📱 Como Usar

### 1. Primeiro Acesso
- Clique em "Cadastre-se"
- Preencha nome, email e senha
- Faça login com suas credenciais

### 2. Registrar Atividades
- Acesse a aba "Atividades Diárias"
- Preencha os campos do formulário
- Clique em "Adicionar Atividade"
- Visualize o histórico na tabela abaixo

### 3. Gerar Folha de Salário
- Acesse a aba "Folha de Salário"
- Preencha os dados do funcionário
- Clique em "Gerar Folha de Salário"
- Use o botão "Imprimir" para salvar ou imprimir

## 🏗️ Estrutura do Projeto

```
star-step-app/
├── src/
│   ├── components/         # Componentes reutilizáveis
│   │   ├── Login.jsx      # Tela de login
│   │   ├── Register.jsx   # Tela de cadastro
│   │   └── Header.jsx     # Cabeçalho da aplicação
│   ├── pages/             # Páginas principais
│   │   ├── Activities.jsx # Gestão de atividades
│   │   └── Salary.jsx     # Folha de salário
│   ├── utils/             # Utilitários e helpers
│   │   └── auth.js        # Serviços de autenticação
│   ├── App.jsx            # Componente principal
│   ├── main.jsx           # Ponto de entrada
│   └── index.css          # Estilos globais
├── index.html             # HTML base
├── package.json           # Dependências
├── vite.config.js         # Configuração Vite
└── tailwind.config.js     # Configuração Tailwind
```

## 🎨 Design e UX

- **Interface Moderna** - Design clean e profissional
- **Responsivo** - Funciona em desktop, tablet e mobile
- **Animações Suaves** - Transições e micro-interações
- **Cores Personalizadas** - Paleta purple/indigo
- **Tipografia** - Google Font Urbanist

## 💾 Armazenamento de Dados

Os dados são armazenados localmente no navegador usando `localStorage`:

- **Usuários:** `star_step_users`
- **Sessão:** `star_step_current_user`
- **Atividades:** `star_step_activities`

**Nota:** Em produção, recomenda-se usar um backend real com banco de dados e autenticação segura.

## 🖨️ Impressão

A aplicação possui suporte para impressão otimizada:
- Folhas de salário formatadas para impressão
- Remoção de elementos desnecessários ao imprimir
- Layout profissional em papel A4

## 🔒 Segurança

**Importante:** Esta é uma versão de demonstração. Para uso em produção:
- Implementar hash de senhas (bcrypt, argon2)
- Usar autenticação JWT ou sessões seguras
- Migrar para banco de dados real
- Adicionar HTTPS
- Implementar rate limiting
- Validação de dados no backend

## 📄 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 🤝 Contribuindo

Sugestões e melhorias são bem-vindas!

## 📝 Licença

© 2026 Star Step Game. Todos os direitos reservados.

---

**Desenvolvido com ❤️ usando React + Tailwind CSS**
