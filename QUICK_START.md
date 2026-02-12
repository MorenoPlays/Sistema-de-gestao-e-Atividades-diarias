# ⚡ Quick Start - Backend MPGestor

## 🚀 5 Minutos para ter tudo funcionando

### Pré-requisitos
- Node.js 18+
- PostgreSQL instalado
- Conhecimento básico de terminal

---

## 1️⃣ Preparar o Banco de Dados (2 min)

```bash
# Abrir PostgreSQL
psql -U postgres

# Dentro do psql, criar banco:
CREATE DATABASE star_step_db;
\q

# Verificar (opcional)
psql -U postgres -l | grep star_step_db
```

---

## 2️⃣ Configurar Backend (1 min)

```bash
cd backend
cp .env.example .env
```

Editar `.env` com seus dados PostgreSQL:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/star_step_db"
```

---

## 3️⃣ Instalar e Iniciar (2 min)

```bash
# Instalar dependências
npm install

# Criar tabelas
npm run prisma:migrate
# Digite: init

# Iniciar servidor
npm run dev
```

**Resultado:**
```
🚀 Servidor rodando em http://localhost:3001
```

---

## 🧪 Testar a API (copiar e colar)

### Terminal 1: Servidor rodando
```bash
npm run dev
```

### Terminal 2: Fazer teste

#### 1️⃣ Registrar
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@empresa.com",
    "password": "Senha123!",
    "companyName": "Minha Empresa"
  }' | jq
```

Salvar o `token` da resposta!

#### 2️⃣ Criar Atividade
```bash
# Substituir TOKEN pelo token acima
TOKEN="seu_token_aqui"

curl -X POST http://localhost:3001/api/activities \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-11T10:00:00Z",
    "description": "Teste de atividade",
    "hoursStart": "08:00",
    "hoursEnd": "16:00",
    "moneyIn": 5000,
    "moneyOut": 1000
  }' | jq
```

#### 3️⃣ Listar Atividades
```bash
curl -X GET http://localhost:3001/api/activities \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 📊 Verificar Banco (Prisma Studio)

```bash
# Terminal novo
npm run prisma:studio
```

Abre: `http://localhost:5555`

Aqui você vê/edita dados visualmente!

---

## 🎯 Próximo Passo

Conectar no Frontend React:

```javascript
// Em seu frontend
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const data = await response.json();
localStorage.setItem('token', data.data.token);
```

---

## 🐛 Se der erro

**Erro: ECONNREFUSED (banco não conecta)**
```bash
# Verificar se PostgreSQL está rodando
psql -U postgres -c "SELECT 1"
```

**Erro: "Port already in use"**
```bash
# Mudar porta em .env
PORT=3002
```

**Erro: "Database does not exist"**
```bash
psql -U postgres -c "CREATE DATABASE star_step_db;"
npm run prisma:migrate
```

---

## ✅ Estrutura de Permissões

| Ação | ADMIN | MANAGER | EMPLOYEE |
|------|-------|---------|----------|
| Criar usuários | ✅ | ❌ | ❌ |
| Criar salários | ✅ | ✅ | ❌ |
| Ver tudo | ✅ | ✅ | ❌ |
| Criar atividades | ✅ | ✅ | ✅ |
| Ver próprias atividades | ✅ | ✅ | ✅ |

---

## 📚 Links Úteis

- 📖 **README Completo**: `backend/README.md`
- 🔧 **Guia Instalação**: `SETUP_BACKEND.md`
- 📝 **Exemplos HTTP**: `backend/requests.http`
- 📊 **Sumário**: `BACKEND_SUMMARY.md`

---

## 🎉 Tá tudo pronto!

Seu backend REST API está 100% funcional com:
- ✅ Autenticação JWT
- ✅ Multi-tenancy (múltiplas empresas)
- ✅ Roles (Admin, Manager, Employee)
- ✅ Gestão completa de atividades
- ✅ Gestão de salários
- ✅ Relatórios

Bora integrar com o Frontend! 🚀
