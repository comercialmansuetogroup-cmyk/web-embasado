import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import { RefreshCw, AlertCircle, Package } from 'lucide-react';
import AnimatedNumber from '../components/AnimatedNumber';

interface ProductoAgregado {
  nombre: string;
  cantidad: number;
}

interface AggregatedProductionData {
  fecha: string;
  productos: ProductoAgregado[];
  updated_at: string;
}

interface AggregatedDashboardProps {
  onNavigateToStats: () => void;
}

export default function AggregatedDashboard({ onNavigateToStats }: AggregatedDashboardProps) {
  const [productionData, setProductionData] = useState<AggregatedProductionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const fetchProductionData = async () => {
    try {
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('aggregated_production_data')
        .select('*')
        .eq('fecha', today)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        setProductionData({
          fecha: data.fecha,
          productos: data.productos,
          updated_at: data.updated_at,
        });
        setLastUpdate(new Date(data.updated_at));
      }
    } catch (err) {
      console.error('Error fetching production data:', err);
      setError('Error al cargar los datos de producción');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductionData();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const channel = supabase
      .channel('aggregated-production-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'aggregated_production_data',
        },
        () => {
          fetchProductionData();
        }
      )
      .subscribe();

    const refreshInterval = setInterval(() => {
      fetchProductionData();
    }, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(refreshInterval);
    };
  }, []);

  const totalProduction = productionData?.productos.reduce((sum, p) => sum + p.cantidad, 0) || 0;

  const groupedByType = productionData?.productos.reduce((acc, producto) => {
    const type = producto.nombre.split(' ')[0];
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(producto);
    return acc;
  }, {} as Record<string, ProductoAgregado[]>) || {};

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-[#bd2025] animate-spin mx-auto mb-4" />
          <p className="text-2xl font-semibold text-gray-700">Cargando datos de producción...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-[#bd2025] mx-auto mb-4" />
          <p className="text-2xl font-semibold text-gray-700 mb-2">{error}</p>
          <button
            onClick={fetchProductionData}
            className="mt-4 px-6 py-3 bg-[#bd2025] text-white rounded-lg font-semibold hover:bg-[#8c1619] transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!productionData || productionData.productos.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onNavigateToStats={onNavigateToStats}
          showControls={true}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-2xl font-semibold text-gray-600">
              No hay datos de producción disponibles
            </p>
            <p className="text-gray-500 mt-2">
              Esperando datos desde Make.com...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onNavigateToStats={onNavigateToStats}
        showControls={true}
      />

      <main className="flex-1 px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className={`mb-8 p-6 rounded-2xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Package className={`w-12 h-12 ${darkMode ? 'text-[#ff4449]' : 'text-[#bd2025]'}`} />
                <div>
                  <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Producción Total
                  </h2>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {new Date(productionData.fecha).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <AnimatedNumber
                  value={totalProduction}
                  className={`text-5xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}
                />
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  unidades totales
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(groupedByType).map(([type, productos]) => {
              const typeTotal = productos.reduce((sum, p) => sum + p.cantidad, 0);

              return (
                <div
                  key={type}
                  className={`rounded-2xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {type}
                  </h3>

                  <div className={`mb-4 pb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total {type}
                      </span>
                      <AnimatedNumber
                        value={typeTotal}
                        className={`text-2xl font-bold ${darkMode ? 'text-[#ff4449]' : 'text-[#bd2025]'}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {productos.map((producto) => (
                      <div
                        key={producto.nombre}
                        className={`flex justify-between items-center p-3 rounded-lg ${
                          darkMode ? 'bg-gray-700' : 'bg-gray-50'
                        }`}
                      >
                        <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {producto.nombre}
                        </span>
                        <AnimatedNumber
                          value={producto.cantidad}
                          className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {lastUpdate && (
        <footer className={`py-3 px-8 border-t ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
          <p className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Última actualización: {lastUpdate.toLocaleString('es-ES')}
          </p>
        </footer>
      )}
    </div>
  );
}
