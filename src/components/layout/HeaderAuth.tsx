'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export function HeaderAuth() {
  const { user, isLoggedIn, logout } = useAuth();

  if (isLoggedIn && user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{user.email}</span>
        <button
          onClick={logout}
          className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          ログアウト
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
    >
      ログイン
    </Link>
  );
}
