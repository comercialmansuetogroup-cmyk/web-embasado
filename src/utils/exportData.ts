import { ProductionData } from '../lib/supabase';

export const exportToCSV = (data: ProductionData) => {
  const rows: string[] = [];
  rows.push('Zona,Producto,Cantidad');

  data.zonas.forEach(zone => {
    zone.productos.forEach(product => {
      rows.push(`${zone.nombre},${product.codigo},${product.cantidad}`);
    });
  });

  const csvContent = rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `produccion_${data.fecha}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const printReport = (data: ProductionData) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Reporte de Producción - ${data.fecha}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
          }
          h1 {
            color: #bd2025;
            text-align: center;
          }
          .zone {
            margin: 30px 0;
            page-break-inside: avoid;
          }
          .zone-title {
            background: #bd2025;
            color: white;
            padding: 15px;
            font-size: 24px;
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #f3f4f6;
            font-weight: bold;
          }
          .total {
            background-color: #f9fafb;
            font-weight: bold;
          }
          @media print {
            body { margin: 20px; }
          }
        </style>
      </head>
      <body>
        <h1>Reporte de Producción</h1>
        <p style="text-align: center; font-size: 18px;">Fecha: ${data.fecha}</p>
        ${data.zonas.map(zone => {
          const total = zone.productos.reduce((sum, p) => sum + p.cantidad, 0);
          return `
            <div class="zone">
              <div class="zone-title">${zone.nombre}</div>
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  ${zone.productos.map(product => `
                    <tr>
                      <td>${product.codigo}</td>
                      <td>${product.cantidad}</td>
                    </tr>
                  `).join('')}
                  <tr class="total">
                    <td>TOTAL</td>
                    <td>${total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          `;
        }).join('')}
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
  }, 250);
};
