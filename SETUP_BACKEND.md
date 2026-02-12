# 🚀 Guia de Setup - MPGestor Backend

## ✅ O que foi criado

Um backend profissional completo com:

✅ **Schema Prisma** com multi-tenancy
- Companies (Empresas)
- Users (Usuários com roles: ADMIN, MANAGER, EMPLOYEE)
- Activities (Atividades diárias)
- Salaries (Folha de salário)
- AuditLog (Auditoria)

✅ **Autenticação & Segurança**
- JWT tokens com expiração
- Hash bcryptjs para senhas
- Middlewares de autenticação e autorização
- Validação com Zod

✅ **Rotas Completas**
- Auth (login, register, verificar token)
- Company (CRUD da empresa)
- Users (CRUD de usuários com permissões)
- Activities (CRUD + relatórios)
- Salaries (CRUD + relatórios)

✅ **Serviços (Business Logic)**
- AuthService
- CompanyService
- UserService
- ActivityService
- SalaryService

---

## 🔧 Passo a Passo - Instalação Local

### 1. Instalar PostgreSQL

#### 🍎 macOS (Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### 🐧 Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### 🪟 Windows
- Baixar em: https://www.postgresql.org/download/windows/
- Instalar com pgAdmin incluído

### 2. Criar Banco de Dados

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco (dentro do psql)
CREATE DATABASE star_step_db;

# Ver usuário e senha (geralmente user: postgres, password: postgres ou o que você definiu na instalação)
\q
```

### 3. Configurar .env

```bash
cd backend
cp .env.example .env
```

Editar `.env`:
```env
# Importante: Adaptar com seus dados
DATABASE_URL="postgresql://postgres:password@localhost:5432/star_step_db"
JWT_SECRET="meu-super-secreto-jwt-key-2024"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"
```

### 4. Instalar Dependências

```bash
npm install
```

### 5. Criar Migrations (Criar tabelas no banco)

```bash
npm run prisma:migrate
```

Será solicitado um nome para a migration. Digite: `init`

```
✔ Enter a name for this migration … init
```

Isso vai:
- Criar as tabelas no PostgreSQL
- Gerar o Prisma Client

### 6. Iniciar o Servidor

```bash
npm run dev
```

Você verá:
```
🚀 Servidor rodando em http://localhost:3001
💾 Prisma Studio: npm run prisma:studio
```

### 7. (Opcional) Abrir Prisma Studio

Em outro terminal:
```bash
npm run prisma:studio
```

Abre interface visual em `http://localhost:5555`

---

## 🧪 Testar a API

### 1. Registrar Nova Empresa + Usuário Admin

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@empresa.com",
    "password": "Senha123!",
    "companyName": "Tech Solutions Angola",
    "phone": "+244923456789"
  }'
```

Resposta (salvar o token):
```json
{
  "success": true,
  "message": "Empresa e conta criadas com sucesso",
  "data": {
    "user": {
      "id": "clp...",
      "name": "João Silva",
      "email": "joao@empresa.com",
      "role": "ADMIN",
      "company": {
        "id": "clp...",
        "name": "Tech Solutions Angola"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Fazer Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@empresa.com",
    "password": "Senha123!"
  }'
```

### 3. Criar Usuário (usar token do admin)

```bash
curl -X POST http://localhost:3001/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Santos",
    "email": "maria@empresa.com",
    "password": "MariaSenha123!",
    "role": "EMPLOYEE"
  }'
```

### 4. Criar Atividade

```bash
curl -X POST http://localhost:3001/api/activities \
  -H "Authorization: Bearer YOUR_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-11T10:00:00Z",
    "description": "Desenvolvimento de features no portal",
    "hoursStart": "08:00",
    "hoursEnd": "16:30",
    "moneyIn": 5000.50,
    "moneyOut": 1200.00
  }'
```

### 5. Listar Atividades

```bash
curl -X GET http://localhost:3001/api/activities \
  -H "Authorization: Bearer YOUR_TOKEN_AQUI"
```

---

## 🏗️ Estrutura de Permissões

### ADMIN
✅ Criar/editar/deletar usuários
✅ Configurar empresa
✅ Criar/editar/deletar salários
✅ Ver todas as atividades
✅ Ativar/desativar usuários

### MANAGER
✅ Criar/editar/deletar salários
✅ Ver todas as atividades
✅ Relatórios

### EMPLOYEE
✅ Criar/editar suas atividades
✅ Ver suas atividades
✅ Ver seus salários
✅ Alterar sua própria senha

---

## 📱 Integração com Frontend

No seu frontend React, use assim:

```javascript
// 1. Registrar
const register = async (userData) => {
  const res = await fetch('http://localhost:3001/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  const data = await res.json();
  localStorage.setItem('token', data.data.token);
  return data;
};

// 2. Login
const login = async (email, password) => {
  const res = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  localStorage.setItem('token', data.data.token);
  return data;
};

// 3. Criar atividade
const createActivity = async (activityData) => {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:3001/api/activities', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(activityData)
  });
  return res.json();
};
```

---

## 🐛 Troubleshooting

### Erro: "ECONNREFUSED - PostgreSQL não conecta"
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql  # Linux
brew services list | grep postgres  # macOS
```

### Erro: "Database 'star_step_db' does not exist"
```bash
# Recriar banco
psql -U postgres -c "CREATE DATABASE star_step_db;"
npm run prisma:migrate
```

### Erro: "Port 3001 already in use"
```bash
# Mudar porta em .env
PORT=3002

# Ou matar processo
lsof -i :3001
kill -9 <PID>
```

### Erro: "CORS error"
Verificar `CORS_ORIGIN` no `.env` - deve ser `http://localhost:3000` se frontend está nessa porta.

---

## 📦 Próximos Passos

1. **Conectar Frontend ao Backend**
   - Substituir localStorage por chamadas API
   - Implementar axios/fetch client

2. **Adicionar Mais Funcionalidades**
   - Paginação nas listagens
   - Filtros avançados
   - Export PDF/Excel

3. **Deploy**
   - Heroku, Railway, ou Render
   - Variáveis de ambiente seguras
   - SSL/HTTPS

4. **Melhorias**
   - Rate limiting
   - Logging detalhado
   - Monitoramento com Sentry
   - Testes automatizados

---

## 📖 Documentação das Rotas Importantes

### 🔐 Auth
```
POST /api/auth/register          - Registrar novo usuário + empresa
POST /api/auth/login             - Fazer login
GET  /api/auth/me                - Obter dados do token
```

### 👥 Users
```
POST   /api/users                - Criar usuário (admin)
GET    /api/users                - Listar usuários
GET    /api/users/me             - Dados do usuário atual
GET    /api/users/:id            - Obter usuário
PUT    /api/users/:id            - Atualizar usuário
DELETE /api/users/:id            - Deletar usuário
POST   /api/users/:id/change-password  - Alterar senha
```

### 📋 Activities
```
POST   /api/activities           - Criar atividade
GET    /api/activities           - Listar (com filtros)
GET    /api/activities/:id       - Obter atividade
PUT    /api/activities/:id       - Atualizar
DELETE /api/activities/:id       - Deletar
GET    /api/activities/daily-closure/:date    - Fecho diário
GET    /api/activities/monthly-report/:month/:year - Relatório
```

### 💰 Salaries
```
POST   /api/salaries             - Criar folha
GET    /api/salaries             - Listar folhas
GET    /api/salaries/:id         - Obter folha
PUT    /api/salaries/:id         - Atualizar
DELETE /api/salaries/:id         - Deletar
GET    /api/salaries/report/:month/:year - Relatório
```

---

## ✨ Pronto!

Seu backend está completo e pronto para ser integrado ao frontend React! 🎉

Qualquer dúvida, verifique os logs do servidor ou abra um issue no repositório.
