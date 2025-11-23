interface VerticalBarChartProps {
  data: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  maxValue?: number;
  height?: number;
  darkMode?: boolean;
}

export default function VerticalBarChart({
  data,
  maxValue,
  height = 300,
  darkMode = false
}: VerticalBarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <div className="h-full flex items-end justify-around gap-2">
        {data.map((item, index) => {
          const barHeight = (item.value / max) * 100;

          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="relative w-full flex flex-col items-center justify-end" style={{ height: '85%' }}>
                <span className={`text-sm font-bold mb-1 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {item.value.toLocaleString()}
                </span>
                <div
                  className="w-full rounded-t-lg transition-all duration-1000 relative"
                  style={{
                    height: `${barHeight}%`,
                    backgroundColor: item.color,
                    minHeight: item.value > 0 ? '4px' : '0'
                  }}
                >
                  {item.value > 0 && (
                    <div
                      className="absolute inset-0 rounded-t-lg opacity-10"
                      style={{
                        background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)'
                      }}
                    />
                  )}
                </div>
              </div>
              <span className={`text-sm font-medium text-center ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
