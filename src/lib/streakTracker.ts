import { getSessions } from './sessionHistory';

function toDateStr(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10); // YYYY-MM-DD
}

export interface StreakInfo {
  current: number;
  best: number;
  studiedToday: boolean;
}

export function getStreakInfo(): StreakInfo {
  const sessions = getSessions();
  if (sessions.length === 0) {
    return { current: 0, best: 0, studiedToday: false };
  }

  // 学習した日付の集合を取得（重複を除く）
  const daysSet = new Set(sessions.map((s) => toDateStr(s.timestamp)));
  const days = Array.from(daysSet).sort(); // 昇順

  const today = toDateStr(Date.now());
  const studiedToday = daysSet.has(today);

  // 連続日数を計算
  let current = 0;
  let best = 0;
  let streak = 1;

  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diffDays === 1) {
      streak++;
    } else {
      best = Math.max(best, streak);
      streak = 1;
    }
  }
  best = Math.max(best, streak);

  // 現在のストリーク: 今日 or 昨日が最後の学習日であれば有効
  const lastDay = days[days.length - 1];
  const yesterday = toDateStr(Date.now() - 86400000);
  if (lastDay === today || lastDay === yesterday) {
    // 末尾から連続を数える
    let cur = 1;
    for (let i = days.length - 1; i > 0; i--) {
      const prev = new Date(days[i - 1]);
      const curr = new Date(days[i]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
      if (diffDays === 1) {
        cur++;
      } else {
        break;
      }
    }
    current = cur;
  } else {
    current = 0;
  }

  return { current, best, studiedToday };
}
