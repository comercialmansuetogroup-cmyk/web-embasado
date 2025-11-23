import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AggregatedProductionData } from '../lib/supabase';

export function exportToPDF(data: AggregatedProductionData[], filename: string = 'produccion-agregada.pdf') {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Producción Agregada - Mansueto', 14, 20);
  
  doc.setFontSize(11);
  const currentDate = new Date().toLocaleString('es-ES');
  doc.text('Generado: ' + currentDate, 14, 28);

  const tableData = data.map(item => [
    item.description,
    item.total_quantity.toLocaleString(),
    new Date(item.last_updated).toLocaleString('es-ES')
  ]);

  autoTable(doc, {
    head: [['Descripción', 'Cantidad Total', 'Última Actualización']],
    body: tableData,
    startY: 35,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [71, 85, 105] },
  });

  doc.save(filename);
}
