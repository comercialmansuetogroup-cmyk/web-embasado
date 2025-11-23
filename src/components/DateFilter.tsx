import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateFilterProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export default function DateFilter({ selectedDate, onDateChange }: DateFilterProps) {
  const handlePreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    onDateChange(date.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    onDateChange(date.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    const today = new Date().toISOString().split('T')[0];
    onDateChange(today);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="flex items-center gap-3 bg-white rounded-lg shadow-md px-4 py-2 border border-gray-200">
      <Calendar className="w-5 h-5 text-gray-600" />

      <button
        onClick={handlePreviousDay}
        className="p-1 hover:bg-gray-100 rounded transition-colors"
        aria-label="Día anterior"
      >
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>

      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-900 min-w-[200px] text-center">
          {formatDate(selectedDate)}
        </span>
        {!isToday && (
          <button
            onClick={handleToday}
            className="px-3 py-1 text-xs font-medium text-white bg-[#bd2025] rounded hover:bg-[#8c1619] transition-colors"
          >
            Hoy
          </button>
        )}
      </div>

      <button
        onClick={handleNextDay}
        className="p-1 hover:bg-gray-100 rounded transition-colors"
        aria-label="Día siguiente"
      >
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="px-3 py-1 text-sm border border-gray-300 rounded hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#bd2025] focus:border-transparent transition-colors"
      />
    </div>
  );
}
