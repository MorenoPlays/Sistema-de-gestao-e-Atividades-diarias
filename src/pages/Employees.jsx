import { useState, useEffect } from 'react';
import { authService, employeeService, userService, salaryService } from '../utils/api';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [creatingAccountFor, setCreatingAccountFor] = useState(null);
  const [createAccountData, setCreateAccountData] = useState({ email: '', password: '', role: 'EMPLOYEE' });
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    position: '',
    userId: '',
    // optional initial salary
    initialMonth: new Date().getMonth() + 1,
    initialYear: new Date().getFullYear(),
    initialBaseSalary: '',
    initialDeductions: '0'
  });

  useEffect(() => {
    (async () => {
      try {
        const u = await authService.getCurrentUser();
        const userData = u?.data || u || null;
        setCurrentUser(userData);
      } catch (err) {
        console.warn('Não foi possível obter currentUser em Employees', err);
      }

      await loadEmployees();
      await loadUsers();
    })();
  }, []);

  const [currentUser, setCurrentUser] = useState(null);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const res = await employeeService.listEmployees();
      setEmployees(res?.data || res || []);
    } catch (err) {
      console.warn('employeeService.listEmployees() falhou, tentando fallback para users:', err);
      // fallback: carregar users como funcionários temporários (quando backend Employee não estiver disponível)
      try {
        const u = await userService.listUsers(1, 200);
        const list = (u?.data || u || []).map(user => ({
          id: user.id,
          name: user.name,
          phone: user.phone || '',
          position: '',
          userId: user.id
        }));
        setEmployees(list);
        setError('Carreguei usuários como fallback — execute a migration para habilitar Employees no backend');
      } catch (err2) {
        setError('Erro ao carregar funcionários');
        console.error(err, err2);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await userService.listUsers(1, 100);
      setUsers(res?.data || res || []);
    } catch (err) {
      console.warn('Não foi possível carregar usuários para vinculação', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setError('Nome é obrigatório');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (editingId) {
        await employeeService.updateEmployee(editingId, {
          name: formData.name,
          phone: formData.phone,
          position: formData.position,
          userId: formData.userId || undefined,
        });
        alert('Funcionário atualizado com sucesso!');
      } else {
        const created = await employeeService.createEmployee({
          name: formData.name,
          phone: formData.phone,
          position: formData.position,
          userId: formData.userId || undefined,
        });

        // criar salário inicial se baseSalary informado
        if (formData.initialBaseSalary) {
          try {
            await salaryService.createSalary({
              month: parseInt(formData.initialMonth),
              year: parseInt(formData.initialYear),
              employeeId: created.data?.id || created.id,
              baseSalary: parseFloat(formData.initialBaseSalary),
              deductions: parseFloat(formData.initialDeductions) || 0,
            });
          } catch (err) {
            console.warn('Falha ao criar salário inicial:', err);
          }
        }

        alert('Funcionário cadastrado com sucesso!');
      }

      setFormData({
        name: '', phone: '', position: '', userId: '',
        initialMonth: new Date().getMonth() + 1,
        initialYear: new Date().getFullYear(),
        initialBaseSalary: '', initialDeductions: '0'
      });
      setEditingId(null);
      setShowForm(false);
      await loadEmployees();
    } catch (err) {
      setError('Erro ao salvar funcionário: ' + (err.message || 'Tente novamente'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (emp) => {
    setFormData({
      name: emp.name,
      phone: emp.phone || '',
      position: emp.position || '',
      userId: emp.userId || '',
      initialMonth: new Date().getMonth() + 1,
      initialYear: new Date().getFullYear(),
      initialBaseSalary: '',
      initialDeductions: '0'
    });
    setEditingId(emp.id);
    setShowForm(true);
  };

  const handleStartCreateAccount = (emp) => {
    setCreatingAccountFor(emp.id);
    setCreateAccountData({ email: emp.email || '', password: '', role: 'EMPLOYEE' });
  };

  const handleCreateAccountChange = (e) => {
    const { name, value } = e.target;
    setCreateAccountData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateAccountSubmit = async (employee) => {
    // Validações no frontend (evitar erro Zod do backend)
    if (!createAccountData.email || !createAccountData.password) {
      setError('Email e senha são obrigatórios para criar a conta');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(createAccountData.email)) {
      setError('Email inválido');
      return;
    }

    if ((createAccountData.password || '').length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres');
      return;
    }

    // Backend exige name >= 3 (createUserSchema). Employees podem ter name com 2 chars — validar aqui.
    if ((employee.name || '').trim().length < 3) {
      setError('Nome do usuário precisa ter pelo menos 3 caracteres para criar a conta');
      return;
    }

    try {
      setLoading(true);
      // criar usuário no backend (será associado à company do admin)
      const payload = {
        name: employee.name,
        email: createAccountData.email,
        password: createAccountData.password,
        role: createAccountData.role,
      };

      const created = await userService.createUser(payload);
      const createdUser = created?.data || created;

      // vincular employee.userId ao novo user
      await employeeService.updateEmployee(employee.id, { userId: createdUser.id });

      alert('Conta criada e vinculada com sucesso!');
      setCreatingAccountFor(null);
      setCreateAccountData({ email: '', password: '', role: 'EMPLOYEE' });
      await loadEmployees();
      await loadUsers();
    } catch (err) {
      console.error('Erro ao criar conta para funcionário:', err);
      setError('Erro ao criar conta: ' + (err.message || 'Tente novamente'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deseja remover este funcionário?')) return;
    try {
      setLoading(true);
      await employeeService.deleteEmployee(id);
      await loadEmployees();
      alert('Funcionário removido');
    } catch (err) {
      setError('Erro ao remover funcionário: ' + (err.message || 'Tente novamente'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', phone: '', position: '', userId: '', initialMonth: new Date().getMonth() + 1, initialYear: new Date().getFullYear(), initialBaseSalary: '', initialDeductions: '0' });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 animate-fadeIn">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">👔 Funcionários (Área de RH)</h2>
        <p className="text-gray-600">Cadastre funcionários e registre salários vinculados ao funcionário</p>
      </div>

      {error && (<div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</div>)}
      {loading && (<div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">Carregando...</div>)}

      {!showForm && (
        <button onClick={() => setShowForm(true)} className="mb-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">➕ Novo Funcionário</button>
      )}

      {showForm && (
        <div className="card mb-8 animate-slideInRight">
          <h3 className="text-xl font-bold text-gray-800 mb-6">{editingId ? '✏️ Editar Funcionário' : '📝 Novo Funcionário'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nome *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Telefone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cargo</label>
                <input type="text" name="position" value={formData.position} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vincular a conta (opcional)</label>
                <select name="userId" value={formData.userId} onChange={handleChange} className="input-field">
                  <option value="">(Nenhuma)</option>
                  {users.map(u => (<option key={u.id} value={u.id}>{u.name} — {u.email}</option>))}
                </select>
              </div>
            </div>

            <div className="mb-4 border-t pt-4">
              <h4 className="font-semibold mb-3">Criar Salário Inicial (opcional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Mês</label>
                  <input type="number" name="initialMonth" value={formData.initialMonth} onChange={handleChange} className="input-field" min="1" max="12" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Ano</label>
                  <input type="number" name="initialYear" value={formData.initialYear} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Salário Base (Kz)</label>
                  <input type="number" name="initialBaseSalary" value={formData.initialBaseSalary} onChange={handleChange} className="input-field" step="0.01" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Descontos (Kz)</label>
                  <input type="number" name="initialDeductions" value={formData.initialDeductions} onChange={handleChange} className="input-field" step="0.01" />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">{editingId ? '💾 Atualizar' : '➕ Cadastrar'}</button>
              <button type="button" onClick={handleCancel} className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">❌ Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {employees.length > 0 ? (
        <div className="card animate-slideInRight">
          <h3 className="text-xl font-bold text-gray-800 mb-6">📋 Funcionários Cadastrados ({employees.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Nome</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Cargo</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Telefone</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Conta vinculada</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employees.map(emp => (
                  <>
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-800">{emp.name}</td>
                      <td className="px-4 py-3 text-gray-600">{emp.position || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{emp.phone || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{emp.userId ? '✅ Vinculada' : '—'}</td>
                      <td className="px-4 py-3 text-center space-x-2">
                        <button onClick={() => handleEdit(emp)} className="text-blue-600 hover:text-blue-800 font-semibold">Editar</button>
                        <button onClick={() => handleDelete(emp.id)} className="text-red-600 hover:text-red-800 font-semibold">Remover</button>

                        {/* Mostrar botão de criar conta apenas se não existir userId e o usuário atual for ADMIN */}
                        {(!emp.userId && currentUser?.role === 'ADMIN') && (
                          <button onClick={() => handleStartCreateAccount(emp)} className="ml-2 text-green-600 hover:text-green-800 font-semibold">Criar Conta</button>
                        )}
                      </td>
                    </tr>

                    {/* Linha de formulário inline para criar conta vinculada */}
                    {creatingAccountFor === emp.id && (
                      <tr key={`${emp.id}-create-account`} className="bg-gray-50">
                        <td colSpan="5" className="px-4 py-3">
                          <div className="bg-white border rounded-lg p-4">
                            <h4 className="font-semibold mb-2">Criar conta para <span className="font-bold">{emp.name}</span></h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                              <input name="email" value={createAccountData.email} onChange={handleCreateAccountChange} placeholder="Email" className="input-field" />
                              <input name="password" type="password" value={createAccountData.password} onChange={handleCreateAccountChange} placeholder="Senha" className="input-field" />
                              <select name="role" value={createAccountData.role} onChange={handleCreateAccountChange} className="input-field">
                                <option value="EMPLOYEE">EMPLOYEE</option>
                                <option value="MANAGER">MANAGER</option>
                                <option value="ADMIN">ADMIN</option>
                              </select>
                            </div>
                            <div className="flex gap-3">
                              <button onClick={() => handleCreateAccountSubmit(emp)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">Criar e Vincular</button>
                              <button onClick={() => setCreatingAccountFor(null)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Nenhum funcionário cadastrado</p>
          <button onClick={() => setShowForm(true)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">➕ Cadastrar Funcionário</button>
        </div>
      )}
    </div>
  );
}
