'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function HeaderAuth() {
  const router = useRouter();
  const { user, isLoggedIn, isLoaded, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // ハイドレーション完了前は何も表示しない（ちらつき防止）
  if (!isLoaded) {
    return <div className="w-16 h-5" aria-hidden="true" />;
  }

  if (isLoggedIn && user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{user.email}</span>
        <button
          onClick={handleLogout}
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
