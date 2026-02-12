# 🔗 Guia de Integração Frontend + Backend

## Visão Geral

Seu frontend foi atualizado para se comunicar com o backend Express.js. Esta documentação detalha como usar a integração.

---

## 📦 Mudanças Realizadas

### 1. Novo Arquivo de API (`src/utils/api.js`)

Criamos um serviço centralizado de API com:
- **authService** - Autenticação (login, register, logout)
- **companyService** - Dados da empresa
- **userService** - Gerenciamento de usuários
- **activityService** - Gestão de atividades
- **salaryService** - Gestão de salários
- **Utilitários** - Token, autenticação, chamadas HTTP

### 2. Componentes Atualizados

- **Login.jsx** - Integrado com `authService.login()`
- **Register.jsx** - Integrado com `authService.register()`
- **App.jsx** - Verificação de autenticação ao carregar
- **Header.jsx** - Usa novo service

### 3. Configuração

- **`.env.local`** - Variável `VITE_API_URL` apontando para backend

### 4. Hook Reutilizável (`src/utils/hooks.js`)

- `useApi()` - Para operações individuais
- `useApiList()` - Para listas paginadas

---

## 🚀 Como Usar

### Autenticação

```jsx
import { authService } from '../utils/api';

// Registrar nova empresa
try {
  const result = await authService.register(companyName, email, password);
  console.log(result.user);
} catch (err) {
  console.error(err.message);
}

// Fazer login
try {
  const result = await authService.login(email, password);
  console.log(result.user);
} catch (err) {
  console.error(err.message);
}

// Obter usuário autenticado
const user = await authService.getCurrentUser();

// Fazer logout
authService.logout();

// Verificar se está autenticado
if (authService.isAuthenticated()) {
  // ...
}
```

### Empresa

```jsx
import { companyService } from '../utils/api';

// Obter dados da empresa
const company = await companyService.getCompany();

// Atualizar empresa
await companyService.updateCompany({
  name: 'Nova Nome',
  email: 'novo@email.com',
});

// Obter estatísticas
const stats = await companyService.getStats();
// { userCount, activityCount, totalBalance }

// Listar usuários
const users = await companyService.getUsers(page, limit);
```

### Usuários

```jsx
import { userService } from '../utils/api';

// Criar usuário
await userService.createUser({
  email: 'novo@email.com',
  password: 'senha123',
  name: 'João Silva',
  role: 'EMPLOYEE', // ADMIN, MANAGER, EMPLOYEE
});

// Listar usuários
const users = await userService.listUsers(page, limit);

// Obter um usuário
const user = await userService.getUser(userId);

// Atualizar usuário
await userService.updateUser(userId, {
  name: 'Novo Nome',
  role: 'MANAGER',
});

// Deletar usuário
await userService.deleteUser(userId);

// Mudar senha
await userService.changePassword(userId, oldPassword, newPassword);

// Desativar/Ativar
await userService.deactivateUser(userId);
await userService.activateUser(userId);
```

### Atividades

```jsx
import { activityService } from '../utils/api';

// Criar atividade
await activityService.createActivity({
  date: '2026-02-11',
  description: 'Trabalhei na feature X',
  hoursStart: '09:00',
  hoursEnd: '17:00',
  moneyIn: 100,
  moneyOut: 50,
});

// Listar atividades com filtros
const activities = await activityService.listActivities({
  startDate: '2026-02-01',
  endDate: '2026-02-28',
  userId: 'user-id', // opcional
  page: 1,
  limit: 10,
});

// Obter uma atividade
const activity = await activityService.getActivity(activityId);

// Atualizar atividade
await activityService.updateActivity(activityId, {
  description: 'Nova descrição',
  moneyIn: 150,
});

// Deletar atividade
await activityService.deleteActivity(activityId);

// Relatórios
const dailyReport = await activityService.getDailyClosureReport('2026-02-11');
const monthlyReport = await activityService.getMonthlyReport(2, 2026);
```

### Salários

```jsx
import { salaryService } from '../utils/api';

// Criar salário
await salaryService.createSalary({
  userId: 'user-id',
  month: 2,
  year: 2026,
  baseSalary: 3000,
  deductions: 500,
});

// Listar salários
const salaries = await salaryService.listSalaries({
  month: 2,
  year: 2026,
  page: 1,
  limit: 10,
});

// Obter um salário
const salary = await salaryService.getSalary(salaryId);

// Atualizar salário
await salaryService.updateSalary(salaryId, {
  baseSalary: 3500,
  deductions: 600,
});

// Deletar salário
await salaryService.deleteSalary(salaryId);

// Relatórios
const report = await salaryService.getMonthlyReport(2, 2026);
const userSalaries = await salaryService.getUserSalaries(userId);
```

---

## 🪝 Usando Hooks

### useApi()

Para operações simples:

```jsx
import { useApi } from '../utils/hooks';
import { activityService } from '../utils/api';

function MyComponent() {
  const { loading, error, request } = useApi();

  const handleCreate = async () => {
    try {
      const result = await request(() =>
        activityService.createActivity({
          date: '2026-02-11',
          description: 'Nova atividade',
          moneyIn: 100,
          moneyOut: 0,
        })
      );
      console.log('Criado:', result);
    } catch (err) {
      // Erro já foi setado em error
    }
  };

  return (
    <div>
      <button onClick={handleCreate} disabled={loading}>
        {loading ? 'Criando...' : 'Criar'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

### useApiList()

Para listas com paginação:

```jsx
import { useApiList } from '../utils/hooks';
import { activityService } from '../utils/api';

function ActivitiesList() {
  const { items, loading, error, page, totalPages, setPage, refresh } =
    useApiList((page) =>
      activityService.listActivities({
        page,
        limit: 10,
      })
    );

  if (loading) return <p>Carregando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <div>
        {items.map((item) => (
          <div key={item.id}>{item.description}</div>
        ))}
      </div>

      {/* Paginação */}
      <div>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Anterior
        </button>
        <span>
          Página {page} de {totalPages}
        </span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
          Próxima
        </button>
      </div>
    </div>
  );
}
```

---

## 🔐 Tratamento de Erros

Todos os serviços lançam erros que podem ser capturados:

```jsx
try {
  await authService.login(email, password);
} catch (err) {
  // err.message contém a mensagem de erro
  console.error(err.message);
}
```

Tipos de erro comuns:
- `"Credenciais inválidas"` - Login com email/senha incorretos
- `"Email já cadastrado"` - Email já existe
- `"Usuário não autorizado"` - Sem permissão
- `"Recurso não encontrado"` - ID inválido
- `"Erro na requisição"` - Erro genérico

---

## 🌐 Variáveis de Ambiente

### Frontend (`.env.local`)

```env
# URL da API backend
VITE_API_URL=http://localhost:3001/api

# Para produção
# VITE_API_URL=https://api.seudominio.com/api
```

### Backend (`.env`)

```env
# Permite requisições do frontend
CORS_ORIGIN=http://localhost:3000

# Para produção
# CORS_ORIGIN=https://www.seudominio.com
```

---

## 📱 Estrutura de Componentes Recomendada

### Para Formulários

```jsx
import { useState } from 'react';
import { useApi } from '../utils/hooks';

function MyForm() {
  const [formData, setFormData] = useState({ /* ... */ });
  const { loading, error, request } = useApi();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await request(() => activityService.createActivity(formData));
      // Sucesso
    } catch (err) {
      // Erro já em state
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      {/* Inputs */}
      <button disabled={loading}>{loading ? 'Enviando...' : 'Enviar'}</button>
    </form>
  );
}
```

### Para Listas

```jsx
import { useApiList } from '../utils/hooks';

function ItemsList() {
  const { items, loading, error, refresh } = useApiList(
    (page) => activityService.listActivities({ page })
  );

  return (
    <div>
      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {items.map((item) => (
        <ItemCard key={item.id} item={item} onUpdate={refresh} />
      ))}
    </div>
  );
}
```

---

## ✅ Checklist de Integração

- [ ] `.env.local` configurado com `VITE_API_URL`
- [ ] Backend rodando em http://localhost:3001
- [ ] Login funcionando
- [ ] Registro funcionando
- [ ] Token sendo salvo no localStorage
- [ ] Requisições autenticadas incluem header Authorization
- [ ] Erros sendo capturados e exibidos
- [ ] Pages de Activities funcionando
- [ ] Pages de Salary funcionando
- [ ] Logout funcionando

---

## 🐛 Troubleshooting

### "CORS error"

**Problema:** `Access-Control-Allow-Origin` error

**Solução:**
1. Verifique se backend está rodando
2. Verifique `CORS_ORIGIN` em `.env` do backend
3. Reinicie backend após mudança

```env
# backend/.env
CORS_ORIGIN=http://localhost:3000
```

### "Token inválido"

**Problema:** 401 Unauthorized

**Solução:**
1. Faça login novamente
2. Token expirou (7 dias)
3. Verifique token em localStorage: `localStorage.getItem('token')`

### "API retorna 500"

**Problema:** Erro do servidor

**Solução:**
1. Verifique logs do backend: `npm run dev`
2. Verifique DATABASE_URL está correto
3. Verifique migrations foram executadas: `npm run prisma:migrate`

### "Dados não atualizam"

**Problema:** Componente não atualiza após criar/editar

**Solução:**
```jsx
// Use refresh do hook
const { refresh } = useApiList(...);

// Após criar/editar
await activityService.createActivity(data);
refresh(); // Recarrega lista
```

---

## 📚 Exemplos Completos

### Página de Atividades

```jsx
import { useState } from 'react';
import { useApiList } from '../utils/hooks';
import { activityService } from '../utils/api';

export default function Activities() {
  const { items, loading, error, refresh } = useApiList((page) =>
    activityService.listActivities({ page, limit: 10 })
  );

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    moneyIn: 0,
    moneyOut: 0,
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await activityService.createActivity(formData);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        moneyIn: 0,
        moneyOut: 0,
      });
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <form onSubmit={handleCreate}>
        <input
          type="date"
          value={formData.date}
          onChange={(e) =>
            setFormData({ ...formData, date: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Descrição"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Entrada"
          value={formData.moneyIn}
          onChange={(e) =>
            setFormData({ ...formData, moneyIn: Number(e.target.value) })
          }
        />
        <input
          type="number"
          placeholder="Saída"
          value={formData.moneyOut}
          onChange={(e) =>
            setFormData({ ...formData, moneyOut: Number(e.target.value) })
          }
        />
        <button type="submit">Criar Atividade</button>
      </form>

      <div>
        {items.map((item) => (
          <div key={item.id}>
            <p>{item.date} - {item.description}</p>
            <p>Entrada: {item.moneyIn} | Saída: {item.moneyOut}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🎓 Próximos Passos

1. Atualize `src/pages/Activities.jsx` para usar `activityService`
2. Atualize `src/pages/Salary.jsx` para usar `salaryService`
3. Adicione páginas de gerenciamento de usuários
4. Implemente filtros e busca
5. Adicione confirmação antes de deletar
6. Teste em produção

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique backend está rodando: `npm run dev` na pasta `backend/`
2. Verifique `.env.local` tem `VITE_API_URL` correto
3. Veja erros no console (F12)
4. Veja erros no backend
5. Consulte `backend/README.md` para API completa

---

Integração concluída! 🎉
