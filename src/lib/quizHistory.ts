const STORAGE_KEY = 'quiz-history';

export interface QuizAttempt {
  score: number;
  total: number;
  timestamp: number;
}

export type QuizHistory = Record<string, QuizAttempt[]>;

export function getQuizHistory(): QuizHistory {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as QuizHistory;
  } catch {
    return {};
  }
}

export function saveQuizAttempt(slug: string, score: number, total: number): void {
  if (typeof window === 'undefined') return;
  const history = getQuizHistory();
  const attempts = history[slug] ?? [];
  attempts.push({ score, total, timestamp: Date.now() });
  history[slug] = attempts.slice(-10); // 直近10回分を保持
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export interface LessonQuizStat {
  slug: string;
  attempts: number;
  bestScore: number;
  total: number;
  bestRate: number;
  latestRate: number;
  latestTimestamp: number;
}

export function getStatsByLesson(history: QuizHistory): LessonQuizStat[] {
  return Object.entries(history).map(([slug, attempts]) => {
    const best = attempts.reduce((max, a) => (a.score > max.score ? a : max), attempts[0]);
    const latest = attempts[attempts.length - 1];
    return {
      slug,
      attempts: attempts.length,
      bestScore: best.score,
      total: best.total,
      bestRate: Math.round((best.score / best.total) * 100),
      latestRate: Math.round((latest.score / latest.total) * 100),
      latestTimestamp: latest.timestamp,
    };
  }).sort((a, b) => b.latestRate - a.latestRate);
}

export function getOverallStats(history: QuizHistory): {
  totalAttempts: number;
  totalCorrect: number;
  totalQuestions: number;
  averageRate: number;
} {
  let totalAttempts = 0;
  let totalCorrect = 0;
  let totalQuestions = 0;
  for (const attempts of Object.values(history)) {
    for (const a of attempts) {
      totalAttempts++;
      totalCorrect += a.score;
      totalQuestions += a.total;
    }
  }
  return {
    totalAttempts,
    totalCorrect,
    totalQuestions,
    averageRate: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
  };
}
