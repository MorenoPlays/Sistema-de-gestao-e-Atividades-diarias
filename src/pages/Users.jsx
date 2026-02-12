import { useState, useEffect } from 'react';
import { userService, authService } from '../utils/api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'EMPLOYEE'
  });

  const roles = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'MANAGER', label: 'Gerente' },
    { value: 'EMPLOYEE', label: 'Funcionário' }
  ];

  useEffect(() => {
    (async () => {
      try {
        const u = await authService.getCurrentUser();
        setCurrentUser(u.data || u || null);
      } catch (err) {
        // ignore
      }
      await loadUsers();
    })();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await userService.listUsers();
      setUsers(data?.data || data || []);
    } catch (err) {
      setError('Erro ao carregar funcionários: ' + (err.message || 'Tente novamente'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      setError('Por favor, preencha Nome e Email!');
      return;
    }

    if (!editingId && !formData.password) {
      setError('Senha é obrigatória para novo funcionário!');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (editingId) {
        // Atualizar usuário
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        await userService.updateUser(editingId, updateData);
        alert('Funcionário atualizado com sucesso!');
      } else {
        // Criar novo usuário
        await userService.createUser(formData);
        alert('Funcionário cadastrado com sucesso!');
      }

      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'EMPLOYEE'
      });
      setEditingId(null);
      setShowForm(false);
      await loadUsers();
    } catch (err) {
      setError('Erro ao salvar: ' + (err.message || 'Tente novamente'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      phone: user.phone || '',
      role: user.role
    });
    setEditingId(user.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Deseja remover este funcionário?')) {
      try {
        setLoading(true);
        await userService.deleteUser(id);
        await loadUsers();
        alert('Funcionário removido com sucesso!');
      } catch (err) {
        setError('Erro ao remover: ' + (err.message || 'Tente novamente'));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'EMPLOYEE'
    });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const getRoleLabel = (role) => {
    return roles.find(r => r.value === role)?.label || role;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 animate-fadeIn">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">👥 Funcionários</h2>
        <p className="text-gray-600">Gerencie os funcionários da sua empresa</p>
      </div>

      {/* Mensagem de Erro */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
          Processando...
        </div>
      )}

      {/* Botão Novo Funcionário */}
      {/* Só ADMIN pode cadastrar novos usuários */}
      {!showForm && currentUser?.role === 'ADMIN' && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          ➕ Novo Funcionário
        </button>
      )}

      {/* Formulário */}
      {showForm && (
        <div className="card mb-8 animate-slideInRight">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            {editingId ? '✏️ Editar Funcionário' : '📝 Novo Funcionário'}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="João Silva"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="joao@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {editingId ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="••••••••"
                  required={!editingId}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="+244 912 345 678"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cargo *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {editingId ? '💾 Atualizar' : '➕ Cadastrar'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                ❌ Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Listagem de Funcionários */}
      {users.length > 0 ? (
        <div className="card animate-slideInRight">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            📋 Funcionários Cadastrados ({users.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Nome</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Cargo</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Telefone</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-800">{user.name}</td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        user.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                        user.role === 'MANAGER' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.phone || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.isActive ? '✅ Ativo' : '❌ Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center space-x-2">
                      {/* Editar: admin ou o próprio usuário */}
                      {(currentUser?.role === 'ADMIN' || currentUser?.id === user.id) && (
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-800 font-semibold mr-2"
                        >
                          Editar
                        </button>
                      )}

                      {/* Remover: apenas admin */}
                      {currentUser?.role === 'ADMIN' && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-800 font-semibold"
                        >
                          Remover
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        !showForm && (
          <div className="card text-center py-12">
            <p className="text-gray-500 text-lg mb-4">Nenhum funcionário cadastrado</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              ➕ Cadastrar Primeiro Funcionário
            </button>
          </div>
        )
      )}
    </div>
  );
}
