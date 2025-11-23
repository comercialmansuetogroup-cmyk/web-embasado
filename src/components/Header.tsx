import { useEffect, useState } from 'react';
import { Moon, Sun, BarChart3 } from 'lucide-react';

interface HeaderProps {
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  onNavigateToStats?: () => void;
  showControls?: boolean;
}

export default function Header({
  darkMode = false,
  onToggleDarkMode,
  onNavigateToStats,
  showControls = false
}: HeaderProps = {}) {
  const [currentDate, setCurrentDate] = useState('');
  const [currentDay, setCurrentDay] = useState('');

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

      setCurrentDay(days[now.getDay()]);
      setCurrentDate(`${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`);
    };

    updateDate();
    const interval = setInterval(updateDate, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className={`w-full border-b-3 border-[#bd2025] py-2 px-8 shadow-md ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src="/Logo mansuetoVR2.png"
            alt="Mansueto Group Logo"
            className="h-12 w-12 object-contain"
          />
          <div>
            <h1 className="text-xl font-bold text-[#bd2025] tracking-tight">MANSUETO GROUP</h1>
            <p className={`text-xs font-medium ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Panel de Producción</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {showControls && (
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
                title={darkMode ? 'Modo claro' : 'Modo oscuro'}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>

              <button
                onClick={onNavigateToStats}
                className="flex items-center gap-2 px-4 py-2 bg-[#bd2025] text-white rounded-lg hover:bg-[#8c1619] transition-colors shadow-sm"
                title="Ver estadísticas"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm font-semibold">Ver Estadísticas</span>
              </button>
            </div>
          )}

          <div className="text-right">
            <p className={`text-xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>{currentDay}</p>
            <p className={`text-sm font-medium ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>{currentDate}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
