import { ProductionHistory } from '../lib/supabase';

export function exportToCSV(data: ProductionHistory[], filename: string = 'production-data.csv') {
  const headers = ['Fecha', 'Zona', 'Producto', 'Cantidad', 'Hora'];
  
  const csvContent = [
    headers.join(','),
    ...data.map(item => [
      item.date,
      item.zone_name,
      item.product_code,
      item.quantity,
      item.hour || ''
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
