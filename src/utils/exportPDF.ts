import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ZoneStat {
  zone: string;
  total: number;
  products: Record<string, number>;
}

interface ComparisonData {
  period: string;
  zones: Record<string, number>;
  total: number;
}

interface PDFExportData {
  filterType: string;
  startDate: string;
  endDate: string;
  selectedZone: string;
  selectedProduct: string;
  totalProduction: number;
  averageDaily: number;
  daysAnalyzed: number;
  zoneStats: ZoneStat[];
  dailyComparison: ComparisonData[];
  uniqueZones: string[];
}

export const generateStatisticsPDF = async (data: PDFExportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Colores corporativos
  const primaryRed = '#bd2025';
  const lightGray = '#f3f4f6';

  let yPos = 20;

  // Logo y fecha (usando texto en lugar de imagen por simplicidad)
  doc.setFontSize(24);
  doc.setTextColor(primaryRed);
  doc.setFont('helvetica', 'bold');
  doc.text('M', 20, yPos);

  // Fecha de descarga a la derecha
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'normal');
  const downloadDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Fecha de descarga: ${downloadDate}`, pageWidth - 20, yPos, { align: 'right' });

  yPos += 5;

  // Título del reporte
  doc.setFontSize(18);
  doc.setTextColor(primaryRed);
  doc.setFont('helvetica', 'bold');
  doc.text('MANSUETO GROUP', 20, yPos);
  yPos += 8;

  doc.setFontSize(14);
  doc.setTextColor(60);
  doc.text('Informe de Estadísticas de Producción', 20, yPos);
  yPos += 12;

  // Información de filtros aplicados
  doc.setFontSize(11);
  doc.setTextColor(80);
  doc.setFont('helvetica', 'bold');
  doc.text('Filtros Aplicados:', 20, yPos);
  yPos += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Período: ${getFilterTypeLabel(data.filterType)}`, 25, yPos);
  yPos += 5;
  doc.text(`Rango: ${formatDate(data.startDate)} - ${formatDate(data.endDate)}`, 25, yPos);
  yPos += 5;

  if (data.selectedZone !== 'all') {
    doc.text(`Isla: ${data.selectedZone}`, 25, yPos);
    yPos += 5;
  }

  if (data.selectedProduct !== 'all') {
    doc.text(`Producto: ${data.selectedProduct}`, 25, yPos);
    yPos += 5;
  }

  yPos += 5;

  // Resumen de métricas principales
  doc.setFillColor(primaryRed);
  doc.rect(20, yPos, pageWidth - 40, 25, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');

  const col1X = 30;
  const col2X = pageWidth / 2 - 10;
  const col3X = pageWidth - 70;

  doc.text('Producción Total', col1X, yPos + 8);
  doc.text('Promedio Diario', col2X, yPos + 8);
  doc.text('Días Analizados', col3X, yPos + 8);

  doc.setFontSize(14);
  doc.text(data.totalProduction.toLocaleString('es-ES'), col1X, yPos + 17);
  doc.text(Math.round(data.averageDaily).toLocaleString('es-ES'), col2X, yPos + 17);
  doc.text(data.daysAnalyzed.toString(), col3X, yPos + 17);

  yPos += 35;

  // Tabla: Producción por Isla
  doc.setTextColor(primaryRed);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Producción por Isla', 20, yPos);
  yPos += 7;

  const zoneTableData = data.zoneStats.map(stat => {
    const productsStr = Object.entries(stat.products)
      .map(([code, qty]) => `${code}: ${qty}`)
      .join(', ');
    return [
      stat.zone,
      stat.total.toLocaleString('es-ES'),
      ((stat.total / data.totalProduction) * 100).toFixed(1) + '%',
      productsStr
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['Isla', 'Total', '% del Total', 'Detalle de Productos']],
    body: zoneTableData,
    theme: 'grid',
    headStyles: {
      fillColor: [189, 32, 37],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: {
      fontSize: 9,
      cellPadding: 4
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 30 },
      1: { halign: 'right', cellWidth: 25 },
      2: { halign: 'center', cellWidth: 20 },
      3: { cellWidth: 'auto' }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Nueva página si es necesario
  if (yPos > pageHeight - 60) {
    doc.addPage();
    yPos = 20;
  }

  // Tabla: Comparativa Diaria
  doc.setTextColor(primaryRed);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Comparativa Diaria', 20, yPos);
  yPos += 7;

  const dailyTableHead = [['Fecha', ...data.uniqueZones, 'Total']];
  const dailyTableData = data.dailyComparison.slice(0, 15).map(day => {
    const row = [day.period];
    data.uniqueZones.forEach(zone => {
      row.push((day.zones[zone] || 0).toLocaleString('es-ES'));
    });
    row.push(day.total.toLocaleString('es-ES'));
    return row;
  });

  autoTable(doc, {
    startY: yPos,
    head: dailyTableHead,
    body: dailyTableData,
    theme: 'grid',
    headStyles: {
      fillColor: [189, 32, 37],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8
    },
    styles: {
      fontSize: 8,
      cellPadding: 3
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 25 }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Pie de página
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      'MANSUETO GROUP - Sistema de Producción',
      20,
      pageHeight - 10
    );
  }

  // Guardar el PDF
  const fileName = `Estadisticas_Produccion_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

const getFilterTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    day: 'Último día',
    week: 'Última semana',
    month: 'Último mes',
    quarter: 'Último trimestre',
    year: 'Último año'
  };
  return labels[type] || type;
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};
