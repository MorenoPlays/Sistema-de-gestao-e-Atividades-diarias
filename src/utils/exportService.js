import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Utilitário para formatar moeda
const formatCurrency = (value) => {
  if (!value) return '0,00';
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
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(activity);
  });
  
  // Ordenar por data
  return Object.keys(grouped)
    .sort()
    .reduce((result, key) => {
      result[key] = grouped[key];
      return result;
    }, {});
};

export const exportService = {
  // Exportar para PDF com fecho diário
  exportToPDF: (activities, userName) => {
    if (activities.length === 0) {
      alert('Nenhuma atividade para exportar!');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const totals = calculateTotals(activities);
    const dailyGroups = groupByDate(activities);

    // Cabeçalho
    doc.setFillColor(147, 51, 234); // Purple
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('📊 Fecho de Caixa - Relatório Diário', pageWidth / 2, 15, { align: 'center' });

    // Informações do utilizador
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Utilizador: ${userName}`, 14, 45);
    doc.text(`Data de Geração: ${formatDate(new Date().toISOString())}`, 14, 52);
    doc.text(`Período: ${formatDate(Object.keys(dailyGroups)[0])} até ${formatDate(Object.keys(dailyGroups)[Object.keys(dailyGroups).length - 1])}`, 14, 59);
    doc.text(`Total de Dias: ${Object.keys(dailyGroups).length}`, 14, 66);

    // Tabela de fecho diário
    const dailyClosures = [];
    let accumulatedBalance = 0;

    Object.keys(dailyGroups).forEach(date => {
      const dayActivities = dailyGroups[date];
      let dayIn = 0;
      let dayOut = 0;

      dayActivities.forEach(activity => {
        const moneyIn = parseFloat(activity.moneyIn) || 0;
        const moneyOut = parseFloat(activity.moneyOut) || 0;
        dayIn += moneyIn;
        dayOut += moneyOut;
      });

      const dayBalance = dayIn - dayOut;
      accumulatedBalance += dayBalance;

      dailyClosures.push([
        formatDate(date),
        dayActivities[0]?.week || '-',
        formatCurrency(dayIn),
        formatCurrency(dayOut),
        formatCurrency(dayBalance),
        formatCurrency(accumulatedBalance)
      ]);
    });

    autoTable(doc, {
      head: [['Data', 'Semana', 'Entrada (Kz)', 'Saída (Kz)', 'Saldo Diário (Kz)', 'Saldo Acumulado (Kz)']],
      body: dailyClosures,
      startY: 75,
      theme: 'grid',
      headStyles: {
        fillColor: [147, 51, 234],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 4
      },
      alternateRowStyles: {
        fillColor: [245, 245, 250]
      },
      columnStyles: {
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' }
      }
    });

    // Resumo totais
    const finalY = doc.lastAutoTable.finalY + 15;
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

    // Salvar PDF
    const fileName = `Fecho_Diario_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  },

  // Exportar para Excel com cálculos automáticos e fecho diário
  exportToExcel: (activities, userName) => {
    if (activities.length === 0) {
      alert('Nenhuma atividade para exportar!');
      return;
    }

    const totals = calculateTotals(activities);
    const dailyGroups = groupByDate(activities);
    
    // Preparar dados com estrutura de fecho diário
    const dataForExcel = [
      ['RELATÓRIO DE ATIVIDADES DIÁRIAS - FECHO DE CAIXA'],
      [''],
      ['Utilizador:', userName],
      ['Data de Geração:', formatDate(new Date().toISOString())],
      [''],
      ['DATA', 'SEMANA', 'EMPRESA', 'ENTRADA (Kz)', 'SAÍDA (Kz)', 'SALDO (Kz)', 'DESCRIÇÃO', 'EXPEDIENTE']
    ];

    let accumulatedBalance = 0;
    const dailyClosures = [];

    // Processar cada dia (fecho diário)
    Object.keys(dailyGroups).forEach(date => {
      const dayActivities = dailyGroups[date];
      let dayIn = 0;
      let dayOut = 0;

      // Calcular totais do dia
      dayActivities.forEach(activity => {
        const moneyIn = parseFloat(activity.moneyIn) || 0;
        const moneyOut = parseFloat(activity.moneyOut) || 0;
        dayIn += moneyIn;
        dayOut += moneyOut;
      });

      const dayBalance = dayIn - dayOut;
      accumulatedBalance += dayBalance;

      // Adicionar primeira atividade do dia com os totais diários
      const firstActivity = dayActivities[0];
      dataForExcel.push([
        formatDate(date),
        firstActivity.week || '',
        firstActivity.company || '',
        dayIn,
        dayOut,
        dayBalance,
        firstActivity.description || '',
        firstActivity.hours || ''
      ]);

      // Se houver mais de uma atividade no dia, adicionar as outras com espaço
      if (dayActivities.length > 1) {
        for (let i = 1; i < dayActivities.length; i++) {
          const activity = dayActivities[i];
          const actIn = parseFloat(activity.moneyIn) || 0;
          const actOut = parseFloat(activity.moneyOut) || 0;
          dataForExcel.push([
            '',
            activity.week || '',
            activity.company || '',
            actIn,
            actOut,
            actIn - actOut,
            activity.description || '',
            activity.hours || ''
          ]);
        }
      }

      // Adicionar linha em branco após o dia
      dataForExcel.push([]);

      // Armazenar fecho diário
      dailyClosures.push({
        date,
        week: firstActivity.week || '',
        dayIn,
        dayOut,
        dayBalance,
        accumulated: accumulatedBalance
      });
    });

    // Adicionar resumo consolidado
    dataForExcel.push(['FECHO DE CAIXA CONSOLIDADO']);
    dataForExcel.push(['DATA', 'SEMANA', 'ENTRADA (Kz)', 'SAÍDA (Kz)', 'SALDO DIÁRIO (Kz)', 'SALDO ACUMULADO (Kz)']);

    dailyClosures.forEach(closure => {
      dataForExcel.push([
        closure.date,
        closure.week,
        closure.dayIn,
        closure.dayOut,
        closure.dayBalance,
        closure.accumulated
      ]);
    });

    // Adicionar totais gerais
    dataForExcel.push([]);
    dataForExcel.push(['TOTAL GERAL']);
    dataForExcel.push(['Total de Entrada (Kz)', totals.totalIn]);
    dataForExcel.push(['Total de Saída (Kz)', totals.totalOut]);
    dataForExcel.push(['Saldo Total (Kz)', totals.balance]);
    dataForExcel.push(['Número de Dias', Object.keys(dailyGroups).length]);

    // Criar workbook
    const ws = XLSX.utils.aoa_to_sheet(dataForExcel);
    
    // Configurar largura das colunas
    const colWidths = [15, 15, 20, 16, 16, 16, 30, 15];
    ws['!cols'] = colWidths.map(w => ({ wch: w }));

    // Configurar formatação de células
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Fecho Diário');

    // Aplicar estilos básicos
    const range = XLSX.utils.decode_range(ws['!ref']);
    
    // Formatar como número as colunas de moeda
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = 3; col <= 5; col++) { // Colunas Entrada, Saída, Saldo
        const cellAddress = XLSX.utils.encode_col(col) + (row + 1);
        if (ws[cellAddress] && typeof ws[cellAddress].v === 'number') {
          ws[cellAddress].z = '"Kz" #,##0.00'; // Formato monetário
        }
      }
    }

    // Salvar arquivo
    const fileName = `Fecho_Diario_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  },

  // Exportar PDF para um dia específico
  exportDayToPDF: (dayActivities, date, userName) => {
    if (dayActivities.length === 0) {
      alert('Nenhuma atividade para este dia!');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    const dayTotals = dayActivities.reduce(
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

    // Cabeçalho
    doc.setFillColor(147, 51, 234); // Purple
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('📅 Fecho de Caixa - Dia', pageWidth / 2, 15, { align: 'center' });

    // Informações do dia
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Data: ${formatDate(date)}`, 14, 45);
    doc.text(`Utilizador: ${userName}`, 14, 52);
    doc.text(`Data de Geração: ${formatDate(new Date().toISOString())}`, 14, 59);
    doc.text(`Semana: ${dayActivities[0]?.week || '-'}`, 14, 66);

    // Tabela de atividades do dia
    const tableData = dayActivities.map(activity => [
      activity.company || '-',
      formatCurrency(parseFloat(activity.moneyIn) || 0),
      formatCurrency(parseFloat(activity.moneyOut) || 0),
      formatCurrency((parseFloat(activity.moneyIn) || 0) - (parseFloat(activity.moneyOut) || 0)),
      activity.description || '-',
      activity.hours || '-'
    ]);

    autoTable(doc, {
      head: [['Empresa', 'Entrada (Kz)', 'Saída (Kz)', 'Saldo (Kz)', 'Descrição', 'Expediente']],
      body: tableData,
      startY: 75,
      theme: 'grid',
      headStyles: {
        fillColor: [147, 51, 234],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 4
      },
      alternateRowStyles: {
        fillColor: [245, 245, 250]
      },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      }
    });

    // Resumo do dia
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Entrada: ${formatCurrency(dayTotals.totalIn)} Kz`, 14, finalY);
    doc.text(`Total Saída: ${formatCurrency(dayTotals.totalOut)} Kz`, 14, finalY + 8);
    doc.setTextColor(147, 51, 234);
    doc.text(`Saldo do Dia: ${formatCurrency(dayTotals.balance)} Kz`, 14, finalY + 16);

    // Rodapé
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('© 2026 Star Step Game', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

    // Salvar PDF
    const dateStr = formatDate(date).replace(/\//g, '-');
    const fileName = `Fecho_${dateStr}.pdf`;
    doc.save(fileName);
  },

  // Exportar Excel para um dia específico
  exportDayToExcel: (dayActivities, date, userName) => {
    if (dayActivities.length === 0) {
      alert('Nenhuma atividade para este dia!');
      return;
    }

    const dayTotals = dayActivities.reduce(
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

    // Preparar dados
    const dataForExcel = [
      ['FECHO DE CAIXA - DIA'],
      [''],
      ['Data:', formatDate(date)],
      ['Utilizador:', userName],
      ['Semana:', dayActivities[0]?.week || '-'],
      ['Data de Geração:', formatDate(new Date().toISOString())],
      [''],
      ['EMPRESA', 'ENTRADA (Kz)', 'SAÍDA (Kz)', 'SALDO (Kz)', 'DESCRIÇÃO', 'EXPEDIENTE']
    ];

    // Adicionar atividades do dia
    dayActivities.forEach(activity => {
      const actIn = parseFloat(activity.moneyIn) || 0;
      const actOut = parseFloat(activity.moneyOut) || 0;
      dataForExcel.push([
        activity.company || '',
        actIn,
        actOut,
        actIn - actOut,
        activity.description || '',
        activity.hours || ''
      ]);
    });

    // Adicionar totais
    dataForExcel.push([]);
    dataForExcel.push(['RESUMO DO DIA']);
    dataForExcel.push(['Total Entrada (Kz)', dayTotals.totalIn]);
    dataForExcel.push(['Total Saída (Kz)', dayTotals.totalOut]);
    dataForExcel.push(['Saldo Total (Kz)', dayTotals.balance]);

    // Criar workbook
    const ws = XLSX.utils.aoa_to_sheet(dataForExcel);
    
    // Configurar largura das colunas
    const colWidths = [20, 16, 16, 16, 30, 15];
    ws['!cols'] = colWidths.map(w => ({ wch: w }));

    // Criar workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Fecho Diário');

    // Formatar como número as colunas de moeda
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = 1; col <= 3; col++) { // Colunas Entrada, Saída, Saldo
        const cellAddress = XLSX.utils.encode_col(col) + (row + 1);
        if (ws[cellAddress] && typeof ws[cellAddress].v === 'number') {
          ws[cellAddress].z = '"Kz" #,##0.00';
        }
      }
    }

    // Salvar arquivo
    const dateStr = formatDate(date).replace(/\//g, '-');
    const fileName = `Fecho_${dateStr}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }
};
