'use client';

import { useState, useEffect } from 'react';

const SHORTCUTS = [
  { key: 'j', description: '次のレッスンへ', scope: 'レッスンページ' },
  { key: 'k', description: '前のレッスンへ', scope: 'レッスンページ' },
  { key: 'c', description: 'レッスン完了をトグル', scope: 'レッスンページ' },
  { key: '⌘K / Ctrl+K', description: 'レッスン検索を開く', scope: '全ページ' },
  { key: 'Esc', description: '検索・モーダルを閉じる', scope: '全ページ' },
  { key: '?', description: 'ショートカット一覧を表示', scope: '全ページ' },
];

export default function KeyboardShortcutsModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const tag = target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || target.isContentEditable) return;

      if (e.key === '?') setOpen((prev) => !prev);
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      onClick={() => setOpen(false)}
    >
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="キーボードショートカット一覧"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">キーボードショートカット</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded px-1.5 py-0.5"
            aria-label="このモーダルを閉じる"
          >
            ESC
          </button>
        </div>
        <ul className="divide-y divide-gray-50">
          {SHORTCUTS.map((s) => (
            <li key={s.key} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm text-gray-800">{s.description}</p>
                <p className="text-xs text-gray-400">{s.scope}</p>
              </div>
              <kbd className="ml-4 flex-shrink-0 font-mono text-xs bg-gray-100 border border-gray-200 rounded px-2 py-1 text-gray-600">
                {s.key}
              </kbd>
            </li>
          ))}
        </ul>
        <p className="text-center text-xs text-gray-400 py-3 border-t border-gray-50">
          <kbd className="font-mono bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 text-gray-500">?</kbd>
          {' '}でいつでも表示できます
        </p>
      </div>
    </div>
  );
}
