import { useState } from 'react';
import { authService } from '../utils/api';

export default function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Por favor, preencha todos os campos!');
      setLoading(false);
      return;
    }

    try {
      const result = await authService.login(email, password);
      onLogin(result.user);
    } catch (err) {
      setError(err.message || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
  <div className="w-28 h-28 rounded-lg overflow-hidden 
                  shadow-xl border-4 border-white">
              <img
                src="/favicon_io/android-chrome-512x512.png"
                alt="Logo MPGestor"
                className="w-full h-full object-cover"
              />
  </div>
</div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            MPGestor
          </h1>
          <p className="text-gray-600 text-lg">Sistema de Gestão</p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Entrar na Conta</h2>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Não tem uma conta?{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-purple-600 font-semibold hover:text-purple-700 transition-colors"
              >
                Cadastre-se
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          © 2026 Moreno_Plays. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
