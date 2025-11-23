import { useEffect, useState } from 'react';
import { supabase, ProductionHistory } from '../lib/supabase';
import {
  ArrowLeft,
  TrendingUp,
  Calendar,
  Package,
  BarChart3,
  Download,
  Filter
} from 'lucide-react';
import { getZoneColor } from '../utils/zoneColors';
import { exportToCSV } from '../utils/exportData';
import { generateStatisticsPDF } from '../utils/exportPDF';
import VerticalBarChart from '../components/VerticalBarChart';

interface StatisticsProps {
  onNavigateBack: () => void;
  darkMode: boolean;
}

interface ZoneStat {
  zone: string;
  total: number;
  products: Record<string, number>;
  trend: number[];
}

interface ComparisonData {
  period: string;
  zones: Record<string, number>;
  total: number;
}

export default function Statistics({ onNavigateBack, darkMode }: StatisticsProps) {
  const [history, setHistory] = useState<ProductionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('week');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchHistory();
  }, [startDate, endDate]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('production_history')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (!error && data) {
        setHistory(data);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const setQuickFilter = (type: 'day' | 'week' | 'month' | 'quarter' | 'year') => {
    setFilterType(type);
    const end = new Date();
    const start = new Date();

    switch (type) {
      case 'day':
        start.setDate(end.getDate() - 1);
        break;
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setMonth(end.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(end.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(end.getFullYear() - 1);
        break;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const filteredHistory = history.filter(h => {
    if (selectedZone !== 'all' && h.zone_name !== selectedZone) return false;
    if (selectedProduct !== 'all' && h.product_code !== selectedProduct) return false;
    return true;
  });

  const zoneStats: ZoneStat[] = Object.entries(
    filteredHistory.reduce((acc, h) => {
      if (!acc[h.zone_name]) {
        acc[h.zone_name] = { zone: h.zone_name, total: 0, products: {}, trend: [] };
      }
      acc[h.zone_name].total += h.quantity;
      acc[h.zone_name].products[h.product_code] = (acc[h.zone_name].products[h.product_code] || 0) + h.quantity;
      return acc;
    }, {} as Record<string, ZoneStat>)
  ).map(([_, stat]) => stat).sort((a, b) => b.total - a.total);

  const dailyComparison: ComparisonData[] = Object.entries(
    filteredHistory.reduce((acc, h) => {
      if (!acc[h.date]) {
        acc[h.date] = { period: h.date, zones: {}, total: 0 };
      }
      acc[h.date].zones[h.zone_name] = (acc[h.date].zones[h.zone_name] || 0) + h.quantity;
      acc[h.date].total += h.quantity;
      return acc;
    }, {} as Record<string, ComparisonData>)
  ).map(([_, data]) => data).sort((a, b) => a.period.localeCompare(b.period));

  const uniqueZones = Array.from(new Set(history.map(h => h.zone_name))).sort();
  const uniqueProducts = Array.from(new Set(history.map(h => h.product_code))).sort();

  const totalProduction = filteredHistory.reduce((sum, h) => sum + h.quantity, 0);
  const averageDaily = dailyComparison.length > 0 ? totalProduction / dailyComparison.length : 0;

  const handleExport = () => {
    const csvData = {
      fecha: `${startDate} a ${endDate}`,
      zonas: zoneStats.map(stat => ({
        nombre: stat.zone,
        productos: Object.entries(stat.products).map(([codigo, cantidad]) => ({
          codigo,
          cantidad
        }))
      }))
    };
    exportToCSV(csvData as any);
  };

  const handleExportPDF = () => {
    generateStatisticsPDF({
      filterType,
      startDate,
      endDate,
      selectedZone,
      selectedProduct,
      totalProduction,
      averageDaily,
      daysAnalyzed: dailyComparison.length,
      zoneStats,
      dailyComparison,
      uniqueZones
    });
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-screen-2xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onNavigateBack}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-[#bd2025]'}`}>
                  Estadísticas y Análisis
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  BackOffice - Análisis de producción
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-[#bd2025] text-white rounded-lg hover:bg-[#8c1619] transition-colors"
              >
                <Download className="w-5 h-5" />
                <span className="text-sm font-semibold">CSV</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-[#bd2025] text-white rounded-lg hover:bg-[#8c1619] transition-colors"
              >
                <Download className="w-5 h-5" />
                <span className="text-sm font-semibold">PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-8 py-6">
        <div className={`rounded-lg shadow-md p-6 mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Filter className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Filtros
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Período rápido
              </label>
              <div className="flex flex-wrap gap-2">
                {(['day', 'week', 'month', 'quarter', 'year'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setQuickFilter(type)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      filterType === type
                        ? 'bg-[#bd2025] text-white'
                        : darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {type === 'day' ? 'Día' : type === 'week' ? 'Semana' : type === 'month' ? 'Mes' : type === 'quarter' ? 'Trimestre' : 'Año'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Fecha inicio
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full px-3 py-2 rounded border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Fecha fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full px-3 py-2 rounded border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Isla
              </label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className={`w-full px-3 py-2 rounded border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">Todas las islas</option>
                {uniqueZones.map(zone => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Producto
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className={`w-full px-3 py-2 rounded border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">Todos los productos</option>
                {uniqueProducts.map(product => (
                  <option key={product} value={product}>{product}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-8 h-8 text-blue-500" />
              <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Producción Total
              </h3>
            </div>
            <p className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {totalProduction.toLocaleString()}
            </p>
          </div>

          <div className={`rounded-lg shadow-md p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Promedio Diario
              </h3>
            </div>
            <p className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {Math.round(averageDaily).toLocaleString()}
            </p>
          </div>

          <div className={`rounded-lg shadow-md p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-8 h-8 text-purple-500" />
              <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Días Analizados
              </h3>
            </div>
            <p className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {dailyComparison.length}
            </p>
          </div>
        </div>

        <div className={`rounded-lg shadow-md p-6 mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Gráfica de Producción por Isla
            </h2>
          </div>

          <VerticalBarChart
            data={zoneStats.map(stat => ({
              label: stat.zone,
              value: stat.total,
              color: getZoneColor(stat.zone).primary
            }))}
            height={300}
            darkMode={darkMode}
          />
        </div>

        <div className={`rounded-lg shadow-md p-6 mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center gap-3 mb-6">
            <Package className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Detalle de Producción por Isla
            </h2>
          </div>

          <div className="space-y-4">
            {zoneStats.map(stat => {
              const color = getZoneColor(stat.zone);
              const percentage = totalProduction > 0 ? (stat.total / totalProduction) * 100 : 0;

              return (
                <div key={stat.zone} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-semibold ${color.text}`}>{stat.zone}</h3>
                    <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {stat.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full transition-all duration-1000"
                      style={{ width: `${percentage}%`, backgroundColor: color.primary }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {Object.entries(stat.products).map(([product, quantity]) => (
                      <div
                        key={product}
                        className={`px-3 py-1 rounded text-sm ${
                          darkMode ? 'bg-gray-600 text-gray-200' : 'bg-white text-gray-700'
                        }`}
                      >
                        <span className="font-medium">{product}:</span> {quantity}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={`rounded-lg shadow-md p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Comparativa Diaria
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Fecha
                  </th>
                  {uniqueZones.map(zone => (
                    <th
                      key={zone}
                      className={`px-4 py-3 text-right text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      {zone}
                    </th>
                  ))}
                  <th className={`px-4 py-3 text-right text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {dailyComparison.map(day => (
                  <tr key={day.period} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <td className={`px-4 py-3 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {new Date(day.period + 'T00:00:00').toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    {uniqueZones.map(zone => (
                      <td key={zone} className={`px-4 py-3 text-right text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {day.zones[zone]?.toLocaleString() || '-'}
                      </td>
                    ))}
                    <td className={`px-4 py-3 text-right text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {day.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
