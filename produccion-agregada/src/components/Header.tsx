import { BarChart3 } from 'lucide-react';

export default function Header() {
  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Producción Agregada - Mansueto</h1>
        </div>
      </div>
    </div>
  );
}
