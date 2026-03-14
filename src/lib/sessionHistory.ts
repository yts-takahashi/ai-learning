const STORAGE_KEY = 'session-history';

export interface LessonSession {
  slug: string;
  duration: number; // 秒
  timestamp: number;
}

export function getSessions(): LessonSession[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as LessonSession[];
  } catch {
    return [];
  }
}

export function saveSession(slug: string, durationSeconds: number): void {
  if (typeof window === 'undefined' || durationSeconds < 10) return;
  const sessions = getSessions();
  sessions.push({ slug, duration: durationSeconds, timestamp: Date.now() });
  // 直近200件を保持
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(-200)));
}

export function getTotalStats(sessions: LessonSession[]): {
  totalMinutes: number;
  sessionCount: number;
  avgMinutesPerSession: number;
} {
  if (sessions.length === 0) {
    return { totalMinutes: 0, sessionCount: 0, avgMinutesPerSession: 0 };
  }
  const totalSec = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalMinutes = Math.round(totalSec / 60);
  return {
    totalMinutes,
    sessionCount: sessions.length,
    avgMinutesPerSession: Math.round(totalSec / sessions.length / 60) || 1,
  };
}
