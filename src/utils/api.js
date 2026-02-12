/**
 * API Service - Frontend
 * Integração com Backend Star Step Game
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// ============================================================================
// UTILITÁRIOS
// ============================================================================

/**
 * Faz requisições autenticadas à API
 */
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
    console.log("📤 Enviando requisição com token para:", endpoint);
  } else {
    console.warn("⚠️ Nenhum token encontrado para:", endpoint);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    let msg = error.message || "Erro na requisição";
    // incluir detalhes de validação do backend quando disponíveis
    const details = error.error || error.errors || error.details;
    if (details) {
      try {
        const summary = Array.isArray(details) ? details.map(d => d.message || d).join('; ') : JSON.stringify(details);
        msg = `${msg}: ${summary}`;
      } catch (e) {
        /* ignore */
      }
    }

    throw new Error(msg);
  }

  return response.json();
}

/**
 * Armazena token no localStorage
 */
function setToken(token) {
  console.log("🔐 Armazenando token:", token ? `${token.substring(0, 20)}...` : "null");
  localStorage.setItem("token", token);
}

/**
 * Remove token do localStorage
 */
function removeToken() {
  localStorage.removeItem("token");
}

/**
 * Obtém token armazenado
 */
function getToken() {
  return localStorage.getItem("token");
}

/**
 * Verifica se usuário está autenticado
 */
function isAuthenticated() {
  return !!getToken();
}

// ============================================================================
// AUTENTICAÇÃO
// ============================================================================

const authService = {
  /**
   * Registra uma nova empresa e cria admin
   */
  async register(name, companyName, email, password) {
    const response = await apiCall("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, companyName, email, password }),
    });
    // Backend retorna: { success, message, data: { user, token } }
    const token = response.data?.token || response.token;
    if (token) {
      setToken(token);
      console.log("✅ Token salvo com sucesso após register");
    } else {
      console.error("❌ Token não encontrado na resposta:", response);
    }
    return response.data || response;
  },

  /**
   * Faz login
   */
  async login(email, password) {
    const response = await apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    // Backend retorna: { success, message, data: { user, token } }
    const token = response.data?.token || response.token;
    if (token) {
      setToken(token);
      console.log("✅ Token salvo com sucesso após login");
    } else {
      console.error("❌ Token não encontrado na resposta:", response);
    }
    return response.data || response;
  },

  /**
   * Obtém dados do usuário autenticado
   */
  async getCurrentUser() {
    return apiCall("/auth/me");
  },

  /**
   * Faz logout
   */
  logout() {
    removeToken();
  },

  /**
   * Verifica se usuário está autenticado
   */
  isAuthenticated() {
    return isAuthenticated();
  },
};

// ============================================================================
// EMPRESA
// ============================================================================

const companyService = {
  /**
   * Obtém dados da empresa
   */
  async getCompany() {
    return apiCall("/company");
  },

  /**
   * Atualiza dados da empresa
   */
  async updateCompany(data) {
    return apiCall("/company", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Obtém estatísticas da empresa
   */
  async getStats() {
    return apiCall("/company/stats");
  },

  /**
   * Lista usuários da empresa
   */
  async getUsers(page = 1, limit = 10) {
    return apiCall(`/company/users?page=${page}&limit=${limit}`);
  },
};

// ============================================================================
// USUÁRIOS
// ============================================================================

const userService = {
  /**
   * Cria novo usuário
   */
  async createUser(userData) {
    return apiCall("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  /**
   * Lista todos os usuários da empresa
   */
  async listUsers(page = 1, limit = 10) {
    return apiCall(`/users?page=${page}&limit=${limit}`);
  },

  /**
   * Obtém um usuário específico
   */
  async getUser(id) {
    return apiCall(`/users/${id}`);
  },

  /**
   * Atualiza dados do usuário
   */
  async updateUser(id, userData) {
    return apiCall(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },

  /**
   * Deleta usuário
   */
  async deleteUser(id) {
    return apiCall(`/users/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Altera senha do usuário
   */
  async changePassword(id, oldPassword, newPassword) {
    return apiCall(`/users/${id}/change-password`, {
      method: "POST",
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  },

  /**
   * Desativa usuário
   */
  async deactivateUser(id) {
    return apiCall(`/users/${id}/deactivate`, {
      method: "POST",
    });
  },

  /**
   * Ativa usuário
   */
  async activateUser(id) {
    return apiCall(`/users/${id}/activate`, {
      method: "POST",
    });
  },
};

// ============================================================================
// ATIVIDADES
// ============================================================================

const activityService = {
  /**
   * Cria nova atividade
   */
  async createActivity(activityData) {
    return apiCall("/activities", {
      method: "POST",
      body: JSON.stringify(activityData),
    });
  },

  /**
   * Lista atividades com filtros opcionais
   */
  async listActivities(filters = {}) {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.userId) params.append("userId", filters.userId);
    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);

    return apiCall(`/activities?${params.toString()}`);
  },

  /**
   * Obtém atividade específica
   */
  async getActivity(id) {
    return apiCall(`/activities/${id}`);
  },

  /**
   * Atualiza atividade
   */
  async updateActivity(id, activityData) {
    return apiCall(`/activities/${id}`, {
      method: "PUT",
      body: JSON.stringify(activityData),
    });
  },

  /**
   * Deleta atividade
   */
  async deleteActivity(id) {
    return apiCall(`/activities/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Obtém atividades do usuário
   */
  async getUserActivities(userId) {
    return apiCall(`/activities/user/${userId}`);
  },

  /**
   * Obtém relatório de fechamento diário
   */
  async getDailyClosureReport(date) {
    return apiCall(`/activities/daily-closure/${date}`);
  },

  /**
   * Obtém relatório mensal
   */
  async getMonthlyReport(month, year) {
    return apiCall(`/activities/monthly-report/${month}/${year}`);
  },
};

// ============================================================================
// EMPREGADOS (Employees)
// ============================================================================
const employeeService = {
  async createEmployee(data) {
    return apiCall(`/employees`, { method: 'POST', body: JSON.stringify(data) });
  },
  async listEmployees(page = 1, limit = 100) {
    return apiCall(`/employees?page=${page}&limit=${limit}`);
  },
  async getEmployee(id) {
    return apiCall(`/employees/${id}`);
  },
  async updateEmployee(id, data) {
    return apiCall(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  async deleteEmployee(id) {
    return apiCall(`/employees/${id}`, { method: 'DELETE' });
  }
};

// ============================================================================
// SALÁRIOS
// ============================================================================

const salaryService = {
  /**
   * Cria novo salário
   */
  async createSalary(salaryData) {
    return apiCall("/salaries", {
      method: "POST",
      body: JSON.stringify(salaryData),
    });
  },

  /**
   * Lista salários da empresa
   */
  async listSalaries(filters = {}) {
    const params = new URLSearchParams();
    if (filters.month) params.append("month", filters.month);
    if (filters.year) params.append("year", filters.year);
    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);

    return apiCall(`/salaries?${params.toString()}`);
  },

  /**
   * Obtém salário específico
   */
  async getSalary(id) {
    return apiCall(`/salaries/${id}`);
  },

  /**
   * Atualiza salário
   */
  async updateSalary(id, salaryData) {
    return apiCall(`/salaries/${id}`, {
      method: "PUT",
      body: JSON.stringify(salaryData),
    });
  },

  /**
   * Deleta salário
   */
  async deleteSalary(id) {
    return apiCall(`/salaries/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Obtém salários do usuário
   */
  async getUserSalaries(userId) {
    return apiCall(`/salaries/user/${userId}`);
  },

  /**
   * Obtém salários do funcionário (employee)
   */
  async getEmployeeSalaries(employeeId) {
    return apiCall(`/salaries/employee/${employeeId}`);
  },

  /**
   * Obtém relatório mensal de salários
   */
  async getMonthlyReport(month, year) {
    return apiCall(`/salaries/report/${month}/${year}`);
  },
};

// ============================================================================
// EXPORTAÇÃO
// ============================================================================

export {
  authService,
  companyService,
  userService,
  activityService,
  salaryService,
  employeeService,
  apiCall,
  setToken,
  removeToken,
  getToken,
  isAuthenticated,
};
