# 🚀 Star Step Game Backend

Backend REST API para o sistema de gestão de atividades diárias e folha de salário.

## 📋 Funcionalidades

### 🔐 Autenticação
- Registro de novo usuário + empresa
- Login com JWT
- Proteção de rotas com token

### 🏢 Gestão de Empresas (Multi-tenancy)
- Criação de empresa durante registro
- Configurações da empresa (nome, email, logo, etc.)
- Isolamento de dados por empresa

### 👥 Gestão de Usuários
- Criação de usuários pela empresa (apenas admin)
- Roles: ADMIN, MANAGER, EMPLOYEE
- Ativação/desativação de usuários
- Alteração de senha
- Listagem de usuários

### 📋 Gestão de Atividades
- Criar/editar/deletar atividades
- Cálculo automático de semana
- Movimentação de dinheiro (entrada/saída em Kz)
- Filtro por data e usuário
- Relatório diário (fecho de caixa)
- Relatório mensal

### 💰 Gestão de Salários
- Criação de folhas de salário
- Cálculo automático de salário líquido
- Relatório mensal de salários
- Histórico de salários por usuário

## 🛠️ Tecnologias

- **Express.js** - Framework HTTP
- **TypeScript** - Tipagem estática
- **Prisma** - ORM para database
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação com token
- **bcryptjs** - Hash de senhas
- **Zod** - Validação de schemas
- **CORS** - Compartilhamento de recursos

## 📦 Instalação

### 1. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Editar `.env` e adicionar sua DATABASE_URL do PostgreSQL:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/star_step_db"
JWT_SECRET="seu-super-secreto-jwt-key"
PORT=3001
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Criar banco de dados

```bash
# Criar migration inicial
npm run prisma:migrate

# Nome sugerido: init
```

Ou resetar banco (apenas em desenvolvimento):

```bash
npm run prisma:migrate
```

### 4. Iniciar servidor

```bash
# Modo desenvolvimento (watch mode)
npm run dev

# Modo produção
npm run build
npm start
```

O servidor estará disponível em `http://localhost:3001`

## 🔌 Endpoints da API

### 🔐 Autenticação

```
POST   /api/auth/register    - Registrar nova empresa + usuário
POST   /api/auth/login       - Fazer login
GET    /api/auth/me          - Obter dados do token
```

### 🏢 Empresa

```
GET    /api/company           - Obter informações da empresa
PUT    /api/company           - Atualizar empresa (admin)
GET    /api/company/stats     - Obter estatísticas
GET    /api/company/users     - Listar usuários
```

### 👥 Usuários

```
POST   /api/users             - Criar usuário (admin)
GET    /api/users             - Listar usuários
GET    /api/users/me          - Dados do usuário atual
GET    /api/users/:id         - Obter usuário específico
PUT    /api/users/:id         - Atualizar usuário
DELETE /api/users/:id         - Deletar usuário (admin)
POST   /api/users/:id/change-password  - Alterar senha
POST   /api/users/:id/deactivate     - Desativar usuário (admin)
POST   /api/users/:id/activate       - Ativar usuário (admin)
```

### 📋 Atividades

```
POST   /api/activities                  - Criar atividade
GET    /api/activities                  - Listar atividades (com filtros)
GET    /api/activities/:id              - Obter atividade
PUT    /api/activities/:id              - Atualizar atividade
DELETE /api/activities/:id              - Deletar atividade
GET    /api/activities/user/:userId     - Atividades do usuário
GET    /api/activities/daily-closure/:date   - Fecho diário
GET    /api/activities/monthly-report/:month/:year - Relatório mensal
```

### 💰 Salários

```
POST   /api/salaries                    - Criar folha de salário (admin/manager)
GET    /api/salaries                    - Listar folhas
GET    /api/salaries/:id                - Obter folha específica
PUT    /api/salaries/:id                - Atualizar folha (admin/manager)
DELETE /api/salaries/:id                - Deletar folha (admin)
GET    /api/salaries/user/:userId       - Folhas do usuário
GET    /api/salaries/report/:month/:year - Relatório mensal
```

## 📚 Exemplos de Uso

### Registrar

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "senha123",
    "companyName": "Tech Solutions",
    "phone": "+244923456789"
  }'
```

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

### Criar Atividade

```bash
curl -X POST http://localhost:3001/api/activities \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-11T10:00:00Z",
    "description": "Desenvolvimento de features",
    "hoursStart": "08:00",
    "hoursEnd": "16:00",
    "moneyIn": 5000,
    "moneyOut": 1500
  }'
```

### Criar Usuário (admin)

```bash
curl -X POST http://localhost:3001/api/users \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Santos",
    "email": "maria@example.com",
    "password": "senha456",
    "role": "EMPLOYEE"
  }'
```

## 🏗️ Estrutura do Projeto

```
backend/
├── src/
│   ├── index.ts                 # Entrada da aplicação
│   ├── lib/
│   │   └── prisma.ts           # Instância do Prisma
│   ├── middleware/
│   │   └── auth.ts             # Middlewares de auth
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── company.routes.ts
│   │   ├── user.routes.ts
│   │   ├── activity.routes.ts
│   │   └── salary.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── company.service.ts
│   │   ├── user.service.ts
│   │   ├── activity.service.ts
│   │   └── salary.service.ts
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   └── validators/
│       └── index.ts            # Validações com Zod
├── prisma/
│   ├── schema.prisma           # Schema do banco
│   └── migrations/             # Histórico de migrations
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🗄️ Modelo de Dados

### Company
- id, name, email, phone, address, city, country, logoUrl
- currency, timezone

### User
- id, email, password, name, phone, avatar
- companyId, role (ADMIN/MANAGER/EMPLOYEE), isActive

### Activity
- id, date, description, weekNumber
- hoursStart, hoursEnd
- moneyIn, moneyOut, balance
- companyId, userId

### Salary
- id, month, year
- baseSalary, deductions, netSalary
- companyId, userId

## 🔒 Segurança

- ✅ Senhas com hash bcryptjs (10 rounds)
- ✅ JWT com expiração (padrão: 7 dias)
- ✅ Validação de schemas com Zod
- ✅ CORS configurável
- ✅ Isolamento de dados por empresa
- ✅ Verificação de permissões por role

## 🚀 Próximos Passos

1. Adicionar paginação nos endpoints de listagem
2. Implementar rate limiting
3. Adicionar logs detalhados
4. Testes automatizados
5. Documentação Swagger
6. Webhooks para notificações
7. Export PDF/Excel de relatórios
8. Backup automático

## 📝 Licença

MIT

## 👨‍💻 Autor

MorenoPlays - Star Step Game
