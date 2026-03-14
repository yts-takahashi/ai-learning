'use client';

import { useEffect, useState } from 'react';
import { getQuizHistory, getOverallStats } from '@/lib/quizHistory';

export default function QuizStats() {
  const [stats, setStats] = useState<ReturnType<typeof getOverallStats> | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const history = getQuizHistory();
    const s = getOverallStats(history);
    if (s.totalAttempts > 0) setStats(s);
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-5 w-24 bg-gray-200 rounded mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center">
              <div className="h-8 w-16 bg-gray-200 rounded mx-auto mb-1" />
              <div className="h-3 w-14 bg-gray-100 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="font-bold text-lg mb-4">クイズ統計</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-purple-600">{stats.averageRate}%</p>
          <p className="text-xs text-gray-500 mt-1">平均正答率</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-800">{stats.totalCorrect}</p>
          <p className="text-xs text-gray-500 mt-1">累計正解数</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-800">{stats.totalAttempts}</p>
          <p className="text-xs text-gray-500 mt-1">挑戦回数</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>正答率</span>
          <span>{stats.totalCorrect} / {stats.totalQuestions} 問</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all"
            style={{ width: `${stats.averageRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}
