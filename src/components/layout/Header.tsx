'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { HeaderAuth } from '@/components/layout/HeaderAuth';
import dynamic from 'next/dynamic';
import type { SearchItem } from '@/lib/search';

const SearchModal = dynamic(() => import('@/components/ui/SearchModal'), { ssr: false });

interface HeaderProps {
  searchItems?: SearchItem[];
}

export default function Header({ searchItems = [] }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  function navClass(href: string) {
    const active = pathname === href || (href !== '/' && pathname.startsWith(href));
    return active
      ? 'text-blue-600 font-semibold text-sm transition-colors'
      : 'text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors';
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">AI Learning</span>
          </Link>

          {/* デスクトップナビ */}
          <nav className="hidden sm:flex items-center gap-4">
            <SearchModal items={searchItems} />
            <Link href="/lessons" className={navClass('/lessons')}>
              レッスン一覧
            </Link>
            <Link href="/dashboard" className={navClass('/dashboard')}>
              ダッシュボード
            </Link>
            <Link
              href="/lessons"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              学習を始める
            </Link>
            <HeaderAuth />
          </nav>

          {/* モバイル: ハンバーガーボタン */}
          <button
            className="sm:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label={menuOpen ? 'メニューを閉じる' : 'メニューを開く'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* モバイルドロワーメニュー */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="sm:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3"
        >
          <Link
            href="/lessons"
            className="block text-gray-700 hover:text-blue-600 text-sm font-medium py-2 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            レッスン一覧
          </Link>
          <Link
            href="/dashboard"
            className="block text-gray-700 hover:text-blue-600 text-sm font-medium py-2 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            ダッシュボード
          </Link>
          <Link
            href="/lessons"
            className="block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors text-center"
            onClick={() => setMenuOpen(false)}
          >
            学習を始める
          </Link>
          <div className="pt-2 border-t border-gray-100">
            <HeaderAuth />
          </div>
        </div>
      )}
    </header>
  );
}
