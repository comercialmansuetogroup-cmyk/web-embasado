import { useState, useEffect } from 'react';
import { Download, FileText, RefreshCw } from 'lucide-react';
import { supabase, AggregatedProductionData } from '../lib/supabase';
import Header from '../components/Header';
import AnimatedNumber from '../components/AnimatedNumber';
import DateFilter from '../components/DateFilter';
import { exportToCSV } from '../utils/exportData';
import { exportToPDF } from '../utils/exportPDF';

export default function Dashboard() {
  const [data, setData] = useState<AggregatedProductionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: productionData, error } = await supabase
        .from('aggregated_production_data')
        .select('*')
        .order('total_quantity', { ascending: false });

      if (error) throw error;

      setData(productionData || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    const channel = supabase
      .channel('aggregated-production-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'aggregated_production_data' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const totalProduction = data.reduce((sum, item) => sum + item.total_quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      
      <div className="max-w-7xl mx-auto p-6">
        <DateFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-800">Resumen de Producción</h2>
            <div className="flex gap-2">
              <button
                onClick={() => exportToCSV(data)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={() => exportToPDF(data)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white mb-6">
            <h3 className="text-lg font-semibold mb-2">Total Producido</h3>
            <div className="text-4xl font-bold">
              <AnimatedNumber value={totalProduction} />
            </div>
            {lastUpdate && (
              <p className="text-sm text-blue-100 mt-2">
                Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
              </p>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Descripción</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Cantidad Total</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Última Actualización</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-800">{item.description}</td>
                    <td className="py-3 px-4 text-right text-lg font-semibold text-blue-600">
                      {item.total_quantity.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-slate-600">
                      {new Date(item.last_updated).toLocaleString('es-ES')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-500">
              No hay datos de producción disponibles
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
