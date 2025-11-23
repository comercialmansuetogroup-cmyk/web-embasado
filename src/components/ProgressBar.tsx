interface ProgressBarProps {
  current: number;
  target: number;
  color: string;
}

export default function ProgressBar({ current, target, color }: ProgressBarProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isComplete = percentage >= 100;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm font-medium">
        <span className="text-gray-600">Progreso</span>
        <span className={`${isComplete ? 'text-green-600' : 'text-gray-900'}`}>
          {percentage.toFixed(0)}%
        </span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ease-out ${
            isComplete
              ? 'bg-green-500'
              : percentage >= 80
              ? 'bg-blue-500'
              : percentage >= 50
              ? 'bg-yellow-500'
              : 'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Fabricado: {current}</span>
        <span>Objetivo: {target}</span>
      </div>
    </div>
  );
}
