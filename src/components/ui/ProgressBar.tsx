interface ProgressBarProps {
  value: number;
  max: number;
  showLabel?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProgressBar({
  value,
  max,
  showLabel = false,
  className = '',
  size = 'md',
}: ProgressBarProps) {
  const percentage = max === 0 ? 0 : Math.round((value / max) * 100);

  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[size];

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>
            {value} / {max} レッスン完了
          </span>
          <span>{percentage}%</span>
        </div>
      )}
      <div
        className={`w-full bg-gray-200 rounded-full ${heightClass}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={Math.max(max, 1)}
        aria-label={`${value} / ${max} 完了`}
      >
        <div
          className={`bg-blue-600 ${heightClass} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
