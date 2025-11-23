import { Moon, Sun, BarChart3 } from 'lucide-react';

interface ControlPanelProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onNavigateToStats: () => void;
}

export default function ControlPanel({
  darkMode,
  onToggleDarkMode,
  onNavigateToStats
}: ControlPanelProps) {
  return (
    <div className={`flex items-center gap-3 rounded-lg shadow-md px-4 py-2 border ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
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

      <div className={`h-6 w-px ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />

      <button
        onClick={onNavigateToStats}
        className="flex items-center gap-2 px-4 py-2 bg-[#bd2025] text-white rounded-lg hover:bg-[#8c1619] transition-colors shadow-sm"
        title="Ver estadísticas"
      >
        <BarChart3 className="w-5 h-5" />
        <span className="text-sm font-semibold">Ver Estadísticas</span>
      </button>
    </div>
  );
}
