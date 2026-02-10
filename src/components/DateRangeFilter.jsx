import { useState } from 'react';

export default function DateRangeFilter({ onFilterChange, activities }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Obter datas mínima e máxima das atividades
  const getDateRange = () => {
    if (activities.length === 0) return { min: '', max: '' };
    
    const dates = activities.map(a => new Date(a.date).getTime());
    const minDate = new Date(Math.min(...dates)).toISOString().split('T')[0];
    const maxDate = new Date(Math.max(...dates)).toISOString().split('T')[0];
    
    return { min: minDate, max: maxDate };
  };

  const dateRange = getDateRange();

  const handleApplyFilter = () => {
    if (!startDate || !endDate) {
      alert('Por favor, selecione as duas datas!');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert('A data inicial não pode ser maior que a data final!');
      return;
    }

    onFilterChange({
      startDate,
      endDate,
      isActive: true
    });
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    onFilterChange({
      startDate: '',
      endDate: '',
      isActive: false
    });
  };

  const handleSetThisMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    setStartDate(firstDay);
    setEndDate(lastDay);
  };

  const handleSetThisWeek = () => {
    const now = new Date();
    const first = now.getDate() - now.getDay() + 1; // Segunda-feira
    const monday = new Date(now.setDate(first)).toISOString().split('T')[0];
    const sunday = new Date(now.setDate(first + 6)).toISOString().split('T')[0];
    
    setStartDate(monday);
    setEndDate(sunday);
  };

  return (
    <div className="card mb-6 animate-slideInRight">
      <div className="flex items-center justify-between mb-4 gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-base md:text-lg font-semibold text-gray-800 hover:text-purple-600 transition-colors flex-1 text-left"
        >
          <span className="flex-shrink-0">{isExpanded ? '▼' : '▶'}</span>
          <span className="truncate">🔍 Filtrar por Data</span>
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-3 md:space-y-4 border-t pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {/* Data Inicial */}
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Data Inicial</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={dateRange.min}
                max={dateRange.max}
                className="input-field w-full"
              />
            </div>

            {/* Data Final */}
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Data Final</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={dateRange.min}
                max={dateRange.max}
                className="input-field w-full"
              />
            </div>
          </div>

          {/* Atalhos Rápidos */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSetThisWeek}
              className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-2.5 md:px-3 py-1.5 md:py-1 rounded-full transition-colors font-medium"
            >
              Esta Semana
            </button>
            <button
              type="button"
              onClick={handleSetThisMonth}
              className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-2.5 md:px-3 py-1.5 md:py-1 rounded-full transition-colors font-medium"
            >
              Este Mês
            </button>
            {dateRange.min && dateRange.max && (
              <button
                type="button"
                onClick={() => {
                  setStartDate(dateRange.min);
                  setEndDate(dateRange.max);
                }}
                className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 px-2.5 md:px-3 py-1.5 md:py-1 rounded-full transition-colors font-medium"
              >
                Todo o Período
              </button>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-2">
            <button
              onClick={handleApplyFilter}
              className="btn-primary flex-1 text-sm md:text-base py-2 md:py-3"
            >
              ✅ Filtrar
            </button>
            <button
              onClick={handleClearFilter}
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 md:py-3 px-4 rounded-lg transition-colors text-sm md:text-base active:scale-95"
            >
              ❌ Limpar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
