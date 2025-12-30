import { Package, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { ZoneData, AlertThreshold } from '../lib/supabase';
import AnimatedNumber from './AnimatedNumber';
import { getZoneColor } from '../utils/zoneColors';
import { getProductName } from '../utils/productNames';

interface ZoneColumnProps {
  zone: ZoneData;
  columnCount: number;
  threshold?: AlertThreshold;
  history?: Record<number, number>;
  previousDayTotal?: number;
  darkMode?: boolean;
  totalProductCount: number;
}

export default function ZoneColumn({
  zone,
  columnCount,
  threshold,
  history = {},
  previousDayTotal = 0,
  darkMode = false,
  totalProductCount
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

  const sortedProducts = Object.entries(productsByCode)
    .map(([codigo, cantidad]) => ({
      codigo,
      nombre: getProductName(codigo),
      cantidad
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  return (
    <div className={`rounded-xl shadow-xl border-2 overflow-hidden flex flex-col h-full ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className={`bg-gradient-to-r ${zoneColor.gradient} px-4 py-2 flex items-center gap-2 shadow-md relative flex-shrink-0`}>
        <Package className="text-white" size={28} strokeWidth={2.5} />
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-white tracking-tight truncate">
            {zone.nombre}
          </h2>
          {zone.nombre === 'Gran Canaria' && (
            <span className="text-white text-xs opacity-80">(local)</span>
          )}
        </div>
        {(isBelowThreshold || isAboveMaxThreshold) && (
          <AlertTriangle className="text-yellow-300 animate-pulse" size={24} />
        )}
      </div>

      <div className="flex-1 p-3 flex flex-col overflow-hidden" style={{ minHeight: 0 }}>
        {previousDayTotal > 0 && (
          <div className={`mb-2 p-1.5 rounded-lg border flex-shrink-0 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>vs Ayer</span>
              <div className="flex items-center gap-1">
                {changeVsPrevious > 0 ? (
                  <TrendingUp className="text-green-600" size={14} />
                ) : changeVsPrevious < 0 ? (
                  <TrendingDown className="text-red-600" size={14} />
                ) : null}
                <span className={`text-sm font-bold ${
                  changeVsPrevious > 0 ? 'text-green-600' : changeVsPrevious < 0 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {changeVsPrevious > 0 ? '+' : ''}{changeVsPrevious.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col justify-between" style={{ minHeight: 0 }}>
          {sortedProducts.map((product) => (
            <div
              key={product.codigo}
              className={`flex justify-between items-center gap-3 px-2 py-1 rounded border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600'
                  : zoneColor.light + ' ' + zoneColor.border
              }`}
              style={{
                flex: `1 1 ${100 / totalProductCount}%`,
                minHeight: 0
              }}
            >
              <span
                className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} truncate flex-1`}
                style={{ fontSize: '18px', lineHeight: '1.2' }}
              >
                {product.nombre}
              </span>
              <AnimatedNumber
                value={product.cantidad}
                className={`font-extrabold ${zoneColor.text} flex-shrink-0`}
                style={{ fontSize: '18px' }}
              />
            </div>
          ))}
        </div>

        <div className={`mt-2 pt-2 border-t-2 flex-shrink-0 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
          <div className={`flex justify-between items-center py-2 px-3 bg-gradient-to-r ${zoneColor.gradient} rounded-lg shadow-lg`}>
            <span className="font-bold text-white uppercase tracking-wide" style={{ fontSize: '18px' }}>
              Total
            </span>
            <AnimatedNumber
              value={totalQuantity}
              className="font-extrabold text-white"
              style={{ fontSize: '18px' }}
            />
          </div>
          {isBelowThreshold && (
            <div className="mt-1.5 p-1.5 bg-yellow-100 border border-yellow-400 rounded flex items-center gap-1">
              <AlertTriangle className="text-yellow-700" size={14} />
              <span className="text-xs font-semibold text-yellow-800">
                Bajo mínimo ({threshold.min_threshold})
              </span>
            </div>
          )}
          {isAboveMaxThreshold && (
            <div className="mt-1.5 p-1.5 bg-orange-100 border border-orange-400 rounded flex items-center gap-1">
              <AlertTriangle className="text-orange-700" size={14} />
              <span className="text-xs font-semibold text-orange-800">
                Sobre máximo ({threshold.max_threshold})
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
