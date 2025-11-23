import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProductionHistory } from '../lib/supabase';

export function generateStatisticsPDF(
  data: ProductionHistory[],
  period: string,
  filename: string = 'estadisticas-produccion.pdf'
) {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Estadísticas de Producción', 14, 20);
  
  doc.setFontSize(11);
  const currentDate = new Date().toLocaleString('es-ES');
  doc.text('Generado: ' + currentDate, 14, 28);
  doc.text('Período: ' + period, 14, 34);

  const tableData = data.map(item => [
    item.date,
    item.zone_name,
    item.product_code,
    item.quantity.toString(),
    item.hour ? item.hour.toString() : '-'
  ]);

  autoTable(doc, {
    head: [['Fecha', 'Zona', 'Producto', 'Cantidad', 'Hora']],
    body: tableData,
    startY: 40,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [71, 85, 105] },
  });

  doc.save(filename);
}
