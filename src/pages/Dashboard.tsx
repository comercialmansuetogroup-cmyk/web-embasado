import { useEffect, useState } from 'react';
import { supabase, ProductionData, AlertThreshold, ProductionHistory } from '../lib/supabase';
import Header from '../components/Header';
import ZoneColumn from '../components/ZoneColumn';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { soundAlert } from '../utils/soundAlerts';

interface DashboardProps {
  onNavigateToStats: () => void;
}

export default function Dashboard({ onNavigateToStats }: DashboardProps) {
  const [productionData, setProductionData] = useState<ProductionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [thresholds, setThresholds] = useState<AlertThreshold[]>([]);
  const [history, setHistory] = useState<ProductionHistory[]>([]);
  const [previousDayData, setPreviousDayData] = useState<Record<string, number>>({});
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [hasNewData, setHasNewData] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const fetchProductionData = async () => {
    try {
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('production_data')
        .select('*')
        .eq('fecha', today)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      const isNewData = data && (!productionData || new Date(data.updated_at).getTime() > new Date(lastUpdate || 0).getTime());

      if (data) {
        setProductionData({
          fecha: data.fecha,
          zonas: data.zonas,
        });
        setLastUpdate(new Date(data.updated_at));

        if (isNewData && soundEnabled) {
          setHasNewData(true);
          soundAlert.playUpdate();
          setTimeout(() => setHasNewData(false), 2000);
        }
      }
    } catch (err) {
      console.error('Error fetching production data:', err);
      setError('Error al cargar los datos de producción');
    } finally {
      setLoading(false);
    }
  };


  const fetchThresholds = async () => {
    try {
      const { data, error } = await supabase
        .from('alert_thresholds')
        .select('*');

      if (!error && data) {
        setThresholds(data);
      }
    } catch (err) {
      console.error('Error fetching thresholds:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('production_history')
        .select('*')
        .eq('date', today)
        .order('hour', { ascending: true });

      if (!error && data) {
        setHistory(data);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const fetchPreviousDayData = async () => {
    try {
      const previousDate = new Date(today);
      previousDate.setDate(previousDate.getDate() - 1);
      const prevDateStr = previousDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('production_data')
        .select('*')
        .eq('fecha', prevDateStr)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        const prevData: Record<string, number> = {};
        data.zonas.forEach((zone: { nombre: string; productos: { cantidad: number }[] }) => {
          prevData[zone.nombre] = zone.productos.reduce((sum: number, p: { cantidad: number }) => sum + p.cantidad, 0);
        });
        setPreviousDayData(prevData);
      }
    } catch (err) {
      console.error('Error fetching previous day data:', err);
    }
  };

  useEffect(() => {
    fetchProductionData();
    fetchThresholds();
    fetchHistory();
    fetchPreviousDayData();
  }, []);

  useEffect(() => {
    soundAlert.setEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const channel = supabase
      .channel('production-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'production_data',
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          fetchProductionData();
          fetchHistory();
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    const refreshInterval = setInterval(() => {
      fetchProductionData();
    }, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(refreshInterval);
    };
  }, []);

  const visibleZones = productionData?.zonas.filter(zone => {
    const total = zone.productos.reduce((sum, p) => sum + p.cantidad, 0);
    return total > 0;
  }) || [];

  const getGridColumns = (count: number) => {
    if (count === 1) return 'grid-cols-1 max-w-3xl mx-auto';
    if (count === 2) return 'grid-cols-2 gap-8';
    if (count === 3) return 'grid-cols-3 gap-6';
    return 'grid-cols-4 gap-6';
  };


  const getZoneThreshold = (zoneName: string) => {
    return thresholds.find(t => t.zone_name === zoneName);
  };

  const getZoneHistory = (zoneName: string) => {
    return history
      .filter(h => h.zone_name === zoneName)
      .reduce((acc, curr) => {
        const hour = curr.hour || 0;
        acc[hour] = (acc[hour] || 0) + curr.quantity;
        return acc;
      }, {} as Record<number, number>);
  };

  const getPreviousDayTotal = (zoneName: string) => {
    return previousDayData[zoneName] || 0;
  };

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

  if (!productionData || visibleZones.length === 0) {
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

  // Calcular el número máximo de productos únicos entre todas las zonas
  const maxProductCount = Math.max(
    ...visibleZones.map((zone) => {
      const uniqueProducts = new Set(zone.productos.map(p => p.codigo));
      return uniqueProducts.size;
    })
  );

  return (
    <div className={`h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onNavigateToStats={onNavigateToStats}
        showControls={true}
      />

      <main className="flex-1 px-4 py-3 overflow-hidden">
        <div className={`grid ${getGridColumns(visibleZones.length)} h-full gap-4`}>
          {visibleZones.map((zone) => (
            <ZoneColumn
              key={zone.nombre}
              zone={zone}
              columnCount={visibleZones.length}
              threshold={getZoneThreshold(zone.nombre)}
              history={getZoneHistory(zone.nombre)}
              previousDayTotal={getPreviousDayTotal(zone.nombre)}
              darkMode={darkMode}
              totalProductCount={maxProductCount}
            />
          ))}
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
