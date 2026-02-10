import { useState } from 'react';
import { exportService } from '../utils/exportService';
import { authService } from '../utils/auth';

export default function DailyClosureTable({ activities, filter }) {
  const [expandedDates, setExpandedDates] = useState({});
  const currentUser = authService.getCurrentUser();

  // Agrupar atividades por data
  const groupByDate = (acts) => {
    const grouped = {};
    acts.forEach(activity => {
      const date = activity.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(activity);
    });

    // Ordenar por data
    return Object.keys(grouped)
      .sort()
      .reverse() // Mostrar datas mais recentes primeiro
      .reduce((result, key) => {
        result[key] = grouped[key];
        return result;
      }, {});
  };

  const dailyData = groupByDate(activities);

  // Calcular totais do dia
  const calculateDayTotals = (dayActivities) => {
    return dayActivities.reduce(
      (acc, activity) => {
        const moneyIn = parseFloat(activity.moneyIn) || 0;
        const moneyOut = parseFloat(activity.moneyOut) || 0;
        return {
          totalIn: acc.totalIn + moneyIn,
          totalOut: acc.totalOut + moneyOut,
          balance: acc.balance + (moneyIn - moneyOut)
        };
      },
      { totalIn: 0, totalOut: 0, balance: 0 }
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      weekday: 'short',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };

  const formatCurrency = (value) => {
    return (value || 0).toLocaleString('pt-PT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const toggleDate = (date) => {
    setExpandedDates(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  const handleExportDayPDF = (date, dayActivities) => {
    const userName = currentUser?.name || 'Utilizador';
    exportService.exportDayToPDF(dayActivities, date, userName);
  };

  const handleExportDayExcel = (date, dayActivities) => {
    const userName = currentUser?.name || 'Utilizador';
    exportService.exportDayToExcel(dayActivities, date, userName);
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-500 text-lg">Nenhuma atividade registrada ainda</p>
      </div>
    );
  }

  let accumulatedBalance = 0;
  const dailyClosures = [];

  Object.keys(dailyData)
    .sort()
    .reverse()
    .forEach(date => {
      const dayActivities = dailyData[date];
      const dayTotals = calculateDayTotals(dayActivities);
      accumulatedBalance += dayTotals.balance;
      dailyClosures.push({ date, activities: dayActivities, totals: dayTotals, accumulated: accumulatedBalance });
    });

  return (
    <div className="space-y-3 md:space-y-4">
      {dailyClosures.map((daily, index) => {
        const isExpanded = expandedDates[daily.date];

        return (
          <div key={daily.date} className="card border-l-4 border-purple-500">
            {/* Resumo diário - Clicável */}
            <button
              onClick={() => toggleDate(daily.date)}
              className="w-full text-left hover:bg-purple-50 p-3 md:p-4 rounded-lg transition-colors active:scale-95"
            >
              <div className="flex items-center justify-between flex-wrap gap-2 md:gap-4">
                <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                  <span className="text-2xl md:text-3xl flex-shrink-0">{isExpanded ? '▼' : '▶'}</span>
                  <div className="min-w-0">
                    <h4 className="text-base md:text-lg font-bold text-gray-800">
                      📅 {formatDate(daily.date)}
                    </h4>
                    <p className="text-xs md:text-sm text-gray-600">
                      {daily.activities.length} atividade{daily.activities.length !== 1 ? 's' : ''} registrada{daily.activities.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-right text-xs md:text-sm">
                  <div>
                    <p className="text-gray-600">Entrada</p>
                    <p className="font-bold text-green-600">{formatCurrency(daily.totals.totalIn)} Kz</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Saída</p>
                    <p className="font-bold text-red-600">{formatCurrency(daily.totals.totalOut)} Kz</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Saldo</p>
                    <p className={`font-bold ${daily.totals.balance >= 0 ? 'text-purple-600' : 'text-orange-600'}`}>
                      {formatCurrency(daily.totals.balance)} Kz
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-gray-600">Acumulado</p>
                    <p className={`font-bold ${daily.accumulated >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {formatCurrency(daily.accumulated)} Kz
                    </p>
                  </div>
                </div>

                {/* Botões de exportação por dia - Aparecem ao lado */}
                <div className="flex gap-1 md:gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleExportDayPDF(daily.date, daily.activities)}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1.5 md:py-2 px-2.5 md:px-3 rounded-lg transition-colors flex items-center gap-1 text-xs md:text-sm active:scale-95"
                    title="Exportar dia em PDF"
                  >
                    <span>📄</span>
                  </button>
                  <button
                    onClick={() => handleExportDayExcel(daily.date, daily.activities)}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1.5 md:py-2 px-2.5 md:px-3 rounded-lg transition-colors flex items-center gap-1 text-xs md:text-sm active:scale-95"
                    title="Exportar dia em Excel"
                  >
                    <span>📊</span>
                  </button>
                </div>
              </div>
            </button>

            {/* Detalhes das atividades - Expansível */}
            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs md:text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-purple-100 to-indigo-100">
                        <th className="px-2 md:px-3 py-2 text-left font-semibold text-gray-700">Semana</th>
                        <th className="px-2 md:px-3 py-2 text-left font-semibold text-gray-700">Empresa</th>
                        <th className="px-2 md:px-3 py-2 text-right font-semibold text-gray-700">Entrada</th>
                        <th className="px-2 md:px-3 py-2 text-right font-semibold text-gray-700">Saída</th>
                        <th className="px-2 md:px-3 py-2 text-right font-semibold text-gray-700">Saldo</th>
                        <th className="px-2 md:px-3 py-2 text-left font-semibold text-gray-700">Expediente</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {daily.activities.map((activity) => {
                        const actIn = parseFloat(activity.moneyIn) || 0;
                        const actOut = parseFloat(activity.moneyOut) || 0;
                        const actBalance = actIn - actOut;

                        return (
                          <tr key={activity.id} className="hover:bg-purple-50 transition-colors">
                            <td className="px-2 md:px-3 py-2 text-gray-700">{activity.week || '-'}</td>
                            <td className="px-2 md:px-3 py-2 text-gray-700">{activity.company || '-'}</td>
                            <td className="px-2 md:px-3 py-2 text-right text-green-600 font-medium">{formatCurrency(actIn)}</td>
                            <td className="px-2 md:px-3 py-2 text-right text-red-600 font-medium">{formatCurrency(actOut)}</td>
                            <td className="px-2 md:px-3 py-2 text-right font-medium" style={{ color: actBalance >= 0 ? '#9333ea' : '#f97316' }}>
                              {formatCurrency(actBalance)}
                            </td>
                            <td className="px-2 md:px-3 py-2 text-gray-700 text-xs md:text-sm">{activity.hours || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Detalhes adicionais */}
                {daily.activities[0]?.description && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs md:text-sm font-semibold text-gray-700 mb-1">📝 Descrição:</p>
                    <p className="text-xs md:text-sm text-gray-600">{daily.activities[0].description}</p>
                  </div>
                )}

                {/* Saldo acumulado em mobile */}
                <div className="md:hidden mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-600">Saldo Acumulado até este dia:</p>
                  <p className={`text-sm font-bold ${daily.accumulated >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {formatCurrency(daily.accumulated)} Kz
                  </p>
                </div>

                {/* Botões de exportação por dia - Mobile */}
                <div className="md:hidden mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleExportDayPDF(daily.date, daily.activities)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 text-xs active:scale-95"
                  >
                    <span>📄</span>
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={() => handleExportDayExcel(daily.date, daily.activities)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 text-xs active:scale-95"
                  >
                    <span>📊</span>
                    <span>Excel</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
