'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { QuizQuestion } from '@/lib/types';
import { saveQuizAttempt } from '@/lib/quizHistory';

function shuffleOptions(question: QuizQuestion): QuizQuestion {
  const indices = question.options.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const newCorrectIndex = indices.indexOf(question.correctIndex);
  return {
    ...question,
    options: indices.map((i) => question.options[i]),
    correctIndex: newCorrectIndex,
  };
}

interface QuizProps {
  questions: QuizQuestion[];
  nextSlug?: string | null;
  slug?: string;
}

interface QuestionState {
  selected: number | null;
  revealed: boolean;
}

export default function Quiz({ questions, nextSlug, slug }: QuizProps) {
  const shuffled = useMemo(() => questions.map(shuffleOptions), [questions]);
  const [states, setStates] = useState<QuestionState[]>(
    questions.map(() => ({ selected: null, revealed: false })),
  );
  const [showScore, setShowScore] = useState(false);

  function selectOption(qIndex: number, optIndex: number) {
    if (states[qIndex].revealed) return;
    setStates((prev) => {
      const next = [...prev];
      next[qIndex] = { selected: optIndex, revealed: false };
      return next;
    });
  }

  function reveal(qIndex: number) {
    if (states[qIndex].selected === null) return;
    setStates((prev) => {
      const next = [...prev];
      next[qIndex] = { ...next[qIndex], revealed: true };
      return next;
    });
  }

  const answeredAll = states.every((s) => s.revealed);
  const score = states.filter(
    (s, i) => s.revealed && s.selected === shuffled[i].correctIndex,
  ).length;

  return (
    <div className="space-y-8" role="list" aria-label="クイズ問題一覧">
      <div className="flex items-center gap-2 text-purple-700">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <span className="font-semibold text-lg">クイズ — 理解度チェック</span>
      </div>

      {shuffled.map((q, qIdx) => {
        const state = states[qIdx];
        const isCorrect = state.selected === q.correctIndex;
        const questionId = `quiz-question-${qIdx}`;
        const feedbackId = `quiz-feedback-${qIdx}`;

        return (
          <div key={qIdx} className="bg-white border border-gray-200 rounded-xl p-6" role="listitem">
            <p id={questionId} className="font-medium text-gray-900 mb-4">
              Q{qIdx + 1}. {q.question}
            </p>
            <div className="space-y-2 mb-4" role="radiogroup" aria-labelledby={questionId} aria-describedby={state.revealed ? feedbackId : undefined}>
              {q.options.map((opt, oIdx) => {
                let optClass =
                  'w-full text-left px-4 py-3 rounded-lg border transition-colors text-sm';

                if (!state.revealed) {
                  optClass +=
                    state.selected === oIdx
                      ? ' border-blue-500 bg-blue-50 text-blue-700'
                      : ' border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700';
                } else {
                  if (oIdx === q.correctIndex) {
                    optClass += ' border-green-500 bg-green-50 text-green-700';
                  } else if (state.selected === oIdx && oIdx !== q.correctIndex) {
                    optClass += ' border-red-400 bg-red-50 text-red-700';
                  } else {
                    optClass += ' border-gray-200 text-gray-400';
                  }
                }

                return (
                  <button
                    key={oIdx}
                    className={optClass}
                    onClick={() => selectOption(qIdx, oIdx)}
                    role="radio"
                    aria-checked={state.selected === oIdx}
                    aria-disabled={state.revealed}
                  >
                    <span className="font-medium mr-2" aria-hidden="true">{String.fromCharCode(65 + oIdx)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {!state.revealed && (
              <button
                onClick={() => reveal(qIdx)}
                disabled={state.selected === null}
                aria-disabled={state.selected === null}
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg font-medium hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                答えを確認する
              </button>
            )}

            {state.revealed && (
              <div
                id={feedbackId}
                role="status"
                aria-live="polite"
                className={`mt-4 p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
              >
                <p className={`font-semibold mb-1 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {isCorrect ? '正解！' : '不正解'}
                </p>
                <p className="text-sm text-gray-700">{q.explanation}</p>
              </div>
            )}
          </div>
        );
      })}

      {answeredAll && !showScore && (
        <div className="text-center">
          <button
            onClick={() => {
              if (slug) saveQuizAttempt(slug, score, shuffled.length);
              setShowScore(true);
            }}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            スコアを確認する
          </button>
        </div>
      )}

      {showScore && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 text-center">
          <p className="text-2xl font-bold text-purple-700 mb-2">
            {score} / {questions.length} 問正解
          </p>
          <p className="text-gray-600 mb-4">
            {score === questions.length
              ? '全問正解！素晴らしい理解力です。'
              : score >= questions.length * 0.7
                ? 'よくできました！もう一度間違えた問題を確認してみましょう。'
                : 'もう一度記事を読み返してみましょう。'}
          </p>
          {score === questions.length && nextSlug && (
            <Link
              href={`/lessons/${nextSlug}`}
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm"
            >
              次のレッスンへ
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
