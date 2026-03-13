import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/lib/constants';

interface BadgeProps {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  className?: string;
}

export default function Badge({ difficulty, className = '' }: BadgeProps) {
  const label = DIFFICULTY_LABELS[difficulty] ?? difficulty;
  const colorClass = DIFFICULTY_COLORS[difficulty] ?? 'bg-gray-100 text-gray-800';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}
    >
      {label}
    </span>
  );
}
