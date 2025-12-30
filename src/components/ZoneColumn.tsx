import { Package, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { ZoneData, AlertThreshold } from '../lib/supabase';
import AnimatedNumber from './AnimatedNumber';
import { getZoneColor } from '../utils/zoneColors';

interface ZoneColumnProps {
  zone: ZoneData;
  columnCount: number;
  threshold?: AlertThreshold;
  history?: Record<number, number>;
  previousDayTotal?: number;
  darkMode?: boolean;
}

export default function ZoneColumn({
  zone,
  columnCount,
  threshold,
  history = {},
  previousDayTotal = 0,
  darkMode = false
}: ZoneColumnProps) {
  const totalQuantity = zone.productos.reduce((sum, product) => sum + product.cantidad, 0);
  const zoneColor = getZoneColor(zone.nombre);

  const changeVsPrevious = previousDayTotal > 0
    ? ((totalQuantity - previousDayTotal) / previousDayTotal) * 100
    : 0;

  const isBelowThreshold = threshold?.alert_enabled && totalQuantity < threshold.min_threshold;
  const isAboveMaxThreshold = threshold?.alert_enabled && totalQuantity > threshold.max_threshold;

  const historyArray = Object.entries(history)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([_, value]) => value);

  if (totalQuantity === 0) {
    return null;
  }

  const productsByCode: Record<string, number> = {};
  zone.productos.forEach((product) => {
    if (productsByCode[product.codigo]) {
      productsByCode[product.codigo] += product.cantidad;
    } else {
      productsByCode[product.codigo] = product.cantidad;
    }
  });

  const sortedProducts = Object.entries(productsByCode).sort(([a], [b]) => a.localeCompare(b));

  const getNumberSize = () => {
    if (columnCount === 1) return 'text-7xl';
    if (columnCount === 2) return 'text-6xl';
    if (columnCount === 3) return 'text-5xl';
    return 'text-4xl';
  };

  const getProductNameSize = (name: string) => {
    const length = name.length;
    if (columnCount === 1) {
      if (length > 40) return 'text-xl';
      if (length > 30) return 'text-2xl';
      return 'text-3xl';
    }
    if (columnCount === 2) {
      if (length > 35) return 'text-lg';
      if (length > 25) return 'text-xl';
      return 'text-2xl';
    }
    if (columnCount === 3) {
      if (length > 30) return 'text-base';
      if (length > 20) return 'text-lg';
      return 'text-xl';
    }
    if (length > 25) return 'text-sm';
    if (length > 20) return 'text-base';
    return 'text-lg';
  };

  const getTitleSize = () => {
    if (columnCount === 1) return 'text-8xl';
    if (columnCount === 2) return 'text-7xl';
    if (columnCount === 3) return 'text-6xl';
    return 'text-5xl';
  };

  return (
    <div className={`rounded-2xl shadow-xl border-2 overflow-hidden flex flex-col h-full ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className={`bg-gradient-to-r ${zoneColor.gradient} px-6 py-3 flex items-center gap-3 shadow-md relative`}>
        <Package className="text-white" size={columnCount === 1 ? 56 : columnCount === 2 ? 52 : columnCount === 3 ? 48 : 44} strokeWidth={2.5} />
        <div>
          <h2 className={`${getTitleSize()} font-bold text-white tracking-tight`}>
            {zone.nombre}
          </h2>
          {zone.nombre === 'Gran Canaria' && (
            <span className="text-white text-sm opacity-80">(local)</span>
          )}
        </div>
        {(isBelowThreshold || isAboveMaxThreshold) && (
          <AlertTriangle className="text-yellow-300 animate-pulse ml-auto" size={32} />
        )}
      </div>

      <div className="flex-1 p-4 flex flex-col">
        {previousDayTotal > 0 && (
          <div className={`mb-3 p-2 rounded-lg border-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>vs Ayer</span>
              <div className="flex items-center gap-2">
                {changeVsPrevious > 0 ? (
                  <TrendingUp className="text-green-600" size={20} />
                ) : changeVsPrevious < 0 ? (
                  <TrendingDown className="text-red-600" size={20} />
                ) : null}
                <span className={`text-lg font-bold ${
                  changeVsPrevious > 0 ? 'text-green-600' : changeVsPrevious < 0 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {changeVsPrevious > 0 ? '+' : ''}{changeVsPrevious.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2 flex-1 overflow-y-auto">
          {sortedProducts.map(([codigo, cantidad]) => (
            <div
              key={codigo}
              className={`flex justify-between items-center gap-6 py-3 px-4 rounded-lg border-2 hover:scale-102 transition-all ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                  : zoneColor.light + ' ' + zoneColor.border + ' hover:bg-opacity-80'
              }`}
            >
              <span className={`${getProductNameSize(codigo)} font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} line-clamp-1 flex-1`}>
                {codigo}
              </span>
              <AnimatedNumber
                value={cantidad}
                className={`${getNumberSize()} font-extrabold ${zoneColor.text} flex-shrink-0`}
              />
            </div>
          ))}
        </div>

        <div className={`mt-4 pt-4 border-t-4 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
          <div className={`flex justify-between items-center py-4 px-4 bg-gradient-to-r ${zoneColor.gradient} rounded-xl shadow-lg relative overflow-hidden`}>
            <span className={`${getNumberSize()} font-bold text-white uppercase tracking-wide relative z-10`}>
              Total
            </span>
            <AnimatedNumber
              value={totalQuantity}
              className={`${getNumberSize()} font-extrabold text-white relative z-10`}
            />
          </div>
          {isBelowThreshold && (
            <div className="mt-3 p-3 bg-yellow-100 border-2 border-yellow-400 rounded-lg flex items-center gap-2">
              <AlertTriangle className="text-yellow-700" size={20} />
              <span className="text-sm font-semibold text-yellow-800">
                Por debajo del umbral mínimo ({threshold.min_threshold})
              </span>
            </div>
          )}
          {isAboveMaxThreshold && (
            <div className="mt-3 p-3 bg-orange-100 border-2 border-orange-400 rounded-lg flex items-center gap-2">
              <AlertTriangle className="text-orange-700" size={20} />
              <span className="text-sm font-semibold text-orange-800">
                Por encima del umbral máximo ({threshold.max_threshold})
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
