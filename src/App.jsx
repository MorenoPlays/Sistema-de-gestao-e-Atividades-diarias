import { useState, useEffect } from 'react';
import { authService } from './utils/api';
import Login from './components/Login';
import Register from './components/Register';
import Header from './components/Header';
import Activities from './pages/Activities';
import Salary from './pages/Salary';
import Employees from './pages/Employees';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [currentPage, setCurrentPage] = useState('activities');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se usuário está autenticado ao carregar
    const checkAuth = async () => {
      try {
        const response = await authService.getCurrentUser();
        // O response pode vir como { success: true, data: {...} } ou direto como {...}
        const user = response.data || response;
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (err) {
        // Usuário não está autenticado
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    if (authService.isAuthenticated()) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCurrentPage('activities');
  };

  const switchToRegister = () => {
    setShowRegister(true);
  };

  const switchToLogin = () => {
    setShowRegister(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600"></div>
          </div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return showRegister ? (
      <Register 
        onRegister={handleLogin} 
        onSwitchToLogin={switchToLogin}
      />
    ) : (
      <Login 
        onLogin={handleLogin} 
        onSwitchToRegister={switchToRegister}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <Header user={currentUser} onLogout={handleLogout} />
      
      {/* Navigation Tabs */}
      <div className="bg-white shadow-md sticky top-[72px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setCurrentPage('activities')}
              className={`py-4 px-2 border-b-4 font-semibold transition-all duration-300 ${
                currentPage === 'activities'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 Atividades Diárias
            </button>
            <button
              onClick={() => setCurrentPage('salary')}
              className={`py-4 px-2 border-b-4 font-semibold transition-all duration-300 ${
                currentPage === 'salary'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              💰 Folha de Salário
            </button>
            <button
              onClick={() => setCurrentPage('employees')}
              className={`py-4 px-2 border-b-4 font-semibold transition-all duration-300 ${
                currentPage === 'employees'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              👥 Funcionários
            </button>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <main>
        {currentPage === 'activities' ? <Activities /> : currentPage === 'salary' ? <Salary /> : <Employees />}
      </main>

      {/* Footer */}
      <footer className="bg-white mt-16 py-6 text-center text-gray-500 text-sm">
        <p>© 2026 MPGestor. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

export default App;
