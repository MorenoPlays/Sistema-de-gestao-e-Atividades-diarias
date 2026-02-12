import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Utilitário para formatar moeda
const formatCurrency = (value) => {
  if (value === undefined || value === null || value === '') return '0,00';
  return parseFloat(value).toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Utilitário para formatar data
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('pt-PT');
};

// Calcular totais
const calculateTotals = (activities) => {
  return activities.reduce(
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
};

// Agrupar atividades por data (fecho diário)
const groupByDate = (activities) => {
  const grouped = {};
  activities.forEach(activity => {
    const date = activity.date;
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(activity);
  });

  return Object.keys(grouped)
    .sort()
    .reduce((res, key) => {
      res[key] = grouped[key];
      return res;
    }, {});
};

export const exportService = {
  // Exportar para PDF em orientação landscape com título Escala de Trabalho
  exportToPDF: (activities, userName) => {
    if (!activities || activities.length === 0) {
      alert('Nenhuma atividade para exportar!');
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const totals = calculateTotals(activities);
    const dailyGroups = groupByDate(activities);

    // Cabeçalho
    doc.setFillColor(147, 51, 234);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('📋 Escala de Trabalho - Relatório', pageWidth / 2, 15, { align: 'center' });

    // Informações
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Utilizador: ${userName}`, 14, 45);
    const dates = Object.keys(dailyGroups);
    doc.text(
      `Período: ${formatDate(dates[0] || new Date().toISOString())} até ${formatDate(dates[dates.length - 1] || new Date().toISOString())}`,
      14,
      52
    );
    doc.text(`Total de Dias: ${dates.length}`, 14, 59);

    // Preparar linhas (mostrar funcionário responsável na primeira atividade do dia)
    const body = [];
    let accumulated = 0;

    dates.forEach(date => {
      const dayActs = dailyGroups[date];
      const dayIn = dayActs.reduce((s, a) => s + (parseFloat(a.moneyIn) || 0), 0);
      const dayOut = dayActs.reduce((s, a) => s + (parseFloat(a.moneyOut) || 0), 0);
      const dayBalance = dayIn - dayOut;
      accumulated += dayBalance;

      body.push([
        formatDate(date),
        dayActs[0]?.week || '-',
        dayActs[0]?.user?.name || dayActs[0]?.userId || '-',
        formatCurrency(dayIn),
        formatCurrency(dayOut),
        formatCurrency(dayBalance),
        formatCurrency(accumulated)
      ]);
    });

    autoTable(doc, {
      head: [[
        'Data',
        'Semana',
        'Funcionário',
        'Entrada (Kz)',
        'Saída (Kz)',
        'Saldo Diário (Kz)',
        'Saldo Acumulado (Kz)'
      ]],
      body,
      startY: 75,
      theme: 'grid',
      headStyles: { fillColor: [147, 51, 234], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10 },
      bodyStyles: { fontSize: 9, cellPadding: 4 },
      alternateRowStyles: { fillColor: [245, 245, 250] },
      columnStyles: {
        3: { halign: 'right' }, // Entrada
        4: { halign: 'right' }, // Saída
        5: { halign: 'right' }, // Saldo
        6: { halign: 'right' }  // Acumulado
      }
    });

    // Totais
    const finalY = doc.lastAutoTable.finalY + 12;
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Entrada: ${formatCurrency(totals.totalIn)} Kz`, 14, finalY);
    doc.text(`Total Saída: ${formatCurrency(totals.totalOut)} Kz`, 14, finalY + 8);
    doc.setTextColor(147, 51, 234);
    doc.text(`Saldo Total: ${formatCurrency(totals.balance)} Kz`, 14, finalY + 16);

    // Rodapé
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('© 2026 Star Step Game', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

    const fileName = `Escala_de_Trabalho_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  },

  // Exportar para Excel (mantém estrutura de fecho, inclui funcionário)
  exportToExcel: (activities, userName) => {
    if (!activities || activities.length === 0) {
      alert('Nenhuma atividade para exportar!');
      return;
    }

    const dailyGroups = groupByDate(activities);
    const wbData = [];

    wbData.push(['ESCALA DE TRABALHO - FECHO DE ATIVIDADES']);
    wbData.push([]);
    wbData.push(['Utilizador:', userName]);
    wbData.push(['Data de Geração:', formatDate(new Date().toISOString())]);
    wbData.push([]);
    wbData.push(['DATA', 'SEMANA', 'FUNCIONÁRIO', 'EMPRESA', 'ENTRADA (Kz)', 'SAÍDA (Kz)', 'SALDO (Kz)', 'DESCRIÇÃO', 'EXPEDIENTE']);

    Object.keys(dailyGroups).forEach(date => {
      const dayActs = dailyGroups[date];
      const first = dayActs[0];
      const dayIn = dayActs.reduce((s, a) => s + (parseFloat(a.moneyIn) || 0), 0);
      const dayOut = dayActs.reduce((s, a) => s + (parseFloat(a.moneyOut) || 0), 0);
      const dayBalance = dayIn - dayOut;

      wbData.push([
        formatDate(date),
        first.week || '',
        first.user?.name || first.userId || '',
        first.company?.name || '',
        dayIn,
        dayOut,
        dayBalance,
        first.description || '',
        `${first.hoursStart || '-'} / ${first.hoursEnd || '-'}`
      ]);

      if (dayActs.length > 1) {
        for (let i = 1; i < dayActs.length; i++) {
          const a = dayActs[i];
          wbData.push(['', a.week || '', a.user?.name || a.userId || '', a.company?.name || '', parseFloat(a.moneyIn) || 0, parseFloat(a.moneyOut) || 0, (parseFloat(a.moneyIn) || 0) - (parseFloat(a.moneyOut) || 0), a.description || '', `${a.hoursStart || '-'} / ${a.hoursEnd || '-'}`]);
        }
      }

      wbData.push([]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wbData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Escala');
    const fileName = `Escala_de_Trabalho_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  },

  // Exportar PDF para um dia específico (landscape) e mostrar funcionário
  exportDayToPDF: (dayActivities, date, userName) => {
    if (!dayActivities || dayActivities.length === 0) {
      alert('Nenhuma atividade para este dia!');
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Cabeçalho
    doc.setFillColor(147, 51, 234);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text(`📋 Escala de Trabalho — ${formatDate(date)}`, pageWidth / 2, 16, { align: 'center' });

    // Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Data: ${formatDate(date)}`, 14, 45);
    doc.text(`Utilizador: ${userName}`, 14, 52);
    doc.text(`Semana: ${dayActivities[0]?.week || '-'}`, 14, 59);

    // Tabela
    const rows = dayActivities.map(a => [
      a.week || '',
      a.user?.name || a.userId || '-',
      a.company?.name || a.company || '',
      formatCurrency(parseFloat(a.moneyIn) || 0),
      formatCurrency(parseFloat(a.moneyOut) || 0),
      `${a.hoursStart || '-'} / ${a.hoursEnd || '-'}`,
      a.description || ''
    ]);

    autoTable(doc, {
      head: [[ 'Semana', 'Funcionário', 'Empresa', 'Entrada (Kz)', 'Saída (Kz)', 'Expediente', 'Descrição' ]],
      body: rows,
      startY: 75,
      theme: 'grid',
      headStyles: { fillColor: [147, 51, 234], textColor: [255, 255, 255], fontStyle: 'bold' },
      bodyStyles: { fontSize: 9 },
      columnStyles: { 3: { halign: 'right' }, 4: { halign: 'right' } }
    });

    const finalY = doc.lastAutoTable.finalY + 12;
    const totals = dayActivities.reduce((acc, a) => {
      acc.totalIn += parseFloat(a.moneyIn) || 0;
      acc.totalOut += parseFloat(a.moneyOut) || 0;
      return acc;
    }, { totalIn: 0, totalOut: 0 });

    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Entrada: ${formatCurrency(totals.totalIn)} Kz`, 14, finalY);
    doc.text(`Total Saída: ${formatCurrency(totals.totalOut)} Kz`, 14, finalY + 8);

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('© 2026 Star Step Game', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

    const dateStr = formatDate(date).replace(/\//g, '-');
    const fileName = `Escala_${dateStr}.pdf`;
    doc.save(fileName);
  }
};

