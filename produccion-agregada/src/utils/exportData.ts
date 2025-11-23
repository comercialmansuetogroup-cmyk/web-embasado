import { AggregatedProductionData } from '../lib/supabase';

export function exportToCSV(data: AggregatedProductionData[], filename: string = 'produccion-agregada.csv') {
  const headers = ['Descripción', 'Cantidad Total', 'Última Actualización'];
  
  const csvContent = [
    headers.join(','),
    ...data.map(item => [
      `"${item.description}"`,
      item.total_quantity,
      new Date(item.last_updated).toLocaleString('es-ES')
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
