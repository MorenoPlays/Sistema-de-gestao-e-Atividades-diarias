import { authService } from '../utils/api';

export default function Header({ user, onLogout }) {
  return (
    <header className="bg-white shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-3 md:px-4 lg:px-8">
        <div className="flex justify-between items-center py-3 md:py-4">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl flex-shrink-0 bg-transparent">
              <img src="/favicon_io/android-chrome-512x512.png" alt="MPGestor" className="w-6 md:w-8 h-6 md:h-8 object-contain" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent truncate">
                MPGestor
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">Sistema de Gestão</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-gray-700 truncate">{user?.name || 'Usuário'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 md:py-2 bg-red-50 text-red-600 rounded-lg md:rounded-xl hover:bg-red-100 transition-all duration-300 font-semibold text-sm md:text-base active:scale-95"
              title="Sair da conta"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
