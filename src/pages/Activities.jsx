import { useState, useEffect } from 'react';
import { activityService, authService } from '../utils/auth';
import { exportService } from '../utils/exportService';
import ActivitySummary from '../components/ActivitySummary';
import DateRangeFilter from '../components/DateRangeFilter';
import DailyClosureTable from '../components/DailyClosureTable';

// Funções utilitárias para automação
const calculateWeekFromDate = (dateString) => {
  const date = new Date(dateString);
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDay) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
  return `${weekNumber}ª Semana`;
};

// Formatar valor como moeda (Kz)
const formatMoneyInput = (value) => {
  // Remove tudo que não é número ou vírgula/ponto
  let cleaned = value.replace(/[^\d.,]/g, '');
  
  // Substitui vírgula por ponto para tratamento consistente
  cleaned = cleaned.replace(',', '.');
  
  // Pega apenas o último ponto (em caso de múltiplos)
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts.slice(0, -1).join('') + '.' + parts[parts.length - 1];
  }
  
  // Limita a 2 casas decimais
  if (cleaned.includes('.')) {
    const [intPart, decPart] = cleaned.split('.');
    cleaned = intPart + '.' + decPart.substring(0, 2);
  }
  
  return cleaned;
};

const getCommonHours = () => [
  { label: '08:00/16:00', start: '08:00', end: '16:00' },
  { label: '09:00/17:00', start: '09:00', end: '17:00' },
  { label: '10:00/18:00', start: '10:00', end: '18:00' },
  { label: '09:00/21:30', start: '09:00', end: '21:30' },
  { label: '12:00/20:00', start: '12:00', end: '20:00' },
  { label: '14:00/22:00', start: '14:00', end: '22:00' },
];

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [filter, setFilter] = useState({ startDate: '', endDate: '', isActive: false });
  const [showHoursSuggestions, setShowHoursSuggestions] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    week: calculateWeekFromDate(new Date().toISOString().split('T')[0]),
    company: 'Star Step Game',
    moneyIn: '',
    moneyOut: '',
    description: '',
    hoursStart: '',
    hoursEnd: ''
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    loadActivities();
  }, []);

  const loadActivities = () => {
    setActivities(activityService.getActivities());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.date || !formData.week || !formData.hoursStart || !formData.hoursEnd) {
      alert('Por favor, preencha Data, Semana, Hora Início e Hora Fim!');
      return;
    }

    // Converter para formato de string para compatibilidade com armazenamento
    const activityData = {
      ...formData,
      hours: `${formData.hoursStart}/${formData.hoursEnd}`
    };

    activityService.saveActivity(activityData);
    loadActivities();
    
    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      week: calculateWeekFromDate(new Date().toISOString().split('T')[0]),
      company: 'Star Step Game',
      moneyIn: '',
      moneyOut: '',
      description: '',
      hoursStart: '',
      hoursEnd: ''
    });
    setShowHoursSuggestions(false);
  };

  const handleDelete = (id) => {
    if (confirm('Deseja remover esta atividade?')) {
      activityService.deleteActivity(id);
      loadActivities();
    }
  };

  const handleClearAll = () => {
    if (confirm('Deseja limpar todas as atividades?')) {
      activityService.clearActivities();
      loadActivities();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedData = { ...formData, [name]: value };
    
    // Auto-calcular semana quando a data muda
    if (name === 'date') {
      updatedData.week = calculateWeekFromDate(value);
    }
    
    // Formatar moeda enquanto digita
    if (name === 'moneyIn' || name === 'moneyOut') {
      updatedData[name] = formatMoneyInput(value);
    }
    
    setFormData(updatedData);
  };

  const handleExportPDF = () => {
    const userName = currentUser?.name || 'Utilizador';
    const dataToExport = getFilteredActivities();
    exportService.exportToPDF(dataToExport, userName);
  };

  const handleExportExcel = () => {
    const userName = currentUser?.name || 'Utilizador';
    const dataToExport = getFilteredActivities();
    exportService.exportToExcel(dataToExport, userName);
  };

  const getFilteredActivities = () => {
    if (!filter.isActive) return activities;

    return activities.filter(activity => {
      const activityDate = new Date(activity.date);
      const start = new Date(filter.startDate);
      const end = new Date(filter.endDate);
      
      // Adicionar 1 dia ao endDate para incluir o dia todo
      end.setDate(end.getDate() + 1);
      
      return activityDate >= start && activityDate < end;
    });
  };

  const handleFilterChange = (filterData) => {
    setFilter(filterData);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 md:px-4 lg:px-8 py-4 md:py-8">
      <div className="mb-6 md:mb-8 animate-fadeIn">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1 md:mb-2">📋 Atividades Diárias</h2>
        <p className="text-sm md:text-base text-gray-600">Registre as atividades e movimentações do dia</p>
      </div>

      {/* Resumo de Atividades */}
      <ActivitySummary activities={getFilteredActivities()} />

      {/* Filtro por Data */}
      <DateRangeFilter 
        onFilterChange={handleFilterChange}
        activities={activities}
      />

      <div className="card mb-6 md:mb-8 animate-slideInRight">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">Nova Atividade</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6 mb-4 md:mb-6">
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Data</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Semana</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  name="week"
                  value={formData.week}
                  onChange={handleChange}
                  className="input-field flex-1"
                  readOnly
                  title="Semana é calculada automaticamente com base na data"
                />
                <span className="text-xl" title="Auto-calculada">🤖</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Auto-calculada pela data</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6 mb-4 md:mb-6">
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Empresa</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="input-field"
                readOnly
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Expediente</label>
              <div className="space-y-2">
                <div className="flex gap-2 md:gap-3 items-end">
                  <div className="flex-1">
                    <label className="text-xs text-gray-600 block mb-1">Início (HH:MM)</label>
                    <input
                      type="text"
                      name="hoursStart"
                      value={formData.hoursStart}
                      onChange={handleChange}
                      placeholder="00:00"
                      list="hoursStartList"
                      pattern="([01]\d|2[0-3]):([0-5]\d)"
                      className="input-field text-sm"
                    />
                    <datalist id="hoursStartList">
                      {[...Array(24)].map((_, h) => {
                        const hour = String(h).padStart(2, '0');
                        return [...Array(60)].map((_, m) => {
                          const minute = String(m).padStart(2, '0');
                          return (
                            <option key={`${h}-${m}`} value={`${hour}:${minute}`} />
                          );
                        });
                      })}
                    </datalist>
                  </div>
                  <div className="text-gray-600 font-semibold pb-2">—</div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-600 block mb-1">Fim (HH:MM)</label>
                    <input
                      type="text"
                      name="hoursEnd"
                      value={formData.hoursEnd}
                      onChange={handleChange}
                      placeholder="00:00"
                      list="hoursEndList"
                      pattern="([01]\d|2[0-3]):([0-5]\d)"
                      className="input-field text-sm"
                    />
                    <datalist id="hoursEndList">
                      {[...Array(24)].map((_, h) => {
                        const hour = String(h).padStart(2, '0');
                        return [...Array(60)].map((_, m) => {
                          const minute = String(m).padStart(2, '0');
                          return (
                            <option key={`${h}-${m}`} value={`${hour}:${minute}`} />
                          );
                        });
                      })}
                    </datalist>
                  </div>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowHoursSuggestions(!showHoursSuggestions)}
                    className="w-full text-xs py-1.5 px-2 border border-purple-300 rounded text-purple-600 hover:bg-purple-50 transition-colors"
                  >
                    💡 Sugestões Rápidas
                  </button>
                  {showHoursSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      <div className="p-2 space-y-1">
                        {getCommonHours().map((hour) => (
                          <button
                            key={hour.label}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, hoursStart: hour.start, hoursEnd: hour.end });
                              setShowHoursSuggestions(false);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-purple-100 rounded transition-colors text-sm"
                          >
                            {hour.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6 mb-4 md:mb-6">
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Dinheiro Entrada (Kz)</label>
              <div className="relative">
                <input
                  type="text"
                  name="moneyIn"
                  value={formData.moneyIn}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="input-field pr-8"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-semibold">Kz</span>
              </div>
            </div>
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Dinheiro Saída (Kz)</label>
              <div className="relative">
                <input
                  type="text"
                  name="moneyOut"
                  value={formData.moneyOut}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="input-field pr-8"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-semibold">Kz</span>
              </div>
            </div>
          </div>

          <div className="mb-4 md:mb-6">
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Descrição das Atividades</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descrição das atividades do dia"
              className="input-field"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
            <button type="submit" className="btn-primary flex-1">
              ➕ Adicionar Atividade
            </button>
            <button type="button" onClick={handleClearAll} className="btn-secondary flex-1">
              🗑️ Limpar Todas
            </button>
          </div>
        </form>
      </div>

      {/* Activities Table */}
      <div className="card animate-fadeIn">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3 md:gap-4">
          <div className="min-w-0">
            <h3 className="text-lg md:text-xl font-bold text-gray-800">📊 Fecho de Caixa</h3>
            {filter.isActive && (
              <p className="text-xs md:text-sm text-gray-600 mt-1 truncate">
                📅 Filtrado de {new Date(filter.startDate).toLocaleDateString('pt-PT')} até {new Date(filter.endDate).toLocaleDateString('pt-PT')}
              </p>
            )}
          </div>
          {getFilteredActivities().length > 0 && (
            <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
              <button
                onClick={handleExportPDF}
                className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 md:px-4 rounded-lg transition-colors flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base active:scale-95"
              >
                <span>📄</span>
                <span className="hidden sm:inline">PDF</span>
              </button>
              <button
                onClick={handleExportExcel}
                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 md:px-4 rounded-lg transition-colors flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base active:scale-95"
              >
                <span>📊</span>
                <span className="hidden sm:inline">Excel</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Componente de Fecho Diário */}
        <DailyClosureTable activities={getFilteredActivities()} filter={filter} />
      </div>
    </div>
  );
}
