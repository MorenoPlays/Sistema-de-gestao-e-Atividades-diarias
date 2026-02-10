import { useState } from 'react';

export default function Salary() {
  const [formData, setFormData] = useState({
    month: '',
    year: new Date().getFullYear(),
    employeeName: '',
    position: '',
    baseSalary: '',
    deductions: '0',
    paymentDate: new Date().toISOString().split('T')[0]
  });

  const [showResult, setShowResult] = useState(false);
  const [salaryData, setSalaryData] = useState(null);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const formatMoney = (num) => {
    return parseFloat(num).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.month || !formData.year || !formData.employeeName || 
        !formData.position || !formData.baseSalary || !formData.paymentDate) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    const base = parseFloat(formData.baseSalary) || 0;
    const deductions = parseFloat(formData.deductions) || 0;
    const netSalary = base - deductions;

    setSalaryData({
      ...formData,
      baseSalary: base,
      deductions: deductions,
      netSalary: netSalary
    });

    setShowResult(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-fadeIn">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">💰 Folha de Salário</h2>
        <p className="text-gray-600">Gere folhas de pagamento profissionais</p>
      </div>

      <div className="card mb-8 animate-slideInRight">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Dados do Pagamento</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mês *</label>
              <select
                name="month"
                value={formData.month}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Selecione o mês</option>
                {months.map((month, index) => (
                  <option key={index} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ano *</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nome do Funcionário *</label>
            <input
              type="text"
              name="employeeName"
              value={formData.employeeName}
              onChange={handleChange}
              placeholder="Nome completo"
              className="input-field"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cargo *</label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="Ex: Desenvolvedor, Designer, Vendedor"
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Salário Base (Kz) *</label>
              <input
                type="number"
                name="baseSalary"
                value={formData.baseSalary}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Descontos (Kz)</label>
              <input
                type="number"
                name="deductions"
                value={formData.deductions}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                className="input-field"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Data de Pagamento *</label>
            <input
              type="date"
              name="paymentDate"
              value={formData.paymentDate}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <button type="submit" className="btn-primary">
            📄 Gerar Folha de Salário
          </button>
        </form>
      </div>

      {/* Salary Result */}
      {showResult && salaryData && (
        <div className="card animate-fadeIn print:shadow-none" id="salary-sheet">
          <div className="text-center mb-8 pb-6 border-b-4 border-purple-600">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Folha de Salário
            </h2>
            <p className="text-xl font-semibold text-gray-700">Star Step Game</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-purple-50 p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Mês/Ano</p>
              <p className="text-lg font-bold text-purple-700">
                {salaryData.month}/{salaryData.year}
              </p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Data de Pagamento</p>
              <p className="text-lg font-bold text-indigo-700">
                {new Date(salaryData.paymentDate).toLocaleDateString('pt-PT')}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto mb-12">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                  <th className="px-6 py-4 text-left font-semibold">Nome do Funcionário</th>
                  <th className="px-6 py-4 text-left font-semibold">Cargo</th>
                  <th className="px-6 py-4 text-right font-semibold">Salário Base (Kz)</th>
                  <th className="px-6 py-4 text-right font-semibold">Descontos (Kz)</th>
                  <th className="px-6 py-4 text-right font-semibold">Salário Líquido (Kz)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="px-6 py-4 font-medium">{salaryData.employeeName}</td>
                  <td className="px-6 py-4">{salaryData.position}</td>
                  <td className="px-6 py-4 text-right">{formatMoney(salaryData.baseSalary)}</td>
                  <td className="px-6 py-4 text-right text-red-600">{formatMoney(salaryData.deductions)}</td>
                  <td className="px-6 py-4 text-right font-bold text-green-600 text-lg">
                    {formatMoney(salaryData.netSalary)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
            <div className="text-center">
              <div className="border-t-2 border-gray-800 pt-3 mt-20">
                <p className="font-bold text-gray-800">Assinatura do Trabalhador</p>
                <p className="text-sm text-gray-600 mt-1">{salaryData.employeeName}</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t-2 border-gray-800 pt-3 mt-20">
                <p className="font-bold text-gray-800">Assinatura do Chefe</p>
                <p className="text-sm text-gray-600 mt-1">Star Step Game</p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center print:hidden">
            <button onClick={handlePrint} className="btn-primary">
              🖨️ Imprimir Folha de Salário
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
