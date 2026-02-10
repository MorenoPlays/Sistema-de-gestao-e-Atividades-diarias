export default function ActivitySummary({ activities }) {
  // Calcular totais
  const totals = activities.reduce(
    (acc, activity) => {
      const moneyIn = parseFloat(activity.moneyIn) || 0;
      const moneyOut = parseFloat(activity.moneyOut) || 0;
      return {
        totalIn: acc.totalIn + moneyIn,
        totalOut: acc.totalOut + moneyOut,
        balance: acc.balance + (moneyIn - moneyOut),
        count: acc.count + 1
      };
    },
    { totalIn: 0, totalOut: 0, balance: 0, count: 0 }
  );

  const formatCurrency = (value) => {
    return value.toLocaleString('pt-PT', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).replace('AOA', 'Kz');
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-8">
      {/* Card Total Atividades */}
      <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500 p-3 md:p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-semibold text-gray-600 truncate">Total</p>
            <p className="text-2xl md:text-3xl font-bold text-blue-600">{totals.count}</p>
          </div>
          <div className="text-3xl md:text-5xl opacity-20 flex-shrink-0">📋</div>
        </div>
      </div>

      {/* Card Total Entrada */}
      <div className="card bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500 p-3 md:p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-semibold text-gray-600 truncate">Entrada</p>
            <p className="text-xl md:text-2xl font-bold text-green-600 truncate">{formatCurrency(totals.totalIn)}</p>
          </div>
          <div className="text-3xl md:text-5xl opacity-20 flex-shrink-0">📈</div>
        </div>
      </div>

      {/* Card Total Saída */}
      <div className="card bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500 p-3 md:p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-semibold text-gray-600 truncate">Saída</p>
            <p className="text-xl md:text-2xl font-bold text-red-600 truncate">{formatCurrency(totals.totalOut)}</p>
          </div>
          <div className="text-3xl md:text-5xl opacity-20 flex-shrink-0">📉</div>
        </div>
      </div>

      {/* Card Saldo */}
      <div className={`card bg-gradient-to-br border-l-4 p-3 md:p-4 ${
        totals.balance >= 0 
          ? 'from-purple-50 to-purple-100 border-purple-500' 
          : 'from-orange-50 to-orange-100 border-orange-500'
      }`}>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-semibold text-gray-600 truncate">Saldo</p>
            <p className={`text-xl md:text-2xl font-bold truncate ${totals.balance >= 0 ? 'text-purple-600' : 'text-orange-600'}`}>
              {formatCurrency(totals.balance)}
            </p>
          </div>
          <div className="text-3xl md:text-5xl opacity-20 flex-shrink-0">{totals.balance >= 0 ? '✅' : '⚠️'}</div>
        </div>
      </div>
    </div>
  );
}
