'use client';

interface ConfidenceIndicatorProps {
  score: number;
  label?: string;
}

export const ConfidenceIndicator = ({ score, label = 'Confidence' }: ConfidenceIndicatorProps) => {
  const getColor = (score: number) => {
    if (score > 0.8) return 'text-green-500';
    if (score > 0.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getBarColor = (score: number) => {
    if (score > 0.8) return 'bg-green-500';
    if (score > 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{label}</span>
        <span className={`text-sm font-semibold ${getColor(score)}`}>
          {(score * 100).toFixed(0)}%
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${getBarColor(score)} transition-all`}
          style={{ width: `${score * 100}%` }}
        />
      </div>
    </div>
  );
};
