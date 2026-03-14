/**
 * クイズ正答率に応じたTailwindテキストカラークラスを返す
 * 100%: amber, >=70%: green, >=40%: yellow, <40%: red
 */
export function getQuizRateTextColor(rate: number): string {
  if (rate === 100) return 'text-amber-500';
  if (rate >= 70) return 'text-green-600';
  if (rate >= 40) return 'text-yellow-600';
  return 'text-red-500';
}

/**
 * クイズ正答率に応じたTailwindバーカラークラスを返す
 * >=70%: green, >=40%: yellow, <40%: red
 */
export function getQuizRateBarColor(rate: number): string {
  if (rate >= 70) return 'bg-green-500';
  if (rate >= 40) return 'bg-yellow-400';
  return 'bg-red-400';
}
