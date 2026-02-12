# 🚀 COMECE AQUI - Star Step Game Backend

Bem-vindo! Seu backend está 100% pronto. Siga estes passos para começar em **5 minutos**.

---

## ⚡ Quick Start (5 minutos)

### 1️⃣ Instale PostgreSQL (primeira vez)

```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# Inicie o serviço
sudo service postgresql start

# Crie usuário (se necessário)
sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'postgres' SUPERUSER;"
```

### 2️⃣ Crie o banco de dados

```bash
psql -U postgres -c "CREATE DATABASE star_step_db;"
```

### 3️⃣ Configure o Backend

```bash
cd backend
cp .env.example .env
```

**Edite `.env`** com seus dados PostgreSQL:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/star_step_db"
JWT_SECRET="sua_senha_super_segura_aqui_12345"
NODE_ENV="development"
PORT=3001
```

### 4️⃣ Instale dependências e rode migrations

```bash
npm install
npm run prisma:migrate
# Digite: init (nome da migration)
```

### 5️⃣ Inicie o servidor

```bash
npm run dev
```

✅ **Pronto!** Servidor rodando em `http://localhost:3001`

---

## 📖 Próximos Passos

### Testar a API

Use o arquivo `backend/requests.http` com a extensão REST Client do VS Code:
- Instale: **REST Client** by Huachao Mao
- Abra: `backend/requests.http`
- Clique em "Send Request" nos exemplos

### Ou use cURL

```bash
# 1. Registre uma empresa
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Minha Empresa",
    "email": "admin@empresa.com",
    "password": "senha123"
  }'

# Resposta:
# {
#   "token": "eyJhbGciOiJIUzI1NiIs...",
#   "user": { "id": "...", "email": "admin@empresa.com", "role": "ADMIN" }
# }

# 2. Faça login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@empresa.com",
    "password": "senha123"
  }'

# 3. Obtenha dados do usuário
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Ou use Postman

1. Crie um novo workspace em `postman.com`
2. Importe `backend/requests.http`
3. Configure o header: `Authorization: Bearer {seu_token}`

---

## 📚 Documentação Completa

Leia na seguinte ordem:

1. **[QUICK_START.md](./QUICK_START.md)** ⚡
   - Setup em 5 minutos

2. **[SETUP_BACKEND.md](./SETUP_BACKEND.md)** 🔧
   - Instalação detalhada com troubleshooting

3. **[ARCHITECTURE.md](./ARCHITECTURE.md)** 🏗️
   - Diagramas e fluxos

4. **[backend/README.md](./backend/README.md)** 📖
   - Documentação completa da API

5. **[DOCUMENTACAO.md](./DOCUMENTACAO.md)** 📚
   - Índice de toda documentação

---

## 🔌 Endpoints Disponíveis

### Autenticação
- `POST /api/auth/register` - Registrar empresa + admin
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/me` - Dados do usuário autenticado

### Empresa
- `GET /api/company` - Dados da empresa
- `PUT /api/company` - Editar empresa
- `GET /api/company/stats` - Estatísticas
- `GET /api/company/users` - Usuários da empresa

### Usuários
- `POST /api/users` - Criar usuário
- `GET /api/users` - Listar usuários
- `GET /api/users/:id` - Obter usuário
- `PUT /api/users/:id` - Editar usuário
- `DELETE /api/users/:id` - Deletar usuário
- `POST /api/users/:id/change-password` - Trocar senha
- `POST /api/users/:id/deactivate` - Desativar
- `POST /api/users/:id/activate` - Ativar

### Atividades
- `POST /api/activities` - Criar atividade
- `GET /api/activities` - Listar atividades
- `GET /api/activities/:id` - Obter atividade
- `PUT /api/activities/:id` - Editar atividade
- `DELETE /api/activities/:id` - Deletar atividade
- `GET /api/activities/daily-closure/:date` - Relatório diário
- `GET /api/activities/monthly-report/:month/:year` - Relatório mensal

### Salários
- `POST /api/salaries` - Criar salário
- `GET /api/salaries` - Listar salários
- `GET /api/salaries/:id` - Obter salário
- `PUT /api/salaries/:id` - Editar salário
- `DELETE /api/salaries/:id` - Deletar salário
- `GET /api/salaries/report/:month/:year` - Relatório mensal

---

## 🔐 Permissões por Papel

### ADMIN
- ✅ Criar/deletar usuários
- ✅ Configurar empresa
- ✅ Ver tudo
- ✅ Gerar relatórios
- ✅ Criar/deletar salários
- ✅ Ativar/desativar usuários

### MANAGER
- ✅ Criar salários
- ✅ Ver atividades de todos
- ✅ Gerar relatórios
- ✅ Criar/editar atividades

### EMPLOYEE
- ✅ Criar atividades próprias
- ✅ Ver próprias atividades
- ✅ Ver próprios salários
- ✅ Alterar própria senha

---

## 🆘 Problemas Comuns

### "Conexão recusada" ao PostgreSQL

```bash
# Verifique se PostgreSQL está rodando
sudo service postgresql status

# Inicie se necessário
sudo service postgresql start

# Verifique DATABASE_URL em .env
echo $DATABASE_URL
```

### "Migration failed"

```bash
# Reset completo (cuidado: deleta dados!)
npm run prisma:reset

# Depois rode migration novamente
npm run prisma:migrate
```

### Porta 3001 já em uso

```bash
# Mude a porta em .env
PORT=3002

# Ou libere a porta
lsof -i :3001
kill -9 <PID>
```

---

## 🛠️ Comandos Úteis

```bash
# Abrir Prisma Studio (visualizar dados)
npm run prisma:studio

# Verificar status das migrations
npm run prisma:status

# Reset do banco (development only)
npm run prisma:reset

# Iniciar servidor em desenvolvimento
npm run dev

# Build para produção
npm run build

# Ver dados do banco graficamente
npm run studio
```

---

## 🚀 Próximo: Integrar com Frontend

Quando estiver pronto, leia **[SETUP_BACKEND.md](./SETUP_BACKEND.md)** na seção "Integração com Frontend" para conectar o React ao backend.

---

## ✅ Checklist

- [ ] PostgreSQL instalado e rodando
- [ ] Banco de dados criado
- [ ] `.env` configurado
- [ ] `npm install` executado
- [ ] `npm run prisma:migrate` executado
- [ ] `npm run dev` rodando
- [ ] API respondendo em http://localhost:3001
- [ ] Testou registro de empresa
- [ ] Testou login
- [ ] Leu SETUP_BACKEND.md

---

## 📞 Suporte

Se encontrar problemas:

1. Leia [SETUP_BACKEND.md](./SETUP_BACKEND.md) - Seção "Troubleshooting"
2. Verifique os logs: `npm run dev` (sem &, para ver erros)
3. Examine o arquivo `.env` - Verifique DATABASE_URL
4. Reset banco: `npm run prisma:reset`

---

## 🎉 Parabéns!

Seu backend está pronto para produção!

**Próximos passos:**
1. Testar cada endpoint
2. Integrar com frontend
3. Deploy em produção

👉 **[Leia QUICK_START.md para mais detalhes](./QUICK_START.md)**

---

*Star Step Game - Sistema de Gestão de Atividades e Salários*
*Criado com ❤️ em TypeScript + Express + PostgreSQL*
