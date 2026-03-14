'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { SearchItem } from '@/lib/search';

interface SearchModalProps {
  items: SearchItem[];
}

export default function SearchModal({ items }: SearchModalProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setResults([]);
    setActiveIndex(0);
  }, []);

  // Cmd+K / Ctrl+K でモーダルを開く
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') close();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [close]);

  // モーダルが開いたらフォーカス
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // 検索（Fuse.js を動的ロード）
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setActiveIndex(0);
      return;
    }
    let cancelled = false;
    import('fuse.js').then(({ default: Fuse }) => {
      if (cancelled) return;
      const fuse = new Fuse(items, {
        keys: ['title', 'chapterTitle'],
        threshold: 0.35,
      });
      const hits = fuse.search(query).slice(0, 8).map((r) => r.item);
      setResults(hits);
      setActiveIndex(0);
    });
    return () => { cancelled = true; };
  }, [query, items]);

  function navigate(slug: string) {
    router.push(`/lessons/${slug}`);
    close();
  }

  function handleKeyNav(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[activeIndex]) {
      navigate(results[activeIndex].slug);
    }
  }

  return (
    <>
      {/* トリガーボタン */}
      <button
        onClick={() => setOpen(true)}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 hover:text-gray-600 transition-colors"
        aria-label="検索"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <span>検索</span>
        <kbd className="ml-1 text-xs bg-white border border-gray-200 rounded px-1">⌘K</kbd>
      </button>

      {/* モーダルオーバーレイ */}
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4"
          onClick={close}
        >
          <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
          <div
            className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="レッスン検索"
          >
            {/* 検索入力 */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="レッスンを検索..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyNav}
                className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
              />
              <button
                onClick={close}
                className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded px-1.5 py-0.5"
              >
                ESC
              </button>
            </div>

            {/* スクリーンリーダー向け結果通知 */}
            <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
              {query && results.length > 0
                ? `${results.length}件のレッスンが見つかりました`
                : query && results.length === 0
                  ? '一致するレッスンが見つかりません'
                  : ''}
            </div>

            {/* 検索結果 */}
            {results.length > 0 && (
              <ul className="max-h-80 overflow-y-auto py-2" role="listbox">
                {results.map((item, i) => (
                  <li key={item.slug} role="option" aria-selected={i === activeIndex}>
                    <button
                      className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                        i === activeIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => navigate(item.slug)}
                      onMouseEnter={() => setActiveIndex(i)}
                    >
                      <span className="mt-0.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded px-1.5 py-0.5 flex-shrink-0">
                        Ch.{item.chapter}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                        <p className="text-xs text-gray-400 truncate">{item.chapterTitle} · {item.duration}分</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {query && results.length === 0 && (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">
                「{query}」に一致するレッスンが見つかりません
              </p>
            )}

            {!query && (
              <p className="px-4 py-4 text-xs text-gray-400 text-center">
                レッスンタイトルやチャプター名で検索できます
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
